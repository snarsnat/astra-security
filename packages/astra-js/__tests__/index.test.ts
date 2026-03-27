import { AstraClient, AstraConfig } from '../src/index';

describe('AstraClient', () => {
  const mockConfig: AstraConfig = {
    apiKey: 'test-api-key',
    endpoint: 'https://api.astra.security/v1',
  };

  test('should create instance with config', () => {
    const client = new AstraClient(mockConfig);
    expect(client).toBeInstanceOf(AstraClient);
  });

  test('should have required methods', () => {
    const client = new AstraClient(mockConfig);
    expect(typeof client.analyze).toBe('function');
    expect(typeof client.verify).toBe('function');
    expect(typeof client.getScore).toBe('function');
  });

  test('should throw error for missing apiKey', () => {
    expect(() => new AstraClient({} as any)).toThrow('API key is required');
  });
});