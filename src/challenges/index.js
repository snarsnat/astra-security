/**
 * ASTRA Challenge System
 * 
 * Physical challenges that are fast, satisfying, and only biology can pass.
 * Never text-based, never image-based, always physical.
 */

class ChallengeSystem {
  constructor() {
    this.challenges = {
      nudge: [
        'pulse',
        'tilt',
        'breath',
        'flick'
      ],
      pause: [
        'reaction_game',
        'balance_game',
        'rhythm_game',
        'memory_game'
      ]
    };
    
    this.challengeHistory = new Map(); // sessionId -> [challenges]
    this.mutationSchedule = this.generateMutationSchedule();
  }

  /**
   * Select appropriate nudge challenge (3-second delight)
   */
  async selectNudgeChallenge(userState) {
    const available = this.getAvailableChallenges('nudge', userState);
    const selected = this.selectChallenge(available, userState);
    
    return this.generateChallenge(selected, userState);
  }

  /**
   * Select appropriate pause challenge (10-second engaging)
   */
  async selectPauseChallenge(userState) {
    const available = this.getAvailableChallenges('pause', userState);
    const selected = this.selectChallenge(available, userState);
    
    return this.generateChallenge(selected, userState);
  }

  /**
   * Get available challenges based on user context and mutation schedule
   */
  getAvailableChallenges(type, userState) {
    const baseChallenges = this.challenges[type];
    
    // Filter based on user capabilities
    const filtered = baseChallenges.filter(challenge => 
      this.isChallengeSuitable(challenge, userState)
    );
    
    // Apply mutation schedule (hourly rotation)
    const currentHour = new Date().getHours();
    const mutationIndex = currentHour % this.mutationSchedule.length;
    const mutation = this.mutationSchedule[mutationIndex];
    
    // Prioritize challenges that match current mutation
    const prioritized = [...filtered].sort((a, b) => {
      const aInMutation = mutation.challenges.includes(a) ? 1 : 0;
      const bInMutation = mutation.challenges.includes(b) ? 1 : 0;
      return bInMutation - aInMutation;
    });
    
    return prioritized.length > 0 ? prioritized : filtered;
  }

  /**
   * Select specific challenge with anti-pattern prevention
   */
  selectChallenge(available, userState) {
    const sessionId = userState.sessionId;
    const history = this.challengeHistory.get(sessionId) || [];
    
    // Don't repeat recent challenges
    const recent = history.slice(-3);
    const candidates = available.filter(c => !recent.includes(c));
    
    // If all recent, expand selection
    const selectionPool = candidates.length > 0 ? candidates : available;
    
    // Weighted random selection
    const weights = selectionPool.map(c => this.getChallengeWeight(c, userState));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < selectionPool.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        const selected = selectionPool[i];
        
        // Update history
        history.push(selected);
        if (history.length > 10) history.shift();
        this.challengeHistory.set(sessionId, history);
        
        return selected;
      }
    }
    
    // Fallback
    return selectionPool[0] || available[0];
  }

  /**
   * Generate challenge configuration
   */
  generateChallenge(type, userState) {
    switch (type) {
      case 'pulse':
        return this.generatePulseChallenge(userState);
      case 'tilt':
        return this.generateTiltChallenge(userState);
      case 'breath':
        return this.generateBreathChallenge(userState);
      case 'flick':
        return this.generateFlickChallenge(userState);
      case 'reaction_game':
        return this.generateReactionGame(userState);
      case 'balance_game':
        return this.generateBalanceGame(userState);
      case 'rhythm_game':
        return this.generateRhythmGame(userState);
      case 'memory_game':
        return this.generateMemoryGame(userState);
      default:
        return this.generatePulseChallenge(userState);
    }
  }

  /**
   * Challenge: The Pulse
   * Tap screen in rhythm with vibration
   */
  generatePulseChallenge(userState) {
    const pattern = this.generateRhythmPattern();
    
    return {
      type: 'pulse',
      name: 'The Pulse',
      description: 'Tap with the vibration',
      instructions: 'Tap the circle in rhythm with the pulse',
      duration: 3000,
      pattern,
      hapticFeedback: true,
      visualFeedback: true,
      successSound: 'chime_positive',
      accessibility: {
        audioCue: true,
        highContrast: true,
        extendedTime: false
      },
      verification: {
        tolerance: 0.3, // 30% timing tolerance
        minAccuracy: 0.7 // 70% accuracy required
      }
    };
  }

  /**
   * Challenge: The Tilt
   * Tilt phone to "pour" virtual ball
   */
  generateTiltChallenge(userState) {
    const direction = ['left', 'right', 'up', 'down'][Math.floor(Math.random() * 4)];
    
    return {
      type: 'tilt',
      name: 'The Tilt',
      description: 'Tilt to guide the ball',
      instructions: `Tilt your phone ${direction} to pour the ball into the hole`,
      duration: 3000,
      direction,
      sensitivity: 0.7,
      hapticFeedback: true,
      visualFeedback: true,
      successSound: 'ball_drop',
      accessibility: {
        alternative: 'touch_drag',
        audioCue: true,
        extendedTime: false
      },
      verification: {
        angleThreshold: 30, // degrees
        timeThreshold: 2000 // ms
      }
    };
  }

  /**
   * Challenge: The Breath
   * Hold phone still for 2 seconds
   */
  generateBreathChallenge(userState) {
    return {
      type: 'breath',
      name: 'The Breath',
      description: 'Hold still for a moment',
      instructions: 'Hold your phone steady for 2 seconds',
      duration: 2000,
      stabilityThreshold: 0.1, // maximum movement
      hapticFeedback: false,
      visualFeedback: true,
      successSound: 'breath_complete',
      accessibility: {
        alternative: 'touch_hold',
        audioCue: true,
        extendedTime: true
      },
      verification: {
        maxMovement: 0.15,
        minDuration: 1800
      }
    };
  }

  /**
   * Challenge: The Flick
   * Flick virtual card off screen
   */
  generateFlickChallenge(userState) {
    const direction = ['left', 'right'][Math.floor(Math.random() * 2)];
    
    return {
      type: 'flick',
      name: 'The Flick',
      description: 'Flick the card away',
      instructions: `Flick the card ${direction} off the screen`,
      duration: 2000,
      direction,
      minVelocity: 0.5,
      hapticFeedback: true,
      visualFeedback: true,
      successSound: 'card_flick',
      accessibility: {
        alternative: 'swipe',
        audioCue: true,
        extendedTime: false
      },
      verification: {
        minVelocity: 0.3,
        directionAccuracy: 0.8
      }
    };
  }

  /**
   * Challenge: Reaction Game (Pause tier)
   */
  generateReactionGame(userState) {
    return {
      type: 'reaction_game',
      name: 'Quick Tap',
      description: 'Tap when the circle turns green',
      instructions: 'Tap the circle as soon as it turns green. 3 rounds.',
      duration: 10000,
      rounds: 3,
      minReactionTime: 100,
      maxReactionTime: 1000,
      hapticFeedback: true,
      visualFeedback: true,
      successSound: 'game_success',
      accessibility: {
        colorBlindMode: true,
        audioCue: true,
        extendedTime: true
      },
      verification: {
        avgReactionTime: 500,
        consistencyThreshold: 0.5
      }
    };
  }

  /**
   * Challenge: Balance Game (Pause tier)
   */
  generateBalanceGame(userState) {
    return {
      type: 'balance_game',
      name: 'Balance Ball',
      description: 'Keep the ball centered',
      instructions: 'Tilt to keep the ball in the center for 5 seconds',
      duration: 10000,
      targetTime: 5000,
      stabilityThreshold: 0.2,
      hapticFeedback: true,
      visualFeedback: true,
      successSound: 'balance_success',
      accessibility: {
        alternative: 'touch_drag',
        audioCue: true,
        extendedTime: true
      },
      verification: {
        timeInCenter: 4500,
        maxDeviation: 0.3
      }
    };
  }

  /**
   * Helper methods
   */
  isChallengeSuitable(challenge, userState) {
    const device = userState.sessionData?.deviceData;
    
    if (!device) return true;
    
    // Check device capabilities
    switch (challenge) {
      case 'tilt':
      case 'balance_game':
        return device.hasGyroscope === true;
      case 'pulse':
      case 'flick':
        return device.hasTouch === true;
      case 'breath':
        return device.hasMotionSensors === true;
      default:
        return true;
    }
  }

  getChallengeWeight(challenge, userState) {
    let weight = 1.0;
    
    // Prefer challenges user has succeeded with before
    const history = this.challengeHistory.get(userState.sessionId) || [];
    const successRate = this.calculateSuccessRate(challenge, history);
    if (successRate > 0.8) weight *= 1.5;
    
    // Adjust for time of day
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) {
      // Late night - prefer quieter challenges
      if (challenge === 'breath') weight *= 2.0;
      if (challenge === 'pulse') weight *= 0.5;
    }
    
    return weight;
  }

  calculateSuccessRate(challenge, history) {
    const challenges = history.filter(h => h.challenge === challenge);
    if (challenges.length === 0) return 0.5; // Default
    
    const successes = challenges.filter(h => h.success).length;
    return successes / challenges.length;
  }

  generateRhythmPattern() {
    const patterns = [
      [500, 500, 500], // Simple triple
      [300, 700, 300], // Swing
      [400, 400, 400, 400], // Quad
      [200, 200, 600] // Quick-quick-slow
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  generateMutationSchedule() {
    // Generate 24-hour mutation schedule
    const schedule = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const challenges = this.selectMutationChallenges(hour);
      schedule.push({
        hour,
        challenges,
        theme: this.getHourTheme(hour)
      });
    }
    
    return schedule;
  }

  selectMutationChallenges(hour) {
    const allChallenges = [...this.challenges.nudge, ...this.challenges.pause];
    
    // Select 2-3 challenges for this hour
    const count = 2 + Math.floor(Math.random() * 2);
    const selected = [];
    
    while (selected.length < count) {
      const challenge = allChallenges[Math.floor(Math.random() * allChallenges.length)];
      if (!selected.includes(challenge)) {
        selected.push(challenge);
      }
    }
    
    return selected;
  }

  getHourTheme(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Verify challenge completion
   */
  verifyCompletion(challengeConfig, userResponse) {
    const { type, verification } = challengeConfig;
    
    switch (type) {
      case 'pulse':
        return this.verifyPulse(verification, userResponse);
      case 'tilt':
        return this.verifyTilt(verification, userResponse);
      case 'breath':
        return this.verifyBreath(verification, userResponse);
      case 'flick':
        return this.verifyFlick(verification, userResponse);
      case 'reaction_game':
        return this.verifyReactionGame(verification, userResponse);
      case 'balance_game':
        return this.verifyBalanceGame(verification, userResponse);
      default:
        return { success: true, confidence: 0.8 };
    }
  }

  verifyPulse(verification, response) {
    const { pattern, taps } = response;
    if (!pattern || !taps || taps.length !== pattern.length) {
      return { success: false, confidence: 0.1 };
    }
    
    let correct = 0;
    for (let i = 0; i < pattern.length; i++) {
      const expected = pattern[i];
      const actual = taps[i];
      const tolerance = expected * verification.tolerance;
      
      if (Math.abs(actual - expected) <= tolerance) {
        correct++;
      }
    }
    
    const accuracy = correct / pattern.length;
    const success = accuracy >= verification.minAccuracy;
    
    return {
      success,
      confidence: accuracy,
      accuracy,
      details: { correct, total: pattern.length }
    };
  }

  verifyTilt(verification, response) {
    const { angle, time } = response;
    const success = angle >= verification.angleThreshold && time <= verification.timeThreshold;
    const confidence = success ? 0.9 : 0.3;
    
    return {
      success,
      confidence,
      details: { angle, time }
    };
  }

  // Other verification methods would be implemented similarly...

  /**
   * Get current mutation status
   */
  getMutationStatus() {
    const currentHour = new Date().getHours();
    const currentMutation = this.mutationSchedule[currentHour];
    const nextHour = (currentHour + 1) % 24;
    const nextMutation = this.mutationSchedule[nextHour];
    
    return {
      current: {
        hour: currentHour,
        challenges: currentMutation.challenges,
        theme: currentMutation.theme
      },
      next: {
        hour: nextHour,
        challenges: nextMutation.challenges,
        refreshIn: this.minutesUntilNextHour()
      },
      schedule: this.mutationSchedule.map(m => ({
        hour: m.hour,
        theme: m.theme,
        challengeCount: m.challenges.length
      }))
    };
  }

  minutesUntilNextHour() {
    const now = new Date();
    return 60 - now.getMinutes();
  }
}

module.exports = ChallengeSystem;