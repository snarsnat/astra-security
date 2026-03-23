/**
 * ASTRA Tier System
 * 
 * Implements the 5-tier friction model:
 * 0: Ghost (invisible)
 * 1: Whisper (imperceptible)
 * 2: Nudge (3-second delight)
 * 3: Pause (engaging, not annoying)
 * 4: Gate (rare, respectful)
 */

const OOSScorer = require('../core/oos-scorer');
const ChallengeSystem = require('../challenges');

class AstraTierSystem {
  constructor() {
    this.scorer = new OOSScorer();
    this.challenges = new ChallengeSystem();
    this.userStates = new Map();
    this.metrics = {
      tierDistributions: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
      completionTimes: [],
      userSatisfaction: []
    };
  }

  /**
   * Process a user request and determine appropriate tier response
   */
  async processRequest(sessionId, requestData) {
    const userState = this.getOrCreateUserState(sessionId);
    
    // Update session data
    this.updateSessionData(userState, requestData);
    
    // Calculate OOS score
    const oosScore = this.scorer.calculateScore(
      userState.sessionData,
      userState.history
    );
    
    // Determine tier
    const tier = this.scorer.determineTier(oosScore);
    
    // Update metrics
    this.metrics.tierDistributions[tier]++;
    
    // Get tier response
    const response = await this.getTierResponse(tier, userState, oosScore);
    
    // Update user history
    this.scorer.updateBaseline(sessionId, userState.sessionData);
    
    return {
      tier,
      oosScore,
      response,
      timestamp: Date.now(),
      sessionId
    };
  }

  /**
   * Get response for specific tier
   */
  async getTierResponse(tier, userState, oosScore) {
    switch (tier) {
      case 0:
        return this.tier0Ghost();
      case 1:
        return this.tier1Whisper(userState);
      case 2:
        return await this.tier2Nudge(userState);
      case 3:
        return await this.tier3Pause(userState, oosScore);
      case 4:
        return await this.tier4Gate(userState, oosScore);
      default:
        return this.tier0Ghost();
    }
  }

  /**
   * Tier 0: Ghost - Invisible verification
   */
  tier0Ghost() {
    // Absolutely nothing visible to user
    return {
      action: 'none',
      delay: 0,
      message: null,
      challenge: null,
      verification: 'hardware_breath'
    };
  }

  /**
   * Tier 1: Whisper - Imperceptible micro-delay
   */
  tier1Whisper(userState) {
    // Add tiny, imperceptible delay to natural interaction
    const delay = 150 + Math.random() * 100; // 150-250ms
    
    // Sample interaction timing during delay
    const interactionToSample = this.selectInteractionToSample(userState);
    
    return {
      action: 'micro_delay',
      delay,
      message: null,
      challenge: null,
      sampling: interactionToSample,
      verification: 'biological_timing'
    };
  }

  /**
   * Tier 2: Nudge - 3-second delightful challenge
   */
  async tier2Nudge(userState) {
    // Select appropriate challenge based on user context
    const challenge = await this.challenges.selectNudgeChallenge(userState);
    
    return {
      action: 'challenge',
      delay: 0,
      message: "Quick tap to continue",
      challenge,
      timeout: 5000, // 5 seconds max
      verification: 'physical_interaction'
    };
  }

  /**
   * Tier 3: Pause - Engaging 10-second challenge
   */
  async tier3Pause(userState, oosScore) {
    const challenge = await this.challenges.selectPauseChallenge(userState);
    
    // Explain why (transparency reduces frustration)
    const explanation = this.getExplanation(oosScore, userState);
    
    return {
      action: 'explained_challenge',
      delay: 0,
      message: explanation,
      challenge,
      timeout: 15000, // 15 seconds max
      instructions: "Complete this quick game to continue",
      verification: 'extended_physical_interaction'
    };
  }

  /**
   * Tier 4: Gate - Manual review with options
   */
  async tier4Gate(userState, oosScore) {
    // Provide multiple resolution paths
    const options = this.getGateOptions(userState);
    
    return {
      action: 'gate',
      delay: 0,
      message: "We need a moment to verify",
      explanation: "Our system detected unusual activity. This usually resolves automatically in 2-3 minutes.",
      options,
      timeout: 180000, // 3 minutes
      fallback: 'auto_review',
      verification: 'multi_factor'
    };
  }

  /**
   * Helper methods
   */
  getOrCreateUserState(sessionId) {
    if (!this.userStates.has(sessionId)) {
      this.userStates.set(sessionId, {
        sessionData: {
          hardwareData: null,
          timingData: { interactions: [], scrollPatterns: {} },
          deviceData: null,
          networkData: null
        },
        history: null,
        tierHistory: [],
        challengeHistory: [],
        lastInteraction: Date.now()
      });
    }
    return this.userStates.get(sessionId);
  }

  updateSessionData(userState, requestData) {
    // Update hardware data if available
    if (requestData.hardware) {
      userState.sessionData.hardwareData = requestData.hardware;
    }
    
    // Update timing data
    if (requestData.interaction) {
      userState.sessionData.timingData.interactions.push({
        type: requestData.interaction.type,
        timestamp: Date.now(),
        duration: requestData.interaction.duration
      });
      
      // Keep only last 100 interactions
      if (userState.sessionData.timingData.interactions.length > 100) {
        userState.sessionData.timingData.interactions.shift();
      }
    }
    
    // Update device data
    if (requestData.device && !userState.sessionData.deviceData) {
      userState.sessionData.deviceData = requestData.device;
    }
    
    userState.lastInteraction = Date.now();
  }

  selectInteractionToSample(userState) {
    const interactions = userState.sessionData.timingData.interactions;
    if (interactions.length === 0) return null;
    
    // Select the most recent common interaction type
    const recentTypes = interactions.slice(-5).map(i => i.type);
    const mostCommon = this.mostFrequent(recentTypes);
    
    return {
      interactionType: mostCommon || 'click',
      samplingMethod: 'response_timing',
      metric: 'click_to_release_rhythm'
    };
  }

  getExplanation(oosScore, userState) {
    const reasons = [];
    
    if (oosScore > 2.5) reasons.push("unusual browsing patterns");
    if (userState.sessionData.deviceData?.isNewDevice) reasons.push("new device");
    if (userState.sessionData.networkData?.isUnusualLocation) reasons.push("unusual location");
    
    if (reasons.length === 0) {
      return "Quick security check";
    }
    
    return `We noticed ${reasons.join(' or ')}. Quick check to continue.`;
  }

  getGateOptions(userState) {
    const options = [
      {
        id: 'wait',
        label: 'Wait (auto-resolve in 2-3 minutes)',
        type: 'auto',
        time: 180000
      },
      {
        id: 'email',
        label: 'Verify via email',
        type: 'email_link',
        time: 60000
      }
    ];
    
    // Add SMS if user has phone number
    if (userState.sessionData.deviceData?.hasSmsCapability) {
      options.push({
        id: 'sms',
        label: 'Verify via SMS',
        type: 'sms_code',
        time: 30000
      });
    }
    
    // Add human chat option for frustrated users
    options.push({
      id: 'chat',
      label: 'Talk to a human',
      type: 'human_chat',
      time: 120000
    });
    
    return options;
  }

  mostFrequent(arr) {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  /**
   * Record completion metrics
   */
  recordCompletion(tier, timeMs, satisfaction = null) {
    this.metrics.completionTimes.push({
      tier,
      timeMs,
      timestamp: Date.now()
    });
    
    if (satisfaction !== null) {
      this.metrics.userSatisfaction.push({
        tier,
        satisfaction,
        timestamp: Date.now()
      });
    }
    
    // Keep only last 1000 entries
    if (this.metrics.completionTimes.length > 1000) {
      this.metrics.completionTimes.shift();
    }
    if (this.metrics.userSatisfaction.length > 1000) {
      this.metrics.userSatisfaction.shift();
    }
  }

  /**
   * Get system metrics
   */
  getMetrics() {
    const total = Object.values(this.metrics.tierDistributions).reduce((a, b) => a + b, 0);
    const distributions = {};
    
    for (const tier in this.metrics.tierDistributions) {
      distributions[tier] = total > 0 
        ? (this.metrics.tierDistributions[tier] / total * 100).toFixed(1) + '%'
        : '0%';
    }
    
    const avgCompletionTimes = {};
    const completionByTier = {};
    
    for (let tier = 0; tier <= 4; tier++) {
      const tierTimes = this.metrics.completionTimes
        .filter(m => m.tier === tier)
        .map(m => m.timeMs);
      
      if (tierTimes.length > 0) {
        const avg = tierTimes.reduce((a, b) => a + b) / tierTimes.length;
        completionByTier[tier] = {
          count: tierTimes.length,
          avgTimeMs: Math.round(avg),
          avgTimeSec: (avg / 1000).toFixed(1)
        };
      }
    }
    
    const satisfactionScores = this.metrics.userSatisfaction.map(s => s.satisfaction);
    const avgSatisfaction = satisfactionScores.length > 0
      ? (satisfactionScores.reduce((a, b) => a + b) / satisfactionScores.length).toFixed(1)
      : null;
    
    return {
      tierDistributions: distributions,
      completionTimes: completionByTier,
      userSatisfaction: {
        average: avgSatisfaction,
        totalRatings: satisfactionScores.length
      },
      totalRequests: total,
      timestamp: Date.now()
    };
  }
}

module.exports = AstraTierSystem;