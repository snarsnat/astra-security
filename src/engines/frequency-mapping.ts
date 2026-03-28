// Pillar 2: Frequency Mapping Engine
// Continuous measurement of temporal patterns across three time scales

export class FrequencyMappingEngine {
  private readonly MICRO_SCALE = 50; // ms
  private readonly MESO_SCALE = 5000; // ms
  private readonly MACRO_SCALE = 3600000; // ms (1 hour)
  
  private readonly HUMAN_OOS_RANGE = { min: 0.0, max: 1.5 };
  private readonly SUSPICIOUS_OOS_RANGE = { min: 1.5, max: 2.5 };
  private readonly FLAGGED_OOS_RANGE = { min: 2.5, max: 3.0 };
  private readonly LOCKDOWN_OOS = 3.0;
  
  private eventHistory: Array<{
    type: string;
    timestamp: number;
    duration?: number;
    metadata?: any;
  }> = [];
  
  private personalBaseline?: FrequencySpectrum;
  private populationBaseline: FrequencySpectrum = {
    micro: 0.3,
    meso: 0.4,
    macro: 0.5,
    chaosIndex: 0.8
  };

  /**
   * Record an event for frequency analysis
   */
  recordEvent(type: string, duration?: number, metadata?: any): void {
    this.eventHistory.push({
      type,
      timestamp: Date.now(),
      duration,
      metadata
    });
    
    // Keep only recent history (last hour)
    const oneHourAgo = Date.now() - this.MACRO_SCALE;
    this.eventHistory = this.eventHistory.filter(e => e.timestamp > oneHourAgo);
  }

  /**
   * Calculate current frequency spectrum
   */
  calculateSpectrum(): FrequencySpectrum {
    if (this.eventHistory.length < 3) {
      // Not enough data, return neutral baseline
      return {
        micro: 0.5,
        meso: 0.5,
        macro: 0.5,
        chaosIndex: 1.0
      };
    }
    
    const now = Date.now();
    
    // Analyze micro-scale (0-50ms)
    const microEvents = this.eventHistory.filter(e => 
      now - e.timestamp < this.MICRO_SCALE
    );
    const microScore = this.analyzeMicroScale(microEvents);
    
    // Analyze meso-scale (50ms-5s)
    const mesoEvents = this.eventHistory.filter(e => 
      e.timestamp >= now - this.MESO_SCALE && 
      e.timestamp < now - this.MICRO_SCALE
    );
    const mesoScore = this.analyzeMesoScale(mesoEvents);
    
    // Analyze macro-scale (5s-1h)
    const macroEvents = this.eventHistory.filter(e => 
      e.timestamp >= now - this.MACRO_SCALE && 
      e.timestamp < now - this.MESO_SCALE
    );
    const macroScore = this.analyzeMacroScale(macroEvents);
    
    // Calculate Chaos Index (OOS)
    const chaosIndex = this.calculateChaosIndex(microScore, mesoScore, macroScore);
    
    return {
      micro: microScore,
      meso: mesoScore,
      macro: macroScore,
      chaosIndex
    };
  }

  /**
   * Analyze micro-scale patterns (0-50ms)
   * Humans: Variable, clustered, jittery
   * Bots: Too consistent OR artificially random
   */
  private analyzeMicroScale(events: any[]): number {
    if (events.length < 2) return 0.5;
    
    const intervals = [];
    for (let i = 1; i < events.length; i++) {
      intervals.push(events[i].timestamp - events[i - 1].timestamp);
    }
    
    // Calculate coefficient of variation
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 0;
    
    // Humans have CV around 0.3-0.7 (biological jitter)
    // Bots have CV near 0 (too perfect) or >1 (artificially random)
    const humanIdeal = 0.5;
    const distance = Math.abs(cv - humanIdeal);
    
    // Score: 1.0 = perfect human rhythm, 0.0 = clearly bot
    return Math.max(0, 1 - (distance * 2));
  }

  /**
   * Analyze meso-scale patterns (50ms-5s)
   * Humans: Context-dependent, cognitively plausible
   * Bots: Instant or formulaic
   */
  private analyzeMesoScale(events: any[]): number {
    if (events.length < 3) return 0.5;
    
    // Group events by type
    const eventsByType: Record<string, any[]> = {};
    events.forEach(event => {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = [];
      }
      eventsByType[event.type].push(event);
    });
    
    let totalScore = 0;
    let typeCount = 0;
    
    Object.values(eventsByType).forEach(typeEvents => {
      if (typeEvents.length < 2) return;
      
      // Check for cognitive plausibility
      // Humans take time to read/think between certain actions
      const readingEvents = typeEvents.filter(e => 
        e.type.includes('read') || e.type.includes('view') || e.metadata?.cognitive
      );
      
      if (readingEvents.length > 0) {
        // Humans need at least 200ms to process information
        const avgDuration = readingEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / readingEvents.length;
        const readingScore = avgDuration >= 200 ? 0.9 : 0.3;
        totalScore += readingScore;
        typeCount++;
      }
      
      // Check for natural clustering
      // Human actions often come in bursts with pauses
      const intervals = [];
      for (let i = 1; i < typeEvents.length; i++) {
        intervals.push(typeEvents[i].timestamp - typeEvents[i - 1].timestamp);
      }
      
      const hasBursts = intervals.some(i => i < 100) && intervals.some(i => i > 1000);
      const burstScore = hasBursts ? 0.8 : 0.4;
      totalScore += burstScore;
      typeCount++;
    });
    
    return typeCount > 0 ? totalScore / typeCount : 0.5;
  }

  /**
   * Analyze macro-scale patterns (5s-1h)
   * Humans: Circadian-influenced, fatigued
   * Bots: Uniform or rigid
   */
  private analyzeMacroScale(events: any[]): number {
    if (events.length < 5) return 0.5;
    
    // Analyze temporal distribution
    const hourOfDay = new Date().getHours();
    const isNormalHours = hourOfDay >= 8 && hourOfDay <= 22;
    
    // Humans are more active during waking hours
    const circadianScore = isNormalHours ? 0.8 : 0.6;
    
    // Check for fatigue patterns
    // Human performance degrades with continuous activity
    const recentActivity = events.filter(e => 
      Date.now() - e.timestamp < 300000 // Last 5 minutes
    ).length;
    
    const fatigueScore = recentActivity > 20 ? 0.7 : 0.9; // More activity = slight fatigue
    
    // Check for uniform timing (bot signature)
    const timestamps = events.map(e => e.timestamp);
    const uniformity = this.calculateUniformity(timestamps);
    const uniformityScore = 1 - uniformity; // Less uniform = more human
    
    return (circadianScore + fatigueScore + uniformityScore) / 3;
  }

  private calculateUniformity(timestamps: number[]): number {
    if (timestamps.length < 3) return 0;
    
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    // Calculate how close intervals are to each other
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
    
    // Normalize variance (0 = perfectly uniform, 1 = highly variable)
    return Math.min(variance / (mean ** 2), 1);
  }

  /**
   * Calculate Chaos Index (OOS)
   * 0.0-1.5: Natural human entropy
   * 1.5-2.5: Suspicious precision or unusual patterns
   * 2.5-3.0: FLAGGED — violates physical possibility
   * 3.0+: Lockdown
   */
  private calculateChaosIndex(micro: number, meso: number, macro: number): number {
    // Convert human-likeness scores (0-1) to OOS scores (0-3+)
    // Lower human-likeness = higher OOS
    
    const microOOS = this.scoreToOOS(micro);
    const mesoOOS = this.scoreToOOS(meso);
    const macroOOS = this.scoreToOOS(macro);
    
    // Weight micro-scale more heavily (immediate behavior)
    return (microOOS * 0.5 + mesoOOS * 0.3 + macroOOS * 0.2);
  }

  private scoreToOOS(humanScore: number): number {
    // humanScore: 1.0 = perfect human, 0.0 = clearly bot
    // OOS: 0.0 = perfect human, 3.0+ = clearly bot
    
    if (humanScore >= 0.8) return 0.0 + (1 - humanScore) * 5; // 0.0-1.0 range
    if (humanScore >= 0.6) return 1.0 + (0.8 - humanScore) * 5; // 1.0-2.0 range
    if (humanScore >= 0.4) return 2.0 + (0.6 - humanScore) * 5; // 2.0-3.0 range
    return 3.0 + (0.4 - humanScore) * 10; // 3.0+ range
  }

  /**
   * Determine protection tier based on OOS score
   */
  determineTier(oosScore: number): 'ghost' | 'whisper' | 'nudge' | 'pause' | 'gate' {
    if (oosScore <= this.HUMAN_OOS_RANGE.max) return 'ghost';
    if (oosScore <= this.SUSPICIOUS_OOS_RANGE.max) return 'whisper';
    if (oosScore <= this.FLAGGED_OOS_RANGE.max) return 'nudge';
    if (oosScore < this.LOCKDOWN_OOS) return 'pause';
    return 'gate';
  }

  /**
   * Establish personal baseline from first 100 events
   */
  establishPersonalBaseline(): void {
    if (this.eventHistory.length >= 100) {
      this.personalBaseline = this.calculateSpectrum();
    }
  }

  /**
   * Get current OOS interpretation
   */
  getOOSInterpretation(oosScore: number): string {
    if (oosScore <= 1.5) return "Natural human entropy (healthy biological sloppiness)";
    if (oosScore <= 2.5) return "Suspicious precision or unusual patterns";
    if (oosScore <= 3.0) return "FLAGGED — violates physical possibility";
    return "LOCKDOWN — confirmed non-human pattern";
  }
}