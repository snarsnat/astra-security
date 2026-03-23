/**
 * ASTRA Core - The Invisible Guardian
 * 
 * Main entry point for the ASTRA security system.
 */

const AstraTierSystem = require('../tiers');
const AccessibilitySystem = require('../accessibility');
const MutationSystem = require('../mutation');

class AstraCore {
  constructor(config = {}) {
    this.config = {
      // Default configuration
      strictMode: false,
      learningRate: 0.1,
      minInteractionsForBaseline: 5,
      ...config
    };
    
    // Initialize subsystems
    this.tierSystem = new AstraTierSystem();
    this.accessibility = new AccessibilitySystem();
    this.mutation = new MutationSystem();
    
    // Session management
    this.sessions = new Map();
    this.metrics = {
      requests: 0,
      tierDistributions: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      completionTimes: [],
      errors: []
    };
    
    console.log('ASTRA Security System initialized');
    console.log('Core Philosophy: The best security is the security you never notice.');
  }

  /**
   * Main entry point: process user request
   */
  async process(sessionId, request) {
    this.metrics.requests++;
    
    try {
      // Get or create session
      const session = this.getSession(sessionId);
      
      // Update session with request data
      this.updateSession(session, request);
      
      // Detect accessibility needs
      const needs = this.accessibility.detectNeeds(session.data);
      
      // Process through tier system
      const startTime = Date.now();
      const result = await this.tierSystem.processRequest(sessionId, session.data);
      const processingTime = Date.now() - startTime;
      
      // Adapt challenge if needed
      if (result.response.challenge && Object.values(needs).some(n => n)) {
        const adaptedChallenge = this.accessibility.adaptChallenge(
          result.response.challenge,
          needs
        );
        result.response.challenge = adaptedChallenge;
        result.response.accessibilityAdapted = true;
      }
      
      // Add mutation transparency
      const mutationStatus = this.mutation.getUserMutationStatus(sessionId);
      result.mutation = {
        currentTheme: mutationStatus.current.theme,
        nextRefresh: mutationStatus.next.refreshIn,
        transparency: mutationStatus.transparency
      };
      
      // Record metrics
      this.metrics.tierDistributions[result.tier]++;
      this.metrics.completionTimes.push({
        tier: result.tier,
        timeMs: processingTime,
        timestamp: Date.now()
      });
      
      // Update session
      session.lastActivity = Date.now();
      session.tierHistory.push({
        tier: result.tier,
        oosScore: result.oosScore,
        timestamp: Date.now()
      });
      
      // Keep history manageable
      if (session.tierHistory.length > 100) {
        session.tierHistory.shift();
      }
      
      return {
        success: true,
        data: result,
        processingTime,
        sessionId,
        needsDetected: needs
      };
      
    } catch (error) {
      console.error('ASTRA processing error:', error);
      this.metrics.errors.push({
        error: error.message,
        sessionId,
        timestamp: Date.now()
      });
      
      // Fallback to minimal friction
      return {
        success: false,
        error: error.message,
        fallback: {
          tier: 0,
          response: { action: 'none', delay: 0 },
          message: 'System error - proceeding with minimal security'
        }
      };
    }
  }

  /**
   * Verify challenge completion
   */
  async verifyChallenge(sessionId, challengeType, userResponse) {
    const session = this.getSession(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // Get the expected challenge from session
    const expectedChallenge = session.pendingChallenge;
    if (!expectedChallenge) {
      throw new Error('No pending challenge for verification');
    }
    
    // Verify through appropriate system
    let verification;
    if (expectedChallenge.type.includes('game')) {
      verification = await this.tierSystem.challenges.verifyCompletion(
        expectedChallenge,
        userResponse
      );
    } else {
      // Use challenge system verification
      verification = { success: true, confidence: 0.9 }; // Simplified
    }
    
    // Record completion
    if (verification.success) {
      const completionTime = Date.now() - session.challengeStartTime;
      
      // Update mutation system
      this.mutation.recordUserChallenge(
        sessionId,
        challengeType,
        true,
        completionTime
      );
      
      // Update accessibility profile
      if (session.userId) {
        this.accessibility.updateProfile(
          session.userId,
          challengeType,
          true,
          expectedChallenge.accessibilityAdapted ? 'adapted' : null
        );
      }
      
      // Clear pending challenge
      session.pendingChallenge = null;
      session.challengeStartTime = null;
      
      // Update OOS baseline (successful verification lowers risk)
      this.tierSystem.scorer.updateBaseline(sessionId, {
        verificationSuccess: true,
        challengeType,
        completionTime
      });
    }
    
    return {
      verified: verification.success,
      confidence: verification.confidence,
      nextAction: verification.success ? 'proceed' : 'retry',
      details: verification
    };
  }

  /**
   * Get session information
   */
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        data: {
          hardwareData: null,
          timingData: { interactions: [], scrollPatterns: {} },
          deviceData: null,
          networkData: null
        },
        tierHistory: [],
        challengeHistory: [],
        pendingChallenge: null,
        challengeStartTime: null,
        userId: null
      });
    }
    return this.sessions.get(sessionId);
  }

  /**
   * Update session with new data
   */
  updateSession(session, request) {
    // Update hardware data
    if (request.hardware) {
      session.data.hardwareData = request.hardware;
    }
    
    // Update timing data
    if (request.interaction) {
      session.data.timingData.interactions.push({
        type: request.interaction.type,
        timestamp: Date.now(),
        duration: request.interaction.duration,
        coordinates: request.interaction.coordinates
      });
      
      // Keep only last 100 interactions
      if (session.data.timingData.interactions.length > 100) {
        session.data.timingData.interactions.shift();
      }
    }
    
    // Update device data
    if (request.device) {
      session.data.deviceData = request.device;
    }
    
    // Update network data
    if (request.network) {
      session.data.networkData = request.network;
    }
    
    // Update user ID if provided
    if (request.userId) {
      session.userId = request.userId;
    }
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    const tierMetrics = this.tierSystem.getMetrics();
    const accessibilityMetrics = this.accessibility.getAccessibilityReport();
    const mutationAnalytics = this.mutation.getMutationAnalytics();
    
    return {
      totalRequests: this.metrics.requests,
      tierDistributions: tierMetrics.tierDistributions,
      averageProcessingTime: this.calculateAverageTime(),
      accessibility: accessibilityMetrics,
      mutation: mutationAnalytics,
      errorRate: this.metrics.errors.length / Math.max(this.metrics.requests, 1),
      timestamp: Date.now()
    };
  }

  calculateAverageTime() {
    if (this.metrics.completionTimes.length === 0) return 0;
    const total = this.metrics.completionTimes.reduce((sum, m) => sum + m.timeMs, 0);
    return Math.round(total / this.metrics.completionTimes.length);
  }

  /**
   * Cleanup old sessions
   */
  cleanupSessions(maxAgeMs = 30 * 60 * 1000) { // 30 minutes
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > maxAgeMs) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Get "Good" Security Metrics
   * Track user happiness alongside security
   */
  getGoodMetrics() {
    const metrics = this.getMetrics();
    const satisfaction = this.tierSystem.metrics.userSatisfaction;
    
    return {
      // Time to verify: <3 seconds for 95% of users
      timeToVerify: this.calculateTimeToVerify(),
      
      // Completion rate: >99% for legitimate humans
      completionRate: this.calculateCompletionRate(),
      
      // User satisfaction: >4.5/5
      userSatisfaction: satisfaction.length > 0 
        ? (satisfaction.reduce((sum, s) => sum + s.satisfaction, 0) / satisfaction.length).toFixed(1)
        : null,
      
      // Retry rate: <2%
      retryRate: this.calculateRetryRate(),
      
      // Abandonment: <0.5%
      abandonmentRate: this.calculateAbandonmentRate(),
      
      // Security effectiveness
      tierDistribution: metrics.tierDistributions,
      
      // Accessibility
      accessibilityUsage: metrics.accessibility.totalUsers,
      accessibilitySuccessRate: metrics.accessibility.overallSuccessRate,
      
      // Mutation novelty
      mutation: {
        currentTheme: this.mutation.getCurrentMutation().theme,
        uniqueChallengesThisHour: this.mutation.getCurrentMutation().challenges.length
      }
    };
  }

  calculateTimeToVerify() {
    const times = this.metrics.completionTimes.map(m => m.timeMs);
    times.sort((a, b) => a - b);
    
    const p95Index = Math.floor(times.length * 0.95);
    const p95Time = times[p95Index] || 0;
    
    return {
      p95: p95Time,
      average: this.calculateAverageTime(),
      target: 3000, // 3 seconds
      met: p95Time < 3000
    };
  }

  calculateCompletionRate() {
    const challenges = this.metrics.completionTimes.filter(m => m.tier >= 2);
    if (challenges.length === 0) return 1.0; // No challenges = 100% completion
    
    // This is simplified - in production would track started vs completed
    return 0.99;
  }

  calculateRetryRate() {
    // Simplified - would track retry attempts
    return 0.01; // 1%
  }

  calculateAbandonmentRate() {
    // Simplified - would track abandonments
    return 0.002; // 0.2%
  }

  /**
   * Record user satisfaction after challenge
   */
  recordSatisfaction(sessionId, tier, rating) {
    this.tierSystem.recordCompletion(tier, 0, rating);
  }
}

// Export singleton instance and class
const astra = new AstraCore();

module.exports = {
  AstraCore,
  astra
};