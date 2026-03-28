// Pillar 3: Living Mutation System
// Security challenges that completely transform every hour

import { MutationChallenge, ChallengeType } from '../types';

export class MutationSystem {
  private readonly CHALLENGE_POOL: ChallengeType[] = [
    'pulse',      // Tap in rhythm with vibration
    'tilt',       // Tilt phone to guide virtual object
    'breath',     // Hold phone still for tremor analysis
    'flick',      // Flick gesture with jitter analysis
    'entropy',    // Move mouse in any pattern
    'temporal',   // React to randomized interval
    'cognitive',  // Answer based on content just shown
    'social',     // Wait for other humans to join
  ];

  private readonly MUTATION_INTERVAL = 3600000; // 1 hour
  private readonly VARIATIONS_PER_TYPE = 1000;
  
  private currentChallenge?: MutationChallenge;
  private lastMutationTime: number = 0;
  private serverEntropy: string = '';

  constructor() {
    this.initializeServerEntropy();
  }

  /**
   * Initialize server entropy for challenge selection
   */
  private initializeServerEntropy(): void {
    // In production, this would come from a secure entropy source
    const sources = [
      Date.now().toString(36),
      Math.random().toString(36).substring(2),
      process.hrtime.bigint().toString(36),
    ];
    
    this.serverEntropy = sources.join('');
  }

  /**
   * Get current or generate new challenge
   */
  getCurrentChallenge(tier: 'ghost' | 'whisper' | 'nudge' | 'pause' | 'gate'): MutationChallenge {
    const now = Date.now();
    
    // Check if we need a new mutation
    if (!this.currentChallenge || now - this.lastMutationTime >= this.MUTATION_INTERVAL) {
      this.currentChallenge = this.generateChallenge(tier);
      this.lastMutationTime = now;
    }
    
    return this.currentChallenge;
  }

  /**
   * Generate a new challenge based on tier and server entropy
   */
  private generateChallenge(tier: string): MutationChallenge {
    // Select challenge type based on server entropy
    const entropyIndex = this.hashToIndex(this.serverEntropy);
    const challengeType = this.CHALLENGE_POOL[entropyIndex % this.CHALLENGE_POOL.length];
    
    // Generate unique parameters
    const parameters = this.generateParameters(challengeType, tier);
    
    // Create challenge ID that includes mutation timestamp
    const challengeId = `${challengeType}-${Date.now().toString(36)}-${this.hashToIndex(this.serverEntropy + Date.now())}`;
    
    return {
      id: challengeId,
      type: challengeType,
      parameters,
      expiresAt: Date.now() + this.MUTATION_INTERVAL,
      difficulty: tier as any
    };
  }

  /**
   * Generate parameters for a specific challenge type
   */
  private generateParameters(type: ChallengeType, tier: string): Record<string, any> {
    const baseParams: Record<string, any> = {
      tier,
      timestamp: Date.now(),
      variation: Math.floor(Math.random() * this.VARIATIONS_PER_TYPE)
    };

    switch (type) {
      case 'pulse':
        return {
          ...baseParams,
          rhythm: this.generateRhythmPattern(),
          vibrationPattern: this.generateVibrationPattern(),
          requiredTaps: 3 + Math.floor(Math.random() * 4),
          tolerance: tier === 'nudge' ? 150 : tier === 'pause' ? 100 : 200, // ms
        };

      case 'tilt':
        return {
          ...baseParams,
          targetPath: this.generateTiltPath(),
          sensitivity: 0.5 + Math.random() * 0.5,
          timeLimit: 5000 + Math.random() * 5000, // ms
          obstacleCount: Math.floor(Math.random() * 5),
        };

      case 'breath':
        return {
          ...baseParams,
          duration: 2000, // ms
          stabilityThreshold: 0.1 + Math.random() * 0.2,
          tremorAnalysis: true,
          requireStillness: tier !== 'ghost',
        };

      case 'flick':
        return {
          ...baseParams,
          direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
          minVelocity: 0.5 + Math.random() * 0.5,
          jitterAnalysis: true,
          smoothnessThreshold: 0.7,
        };

      case 'entropy':
        return {
          ...baseParams,
          patternType: ['circle', 'zigzag', 'spiral', 'random'][Math.floor(Math.random() * 4)],
          minDuration: 1000,
          entropyThreshold: 0.6,
          analyzeJitter: true,
        };

      case 'temporal':
        return {
          ...baseParams,
          intervals: this.generateRandomIntervals(3 + Math.floor(Math.random() * 3)),
          reactionWindow: 300 + Math.random() * 700, // ms
          varianceAllowed: 0.2,
        };

      case 'cognitive':
        return {
          ...baseParams,
          questionType: ['color', 'shape', 'count', 'position'][Math.floor(Math.random() * 4)],
          elements: this.generateCognitiveElements(),
          readingTimeRequired: 1000 + Math.random() * 2000, // ms
          answerOptions: 3,
        };

      case 'social':
        return {
          ...baseParams,
          minParticipants: 2,
          waitWindow: 3000 + Math.random() * 7000, // ms
          coordinationRequired: true,
          syncTolerance: 500, // ms
        };

      default:
        return baseParams;
    }
  }

  /**
   * Generate a rhythm pattern for pulse challenges
   */
  private generateRhythmPattern(): number[] {
    const pattern = [];
    const beats = 3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < beats; i++) {
      // Human rhythms have natural variation (not metronomic)
      const baseInterval = 500 + Math.random() * 500; // 500-1000ms
      const variation = (Math.random() - 0.5) * 100; // ±50ms
      pattern.push(baseInterval + variation);
    }
    
    return pattern;
  }

  /**
   * Generate vibration pattern matching rhythm
   */
  private generateVibrationPattern(): number[] {
    const pattern = [];
    const segments = 4 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < segments; i++) {
      // Vibration intensity (0-1) with natural decay
      const intensity = 0.3 + Math.random() * 0.7;
      const duration = 100 + Math.random() * 200; // 100-300ms
      pattern.push(intensity, duration);
    }
    
    return pattern;
  }

  /**
   * Generate tilt path for guidance challenge
   */
  private generateTiltPath(): Array<{x: number, y: number}> {
    const path = [];
    const points = 5 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < points; i++) {
      path.push({
        x: (Math.random() - 0.5) * 2, // -1 to 1
        y: (Math.random() - 0.5) * 2
      });
    }
    
    return path;
  }

  /**
   * Generate random intervals for temporal challenges
   */
  private generateRandomIntervals(count: number): number[] {
    const intervals = [];
    
    for (let i = 0; i < count; i++) {
      // Humans can't predict truly random intervals
      const interval = 500 + Math.random() * 1500; // 500-2000ms
      intervals.push(interval);
    }
    
    return intervals;
  }

  /**
   * Generate elements for cognitive challenges
   */
  private generateCognitiveElements(): any[] {
    const elements = [];
    const count = 3 + Math.floor(Math.random() * 4);
    
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const shapes = ['circle', 'square', 'triangle', 'star', 'hexagon'];
    
    for (let i = 0; i < count; i++) {
      elements.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        position: { x: Math.random(), y: Math.random() },
        size: 0.5 + Math.random() * 0.5
      });
    }
    
    return elements;
  }

  /**
   * Verify a challenge response
   */
  verifyResponse(challenge: MutationChallenge, response: any): {
    success: boolean;
    score: number;
    details: Record<string, any>;
  } {
    const verifier = this.getVerifier(challenge.type);
    return verifier(challenge.parameters, response);
  }

  /**
   * Get appropriate verifier for challenge type
   */
  private getVerifier(type: ChallengeType): (params: any, response: any) => any {
    switch (type) {
      case 'pulse':
        return this.verifyPulse;
      case 'tilt':
        return this.verifyTilt;
      case 'breath':
        return this.verifyBreath;
      case 'flick':
        return this.verifyFlick;
      case 'entropy':
        return this.verifyEntropy;
      case 'temporal':
        return this.verifyTemporal;
      case 'cognitive':
        return this.verifyCognitive;
      case 'social':
        return this.verifySocial;
      default:
        return () => ({ success: false, score: 0, details: { error: 'Unknown challenge type' } });
    }
  }

  private verifyPulse(params: any, response: any) {
    const { rhythm, tolerance, requiredTaps } = params;
    const { taps, timestamps } = response;
    
    if (taps.length < requiredTaps) {
      return { success: false, score: 0, details: { reason: 'Insufficient taps' } };
    }
    
    let score = 0;
    const details: any = { matches: [] };
    
    for (let i = 1; i < Math.min(taps.length, rhythm.length + 1); i++) {
      const interval = timestamps[i] - timestamps[i - 1];
      const expected = rhythm[i - 1];
      const diff = Math.abs(interval - expected);
      const match = diff <= tolerance;
      
      details.matches.push({ interval, expected, diff, match });
      if (match) score += 1;
    }
    
    const success = score >= requiredTaps - 1;
    return { success, score: score / rhythm.length, details };
  }

  private verifyTilt(params: any, response: any) {
    const { targetPath, sensitivity } = params;
    const { tiltData } = response;
    
    if (!tiltData || tiltData.length < 2) {
      return { success: false, score: 0, details: { reason: 'Insufficient tilt data' } };
    }
    
    // Simplified verification - in reality would compare path following
    const score = 0.7 + Math.random() * 0.3; // Simulated
    return { success: score > 0.5, score, details: { pathFollowing: score } };
  }

  private verifyBreath(params: any, response: any) {
    const { duration, stabilityThreshold } = params;
    const { stillnessData, tremorAnalysis } = response;
    
    if (!stillnessData || stillnessData.length < 10) {
      return { success: false, score: 0, details: { reason: 'Insufficient data' } };
    }
    
    // Calculate device movement variance
    const variances = stillnessData.map((point: any) => {
      const dx = point.x - point.baseX;
      const dy = point.y - point.baseY;
      const dz = point.z - point.baseZ;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    });
    
    const avgVariance = variances.reduce((a: number, b: number) => a + b, 0) / variances.length;
    const stabilityScore = Math.max(0, 1 - (avgVariance / stabilityThreshold));
    
    // Check for human tremor (8-12Hz)
    const hasTremor = tremorAnalysis && tremorAnalysis.frequency >= 8 && tremorAnalysis.frequency <= 12;
    const tremorScore = hasTremor ? 0.8 : 0.2;
    
    const finalScore = (stabilityScore * 0.7 + tremorScore * 0.3);
    const success = finalScore > 0.6;
    
    return { 
      success, 
      score: finalScore, 
      details: { stabilityScore, hasTremor, tremorFrequency: tremorAnalysis?.frequency } 
    };
  }

  private verifyFlick(params: any, response: any) {
    const { direction, minVelocity, jitterAnalysis } = params;
    const { flickData } = response;
    
    if (!flickData) {
      return { success: false, score: 0, details: { reason: 'No flick data' } };
    }
    
    const velocity = flickData.velocity || 0;
    const detectedDirection = flickData.direction || 'unknown';
    const jitter = flickData.jitter || 0;
    
    const directionMatch = detectedDirection === direction ? 1 : 0;
    const velocityScore = Math.min(1, velocity / minVelocity);
    const smoothnessScore = jitterAnalysis ? Math.max(0, 1 - (jitter * 2)) : 0.5;
    
    const finalScore = (directionMatch * 0.4 + velocityScore * 0.4 + smoothnessScore * 0.2);
    const success = finalScore > 0.7;
    
    return { 
      success, 
      score: finalScore, 
      details: { directionMatch, velocityScore, smoothnessScore, jitter } 
    };
  }

  private verifyEntropy(params: any, response: any) {
    const { entropyThreshold } = params;
    const { movementPattern } = response;
    
    if (!movementPattern || movementPattern.length < 10) {
      return { success: false, score: 0, details: { reason: 'Insufficient movement data' } };
    }
    
    // Calculate entropy of movement pattern
    const entropy = this.calculatePatternEntropy(movementPattern);
    const entropyScore = Math.min(1, entropy / entropyThreshold);
    
    // Check for biological jitter in the pattern
    const jitterScore = this.analyzeBiologicalJitter(movementPattern);
    
    const finalScore = (entropyScore * 0.6 + jitterScore * 0.4);
    const success = finalScore > 0.6;
    
    return { success, score: finalScore, details: { entropy, entropyScore, jitterScore } };
  }

  private verifyTemporal(params: any, response: any) {
    const { intervals, reactionWindow, varianceAllowed } = params;
    const { reactions } = response;
    
    if (!reactions || reactions.length !== intervals.length) {
      return { success: false, score: 0, details: { reason: 'Wrong number of reactions' } };
    }
    
    let score = 0;
    const details: any = { matches: [] };
    
    for (let i = 0; i < intervals.length; i++) {
      const reactionTime = reactions[i];
      const expectedWindow = reactionWindow;
      const variance = Math.abs(reactionTime - expectedWindow) / expectedWindow;
      const match = variance <= varianceAllowed;
      
      details.matches.push({ reactionTime, expectedWindow, variance, match });
      if (match) score += 1;
    }
    
    const success = score >= intervals.length * 0.7;
    return { success, score: score / intervals.length, details };
  }

  private verifyCognitive(params: any, response: any) {
    const { questionType, readingTimeRequired } = params;
    const { answer, readingTime } = response;
    
    if (readingTime < readingTimeRequired * 0.5) {
      return { success: false, score: 0, details: { reason: 'Insufficient reading time' } };
    }
    
    // Simplified - in reality would check actual cognitive processing
    const readingScore = Math.min(1, readingTime / readingTimeRequired);
    const answerScore = answer ? 0.8 : 0.2; // Simulated
    
    const finalScore = (readingScore * 0.6 + answerScore * 0.4);
    const success = finalScore > 0.6;
    
    return { success, score: finalScore, details: { readingScore, answerScore } };
  }

  private verifySocial(params: any, response: any) {
    const { syncTolerance } = params;
    const { coordinationData } = response;
    
    if (!coordinationData || coordinationData.length < 2) {
      return { success: false, score: 0, details: { reason: 'Insufficient coordination data' } };
    }
    
    // Check synchronization between participants
    const syncScores = [];
    for (let i = 1; i < coordinationData.length; i++) {
      const timeDiff = Math.abs(coordinationData[i].timestamp - coordinationData[i - 1].timestamp);
      const syncScore = Math.max(0, 1 - (timeDiff / syncTolerance));
      syncScores.push(syncScore);
    }
    
    const avgSync = syncScores.reduce((a, b) => a + b, 0) / syncScores.length;
    const success = avgSync > 0.7;
    
    return { success, score: avgSync, details: { syncScores, avgSync } };
  }

  private calculatePatternEntropy(pattern: any[]): number {
    // Simplified entropy calculation
    if (pattern.length < 2) {
      return 0;
    }
    
    // Calculate variance of the pattern
    const mean = pattern.reduce((a, b) => a + b, 0) / pattern.length;
    const variance = pattern.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pattern.length;
    
    // Normalize to 0-1 range
    return Math.min(variance, 1);
  }