export interface AstraConfig {
  apiKey: string;
  environment?: 'production' | 'development';
  timeout?: number;
  debug?: boolean;
  autoBlock?: boolean;
  endpoint?: string;
}

export interface VerificationResult {
  isHuman: boolean;
  confidence: number;
  riskScore: number;
  reasons?: string[];
  timestamp: string;
  requestId: string;
}

export interface AnalyticsData {
  totalRequests: number;
  humanRequests: number;
  botRequests: number;
  blockedRequests: number;
  averageResponseTime: number;
  topThreats: Array<{
    type: string;
    count: number;
  }>;
}

export class Astra {
  private config: Required<AstraConfig>;
  private initialized = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: AstraConfig) {
    this.config = {
      environment: 'production',
      timeout: 5000,
      debug: false,
      autoBlock: true,
      endpoint: 'https://api.astra.security/v1',
      ...config
    };

    if (!this.config.apiKey) {
      throw new Error('API key is required');
    }
  }

  /**
   * Initialize the SDK
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Validate API key
      const response = await this.makeRequest('/validate', {
        apiKey: this.config.apiKey
      });

      if (response.valid) {
        this.initialized = true;
        this.emit('initialized');
        if (this.config.debug) {
          console.log('Astra Security initialized successfully');
        }
      } else {
        throw new Error('Invalid API key');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize Astra: ${message}`);
    }
  }

  /**
   * Verify if a request is from a human
   */
  async verifyRequest(requestData: any): Promise<VerificationResult> {
    if (!this.initialized) {
      throw new Error('Astra not initialized. Call init() first.');
    }

    try {
      const response = await this.makeRequest('/verify', {
        ...requestData,
        apiKey: this.config.apiKey
      });

      const result: VerificationResult = {
        isHuman: response.isHuman,
        confidence: response.confidence,
        riskScore: response.riskScore,
        reasons: response.reasons,
        timestamp: response.timestamp,
        requestId: response.requestId
      };

      if (result.isHuman) {
        this.emit('verification.success', result);
      } else {
        this.emit('verification.failure', result);
        if (this.config.autoBlock) {
          this.emit('blocked', result);
        }
      }

      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Track a security event
   */
  async trackEvent(eventName: string, data: any = {}): Promise<void> {
    if (!this.initialized) {
      throw new Error('Astra not initialized. Call init() first.');
    }

    try {
      await this.makeRequest('/events', {
        event: eventName,
        data,
        apiKey: this.config.apiKey,
        timestamp: new Date().toISOString()
      });

      this.emit('event.tracked', { eventName, data });
    } catch (error) {
      this.emit('error', error);
      // Don't throw for event tracking errors
      if (this.config.debug) {
        console.warn('Failed to track event:', error);
      }
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    if (!this.initialized) {
      throw new Error('Astra not initialized. Call init() first.');
    }

    try {
      const response = await this.makeRequest('/analytics', {
        apiKey: this.config.apiKey
      });

      return response;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Make HTTP request to Astra API
   */
  private async makeRequest(path: string, data: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.endpoint}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AstraConfig {
    return { ...this.config };
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Default export
export default Astra;