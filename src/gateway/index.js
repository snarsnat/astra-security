/**
 * ASTRA Gateway Check System
 * 
 * Runs when user opens a site - checks connection, security, and user status
 * before allowing access.
 */

const crypto = require('crypto');

class AstraGateway {
  constructor() {
    // Security checks to perform
    this.securityChecks = [
      'connection_integrity',
      'device_fingerprint',
      'session_validity',
      'network_reputation',
      'behavioral_analysis',
      'threat_intelligence'
    ];
    
    // Check configurations
    this.checkConfigs = {
      connection_integrity: {
        weight: 0.25,
        timeout: 2000,
        required: true
      },
      device_fingerprint: {
        weight: 0.20,
        timeout: 1500,
        required: true
      },
      session_validity: {
        weight: 0.15,
        timeout: 1000,
        required: true
      },
      network_reputation: {
        weight: 0.15,
        timeout: 3000,
        required: false
      },
      behavioral_analysis: {
        weight: 0.15,
        timeout: 2500,
        required: false
      },
      threat_intelligence: {
        weight: 0.10,
        timeout: 4000,
        required: false
      }
    };
    
    // Gateway sessions
    this.gatewaySessions = new Map();
    
    // Threat intelligence cache
    this.threatCache = new Map();
    
    console.log('ASTRA Gateway System initialized');
  }

  /**
   * Perform gateway check when user opens a site
   */
  async performGatewayCheck(request) {
    const {
      sessionId,
      userId,
      deviceData,
      networkData,
      userAgent,
      ipAddress,
      siteDomain,
      previousChecks = []
    } = request;
    
    // Create gateway session
    const session = {
      sessionId,
      userId,
      siteDomain,
      ipAddress,
      startedAt: Date.now(),
      checks: [],
      status: 'processing',
      riskScore: 0
    };
    
    this.gatewaySessions.set(sessionId, session);
    
    // Perform security checks in parallel
    const checkPromises = this.securityChecks.map(checkName => 
      this.performSecurityCheck(checkName, request)
    );
    
    const checkResults = await Promise.allSettled(checkPromises);
    
    // Process results
    const results = [];
    let totalWeight = 0;
    let weightedScore = 0;
    let failedRequiredChecks = false;
    
    checkResults.forEach((result, index) => {
      const checkName = this.securityChecks[index];
      const config = this.checkConfigs[checkName];
      
      if (result.status === 'fulfilled') {
        const checkResult = result.value;
        results.push(checkResult);
        
        if (checkResult.passed) {
          weightedScore += checkResult.confidence * config.weight;
        } else if (config.required) {
          failedRequiredChecks = true;
        }
        
        totalWeight += config.weight;
      } else {
        // Check failed to execute
        results.push({
          check: checkName,
          passed: false,
          confidence: 0,
          reason: 'Check execution failed',
          error: result.reason?.message || 'Unknown error'
        });
        
        if (config.required) {
          failedRequiredChecks = true;
        }
      }
    });
    
    // Calculate final risk score (0-1, where 0 is safe, 1 is high risk)
    const riskScore = totalWeight > 0 ? weightedScore / totalWeight : 0.5;
    
    // Determine access decision
    let accessGranted = true;
    let verificationRequired = false;
    let blockReason = null;
    
    if (failedRequiredChecks) {
      accessGranted = false;
      blockReason = 'Failed required security checks';
    } else if (riskScore > 0.7) {
      accessGranted = false;
      blockReason = 'High risk score detected';
    } else if (riskScore > 0.4) {
      accessGranted = true;
      verificationRequired = true;
    }
    
    // Update session
    session.checks = results;
    session.riskScore = riskScore;
    session.completedAt = Date.now();
    session.accessGranted = accessGranted;
    session.verificationRequired = verificationRequired;
    session.blockReason = blockReason;
    session.status = 'completed';
    
    // Generate response
    const response = {
      sessionId,
      accessGranted,
      verificationRequired,
      riskScore: parseFloat(riskScore.toFixed(3)),
      processingTime: session.completedAt - session.startedAt,
      checks: results.map(r => ({
        check: r.check,
        passed: r.passed,
        confidence: r.confidence,
        reason: r.reason
      })),
      recommendations: this.generateRecommendations(results, riskScore),
      nextSteps: this.getNextSteps(accessGranted, verificationRequired),
      timestamp: Date.now()
    };
    
    if (!accessGranted && blockReason) {
      response.blockReason = blockReason;
      response.suggestedActions = this.getBlockedActions(blockReason);
    }
    
    if (verificationRequired) {
      response.verificationType = this.determineVerificationType(riskScore, results);
      response.verificationPriority = riskScore > 0.6 ? 'high' : 'medium';
    }
    
    return response;
  }

  /**
   * Perform individual security check
   */
  async performSecurityCheck(checkName, request) {
    const config = this.checkConfigs[checkName];
    const timeout = config.timeout;
    
    try {
      switch (checkName) {
        case 'connection_integrity':
          return await this.checkConnectionIntegrity(request);
        case 'device_fingerprint':
          return await this.checkDeviceFingerprint(request);
        case 'session_validity':
          return await this.checkSessionValidity(request);
        case 'network_reputation':
          return await this.checkNetworkReputation(request);
        case 'behavioral_analysis':
          return await this.checkBehavioralAnalysis(request);
        case 'threat_intelligence':
          return await this.checkThreatIntelligence(request);
        default:
          return {
            check: checkName,
            passed: false,
            confidence: 0,
            reason: 'Unknown check type'
          };
      }
    } catch (error) {
      return {
        check: checkName,
        passed: false,
        confidence: 0,
        reason: `Check failed: ${error.message}`,
        error: error.toString()
      };
    }
  }

  /**
   * Check connection integrity
   */
  async checkConnectionIntegrity(request) {
    const { ipAddress, userAgent, headers = {} } = request;
    
    // Check for common attack signatures
    const attackPatterns = [
      /sql_injection|union_select/i,
      /<script.*?>.*?<\/script>/i,
      /eval\(|exec\(|system\(/i,
      /\.\.\/|\.\.\\/ // Directory traversal
    ];
    
    let issues = [];
    
    // Check user agent
    if (!userAgent || userAgent.length < 10) {
      issues.push('Suspicious user agent');
    }
    
    // Check headers for anomalies
    const headerChecks = {
      'User-Agent': (value) => value && value.length > 5,
      'Accept': (value) => value && value.includes('text/html'),
      'Accept-Language': (value) => value && value.length > 2
    };
    
    Object.entries(headerChecks).forEach(([header, check]) => {
      if (!check(headers[header])) {
        issues.push(`Missing or invalid ${header} header`);
      }
    });
    
    // Check for attack patterns in headers
    Object.entries(headers).forEach(([key, value]) => {
      attackPatterns.forEach(pattern => {
        if (pattern.test(value)) {
          issues.push(`Attack pattern detected in ${key} header`);
        }
      });
    });
    
    const passed = issues.length === 0;
    const confidence = passed ? 0.95 : Math.max(0.1, 1 - (issues.length * 0.2));
    
    return {
      check: 'connection_integrity',
      passed,
      confidence,
      reason: passed ? 'Connection appears legitimate' : `Issues: ${issues.join(', ')}`,
      issues: issues.length > 0 ? issues : undefined
    };
  }

  /**
   * Check device fingerprint
   */
  async checkDeviceFingerprint(request) {
    const { deviceData = {}, sessionId } = request;
    
    // Check for basic device data
    const requiredFields = ['platform', 'browser', 'screenResolution'];
    const missingFields = requiredFields.filter(field => !deviceData[field]);
    
    if (missingFields.length > 0) {
      return {
        check: 'device_fingerprint',
        passed: false,
        confidence: 0.3,
        reason: `Missing device data: ${missingFields.join(', ')}`
      };
    }
    
    // Check for suspicious device characteristics
    let warnings = [];
    
    // Screen resolution checks
    if (deviceData.screenResolution) {
      const [width, height] = deviceData.screenResolution.split('x').map(Number);
      if (width < 320 || height < 480) {
        warnings.push('Unusually small screen resolution');
      }
      if (width > 7680 || height > 4320) {
        warnings.push('Unusually large screen resolution');
      }
    }
    
    // Browser checks
    if (deviceData.browser) {
      const browser = deviceData.browser.toLowerCase();
      if (browser.includes('headless') || browser.includes('phantom')) {
        warnings.push('Headless browser detected');
      }
    }
    
    // Platform checks
    if (deviceData.platform) {
      const platform = deviceData.platform.toLowerCase();
      if (platform.includes('unknown') || platform.includes('test')) {
        warnings.push('Suspicious platform');
      }
    }
    
    // Generate device fingerprint
    const fingerprint = this.generateDeviceFingerprint(deviceData, sessionId);
    
    const passed = warnings.length === 0;
    const confidence = passed ? 0.9 : Math.max(0.4, 0.9 - (warnings.length * 0.1));
    
    return {
      check: 'device_fingerprint',
      passed,
      confidence,
      reason: passed ? 'Device fingerprint valid' : `Warnings: ${warnings.join(', ')}`,
      fingerprint: fingerprint.substring(0, 16),
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Check session validity
   */
  async checkSessionValidity(request) {
    const { sessionId, userId, previousChecks = [] } = request;
    
    // Check if session is too new (potential session hijacking)
    const sessionAge = previousChecks.length > 0 
      ? Date.now() - previousChecks[0].timestamp
      : 0;
    
    if (sessionAge < 1000 && previousChecks.length > 0) {
      return {
        check: 'session_validity',
        passed: false,
        confidence: 0.2,
        reason: 'Session appears too new (possible hijacking)'
      };
    }
    
    // Check for session anomalies
    const recentChecks = previousChecks.filter(check => 
      Date.now() - check.timestamp < 300000 // Last 5 minutes
    );
    
    if (recentChecks.length > 10) {
      return {
        check: 'session_validity',
        passed: false,
        confidence: 0.3,
        reason: 'Excessive session activity detected'
      };
    }
    
    // Check for geographic anomalies (if location data available)
    if (request.locationData && previousChecks.length > 0) {
      const lastLocation = previousChecks[previousChecks.length - 1].location;
      if (lastLocation && request.locationData) {
        const distance = this.calculateDistance(
          lastLocation.lat, lastLocation.lon,
          request.locationData.lat, request.locationData.lon
        );
        
        if (distance > 1000 && sessionAge < 3600000) { // 1000km in 1 hour
          return {
            check: 'session_validity',
            passed: false,
            confidence: 0.4,
            reason: 'Impossible travel detected'
          };
        }
      }
    }
    
    return {
      check: 'session_validity',
      passed: true,
      confidence: 0.85,
      reason: 'Session appears valid'
    };
  }

  /**
   * Check network reputation
   */
  async checkNetworkReputation(request) {
    const { ipAddress, networkData = {} } = request;
    
    // Check IP reputation (simplified)
    const suspiciousIPs = [
      '10.0.0.0/8',      // Private network
      '172.16.0.0/12',   // Private network
      '192.168.0.0/16',  // Private network
      '127.0.0.0/8',     // Loopback
      '0.0.0.0/8'        // Invalid
    ];
    
    let isSuspicious = false;
    let reason = '';
    
    for (const range of suspiciousIPs) {
      if (this.isIPInRange(ipAddress, range)) {
        isSuspicious = true;
        reason = `IP in restricted range: ${range}`;
        break;
      }
    }
    
    // Check for VPN/Tor/Proxy (simplified)
    if (networkData.isVPN || networkData.isTor || networkData.isProxy) {
      isSuspicious = true;
      reason = 'Connection through anonymity network';
    }
    
    // Check ASN/ISP reputation
    if (networkData.asn && this.isSuspiciousASN(networkData.asn)) {
      isSuspicious = true;
      reason = 'Suspicious network provider';
    }
    
    const passed = !isSuspicious;
    const confidence = passed ? 0.8 : 0.3;
    
    return {
      check: 'network_reputation',
      passed,
      confidence,
      reason: passed ? 'Network reputation acceptable' : reason,
      details: {
        ip: ipAddress,
        vpn: networkData.isVPN || false,
        tor: networkData.isTor || false,
        proxy: networkData.isProxy || false,
        asn: networkData.asn || 'unknown'
      }
    };
  }

  /**
   * Check behavioral analysis
   */
  async checkBehavioralAnalysis(request) {
    const { previousChecks = [], userBehavior = {} } = request;
    
    // Analyze behavior patterns
    const behaviors = [];
    let riskScore = 0;
    
    // Check request timing
    if (previousChecks.length > 0) {
      const timeSinceLast = Date.now() - previousChecks[previousChecks.length - 1].timestamp;
      if (timeSinceLast < 100) { // 100ms between requests
        behaviors.push('Unusually fast requests');
        riskScore += 0.3;
      }
    }
    
    // Check mouse/keyboard patterns (if available)
    if (userBehavior.mouseMovements) {
      const movements = userBehavior.mouseMovements;
      if (movements.length > 0) {
        // Check for robotic movement patterns
        const isRobotic = this.detectRoboticMovement(movements);
        if (isRobotic) {
          behaviors.push('Robotic mouse movement detected');
          riskScore += 0.4;
        }
      }
    }
    
    if (userBehavior.keystrokes) {
      const keystrokes = userBehavior.keystrokes;
      if (keystrokes.length > 0) {
        // Check for automated typing
        const isAutomated = this.detectAutomatedTyping(keystrokes);
        if (isAutomated) {
          behaviors.push('Automated typing detected');
          riskScore += 0.4;
        }
      }
    }
    
    // Check scroll patterns
    if (userBehavior.scrollPattern) {
      const isSmooth = this.isTooSmooth(userBehavior.scrollPattern);
      if (isSmooth) {
        behaviors.push('Unnaturally smooth scrolling');
        riskScore += 0.2;
      }
    }
    
    const passed = riskScore < 0.5;
    const confidence = Math.max(0.1, 1 - riskScore);
    
    return {
      check: 'behavioral_analysis',
      passed,
      confidence,
      reason: passed ? 'Behavior appears human' : `Behavioral anomalies: ${behaviors.join(', ')}`,
      behaviors: behaviors.length > 0 ? behaviors : undefined,
      riskScore: parseFloat(riskScore.toFixed(2))
    };
  }

  /**
   * Check threat intelligence
   */
  async checkThreatIntelligence(request) {
    const { ipAddress, userId, deviceData } = request;
    
    // Check cache first
    const cacheKey = `${ipAddress}:${userId}`;
    const cached = this.threatCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.result;
    }
    
    // Simulate threat intelligence check
    // In production: Query threat intelligence APIs
    
    let threats = [];
    let confidence = 0.9;
    
    // Check for known malicious patterns (simplified)
    if (this.isKnownMaliciousIP(ipAddress)) {
      threats.push('IP address associated with malicious activity');
      confidence = 0.1;
    }
    
    if (userId && this.isCompromisedAccount(userId)) {
      threats.push('User account may be compromised');
      confidence = Math.min(confidence, 0.3);
    }
    
    if (deviceData && this.isMaliciousDevice(deviceData)) {
      threats.push('Device characteristics match known threats');
      confidence = Math.min(confidence, 0.4);
    }
    
    const passed = threats.length === 0;
    const result = {
      check: 'threat_intelligence',
      passed,
      confidence,
      reason: passed ? 'No known threats detected' : `Threats: ${threats.join(', ')}`,
      threats: threats.length > 0 ? threats : undefined
    };
    
    // Cache result
    this.threatCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
    
    // Clean old cache entries
    this.cleanThreatCache();
    
    return result;
  }

  /**
   * Generate recommendations based on check results
   */
  generateRecommendations(checkResults, riskScore) {
    const recommendations = [];
    
    checkResults.forEach(result => {
      if (!result.passed || result.confidence < 0.7) {
        switch (result.check) {
          case 'connection_integrity':
            recommendations.push({
              action: 'verify_connection',
              priority: 'high',
              message: 'Verify your network connection and try again'
            });
            break;
          case 'device_fingerprint':
            recommendations.push({
              action: 'update_browser',
              priority: 'medium',
              message: 'Update your browser to the latest version'
            });
            break;
          case 'session_validity':
            recommendations.push({
              action: 'clear_cookies',
              priority: 'high',
              message: 'Clear browser cookies and restart session'
            });
            break;
          case 'network_reputation':
            recommendations.push({
              action: 'disable_vpn',
              priority: 'medium',
              message: 'Disable VPN or proxy for better access'
            });
            break;
        }
      }
    });
    
    if (riskScore > 0.5) {
      recommendations.push({
        action: 'enable_2fa',
        priority: 'high',
        message: 'Enable two-factor authentication for added security'
      });
    }
    
    return recommendations;
  }

  /**
   * Get next steps based on access decision
   */
  getNextSteps(accessGranted, verificationRequired) {
    if (!accessGranted) {
      return [
        'Contact support if you believe this is an error',
        'Check your network connection',
        'Try accessing from a different device or network'
      ];
    }
    
    if (verificationRequired) {
      return [
        'Complete the verification challenge',
        'Have your camera/microphone ready if needed',
        'Follow the on-screen instructions carefully'
      ];
    }
    
    return [
      'Access granted - you may proceed',
      'Your session is being monitored for security',
      'Report any suspicious activity immediately'
    ];
  }

  /**
   * Get actions for blocked access
   */
  getBlockedActions(blockReason) {
    const actions = [
      'Wait 5 minutes and try again',
      'Clear your browser cache and cookies'
    ];
    
    if (blockReason.includes('IP') || blockReason.includes('network')) {
      actions.push('Try using a different network connection');
      actions.push('Disable any VPN or proxy services');
    }
    
    if (blockReason.includes('device')) {
      actions.push('Try accessing from a different device');
      actions.push('Update your browser to the latest version');
    }
    
    return actions;
  }

  /**
   * Determine verification type based on risk
   */
  determineVerificationType(riskScore, checkResults) {
    if (riskScore > 0.6) {
      return 'comprehensive'; // Multiple verification steps
    }
    
    // Check which checks failed
    const failedChecks = checkResults.filter(r => !r.passed).map(r => r.check);
    
    if (failedChecks.includes('device_fingerprint')) {
      return 'device_verification';
    }
    
    if (failedChecks.includes('behavioral_analysis')) {
      return 'behavioral_verification';
    }
    
    return 'standard'; // Basic verification
  }

  /**
   * Helper methods
   */
  generateDeviceFingerprint(deviceData, sessionId) {
    const data = JSON.stringify({
      platform: deviceData.platform,
      browser: deviceData.browser,
      screen: deviceData.screenResolution,
      timezone: deviceData.timezone,
      languages: deviceData.languages,
      sessionId
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Simplified distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  isIPInRange(ip, range) {
    // Simplified IP range check
    if (range === '0.0.0.0/8') return ip.startsWith('0.');
    if (range === '10.0.0.0/8') return ip.startsWith('10.');
    if (range === '127.0.0.0/8') return ip.startsWith('127.');
    if (range === '172.16.0.0/12') {
      const parts = ip.split('.').map(Number);
      return parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31;
    }
    if (range === '192.168.0.0/16') return ip.startsWith('192.168.');
    return false;
  }

  isSuspiciousASN(asn) {
    // Simplified ASN check
    const suspiciousASNs = ['AS12345', 'AS67890']; // Example suspicious ASNs
    return suspiciousASNs.includes(asn);
  }

  detectRoboticMovement(movements) {
    // Simplified robotic movement detection
    if (movements.length < 3) return false;
    
    // Check for perfectly straight lines or perfect curves
    let straightCount = 0;
    for (let i = 1; i < movements.length - 1; i++) {
      const dx1 = movements[i].x - movements[i-1].x;
      const dy1 = movements[i].y - movements[i-1].y;
      const dx2 = movements[i+1].x - movements[i].x;
      const dy2 = movements[i+1].y - movements[i].y;
      
      // Check if movement is perfectly linear
      if (Math.abs(dx1 - dx2) < 0.1 && Math.abs(dy1 - dy2) < 0.1) {
        straightCount++;
      }
    }
    
    return straightCount > movements.length * 0.8; // 80% straight movements
  }

  detectAutomatedTyping(keystrokes) {
    // Simplified automated typing detection
    if (keystrokes.length < 5) return false;
    
    // Check for perfectly consistent timing
    const intervals = [];
    for (let i = 1; i < keystrokes.length; i++) {
      intervals.push(keystrokes[i].timestamp - keystrokes[i-1].timestamp);
    }
    
    // Calculate variance
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
    
    return variance < 10; // Very low variance = automated
  }

  isTooSmooth(scrollPattern) {
    // Check for unnaturally smooth scrolling
    const velocities = scrollPattern.velocities || [];
    if (velocities.length < 3) return false;
    
    // Calculate acceleration variance
    const accelerations = [];
    for (let i = 1; i < velocities.length; i++) {
      accelerations.push(Math.abs(velocities[i] - velocities[i-1]));
    }
    
    const mean = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
    const variance = accelerations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accelerations.length;
    
    return variance < 0.1; // Very smooth scrolling
  }

  isKnownMaliciousIP(ip) {
    // Simplified malicious IP check
    const maliciousIPs = [
      '1.2.3.4', // Example malicious IP
      '5.6.7.8'
    ];
    return maliciousIPs.includes(ip);
  }

  isCompromisedAccount(userId) {
    // Simplified compromised account check
    return false; // In production: Check against breach databases
  }

  isMaliciousDevice(deviceData) {
    // Simplified malicious device check
    const suspiciousPatterns = [
      'HeadlessChrome',
      'PhantomJS',
      'Selenium'
    ];
    
    const userAgent = deviceData.userAgent || '';
    return suspiciousPatterns.some(pattern => userAgent.includes(pattern));
  }

  cleanThreatCache() {
    const cutoff = Date.now() - 3600000; // 1 hour
    for (const [key, entry] of this.threatCache.entries()) {
      if (entry.timestamp < cutoff) {
        this.threatCache.delete(key);
      }
    }
  }

  /**
   * Get gateway session status
   */
  getSessionStatus(sessionId) {
    const session = this.gatewaySessions.get(sessionId);
    if (!session) return null;
    
    return {
      sessionId,
      status: session.status,
      riskScore: session.riskScore,
      accessGranted: session.accessGranted,
      verificationRequired: session.verificationRequired,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      processingTime: session.completedAt ? session.completedAt - session.startedAt : null,
      siteDomain: session.siteDomain
    };
  }

  /**
   * Get gateway statistics
   */
  getGatewayStats() {
    const sessions = Array.from(this.gatewaySessions.values());
    const completed = sessions.filter(s => s.status === 'completed');
    const granted = completed.filter(s => s.accessGranted);
    
    return {
      totalSessions: sessions.length,
      completedSessions: completed.length,
      accessGranted: granted.length,
      grantRate: completed.length > 0 ? granted.length / completed.length : 0,
      averageRiskScore: completed.length > 0 ? 
        completed.reduce((sum, s) => sum + s.riskScore, 0) / completed.length : 0,
      averageProcessingTime: completed.length > 0 ?
        completed.reduce((sum, s) => sum + (s.completedAt - s.startedAt), 0) / completed.length : 0,
      threatCacheSize: this.threatCache.size,
      timestamp: Date.now()
    };
  }

  /**
   * Clean old gateway sessions
   */
  cleanupOldSessions(maxAgeHours = 24) {
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    let cleared = 0;
    
    for (const [sessionId, session] of this.gatewaySessions.entries()) {
      if (session.startedAt < cutoff) {
        this.gatewaySessions.delete(sessionId);
        cleared++;
      }
    }
    
    return {
      clearedSessions: cleared,
      remainingSessions: this.gatewaySessions.size,
      timestamp: Date.now()
    };
  }
}

module.exports = AstraGateway;