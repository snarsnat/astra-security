/**
 * ASTRA Humanity Verification System
 * 
 * When OOS > 3, triggers "Humanity Verification" challenges
 * that AI/hackers cannot bypass.
 */

const crypto = require('crypto');

class HumanityVerification {
  constructor() {
    // Challenge types that are AI-resistant
    this.challengeTypes = {
      face: ['show_face', 'blink_pattern', 'head_turn'],
      audio: ['random_sentence', 'emotion_tone', 'background_sounds'],
      cognitive: ['describe_photo', 'context_understanding', 'moral_judgment'],
      physical: ['device_tilt', 'screen_tap_rhythm', 'breath_hold']
    };
    
    // Challenge difficulty levels
    this.difficultyLevels = {
      easy: { timeLimit: 30, attempts: 3 },
      medium: { timeLimit: 20, attempts: 2 },
      hard: { timeLimit: 15, attempts: 1 }
    };
    
    // Verification sessions
    this.sessions = new Map();
    
    console.log('ASTRA Humanity Verification System initialized');
  }

  /**
   * Trigger humanity verification when OOS > 3
   */
  triggerVerification(sessionId, oosScore, userContext) {
    const difficulty = this.determineDifficulty(oosScore);
    const challenge = this.generateChallenge(difficulty, userContext);
    
    // Create verification session
    const session = {
      sessionId,
      oosScore,
      difficulty,
      challenge,
      createdAt: Date.now(),
      attempts: 0,
      passed: false,
      completed: false
    };
    
    this.sessions.set(sessionId, session);
    
    return {
      verificationRequired: true,
      message: "Humanity Verification Required",
      reason: `OOS score ${oosScore.toFixed(1)} indicates possible non-human activity`,
      challenge: challenge.description,
      type: challenge.type,
      timeLimit: challenge.timeLimit,
      attemptsAllowed: challenge.attempts,
      instructions: challenge.instructions,
      uiComponent: this.getUIComponent(challenge.type)
    };
  }

  /**
   * Determine challenge difficulty based on OOS score
   */
  determineDifficulty(oosScore) {
    if (oosScore >= 4.0) return 'hard';
    if (oosScore >= 3.5) return 'medium';
    return 'easy';
  }

  /**
   * Generate AI-resistant challenge
   */
  generateChallenge(difficulty, userContext) {
    // Select challenge type based on user context
    const type = this.selectChallengeType(userContext);
    const subtype = this.selectChallengeSubtype(type);
    
    const config = this.difficultyLevels[difficulty];
    
    switch (subtype) {
      case 'show_face':
        return {
          type: 'face',
          subtype: 'show_face',
          description: 'Show your face to the camera',
          instructions: 'Position your face within the frame and maintain eye contact for 3 seconds',
          timeLimit: config.timeLimit,
          attempts: config.attempts,
          aiResistance: 'high', // Requires live facial presence
          verificationMethod: 'facial_liveness',
          params: {
            requireBlink: true,
            requireHeadMovement: false,
            antiSpoofing: true
          }
        };
        
      case 'random_sentence':
        const sentence = this.generateRandomSentence();
        return {
          type: 'audio',
          subtype: 'random_sentence',
          description: 'Say the following sentence out loud',
          instructions: `Speak clearly: "${sentence}"`,
          sentence,
          timeLimit: config.timeLimit,
          attempts: config.attempts,
          aiResistance: 'high', // Requires unique vocal characteristics
          verificationMethod: 'voice_biometrics',
          params: {
            checkBackgroundNoise: true,
            requireEmotion: false,
            antiReplay: true
          }
        };
        
      case 'describe_photo':
        const photoDescription = this.generatePhotoDescription();
        return {
          type: 'cognitive',
          subtype: 'describe_photo',
          description: 'Describe what you see in this photo',
          instructions: `Look at the photo and describe it in 10 words or less. Focus on: ${photoDescription.focus}`,
          photoDescription,
          timeLimit: config.timeLimit,
          attempts: config.attempts,
          aiResistance: 'very_high', // Requires semantic understanding
          verificationMethod: 'semantic_analysis',
          params: {
            wordLimit: 10,
            requireOriginality: true,
            checkForPatterns: true
          }
        };
        
      case 'device_tilt':
        const pattern = this.generateTiltPattern();
        return {
          type: 'physical',
          subtype: 'device_tilt',
          description: 'Tilt your device following the pattern',
          instructions: `Tilt your device: ${pattern.description}`,
          pattern,
          timeLimit: config.timeLimit,
          attempts: config.attempts,
          aiResistance: 'high', // Requires physical device interaction
          verificationMethod: 'gyroscope_pattern',
          params: {
            precision: 0.8,
            requireContinuity: true,
            checkForAutomation: true
          }
        };
        
      default:
        return this.generateChallenge('easy', userContext);
    }
  }

  /**
   * Select challenge type based on user context
   */
  selectChallengeType(userContext) {
    // Prefer challenges that match user's capabilities
    const { hasCamera = true, hasMicrophone = true, hasMotionSensors = true } = userContext;
    
    const availableTypes = [];
    if (hasCamera) availableTypes.push('face');
    if (hasMicrophone) availableTypes.push('audio');
    availableTypes.push('cognitive'); // Always available
    if (hasMotionSensors) availableTypes.push('physical');
    
    if (availableTypes.length === 0) return 'cognitive';
    
    // Weighted random selection
    const weights = {
      face: 0.25,
      audio: 0.25,
      cognitive: 0.3,
      physical: 0.2
    };
    
    let totalWeight = 0;
    for (const type of availableTypes) {
      totalWeight += weights[type] || 0.1;
    }
    
    let random = Math.random() * totalWeight;
    for (const type of availableTypes) {
      random -= weights[type] || 0.1;
      if (random <= 0) {
        return type;
      }
    }
    
    return availableTypes[0];
  }

  /**
   * Select challenge subtype
   */
  selectChallengeSubtype(type) {
    const subtypes = this.challengeTypes[type];
    return subtypes[Math.floor(Math.random() * subtypes.length)];
  }

  /**
   * Submit verification response
   */
  submitResponse(sessionId, response) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'No active verification session' };
    }
    
    if (session.completed) {
      return { error: 'Verification already completed' };
    }
    
    session.attempts++;
    session.lastResponse = response;
    session.lastAttemptTime = Date.now();
    
    // Check if time limit exceeded
    if (Date.now() - session.createdAt > session.challenge.timeLimit * 1000) {
      session.completed = true;
      return {
        passed: false,
        reason: 'Time limit exceeded',
        attemptsUsed: session.attempts,
        canRetry: false
      };
    }
    
    // Check if max attempts reached
    if (session.attempts >= session.challenge.attempts) {
      session.completed = true;
      return {
        passed: false,
        reason: 'Maximum attempts reached',
        attemptsUsed: session.attempts,
        canRetry: false
      };
    }
    
    // Verify the response
    const verificationResult = this.verifyResponse(session.challenge, response);
    
    if (verificationResult.passed) {
      session.passed = true;
      session.completed = true;
      session.verifiedAt = Date.now();
      
      return {
        passed: true,
        confidence: verificationResult.confidence,
        message: 'Humanity verified successfully',
        attemptsUsed: session.attempts,
        sessionCleared: true
      };
    } else {
      return {
        passed: false,
        reason: verificationResult.reason,
        attemptsUsed: session.attempts,
        attemptsRemaining: session.challenge.attempts - session.attempts,
        canRetry: true,
        hint: verificationResult.hint
      };
    }
  }

  /**
   * Verify challenge response
   */
  verifyResponse(challenge, response) {
    switch (challenge.subtype) {
      case 'show_face':
        return this.verifyFaceResponse(response);
        
      case 'random_sentence':
        return this.verifyAudioResponse(challenge, response);
        
      case 'describe_photo':
        return this.verifyCognitiveResponse(challenge, response);
        
      case 'device_tilt':
        return this.verifyPhysicalResponse(challenge, response);
        
      default:
        return { passed: false, reason: 'Unknown challenge type', confidence: 0 };
    }
  }

  /**
   * Verify face response (simplified)
   */
  verifyFaceResponse(response) {
    // In production: Use facial recognition and liveness detection
    // Simplified: Check for basic face data
    const hasFace = response.faceData && response.faceData.faceCount > 0;
    const hasLiveness = response.faceData && response.faceData.livenessScore > 0.7;
    
    if (!hasFace) {
      return { passed: false, reason: 'No face detected', confidence: 0 };
    }
    
    if (!hasLiveness) {
      return { passed: false, reason: 'Liveness check failed', confidence: 0.3 };
    }
    
    return { passed: true, confidence: 0.9 };
  }

  /**
   * Verify audio response (simplified)
   */
  verifyAudioResponse(challenge, response) {
    // In production: Use voice biometrics and speech recognition
    // Simplified: Check if sentence was spoken
    const hasAudio = response.audioData && response.audioData.duration > 1;
    const matchesSentence = response.transcript && 
      response.transcript.toLowerCase().includes(challenge.sentence.toLowerCase());
    
    if (!hasAudio) {
      return { passed: false, reason: 'No audio detected', confidence: 0 };
    }
    
    if (!matchesSentence) {
      return { 
        passed: false, 
        reason: 'Incorrect sentence spoken', 
        confidence: 0.2,
        hint: `Please say: "${challenge.sentence}"`
      };
    }
    
    // Check for unique voice characteristics (simplified)
    const voiceUniqueness = response.audioData.pitchVariation > 0.3 ? 0.8 : 0.4;
    
    return { passed: true, confidence: voiceUniqueness };
  }

  /**
   * Verify cognitive response (simplified)
   */
  verifyCognitiveResponse(challenge, response) {
    // In production: Use NLP to analyze semantic understanding
    // Simplified: Check for relevant keywords and originality
    
    const description = response.description || '';
    const words = description.toLowerCase().split(/\s+/);
    
    // Check word limit
    if (words.length > 10) {
      return { passed: false, reason: 'Description too long (max 10 words)', confidence: 0 };
    }
    
    // Check for relevant keywords
    const relevantKeywords = challenge.photoDescription.keywords || [];
    const matches = relevantKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (matches.length === 0) {
      return { 
        passed: false, 
        reason: 'Description not relevant to photo', 
        confidence: 0.1,
        hint: `Focus on: ${challenge.photoDescription.focus}`
      };
    }
    
    // Check for originality (avoid generic descriptions)
    const genericPhrases = ['a picture', 'an image', 'photo of', 'picture of'];
    const isGeneric = genericPhrases.some(phrase => 
      description.toLowerCase().includes(phrase)
    );
    
    if (isGeneric) {
      return { 
        passed: false, 
        reason: 'Description too generic', 
        confidence: 0.3,
        hint: 'Be more specific about what you see'
      };
    }
    
    return { passed: true, confidence: 0.8 };
  }

  /**
   * Verify physical response (simplified)
   */
  verifyPhysicalResponse(challenge, response) {
    // In production: Analyze gyroscope/accelerometer patterns
    // Simplified: Check for pattern matching
    
    const hasMotionData = response.motionData && response.motionData.pattern;
    if (!hasMotionData) {
      return { passed: false, reason: 'No motion data received', confidence: 0 };
    }
    
    // Check pattern similarity (simplified)
    const expectedPattern = challenge.pattern.sequence;
    const actualPattern = response.motionData.pattern;
    
    let similarity = 0;
    if (actualPattern.length === expectedPattern.length) {
      let matches = 0;
      for (let i = 0; i < expectedPattern.length; i++) {
        if (Math.abs(actualPattern[i] - expectedPattern[i]) < 0.2) {
          matches++;
        }
      }
      similarity = matches / expectedPattern.length;
    }
    
    if (similarity < 0.7) {
      return { 
        passed: false, 
        reason: 'Pattern not followed correctly', 
        confidence: similarity,
        hint: `Follow this pattern: ${challenge.pattern.description}`
      };
    }
    
    return { passed: true, confidence: similarity };
  }

  /**
   * Get UI component for challenge type
   */
  getUIComponent(challengeType) {
    const components = {
      face: 'FaceVerificationUI',
      audio: 'AudioVerificationUI',
      cognitive: 'CognitiveVerificationUI',
      physical: 'PhysicalVerificationUI'
    };
    
    return {
      component: components[challengeType] || 'GenericVerificationUI',
      props: {
        challengeType,
        requiresCamera: challengeType === 'face',
        requiresMicrophone: challengeType === 'audio',
        requiresMotion: challengeType === 'physical'
      }
    };
  }

  /**
   * Get session status
   */
  getSessionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      sessionId,
      oosScore: session.oosScore,
      difficulty: session.difficulty,
      challengeType: session.challenge.type,
      attempts: session.attempts,
      passed: session.passed,
      completed: session.completed,
      timeRemaining: session.completed ? 0 : 
        Math.max(0, (session.challenge.timeLimit * 1000) - (Date.now() - session.createdAt)) / 1000,
      createdAt: session.createdAt
    };
  }

  /**
   * Get verification statistics
   */
  getStatistics() {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter(s => s.completed);
    const passed = completed.filter(s => s.passed);
    
    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      passedSessions: passed.length,
      passRate: completed.length > 0 ? passed.length / completed.length : 0,
      averageAttempts: completed.length > 0 ? 
        completed.reduce((sum, s) => sum + s.attempts, 0) / completed.length : 0,
      challengeDistribution: this.getChallengeDistribution(sessions),
      timestamp: Date.now()
    };
  }

  /**
   * Get challenge type distribution
   */
  getChallengeDistribution(sessions) {
    const distribution = {};
    sessions.forEach(session => {
      const type = session.challenge.type;
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }

  /**
   * Helper methods for challenge generation
   */
  generateRandomSentence() {
    const sentences = [
      "The quick brown fox jumps over the lazy dog",
      "How much wood would a woodchuck chuck",
      "She sells seashells by the seashore",
      "Peter Piper picked a peck of pickled peppers",
      "Unique New York, unique New York",
      "Red leather, yellow leather, red leather, yellow leather",
      "Toy boat, toy boat, toy boat",
      "I scream, you scream, we all scream for ice cream"
    ];
    
    return sentences[Math.floor(Math.random() * sentences.length)];
  }

  generatePhotoDescription() {
    const descriptions = [
      {
        focus: "colors, objects, and setting",
        keywords: ["building", "street", "people", "cars", "trees", "sky"]
      },
      {
        focus: "emotions, actions, and relationships",
        keywords: ["happy", "running", "family", "playing", "smiling", "together"]
      },
      {
        focus: "nature, weather, and atmosphere",
        keywords: ["mountains", "river", "sunset", "clouds", "birds", "peaceful"]
      },
      {
        focus: "technology, details, and composition",
        keywords: ["screen", "keyboard", "lights", "modern", "clean", "minimal"]
      }
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  generateTiltPattern() {
    const patterns = [
      {
        description: "Tilt left, then right, then up",
        sequence: [-0.8, 0.8, 0.5]
      },
      {
        description: "Tilt forward, then backward, then left",
        sequence: [0.6, -0.6, -0.8]
      },
      {
        description: "Make a small circle with your device",
        sequence: [0.3, 0.6, -0.3, -0.6]
      },
      {
        description: "Tilt up, then down, then left, then right",
        sequence: [0.7, -0.7, -0.8, 0.8]
      }
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  /**
   * Clear old sessions
   */
  cleanupOldSessions(maxAgeHours = 24) {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let cleared = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.createdAt < cutoff) {
        this.sessions.delete(sessionId);
        cleared++;
      }
    }
    
    return { cleared, totalRemaining: this.sessions.size };
  }
}

module.exports = HumanityVerification;