import { HttpHandlerOperation, HttpHandlerOperationHeader, HttpHandlerOperationMedia, HttpHandlerOperationMediaPayload, HttpHandlerOperationResponse, HttpHandlerOperationSecurityType, HttpHandlerRoute } from './http-handler-route';

describe('HttpHandlerRoute', () => {

  describe('HttpHanndlerOperationMediaPayload', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerOperationMediaPayload { }
      const object = new testClass();
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

  describe('HttpHandlerOperationMedia', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerOperationMedia { }
      const object = new testClass('type');
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

  describe('HttpHandlerOperationHeader', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerOperationHeader { }
      const object = new testClass('type', 'description');
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

  describe('HttpHandlerOperationResponse', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerOperationResponse { }
      const object = new testClass(200);
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

  describe('HttpHandlerOperation', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerOperation { }
      const object = new testClass('method', true);
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

  describe('HttpHandlerRoute', () => {

    it('should be instantiated correctly', () => {

      class testClass extends HttpHandlerRoute { }
      const object = new testClass(undefined, 'path', undefined);
      expect(object).toBeDefined();
      expect(object).toBeTruthy();

    });

  });

});
