import { IncomingMessage, ServerResponse } from 'http';
import { of, throwError } from 'rxjs';
import * as mockhttp from 'mock-http';
import { HttpHandler } from '../../models/http-handler';
import { NodeHttpRequestResponseHandler } from './node-http-request-response.handler';
import { NodeHttpStreams } from './node-http-streams.model';

describe('NodeHttpRequestResponseHandler', () => {

  let handler: NodeHttpRequestResponseHandler;
  let nestedHttpHandler: HttpHandler;
  let streamMock: NodeHttpStreams;
  let req: IncomingMessage;
  let res: ServerResponse;

  beforeEach(async () => {

    nestedHttpHandler = {
      canHandle: jest.fn(),
      handle: jest.fn().mockReturnValueOnce(of({ body: 'mockBody', headers: { mockKey: 'mockValue' }, status: 200 })),
      safeHandle: jest.fn(),
    } as HttpHandler;

    handler = new NodeHttpRequestResponseHandler(nestedHttpHandler);

    req = new mockhttp.Request({
      url: 'http://localhost:3000/test?works=yes',
      method: 'GET',
    });

    res = new mockhttp.Response();
    res.write = jest.fn();
    res.writeHead = jest.fn();
    res.end = jest.fn();

    streamMock = {
      requestStream: req,
      responseStream: res,
    };

  });

  it('should be correctly instantiated if handler is present', () => {

    expect(handler).toBeTruthy();

  });

  it('throws when handler is null or undefined', () => {

    expect(() => new NodeHttpRequestResponseHandler(null)).toThrow('A HttpHandler must be provided');

    expect(() => new NodeHttpRequestResponseHandler(undefined)).toThrow('A HttpHandler must be provided');

  });

  it('nested should be correctly instantiated', () => {

    expect(nestedHttpHandler).toBeTruthy();

  });

  describe('handle', () => {

    it('throws when url is null/undefined', async () => {

      streamMock.requestStream.url = null;
      expect(streamMock.requestStream.url).toBeNull();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('url of the request cannot be null or undefined.');

      streamMock.requestStream.url = undefined;
      expect(streamMock.requestStream.url).toBeUndefined();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('url of the request cannot be null or undefined.');

    });

    it('throws when method is null/undefined', async () => {

      streamMock.requestStream.method = null;
      expect(streamMock.requestStream.method).toBeNull();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('method of the request cannot be null or undefined.');

      streamMock.requestStream.method = undefined;
      expect(streamMock.requestStream.method).toBeUndefined();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('method of the request cannot be null or undefined.');

    });

    it('throws when headers is null/undefined', async () => {

      streamMock.requestStream.headers = null;
      expect(streamMock.requestStream.headers).toBeNull();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('headers of the request cannot be null or undefined.');

      streamMock.requestStream.headers = undefined;
      expect(streamMock.requestStream.headers).toBeUndefined();
      await expect(handler.handle(streamMock).toPromise()).rejects.toThrow('headers of the request cannot be null or undefined.');

    });

    it('should call the nested handlers handle method', async () => {

      await handler.handle(streamMock).toPromise();
      expect(nestedHttpHandler.handle).toHaveBeenCalledTimes(1);

    });

    it('should write the headers to response stream', async () => {

      await handler.handle(streamMock).toPromise();
      expect(streamMock.responseStream.writeHead).toHaveBeenCalledWith(200, { mockKey: 'mockValue', 'content-length': Buffer.byteLength('mockBody', 'utf-8').toString() });

    });

    it('should write the body to response stream', async () => {

      await handler.handle(streamMock).toPromise();
      expect(streamMock.responseStream.write).toHaveBeenCalledWith('mockBody');

    });

    it('should close the output stream', async () => {

      await handler.handle(streamMock).toPromise();
      expect(streamMock.responseStream.end).toHaveBeenCalledTimes(1);

    });

    it('should parse the url correctly', async () => {

      await handler.handle(streamMock).toPromise();
      expect(nestedHttpHandler.handle).toHaveBeenCalledTimes(1);

      expect(nestedHttpHandler.handle).toHaveBeenCalledWith(expect.objectContaining({
        request: { url: new URL('http://localhost:3000/test?works=yes'), method: 'GET', headers: {} },
      }));

    });

    it('should catch all errors and create an error response', async () => {

      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(new Error('mock error')));

      await handler.handle(streamMock).toPromise();
      const expectedError = 'The server could not process the request due to an internal server error:\nmock error';

      expect(res.writeHead).toHaveBeenCalledWith(500, { 'content-length': Buffer.byteLength(expectedError, 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith(expectedError);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should calculate the content-length of the response body as utf-8 when no charset is present', async () => {

      const body = 'This is a response body with a certain length.';
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-length': '2' }, status:200 }));

      await handler.handle(streamMock).toPromise();

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'utf-8').toString() });
      expect(res.write).toHaveBeenCalledWith(body);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

    it('should calculate the content-length of the response body with the given charset', async () => {

      const body = btoa('This is a response body with a certain length.');
      nestedHttpHandler.handle = jest.fn().mockReturnValueOnce(of({ body, headers: { 'content-length': '2', 'content-type': 'text/html; charset=base64' }, status:200 }));

      await handler.handle(streamMock).toPromise();

      expect(res.writeHead).toHaveBeenCalledWith(200, { 'content-length': Buffer.byteLength(body, 'base64').toString(), 'content-type': 'text/html; charset=base64' });
      expect(res.write).toHaveBeenCalledWith(body);
      expect(res.end).toHaveBeenCalledTimes(1);

    });

  });

  describe('canHandle', () => {

    it('should return false if input is null or undefined', async () => {

      await expect(handler.canHandle(null).toPromise()).resolves.toEqual(false);

      await expect(handler.canHandle(undefined).toPromise()).resolves.toEqual(false);

    });

    it('returns false if input.requestStream is null or undefined', async () => {

      streamMock.requestStream = null;
      expect(streamMock.requestStream).toBeNull();
      await expect(handler.canHandle(streamMock).toPromise()).resolves.toEqual(false);

      streamMock.requestStream = undefined;
      expect(streamMock.requestStream).toBeUndefined();
      await expect(handler.canHandle(streamMock).toPromise()).resolves.toEqual(false);

    });

    it('returns false if input.responseStream is null', async () => {

      streamMock.responseStream = null;
      expect(streamMock.responseStream).toBeNull();
      await expect(handler.canHandle(streamMock).toPromise()).resolves.toEqual(false);

      streamMock.responseStream = undefined;
      expect(streamMock.responseStream).toBeUndefined();
      await expect(handler.canHandle(streamMock).toPromise()).resolves.toEqual(false);

    });

    it('returns true if input is complete', async () => {

      await expect(handler.canHandle(streamMock).toPromise()).resolves.toEqual(true);

    });

  });

});
