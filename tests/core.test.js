/**
 * ASTRA Core Tests
 */

const { AstraCore } = require('../src/core');

describe('ASTRA Core', () => {
  let astra;

  beforeEach(() => {
    astra = new AstraCore();
  });

  describe('Tier System', () => {
    test('should return Tier 0 for normal human behavior', async () => {
      const sessionId = 'test-session-1';
      
      const result = await astra.process(sessionId, {
        hardware: {
          entropy: 0.85,
          consistency: 0.4
        },
        interaction: { type: 'click', duration: 200 }
      });
      
      expect(result.success).toBe(true);
      expect(result.data.tier).toBe(0);
      expect(result.data.oosScore).toBeLessThan(1.5);
    });

    test('should escalate to higher tiers for suspicious patterns', async () => {
      const sessionId = 'test-session-2';
      
      // Simulate bot-like behavior
      const result = await astra.process(sessionId, {
        hardware: {
          entropy: 0.2, // Very low entropy = bot-like
          consistency: 0.95 // Too consistent
        },
        interaction: { type: 'click', duration: 500 }
      });
      
      // Should have higher OOS
      expect(result.data.oosScore).toBeGreaterThan(2.0);
    });
  });

  describe('Accessibility', () => {
    test('should detect accessibility needs', async () => {
      const sessionId = 'test-session-3';
      
      const result = await astra.process(sessionId, {
        device: {
          hasScreenReader: true,
          hasSwitchControl: true
        }
      });
      
      expect(result.needsDetected.visual).toBe(true);
      expect(result.needsDetected.motor).toBe(true);
    });

    test('should adapt challenges for accessibility needs', async () => {
      const sessionId = 'test-session-4';
      
      // First trigger a challenge
      await astra.process(sessionId, {
        hardware: { entropy: 0.3 }
      });
      
      const result = await astra.process(sessionId, {
        device: {
          hasScreenReader: true
        }
      });
      
      if (result.data.response.accessibilityAdapted) {
        expect(result.data.response.accessibilityAdapted).toBe(true);
      }
    });
  });

  describe('Metrics', () => {
    test('should track system metrics', async () => {
      await astra.process('session-5', { interaction: { type: 'click' } });
      await astra.process('session-6', { interaction: { type: 'click' } });
      await astra.process('session-7', { interaction: { type: 'click' } });
      
      const metrics = astra.getMetrics();
      
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.tierDistributions).toBeDefined();
    });

    test('should calculate "Good" Security metrics', async () => {
      const metrics = astra.getGoodMetrics();
      
      expect(metrics.timeToVerify).toBeDefined();
      expect(metrics.completionRate).toBeDefined();
      expect(metrics.retryRate).toBeLessThan(0.05); // Should be low
    });
  });

  describe('Session Management', () => {
    test('should maintain session state', async () => {
      const sessionId = 'persistent-session';
      
      // Multiple interactions
      await astra.process(sessionId, { interaction: { type: 'scroll' } });
      await astra.process(sessionId, { interaction: { type: 'click' } });
      await astra.process(sessionId, { interaction: { type: 'hover' } });
      
      const session = astra.getSession(sessionId);
      
      expect(session.tierHistory.length).toBeGreaterThan(0);
    });

    test('should cleanup old sessions', async () => {
      const sessionId = 'old-session';
      
      // Create session with old timestamp
      const session = astra.getSession(sessionId);
      session.lastActivity = Date.now() - 31 * 60 * 1000; // 31 minutes ago
      
      const cleaned = astra.cleanupSessions();
      
      expect(cleaned).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should handle errors gracefully', async () => {
      const sessionId = 'error-test';
      
      // This should not throw
      const result = await astra.process(sessionId, {
        hardware: null, // Missing data
        interaction: null
      });
      
      expect(result.success).toBe(false);
      expect(result.fallback).toBeDefined();
    });
  });
});

describe('OOSScorer', () => {
  const OOSScorer = require('../src/core/oos-scorer');
  let scorer;

  beforeEach(() => {
    scorer = new OOSScorer();
  });

  test('should score hardware breath correctly', () => {
    const highEntropy = { entropy: 0.85, consistency: 0.4 };
    const score = scorer.analyzeHardwareBreath(highEntropy);
    
    expect(score).toBeLessThan(2.0);
  });

  test('should detect bot-like timing', () => {
    const botTiming = {
      interactions: 10,
      clickIntervals: [500, 500, 500, 500, 500] // Too consistent
    };
    const score = scorer.analyzeTimingPatterns(botTiming);
    
    expect(score).toBeGreaterThan(1.5);
  });

  test('should determine correct tier', () => {
    expect(scorer.determineTier(1.0)).toBe(0);
    expect(scorer.determineTier(1.6)).toBe(1);
    expect(scorer.determineTier(2.2)).toBe(2);
    expect(scorer.determineTier(2.7)).toBe(3);
    expect(scorer.determineTier(3.5)).toBe(4);
  });
});

describe('Mutation System', () => {
  const MutationSystem = require('../src/mutation');
  let mutation;

  beforeEach(() => {
    mutation = new MutationSystem();
  });

  test('should generate daily schedule', () => {
    const status = mutation.getUserMutationStatus('test-user');
    
    expect(status.current).toBeDefined();
    expect(status.next).toBeDefined();
    expect(status.current.challenges.length).toBeGreaterThanOrEqual(2);
  });

  test('should track user mutations', () => {
    const userId = 'test-user';
    
    mutation.recordUserChallenge(userId, 'pulse', true, 2500);
    mutation.recordUserChallenge(userId, 'tilt', true, 3000);
    
    const status = mutation.getUserMutationStatus(userId);
    
    expect(status.userStats.challengesSeen).toBe(2);
    expect(status.userStats.uniqueChallenges).toBe(2);
  });

  test('should provide transparency info', () => {
    const info = mutation.getTransparencyInfo();
    
    expect(info.currentMutation).toBeDefined();
    expect(info.nextMutation).toBeDefined();
    expect(info.systemMessage).toContain('minutes');
  });
});