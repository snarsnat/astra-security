/**
 * OOS (Out-of-Session) Scoring System
 * 
 * Calculates risk scores from 0.0 to 4.0+ based on user behavior patterns.
 * Lower scores = more human-like, higher scores = more bot-like.
 */

class OOSScorer {
  constructor() {
    this.weights = {
      hardwareBreath: 0.3,      // Quantum entropy from device sensors
      timingPatterns: 0.25,     // Click/scroll timing consistency
      behavioralBaseline: 0.2,  // Deviation from established patterns
      deviceFingerprint: 0.15,  // Device/browser characteristics
      networkPatterns: 0.1      // Network timing and patterns
    };
    
    this.baselines = new Map(); // User ID -> behavioral baseline
  }

  /**
   * Calculate OOS score for a session
   * @param {Object} sessionData - Current session data
   * @param {Object} userHistory - User's historical data (if available)
   * @returns {number} OOS score (0.0-4.0+)
   */
  calculateScore(sessionData, userHistory = null) {
    let score = 0;
    
    // 1. Hardware Breath Analysis
    const hardwareScore = this.analyzeHardwareBreath(sessionData.hardwareData);
    score += hardwareScore * this.weights.hardwareBreath;
    
    // 2. Timing Pattern Analysis
    const timingScore = this.analyzeTimingPatterns(sessionData.timingData);
    score += timingScore * this.weights.timingPatterns;
    
    // 3. Behavioral Baseline Comparison
    if (userHistory) {
      const behaviorScore = this.compareToBaseline(sessionData, userHistory);
      score += behaviorScore * this.weights.behavioralBaseline;
    } else {
      // New user - use conservative baseline
      score += 1.5 * this.weights.behavioralBaseline;
    }
    
    // 4. Device Fingerprint Analysis
    const deviceScore = this.analyzeDeviceFingerprint(sessionData.deviceData);
    score += deviceScore * this.weights.deviceFingerprint;
    
    // 5. Network Pattern Analysis
    const networkScore = this.analyzeNetworkPatterns(sessionData.networkData);
    score += networkScore * this.weights.networkPatterns;
    
    // Apply smoothing and bounds
    return this.normalizeScore(score);
  }

  /**
   * Analyze hardware breath (quantum entropy from device sensors)
   */
  analyzeHardwareBreath(hardwareData) {
    if (!hardwareData || !hardwareData.entropy) {
      return 3.0; // No hardware data = high risk
    }
    
    const { entropy, consistency, randomness } = hardwareData;
    
    // High entropy = more human-like (biological noise)
    // Low entropy = more bot-like (predictable)
    let score = 0;
    
    if (entropy > 0.8) score += 0.5;  // Excellent entropy
    else if (entropy > 0.6) score += 1.0;
    else if (entropy > 0.4) score += 2.0;
    else score += 3.0;
    
    // Check consistency (humans are inconsistent)
    if (consistency > 0.9) score += 2.0;  // Too consistent = bot-like
    else if (consistency > 0.7) score += 1.0;
    
    return score / 2; // Normalize to 0-3 scale
  }

  /**
   * Analyze timing patterns for bot-like consistency
   */
  analyzeTimingPatterns(timingData) {
    if (!timingData || !timingData.interactions) {
      return 2.0; // Moderate risk without timing data
    }
    
    const { interactions, clickIntervals, scrollPatterns } = timingData;
    
    if (interactions < 5) {
      return 1.0; // Not enough data, low risk
    }
    
    let score = 0;
    
    // Analyze click interval consistency
    if (clickIntervals && clickIntervals.length > 3) {
      const variance = this.calculateVariance(clickIntervals);
      if (variance < 50) score += 2.0; // Too consistent
      else if (variance < 200) score += 1.0;
    }
    
    // Analyze scroll patterns
    if (scrollPatterns) {
      const { speedConsistency, pausePatterns } = scrollPatterns;
      if (speedConsistency > 0.9) score += 1.5;
      if (!pausePatterns || pausePatterns.length === 0) score += 1.0;
    }
    
    return Math.min(score, 3.0);
  }

  /**
   * Compare current behavior to established baseline
   */
  compareToBaseline(currentData, history) {
    const deviations = this.calculateDeviations(currentData, history.baseline);
    
    let score = 0;
    
    // Small deviations = normal human behavior
    // Large deviations = potentially bot or compromised account
    if (deviations.overall > 0.8) score = 3.0;
    else if (deviations.overall > 0.6) score = 2.0;
    else if (deviations.overall > 0.4) score = 1.0;
    else score = 0.5;
    
    return score;
  }

  /**
   * Analyze device fingerprint
   */
  analyzeDeviceFingerprint(deviceData) {
    if (!deviceData) return 2.0;
    
    const { browser, os, screen, plugins, fonts } = deviceData;
    let score = 0;
    
    // Check for common bot fingerprints
    if (browser === 'HeadlessChrome') score += 3.0;
    if (plugins && plugins.length === 0) score += 1.0;
    if (fonts && fonts.length < 10) score += 1.0;
    if (screen && screen.width === 0 && screen.height === 0) score += 3.0;
    
    return Math.min(score, 3.0);
  }

  /**
   * Analyze network patterns
   */
  analyzeNetworkPatterns(networkData) {
    if (!networkData) return 1.5;
    
    const { latencyConsistency, packetTiming, proxyDetection } = networkData;
    let score = 0;
    
    if (latencyConsistency > 0.9) score += 1.0;
    if (packetTiming && packetTiming.regularity > 0.8) score += 1.5;
    if (proxyDetection && proxyDetection.isProxy) score += 2.0;
    
    return Math.min(score, 3.0);
  }

  /**
   * Normalize score to 0-4+ range with smoothing
   */
  normalizeScore(rawScore) {
    // Apply sigmoid-like normalization
    const normalized = 4 / (1 + Math.exp(-(rawScore - 2)));
    
    // Round to 1 decimal place
    return Math.round(normalized * 10) / 10;
  }

  /**
   * Update user baseline with new data
   */
  updateBaseline(userId, sessionData) {
    if (!this.baselines.has(userId)) {
      this.baselines.set(userId, this.createInitialBaseline(sessionData));
    } else {
      const baseline = this.baselines.get(userId);
      this.evolveBaseline(baseline, sessionData);
    }
  }

  /**
   * Helper methods
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  calculateDeviations(current, baseline) {
    // Simplified deviation calculation
    const deviations = {};
    let totalDeviation = 0;
    let count = 0;
    
    for (const key in baseline) {
      if (current[key] !== undefined) {
        const deviation = Math.abs(current[key] - baseline[key]) / baseline[key];
        deviations[key] = deviation;
        totalDeviation += deviation;
        count++;
      }
    }
    
    return {
      individual: deviations,
      overall: count > 0 ? totalDeviation / count : 1.0
    };
  }

  createInitialBaseline(sessionData) {
    return {
      clickSpeed: sessionData.timingData?.averageClickSpeed || 300,
      scrollPattern: sessionData.timingData?.scrollPatterns || {},
      interactionRate: sessionData.timingData?.interactionsPerMinute || 10
    };
  }

  evolveBaseline(baseline, newData) {
    // Exponential moving average for baseline evolution
    const alpha = 0.1; // Learning rate
    
    for (const key in baseline) {
      if (newData[key] !== undefined) {
        baseline[key] = alpha * newData[key] + (1 - alpha) * baseline[key];
      }
    }
    
    return baseline;
  }

  /**
   * Determine which tier to use based on OOS score
   */
  determineTier(oosScore) {
    if (oosScore < 1.5) return 0; // Ghost
    if (oosScore < 2.0) return 1; // Whisper
    if (oosScore < 2.5) return 2; // Nudge
    if (oosScore < 3.0) return 3; // Pause
    return 4; // Gate
  }
}

module.exports = OOSScorer;