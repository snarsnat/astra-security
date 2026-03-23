/**
 * ASTRA Accessibility System
 * 
 * Security for everyone, with adaptations for:
 * - Motor disabilities
 * - Visual impairments
 * - Cognitive disabilities
 * - Assistive tech users
 * - No smartphone (desktop users)
 */

class AccessibilitySystem {
  constructor() {
    this.adaptations = {
      motor: [
        'extended_time',
        'voice_control',
        'single_switch',
        'head_tracking'
      ],
      visual: [
        'high_contrast',
        'screen_reader',
        'audio_only',
        'braille_display'
      ],
      cognitive: [
        'simplified_ui',
        'consistent_patterns',
        'no_time_pressure',
        'step_by_step'
      ],
      hearing: [
        'visual_cues',
        'subtitles',
        'vibration_feedback'
      ],
      assistiveTech: [
        'whitelist_mode',
        'extended_baseline',
        'custom_verification'
      ]
    };
    
    this.userProfiles = new Map();
  }

  /**
   * Detect user accessibility needs
   */
  detectNeeds(sessionData) {
    const needs = {
      motor: false,
      visual: false,
      cognitive: false,
      hearing: false,
      assistiveTech: false,
      desktop: false
    };
    
    const { deviceData, timingData, hardwareData } = sessionData;
    
    // Check for desktop (no motion sensors)
    if (deviceData && !deviceData.hasMotionSensors && deviceData.screenWidth > 768) {
      needs.desktop = true;
    }
    
    // Check for assistive tech indicators
    if (deviceData) {
      if (deviceData.hasScreenReader) needs.visual = true;
      if (deviceData.hasSwitchControl) needs.motor = true;
      if (deviceData.hasVoiceControl) needs.motor = true;
      if (deviceData.assistiveTech.length > 0) needs.assistiveTech = true;
    }
    
    // Check timing patterns for motor/cognitive indicators
    if (timingData && timingData.interactions.length > 5) {
      const avgTime = this.calculateAverageInteractionTime(timingData);
      if (avgTime > 2000) needs.motor = true;
      
      const consistency = this.calculateInteractionConsistency(timingData);
      if (consistency < 0.3) needs.cognitive = true;
    }
    
    // Check hardware data for visual/hearing indicators
    if (hardwareData) {
      if (hardwareData.brightnessLevel < 0.1) needs.visual = true;
      if (hardwareData.volumeLevel === 0) needs.hearing = true;
    }
    
    return needs;
  }

  /**
   * Adapt challenge for user needs
   */
  adaptChallenge(challengeConfig, userNeeds) {
    const adapted = { ...challengeConfig };
    
    // Apply adaptations based on needs
    if (userNeeds.motor) {
      adapted = this.adaptForMotor(adapted);
    }
    
    if (userNeeds.visual) {
      adapted = this.adaptForVisual(adapted);
    }
    
    if (userNeeds.cognitive) {
      adapted = this.adaptForCognitive(adapted);
    }
    
    if (userNeeds.hearing) {
      adapted = this.adaptForHearing(adapted);
    }
    
    if (userNeeds.desktop) {
      adapted = this.adaptForDesktop(adapted);
    }
    
    if (userNeeds.assistiveTech) {
      adapted = this.adaptForAssistiveTech(adapted);
    }
    
    // Update verification thresholds for adaptations
    adapted.verification = this.adjustVerification(adapted.verification, userNeeds);
    
    return adapted;
  }

  /**
   * Adaptations for motor disabilities
   */
  adaptForMotor(challenge) {
    const adapted = { ...challenge };
    
    switch (adapted.type) {
      case 'pulse':
        adapted.duration *= 2;
        adapted.verification.tolerance *= 1.5;
        adapted.accessibility.extendedTime = true;
        adapted.accessibility.alternative = 'voice_tap';
        break;
        
      case 'tilt':
        adapted.type = 'touch_drag';
        adapted.instructions = 'Drag the ball to the hole';
        adapted.sensitivity = 0.3;
        adapted.verification.angleThreshold = null;
        adapted.verification.dragDistance = 100;
        break;
        
      case 'flick':
        adapted.type = 'swipe';
        adapted.instructions = 'Swipe the card away';
        adapted.minVelocity = 0.2;
        adapted.verification.minVelocity = 0.1;
        break;
        
      case 'breath':
        adapted.type = 'touch_hold';
        adapted.instructions = 'Touch and hold for 2 seconds';
        adapted.duration = 4000;
        adapted.verification.minDuration = 3500;
        break;
    }
    
    return adapted;
  }

  /**
   * Adaptations for visual impairments
   */
  adaptForVisual(challenge) {
    const adapted = { ...challenge };
    
    adapted.visualFeedback = false;
    adapted.hapticFeedback = true;
    adapted.accessibility.audioCue = true;
    adapted.accessibility.highContrast = true;
    
    switch (adapted.type) {
      case 'pulse':
        adapted.instructions = 'Tap when you feel the vibration pulse';
        adapted.pattern = adapted.pattern.map(time => ({
          time,
          vibration: 'strong'
        }));
        break;
        
      case 'tilt':
        adapted.type = 'audio_tilt';
        adapted.instructions = 'Tilt when you hear the tone change';
        adapted.audioCues = {
          center: 'low_tone',
          target: 'high_tone',
          success: 'rising_scale'
        };
        break;
        
      case 'reaction_game':
        adapted.type = 'audio_reaction';
        adapted.instructions = 'Tap when you hear the high tone';
        adapted.visualFeedback = false;
        adapted.audioCues = {
          ready: 'low_beep',
          go: 'high_beep'
        };
        break;
    }
    
    return adapted;
  }

  /**
   * Adaptations for cognitive disabilities
   */
  adaptForCognitive(challenge) {
    const adapted = { ...challenge };
    
    adapted.accessibility.simplifiedUI = true;
    adapted.accessibility.noTimePressure = true;
    adapted.accessibility.stepByStep = true;
    
    // Simplify instructions
    adapted.instructions = this.simplifyInstructions(adapted.instructions);
    
    // Remove time pressure
    if (adapted.timeout) {
      adapted.timeout *= 2;
    }
    
    // Add progress indicators
    adapted.progress = {
      steps: 3,
      current: 1,
      visual: true,
      audio: true
    };
    
    return adapted;
  }

  /**
   * Adaptations for hearing impairments
   */
  adaptForHearing(challenge) {
    const adapted = { ...challenge };
    
    adapted.audioFeedback = false;
    adapted.visualFeedback = true;
    adapted.hapticFeedback = true;
    adapted.accessibility.visualCues = true;
    adapted.accessibility.subtitles = true;
    
    if (adapted.successSound) {
      adapted.successVibration = 'pattern_success';
    }
    
    return adapted;
  }

  /**
   * Adaptations for desktop users (no smartphone)
   */
  adaptForDesktop(challenge) {
    const adapted = { ...challenge };
    
    switch (adapted.type) {
      case 'pulse':
        adapted.type = 'keyboard_rhythm';
        adapted.instructions = 'Press SPACE in rhythm with the highlight';
        adapted.pattern = adapted.pattern; // Use same rhythm
        adapted.verification.keyPressTiming = true;
        break;
        
      case 'tilt':
        adapted.type = 'mouse_tilt';
        adapted.instructions = 'Move mouse to guide the ball';
        adapted.verification.mouseMovement = true;
        break;
        
      case 'breath':
        adapted.type = 'mouse_steady';
        adapted.instructions = 'Keep mouse still for 2 seconds';
        adapted.verification.mouseStability = true;
        break;
        
      case 'flick':
        adapted.type = 'mouse_flick';
        adapted.instructions = 'Flick mouse quickly to the side';
        adapted.verification.mouseVelocity = true;
        break;
    }
    
    // Add SMS backup option
    adapted.fallback = {
      type: 'sms',
      available: true,
      instructions: 'Or verify via SMS code'
    };
    
    return adapted;
  }

  /**
   * Adaptations for assistive tech users
   */
  adaptForAssistiveTech(challenge) {
    const adapted = { ...challenge };
    
    adapted.accessibility.whitelistMode = true;
    adapted.accessibility.extendedBaseline = true;
    adapted.accessibility.customVerification = true;
    
    // Use hardware breath as primary verification
    adapted.primaryVerification = 'hardware_breath';
    adapted.secondaryVerification = challenge.type;
    
    // Extended time for all interactions
    if (adapted.duration) {
      adapted.duration *= 3;
    }
    
    if (adapted.timeout) {
      adapted.timeout *= 3;
    }
    
    // Custom verification path
    adapted.customPath = {
      method: 'assistive_tech',
      requirements: ['hardware_breath', 'extended_timing'],
      alternatives: ['email_link', 'human_verification']
    };
    
    return adapted;
  }

  /**
   * Adjust verification thresholds for adaptations
   */
  adjustVerification(verification, needs) {
    const adjusted = { ...verification };
    
    // Looser thresholds for accessibility needs
    if (needs.motor || needs.cognitive) {
      if (adjusted.tolerance) adjusted.tolerance *= 2;
      if (adjusted.minAccuracy) adjusted.minAccuracy *= 0.7;
      if (adjusted.timeThreshold) adjusted.timeThreshold *= 2;
    }
    
    // Different thresholds for visual/hearing
    if (needs.visual) {
      if (adjusted.visualAccuracy) delete adjusted.visualAccuracy;
    }
    
    if (needs.hearing) {
      if (adjusted.audioAccuracy) delete adjusted.audioAccuracy;
    }
    
    return adjusted;
  }

  /**
   * Create user accessibility profile
   */
  createProfile(userId, needs, preferences = {}) {
    const profile = {
      userId,
      needs,
      preferences,
      adaptations: this.getRecommendedAdaptations(needs),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      usageStats: {
        challengesCompleted: 0,
        adaptationsUsed: {},
        successRate: 1.0
      }
    };
    
    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Get recommended adaptations for detected needs
   */
  getRecommendedAdaptations(needs) {
    const adaptations = [];
    
    for (const [needType, hasNeed] of Object.entries(needs)) {
      if (hasNeed && this.adaptations[needType]) {
        adaptations.push(...this.adaptations[needType]);
      }
    }
    
    // Remove duplicates
    return [...new Set(adaptations)];
  }

  /**
   * Simplify instructions for cognitive accessibility
   */
  simplifyInstructions(instructions) {
    // Basic simplification rules
    let simplified = instructions
      .replace(/Quick tap to continue/i, 'Tap to continue')
      .replace(/Tilt your phone/i, 'Move your phone')
      .replace(/Flick the card/i, 'Swipe the card')
      .replace(/Hold your phone steady/i, 'Keep phone still')
      .replace(/as soon as/i, 'when')
      .replace(/Complete this quick game/i, 'Do this game');
    
    // Limit sentence length
    const sentences = simplified.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 2) {
      simplified = sentences.slice(0, 2).join('. ') + '.';
    }
    
    return simplified;
  }

  /**
   * Helper methods
   */
  calculateAverageInteractionTime(timingData) {
    const interactions = timingData.interactions;
    if (interactions.length === 0) return 0;
    
    const total = interactions.reduce((sum, i) => sum + (i.duration || 100), 0);
    return total / interactions.length;
  }

  calculateInteractionConsistency(timingData) {
    const interactions = timingData.interactions;
    if (interactions.length < 3) return 1.0;
    
    const durations = interactions.map(i => i.duration || 100);
    const mean = durations.reduce((a, b) => a + b) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower stdDev/mean ratio = more consistent
    const consistency = 1 - Math.min(stdDev / mean, 1);
    return consistency;
  }

  /**
   * Update user profile with completion data
   */
  updateProfile(userId, challengeType, success, adaptationUsed = null) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;
    
    profile.updatedAt = Date.now();
    profile.usageStats.challengesCompleted++;
    
    if (adaptationUsed) {
      profile.usageStats.adaptationsUsed[adaptationUsed] = 
        (profile.usageStats.adaptationsUsed[adaptationUsed] || 0) + 1;
    }
    
    // Update success rate (moving average)
    const currentRate = profile.usageStats.successRate;
    const newRate = success ? 0.95 : 0.7; // Weight recent results more
    profile.usageStats.successRate = currentRate * 0.8 + newRate * 0.2;
    
    // Adjust adaptations based on success
    if (!success && adaptationUsed) {
      this.adjustAdaptationEffectiveness(userId, adaptationUsed, false);
    }
  }

  adjustAdaptationEffectiveness(userId, adaptation, effective) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;
    
    // Track adaptation effectiveness
    if (!profile.adaptationEffectiveness) {
      profile.adaptationEffectiveness = {};
    }
    
    const current = profile.adaptationEffectiveness[adaptation] || { attempts: 0, successes: 0 };
    current.attempts++;
    if (effective) current.successes++;
    
    profile.adaptationEffectiveness[adaptation] = current;
    
    // If adaptation consistently ineffective, suggest alternatives
    if (current.attempts >= 5 && current.successes / current.attempts < 0.3) {
      this.suggestAlternativeAdaptation(userId, adaptation);
    }
  }

  suggestAlternativeAdaptation(userId, ineffectiveAdaptation) {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;
    
    const needs = profile.needs;
    const alternatives = [];
    
    // Find alternative adaptations for the same need
    for (const [needType, hasNeed] of Object.entries(needs)) {
      if (hasNeed) {
        const available = this.adaptations[needType] || [];
        const otherAdaptations = available.filter(a => a !== ineffectiveAdaptation);
        alternatives.push(...otherAdaptations);
      }
    }
    
    if (alternatives.length > 0) {
      profile.suggestedAlternatives = profile.suggestedAlternatives || [];
      profile.suggestedAlternatives.push({
        ineffective: ineffectiveAdaptation,
        alternatives: [...new Set(alternatives)].slice(0, 3),
        suggestedAt: Date.now()
      });
    }
  }

  /**
   * Get accessibility report
   */
  getAccessibilityReport() {
    const totalUsers = this.userProfiles.size;
    const needsDistribution = {};
    const adaptationUsage = {};
    
    for (const profile of this.userProfiles.values()) {
      for (const [need, hasNeed] of Object.entries(profile.needs)) {
        if (hasNeed) {
          needsDistribution[need] = (needsDistribution[need] || 0) + 1;
        }
      }
      
      for (const [adaptation, count] of Object.entries(profile.usageStats.adaptationsUsed || {})) {
        adaptationUsage[adaptation] = (adaptationUsage[adaptation] || 0) + count;
      }
    }
    
    // Calculate percentages
    const needsPercent = {};
    for (const [need, count] of Object.entries(needsDistribution)) {
      needsPercent[need] = totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) + '%' : '0%';
    }
    
    return {
      totalUsers,
      needsDistribution: needsPercent,
      topAdaptations: Object.entries(adaptationUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([adaptation, count]) => ({ adaptation, count })),
      overallSuccessRate: this.calculateOverallSuccessRate(),
      timestamp: Date.now()
    };
  }

  calculateOverallSuccessRate() {
    let totalRate = 0;
    let count = 0;
    
    for (const profile of this.userProfiles.values()) {
      if (profile.usageStats.successRate) {
        totalRate += profile.usageStats.successRate;
        count++;
      }
    }
    
    return count > 0 ? (totalRate / count).toFixed(3) : 0;
  }
}

module.exports = AccessibilitySystem;