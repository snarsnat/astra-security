import { Astra, AstraConfig } from '../src/index';

describe('Astra', () => {
  const mockConfig: AstraConfig = {
    apiKey: 'test-api-key',
    endpoint: 'https://api.astra.security/v1',
  };

  test('should create instance with config', () => {
    const client = new Astra(mockConfig);
    expect(client).toBeInstanceOf(Astra);
  });

  test('should have required methods', () => {
    const client = new Astra(mockConfig);
    expect(typeof client.init).toBe('function');
    expect(typeof client.verifyRequest).toBe('function');
    expect(typeof client.trackEvent).toBe('function');
    expect(typeof client.getAnalytics).toBe('function');
  });

  test('should throw error for missing apiKey', () => {
    expect(() => new Astra({} as any)).toThrow('API key is required');
  });
});