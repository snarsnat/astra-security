/**
 * ASTRA Deep Layer: "The Living Session"
 * 
 * Continuous passive verification against session hijacking.
 * The mask can copy your face. It cannot copy your breath, your tremor,
 * your unconscious dance with time and space.
 */

const crypto = require('crypto');

class DeepLayer {
  constructor() {
    // Session entanglement states
    this.entanglements = new Map(); // sessionId -> entanglement token
    this.biologicalBaselines = new Map(); // sessionId -> biological signature
    this.canaryHistory = new Map(); // sessionId -> canary interactions
    
    // Continuous verification intervals
    this.verificationInterval = 5000; // Check every 5 seconds
    this.entanglementRenewal = 30000; // Renew token every 30 seconds
    
    // Canary types and configurations
    this.canaryTypes = {
      temporal: ['button_drift', 'scroll_stutter', 'input_echo'],
      spatial: ['micro_offset', 'variable_friction', 'ghost_element'],
      cognitive: ['semantic_drift', 'hierarchy_shift', 'context_contradiction']
    };
    
    console.log('ASTRA Deep Layer initialized: The Living Session');
  }

  /**
   * Create session entanglement (invisible, 500ms at page load)
   */
  createEntanglement(sessionId, hardwareData, initialInteraction) {
    // 1. Hardware Breath
    const hardwareEntropy = this.sampleHardwareBreath(hardwareData);
    
    // 2. Neuromuscular Fingerprint
    const neuromuscular = this.captureNeuromuscularFingerprint(initialInteraction);
    
    // 3. Cognitive Calibration
    const cognitive = this.calibrateCognitiveRhythm(initialInteraction);
    
    // 4. Generate Entanglement Token
    const token = this.generateEntanglementToken(
      hardwareEntropy,
      neuromuscular,
      cognitive,
      Date.now()
    );
    
    // Store baseline
    this.biologicalBaselines.set(sessionId, {
      hardwareEntropy,
      neuromuscular,
      cognitive,
      createdAt: Date.now(),
      lastVerified: Date.now(),
      verificationCount: 0
    });
    
    // Store entanglement
    this.entanglements.set(sessionId, {
      token,
      createdAt: Date.now(),
      renewAt: Date.now() + this.entanglementRenewal,
      version: 1
    });
    
    // Initialize canary history
    this.canaryHistory.set(sessionId, []);
    
    return {
      entangled: true,
      tokenHash: token.substring(0, 16),
      nextRenewal: this.entanglementRenewal
    };
  }

  /**
   * Continuous passive verification
   */
  async verifyContinuity(sessionId, interaction) {
    const baseline = this.biologicalBaselines.get(sessionId);
    const entanglement = this.entanglements.get(sessionId);
    
    if (!baseline || !entanglement) {
      return { continuity: false, confidence: 0, reason: 'No baseline established' };
    }
    
    // Check if token needs renewal
    if (Date.now() > entanglement.renewAt) {
      const renewed = await this.renewEntanglement(sessionId, interaction);
      if (!renewed.success) {
        return { continuity: false, confidence: 0, reason: 'Entanglement renewal failed' };
      }
    }
    
    // Perform continuous verification checks
    const checks = await this.performContinuityChecks(sessionId, interaction, baseline);
    
    // Calculate overall continuity confidence
    const confidence = this.calculateContinuityConfidence(checks);
    const continuity = confidence > 0.7; // 70% confidence threshold
    
    // Update verification stats
    baseline.lastVerified = Date.now();
    baseline.verificationCount++;
    
    // Inject canary if confidence is borderline
    if (confidence > 0.5 && confidence < 0.8) {
      const canaryResult = await this.injectCanary(sessionId, interaction, baseline);
      if (canaryResult) {
        checks.push(canaryResult);
        // Recalculate confidence with canary result
        return this.verifyContinuity(sessionId, interaction);
      }
    }
    
    return {
      continuity,
      confidence,
      checks: checks.filter(c => !c.passed),
      oosImpact: continuity ? 0 : 2.0, // Significant OOS impact if continuity broken
      nextVerification: this.verificationInterval
    };
  }

  /**
   * Perform all continuity checks
   */
  async performContinuityChecks(sessionId, interaction, baseline) {
    const checks = [];
    
    // 1. Neuromuscular Jitter Check
    const jitterCheck = this.checkNeuromuscularJitter(interaction, baseline.neuromuscular);
    checks.push(jitterCheck);
    
    // 2. Cognitive Timing Check
    const timingCheck = this.checkCognitiveTiming(interaction, baseline.cognitive);
    checks.push(timingCheck);
    
    // 3. Hardware Breath Check (if hardware data available)
    if (interaction.hardwareData) {
      const hardwareCheck = this.checkHardwareBreath(interaction.hardwareData, baseline.hardwareEntropy);
      checks.push(hardwareCheck);
    }
    
    // 4. Canary Response Check (if any active canaries)
    const canaryCheck = this.checkCanaryResponses(sessionId, interaction);
    if (canaryResult) checks.push(canaryCheck);
    
    // 5. Behavioral Pattern Check
    const patternCheck = this.checkBehavioralPatterns(sessionId, interaction);
    checks.push(patternCheck);
    
    return checks;
  }

  /**
   * Check neuromuscular jitter (8-12Hz tremor, individual waveform)
   */
  checkNeuromuscularJitter(interaction, baseline) {
    if (!interaction.movementData || !baseline.jitterPattern) {
      return { type: 'neuromuscular', passed: true, confidence: 0.5, reason: 'Insufficient data' };
    }
    
    const currentJitter = this.analyzeJitterPattern(interaction.movementData);
    const similarity = this.compareJitterPatterns(currentJitter, baseline.jitterPattern);
    
    return {
      type: 'neuromuscular',
      passed: similarity > 0.7,
      confidence: similarity,
      similarity,
      threshold: 0.7,
      reason: similarity > 0.7 ? 'Jitter pattern matches' : 'Jitter pattern mismatch'
    };
  }

  /**
   * Check cognitive timing (personal speed-of-thought curve)
   */
  checkCognitiveTiming(interaction, baseline) {
    if (!interaction.timingData || !baseline.cognitiveCurve) {
      return { type: 'cognitive', passed: true, confidence: 0.5, reason: 'Insufficient data' };
    }
    
    const currentTiming = this.analyzeCognitiveTiming(interaction.timingData);
    const deviation = this.calculateTimingDeviation(currentTiming, baseline.cognitiveCurve);
    
    // Allow for natural variation but flag significant deviations
    const passed = deviation < 0.3; // 30% deviation threshold
    
    return {
      type: 'cognitive',
      passed,
      confidence: 1 - Math.min(deviation, 1),
      deviation,
      threshold: 0.3,
      reason: passed ? 'Timing within expected range' : 'Unusual cognitive timing'
    };
  }

  /**
   * Check hardware breath (quantum noise pattern)
   */
  checkHardwareBreath(currentHardware, baseline) {
    const currentEntropy = this.sampleHardwareBreath(currentHardware);
    const entropyMatch = this.compareEntropySignatures(currentEntropy, baseline);
    
    return {
      type: 'hardware',
      passed: entropyMatch > 0.8,
      confidence: entropyMatch,
      match: entropyMatch,
      threshold: 0.8,
      reason: entropyMatch > 0.8 ? 'Hardware signature matches' : 'Hardware signature changed'
    };
  }

  /**
   * Check canary responses
   */
  checkCanaryResponses(sessionId, interaction) {
    const history = this.canaryHistory.get(sessionId) || [];
    const activeCanaries = history.filter(c => c.active && !c.responded);
    
    if (activeCanaries.length === 0) {
      return null;
    }
    
    let passed = true;
    let confidence = 1.0;
    
    for (const canary of activeCanaries) {
      const response = this.evaluateCanaryResponse(canary, interaction);
      canary.responded = true;
      canary.response = response;
      canary.responseTime = Date.now();
      
      if (!response.expected) {
        passed = false;
        confidence *= 0.5; // Reduce confidence for unexpected response
      }
    }
    
    return {
      type: 'canary',
      passed,
      confidence,
      canariesTested: activeCanaries.length,
      reason: passed ? 'Canary responses as expected' : 'Unexpected canary response'
    };
  }

  /**
   * Check behavioral patterns (unconscious habits)
   */
  checkBehavioralPatterns(sessionId, interaction) {
    const history = this.canaryHistory.get(sessionId) || [];
    const recentInteractions = history
      .filter(h => h.type === 'interaction' && Date.now() - h.timestamp < 300000) // Last 5 minutes
      .slice(-20);
    
    if (recentInteractions.length < 5) {
      return { type: 'behavioral', passed: true, confidence: 0.5, reason: 'Insufficient history' };
    }
    
    // Analyze patterns
    const patterns = this.analyzeBehavioralPatterns(recentInteractions);
    const consistency = this.calculateBehavioralConsistency(patterns);
    
    return {
      type: 'behavioral',
      passed: consistency > 0.6,
      confidence: consistency,
      consistency,
      threshold: 0.6,
      reason: consistency > 0.6 ? 'Behavioral patterns consistent' : 'Behavioral patterns changed'
    };
  }

  /**
   * Inject a canary test
   */
  async injectCanary(sessionId, interaction, baseline) {
    const canaryType = this.selectCanaryType(baseline);
    const canary = this.createCanary(canaryType, baseline);
    
    // Store canary
    const history = this.canaryHistory.get(sessionId) || [];
    history.push({
      ...canary,
      sessionId,
      injectedAt: Date.now(),
      active: true,
      responded: false
    });
    
    // Keep history manageable
    if (history.length > 50) history.shift();
    this.canaryHistory.set(sessionId, history);
    
    return {
      canaryInjected: true,
      type: canaryType,
      invisible: canary.invisible,
      expectedResponse: canary.expectedResponse
    };
  }

  /**
   * Renew entanglement token
   */
  async renewEntanglement(sessionId, interaction) {
    const baseline = this.biologicalBaselines.get(sessionId);
    if (!baseline) {
      return { success: false, reason: 'No baseline to renew from' };
    }
    
    // Verify continuity before renewal
    const continuity = await this.verifyContinuity(sessionId, interaction);
    if (!continuity.continuity) {
      return { success: false, reason: 'Continuity broken, cannot renew' };
    }
    
    // Sample fresh hardware breath
    const hardwareEntropy = interaction.hardwareData 
      ? this.sampleHardwareBreath(interaction.hardwareData)
      : baseline.hardwareEntropy;
    
    // Update neuromuscular fingerprint (evolves over time)
    const updatedNeuromuscular = this.evolveNeuromuscularFingerprint(
      baseline.neuromuscular,
      interaction
    );
    
    // Update cognitive calibration
    const updatedCognitive = this.evolveCognitiveCalibration(
      baseline.cognitive,
      interaction
    );
    
    // Generate new token
    const newToken = this.generateEntanglementToken(
      hardwareEntropy,
      updatedNeuromuscular,
      updatedCognitive,
      Date.now()
    );
    
    // Update baseline
    this.biologicalBaselines.set(sessionId, {
      ...baseline,
      hardwareEntropy,
      neuromuscular: updatedNeuromuscular,
      cognitive: updatedCognitive,
      lastRenewed: Date.now()
    });
    
    // Update entanglement
    this.entanglements.set(sessionId, {
      token: newToken,
      createdAt: Date.now(),
      renewAt: Date.now() + this.entanglementRenewal,
      version: (this.entanglements.get(sessionId)?.version || 0) + 1
    });
    
    return {
      success: true,
      tokenHash: newToken.substring(0, 16),
      version: this.entanglements.get(sessionId).version
    };
  }

  /**
   * Handle hijack detection
   */
  handleHijackDetection(sessionId, confidence, checks) {
    const failedChecks = checks.filter(c => !c.passed);
    
    // Determine hijack confidence level
    let hijackConfidence = 0;
    let reason = '';
    
    if (confidence < 0.3) {
      hijackConfidence = 0.95;
      reason = 'Multiple biological signatures mismatched';
    } else if (confidence < 0.5) {
      hijackConfidence = 0.8;
      reason = 'Significant biological deviation detected';
    } else if (confidence < 0.7) {
      hijackConfidence = 0.6;
      reason = 'Possible session continuity issue';
    }
    
    if (hijackConfidence > 0) {
      return {
        hijackDetected: true,
        confidence: hijackConfidence,
        reason,
        failedChecks: failedChecks.map(c => ({ type: c.type, reason: c.reason })),
        recommendedAction: this.getRecommendedAction(hijackConfidence),
        timestamp: Date.now()
      };
    }
    
    return { hijackDetected: false };
  }

  /**
   * Get recommended action based on hijack confidence
   */
  getRecommendedAction(confidence) {
    if (confidence >= 0.9) {
      return {
        action: 'immediate_termination',
        userExperience: 'Silent logout, security alert',
        notification: 'Email user about suspicious activity'
      };
    } else if (confidence >= 0.8) {
      return {
        action: 'soft_reauthentication',
        userExperience: '"Please tap to confirm it\'s you" (3 seconds)',
        escalation: 'If failed, require MFA'
      };
    } else if (confidence >= 0.6) {
      return {
        action: 'inject_canary_cluster',
        userExperience: 'Invisible tests, update baseline if passed',
        monitoring: 'Increase verification frequency'
      };
    } else {
      return {
        action: 'monitor',
        userExperience: 'No interruption',
        logging: 'Log anomaly for pattern analysis'
      };
    }
  }

  /**
   * Helper methods (simplified implementations)
   */
  sampleHardwareBreath(hardwareData) {
    // In production: Sample quantum entropy from device sensors
    // Simplified: Generate hash from available hardware data
    const data = JSON.stringify(hardwareData || { timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  captureNeuromuscularFingerprint(interaction) {
    // In production: Analyze micro-tremors in movement data
    // Simplified: Create signature from interaction characteristics
    return {
      jitterPattern: this.generateJitterSignature(interaction),
      movementProfile: this.analyzeMovementProfile(interaction),
      timestamp: Date.now()
    };
  }

  calibrateCognitiveRhythm(interaction) {
    // In production: Establish personal speed-of-thought curve
    // Simplified: Create timing profile
    return {
      reactionCurve: this.analyzeReactionCurve(interaction),
      processingSpeed: this.estimateProcessingSpeed(interaction),
      accelerationPattern: this.detectAccelerationPattern(interaction)
    };
  }

  generateEntanglementToken(hardwareEntropy, neuromuscular, cognitive, timestamp) {
    const data = `${hardwareEntropy}:${JSON.stringify(neuromuscular)}:${JSON.stringify(cognitive)}:${timestamp}`;
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  selectCanaryType(baseline) {
    // Select canary type based on user's baseline
    const types = Object.keys(this.canaryTypes);
    const weights = types.map(t => this.getCanaryWeight(t, baseline));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return types[i];
      }
    }
    
    return types[0];
  }

  getCanaryWeight(type, baseline) {
    // Weight canaries based on user's strengths/weaknesses
    switch (type) {
      case 'temporal':
        return baseline.cognitive?.processingSpeed > 0.7 ? 0.3 : 0.7;
      case 'spatial':
        return baseline.neuromuscular?.movementProfile?.accuracy > 0.7 ? 0.3 : 0.7;
      case 'cognitive':
        return baseline.cognitive?.reactionCurve?.consistency > 0.7 ? 0.3 : 0.7;
      default:
        return 0.5;
    }
  }

  createCanary(type, baseline) {
    const subtypes = this.canaryTypes[type];
    const subtype = subtypes[Math.floor(Math.random() * subtypes.length)];
    
    switch (subtype) {
      case 'button_drift':
        return {
          type: 'temporal',
          subtype: 'button_drift',
          invisible: true,
          delay: 12 + Math.random() * 8, // 12-20ms delay
          expectedResponse: 'unconscious_timing_adjustment'
        };
        
      case 'scroll_stutter':
        return {
          type: 'temporal',
          subtype: 'scroll_stutter',
          invisible: true,
          jitterPattern: this.generateMicroJitter(),
          expectedResponse: 'natural_smoothing'
        };
        
      case 'micro_offset':
        return {
          type: 'spatial',
          subtype: 'micro_offset',
          invisible: true,
          offset: { x: 2 + Math.random() * 2, y: 2 + Math.random() * 2 }, // 2-4px offset
          expectedResponse: 'unconscious_correction'
        };
        
      case 'semantic_drift':
        return {
          type: 'cognitive',
          subtype: 'semantic_drift',
          invisible: false, // Might be slightly noticeable
          driftType: 'word_order',
          expectedResponse: 'brief_pause_then_adapt'
        };
        
      default:
        return {
          type,
          subtype,
          invisible: true,
          expectedResponse: 'unconscious_adaptation'
        };
    }
  }