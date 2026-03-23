/**
 * ASTRA Mutation System
 * 
 * Hourly rotation of challenges to prevent user fatigue and make attacks impossible.
 * Creates positive novelty: "what's today's challenge?"
 */

class MutationSystem {
  constructor() {
    this.mutationSchedule = this.generateDailySchedule();
    this.mutationHistory = [];
    this.userMutationStates = new Map();
    
    // Start mutation timer
    this.startMutationTimer();
  }

  /**
   * Generate 24-hour mutation schedule
   */
  generateDailySchedule() {
    const schedule = [];
    const allChallenges = [
      'pulse', 'tilt', 'breath', 'flick',
      'reaction_game', 'balance_game', 'rhythm_game', 'memory_game'
    ];
    
    const themes = {
      morning: ['pulse', 'breath', 'reaction_game'],
      afternoon: ['tilt', 'flick', 'balance_game'],
      evening: ['rhythm_game', 'memory_game', 'pulse'],
      night: ['breath', 'tilt', 'reaction_game']
    };
    
    for (let hour = 0; hour < 24; hour++) {
      const theme = this.getHourTheme(hour);
      const baseChallenges = themes[theme];
      
      // Select 2-3 challenges for this hour
      const selected = [];
      while (selected.length < 2 + Math.floor(Math.random() * 2)) {
        const challenge = baseChallenges[Math.floor(Math.random() * baseChallenges.length)];
        if (!selected.includes(challenge)) {
          selected.push(challenge);
        }
      }
      
      // Add one wildcard challenge for variety
      const wildcards = allChallenges.filter(c => !selected.includes(c));
      if (wildcards.length > 0) {
        const wildcard = wildcards[Math.floor(Math.random() * wildcards.length)];
        selected.push(wildcard);
      }
      
      // Generate mutation parameters
      const mutation = {
        hour,
        theme,
        challenges: selected,
        parameters: this.generateMutationParameters(theme, hour),
        seed: this.generateMutationSeed(hour),
        expiresAt: this.getNextHourTimestamp(hour)
      };
      
      schedule.push(mutation);
    }
    
    // Record schedule generation
    this.mutationHistory.push({
      type: 'schedule_generated',
      timestamp: Date.now(),
      scheduleId: this.generateScheduleId(),
      totalChallenges: allChallenges.length,
      uniquePerHour: schedule.map(s => s.challenges.length)
    });
    
    return schedule;
  }

  /**
   * Get current mutation
   */
  getCurrentMutation() {
    const currentHour = new Date().getHours();
    return this.mutationSchedule[currentHour];
  }

  /**
   * Get next mutation
   */
  getNextMutation() {
    const currentHour = new Date().getHours();
    const nextHour = (currentHour + 1) % 24;
    return {
      mutation: this.mutationSchedule[nextHour],
      timeUntil: this.minutesUntilNextHour()
    };
  }

  /**
   * Get mutation status for user
   */
  getUserMutationStatus(userId) {
    const current = this.getCurrentMutation();
    const next = this.getNextMutation();
    const userState = this.getUserState(userId);
    
    return {
      current: {
        hour: current.hour,
        theme: current.theme,
        challenges: current.challenges,
        activeSince: this.getCurrentHourTimestamp(),
        parameters: this.getUserSpecificParameters(current, userState)
      },
      next: {
        hour: next.mutation.hour,
        theme: next.mutation.theme,
        refreshIn: next.timeUntil,
        challenges: next.mutation.challenges.slice(0, 2) // Preview
      },
      userStats: {
        challengesSeen: userState?.challengesSeen || 0,
        uniqueChallenges: userState?.uniqueChallenges?.size || 0,
        lastMutation: userState?.lastMutationHour,
        preferences: userState?.preferredChallenges || []
      },
      transparency: {
        scheduleVisible: true,
        nextRefresh: `in ${next.timeUntil} minutes`,
        mutationId: current.seed.substring(0, 8)
      }
    };
  }

  /**
   * Record user challenge completion
   */
  recordUserChallenge(userId, challengeType, success, timeMs) {
    const userState = this.getUserState(userId);
    const currentHour = new Date().getHours();
    
    // Update challenge history
    userState.challengeHistory = userState.challengeHistory || [];
    userState.challengeHistory.push({
      challengeType,
      success,
      timeMs,
      hour: currentHour,
      timestamp: Date.now()
    });
    
    // Keep only last 100 entries
    if (userState.challengeHistory.length > 100) {
      userState.challengeHistory.shift();
    }
    
    // Update unique challenges
    userState.uniqueChallenges = userState.uniqueChallenges || new Set();
    userState.uniqueChallenges.add(challengeType);
    
    // Update counters
    userState.challengesSeen = (userState.challengesSeen || 0) + 1;
    userState.lastMutationHour = currentHour;
    
    // Update success rate
    const history = userState.challengeHistory;
    const recent = history.slice(-10);
    const recentSuccesses = recent.filter(h => h.success).length;
    userState.recentSuccessRate = recent.length > 0 ? recentSuccesses / recent.length : 1.0;
    
    // Detect challenge preferences
    this.updateUserPreferences(userState, challengeType, success, timeMs);
    
    // Save user state
    this.userMutationStates.set(userId, userState);
    
    // Record in global history
    this.mutationHistory.push({
      type: 'user_challenge',
      userId,
      challengeType,
      success,
      timeMs,
      hour: currentHour,
      timestamp: Date.now()
    });
  }

  /**
   * Generate mutation parameters based on theme and hour
   */
  generateMutationParameters(theme, hour) {
    const parameters = {
      speed: 1.0,
      difficulty: 1.0,
      visualStyle: 'default',
      audioStyle: 'default',
      hapticStyle: 'default'
    };
    
    // Adjust based on time of day
    switch (theme) {
      case 'morning':
        parameters.speed = 0.9; // Slightly slower in morning
        parameters.visualStyle = 'bright';
        parameters.audioStyle = 'gentle';
        break;
        
      case 'afternoon':
        parameters.speed = 1.0;
        parameters.difficulty = 1.1; // Slightly more challenging
        parameters.visualStyle = 'vibrant';
        break;
        
      case 'evening':
        parameters.speed = 1.1; // Faster in evening
        parameters.visualStyle = 'warm';
        parameters.audioStyle = 'calm';
        parameters.hapticStyle = 'subtle';
        break;
        
      case 'night':
        parameters.speed = 0.8; // Slower at night
        parameters.difficulty = 0.9; // Easier at night
        parameters.visualStyle = 'dark';
        parameters.audioStyle = 'quiet';
        parameters.hapticStyle = 'minimal';
        break;
    }
    
    // Adjust based on hour within theme
    if (theme === 'night' && hour >= 22) {
      parameters.speed = 0.7;
      parameters.visualStyle = 'very_dark';
      parameters.audioStyle = 'muted';
    }
    
    if (theme === 'morning' && hour >= 10) {
      parameters.speed = 1.0;
      parameters.difficulty = 1.2;
    }
    
    return parameters;
  }

  /**
   * Get user-specific parameters (personalized difficulty)
   */
  getUserSpecificParameters(mutation, userState) {
    const parameters = { ...mutation.parameters };
    
    if (!userState) return parameters;
    
    // Adjust based on user success rate
    if (userState.recentSuccessRate !== undefined) {
      if (userState.recentSuccessRate < 0.5) {
        // User struggling - make easier
        parameters.difficulty *= 0.8;
        parameters.speed *= 0.9;
      } else if (userState.recentSuccessRate > 0.9) {
        // User excelling - make slightly harder
        parameters.difficulty *= 1.1;
        parameters.speed *= 1.05;
      }
    }
    
    // Apply user preferences
    if (userState.preferredSpeed) {
      parameters.speed = userState.preferredSpeed;
    }
    
    if (userState.preferredStyle) {
      parameters.visualStyle = userState.preferredStyle;
    }
    
    return parameters;
  }

  /**
   * Update user preferences based on performance
   */
  updateUserPreferences(userState, challengeType, success, timeMs) {
    userState.preferredChallenges = userState.preferredChallenges || [];
    userState.challengePerformance = userState.challengePerformance || {};
    
    // Update performance stats for this challenge type
    const perf = userState.challengePerformance[challengeType] || {
      attempts: 0,
      successes: 0,
      totalTime: 0,
      avgTime: 0
    };
    
    perf.attempts++;
    if (success) perf.successes++;
    perf.totalTime += timeMs;
    perf.avgTime = perf.totalTime / perf.attempts;
    
    userState.challengePerformance[challengeType] = perf;
    
    // Update preferred challenges (top 3 by success rate)
    const challenges = Object.entries(userState.challengePerformance)
      .map(([type, stats]) => ({
        type,
        successRate: stats.successes / stats.attempts,
        avgTime: stats.avgTime
      }))
      .filter(c => c.successRate >= 0.7) // Only include challenges with good success
      .sort((a, b) => {
        // Sort by success rate, then speed
        if (Math.abs(a.successRate - b.successRate) > 0.1) {
          return b.successRate - a.successRate;
        }
        return a.avgTime - b.avgTime;
      })
      .slice(0, 3)
      .map(c => c.type);
    
    userState.preferredChallenges = challenges;
    
    // Detect preferred speed
    const successfulChallenges = userState.challengeHistory
      .filter(h => h.success)
      .slice(-20);
    
    if (successfulChallenges.length >= 5) {
      const avgTime = successfulChallenges.reduce((sum, h) => sum + h.timeMs, 0) / successfulChallenges.length;
      
      if (avgTime < 2000) {
        userState.preferredSpeed = 1.2; // Fast user
      } else if (avgTime > 4000) {
        userState.preferredSpeed = 0.8; // Slow user
      } else {
        userState.preferredSpeed = 1.0; // Average
      }
    }
  }

  /**
   * Get mutation transparency info for UI
   */
  getTransparencyInfo() {
    const current = this.getCurrentMutation();
    const next = this.getNextMutation();
    
    return {
      currentMutation: {
        id: current.seed.substring(0, 8),
        theme: current.theme,
        activeFor: this.minutesSinceHourStart(),
        challenges: current.challenges.map(c => this.formatChallengeName(c))
      },
      nextMutation: {
        in: `${next.timeUntil} minutes`,
        theme: next.mutation.theme,
        preview: next.mutation.challenges.slice(0, 2).map(c => this.formatChallengeName(c))
      },
      dailyStats: {
        mutationsToday: this.mutationHistory.filter(m => 
          m.type === 'schedule_generated' && 
          this.isToday(m.timestamp)
        ).length,
        userCompletions: this.mutationHistory.filter(m => 
          m.type === 'user_challenge' && 
          this.isToday(m.timestamp)
        ).length,
        uniqueUsers: new Set(
          this.mutationHistory
            .filter(m => m.type === 'user_challenge' && this.isToday(m.timestamp))
            .map(m => m.userId)
        ).size
      },
      systemMessage: "ASTRA security refreshes hourly. Next refresh in " + next.timeUntil + " minutes."
    };
  }

  /**
   * Start mutation timer (runs every hour)
   */
  startMutationTimer() {
    // Calculate ms until next hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    nextHour.setMilliseconds(0);
    
    const msUntilNextHour = nextHour - now;
    
    // Schedule mutation
    setTimeout(() => {
      this.executeMutation();
      // Continue hourly
      setInterval(() => this.executeMutation(), 60 * 60 * 1000);
    }, msUntilNextHour);
  }

  /**
   * Execute hourly mutation
   */
  executeMutation() {
    const oldHour = new Date().getHours() - 1;
    if (oldHour < 0) oldHour = 23;
    
    const newHour = new Date().getHours();
    const oldMutation = this.mutationSchedule[oldHour];
    const newMutation = this.mutationSchedule[newHour];
    
    // Record mutation
    this.mutationHistory.push({
      type: 'mutation_executed',
      timestamp: Date.now(),
      fromHour: oldHour,
      toHour: newHour,
      fromTheme: oldMutation.theme,
      toTheme: newMutation.theme,
      challengeChanges: {
        removed: oldMutation.challenges.filter(c => !newMutation.challenges.includes(c)),
        added: newMutation.challenges.filter(c => !oldMutation.challenges.includes(c)),
        kept: newMutation.challenges.filter(c => oldMutation.challenges.includes(c))
      }
    });
    
    // Log mutation (in production, this would trigger UI updates)
    console.log(`ASTRA Mutation: ${oldMutation.theme} → ${newMutation.theme}`);
    console.log(`New challenges: ${newMutation.challenges.join(', ')}`);
    
    // Check if we need a new daily schedule
    if (newHour === 0) {
      this.mutationSchedule = this.generateDailySchedule();
      console.log('New daily mutation schedule generated');
    }
  }

  /**
   * Helper methods
   */
  getHourTheme(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  generateMutationSeed(hour) {
    const date = new Date();
    const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return require('crypto').createHash('md5')
      .update(`${dateStr}-${hour}-${Math.random()}`)
      .digest('hex');
  }

  getNextHourTimestamp(hour) {
    const date = new Date();
    date.setHours(hour + 1);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  getCurrentHourTimestamp() {
    const date = new Date();
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date.getTime();
  }

  minutesUntilNextHour() {
    const now = new Date();
    return 60 - now.getMinutes();
  }

  minutesSinceHourStart() {
    const now = new Date();
    return now.getMinutes();
  }

  getUserState(userId) {
    if (!this.userMutationStates.has(userId)) {
      this.userMutationStates.set(userId, {
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    return this.userMutationStates.get(userId);
  }

  generateScheduleId() {
    return require('crypto').randomBytes(8).toString('hex');
  }

  formatChallengeName(challenge) {
    const names = {
      pulse: 'The Pulse',
      tilt: 'The Tilt',
      breath: 'The Breath',
      flick: 'The Flick',
      reaction_game: 'Reaction Game',
      balance_game: 'Balance Game',
      rhythm_game: 'Rhythm Game',
      memory_game: 'Memory Game'
    };
    return names[challenge] || challenge;
  }

  isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  /**
   * Get mutation analytics
   */
  getMutationAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayHistory = this.mutationHistory.filter(m => m.timestamp >= today.getTime());
    
    const userChallenges = todayHistory.filter(m => m.type === 'user_challenge');
    const successRate = userChallenges.length > 0
      ? userChallenges.filter(m => m.success).length / userChallenges.length
      : 0;
    
    const challengeDistribution = {};
    userChallenges.forEach(m => {
      challengeDistribution[m.challengeType] = (challengeDistribution[m.challengeType] || 0) + 1;
    });
    
    const themeUsage = {};
    this.mutationSchedule.forEach(m => {
      themeUsage[m.theme] = (themeUsage[m.theme] || 0) + m.challenges.length;
    });
    
    return {
      date: today.toISOString().split('T')[0],
      totalMutations: this.mutationHistory.filter(m => m.type === 'mutation_executed').length,
      today: {
        userChallenges: userChallenges.length,
        uniqueUsers: new Set(userChallenges.map(m => m.userId)).size,
        successRate: (successRate * 100).toFixed(1) + '%',
        avgTime: userChallenges