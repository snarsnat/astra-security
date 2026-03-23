/**
 * ASTRA Full Demo
 * 
 * Demonstrates the complete ASTRA security system:
 * 1. OOS scoring and tier system
 * 2. Deep Layer hijack detection
 * 3. Humanity verification (OOS > 3)
 * 4. Gateway checks for site access
 * 5. UI components for all interactions
 */

const AstraCore = require('../src/core');

async function runDemo() {
  console.log('🚀 ASTRA Security System - Full Demo\n');
  
  // Initialize ASTRA
  const astra = new AstraCore();
  
  // Demo scenarios
  await demoNormalUser(astra);
  await demoHighOOSUser(astra);
  await demoHijackedSession(astra);
  await demoSiteAccess(astra);
  
  console.log('\n✅ Demo completed successfully!');
  console.log('\n📊 System Metrics:');
  console.log(JSON.stringify(astra.getMetrics(), null, 2));
}

async function demoNormalUser(astra) {
  console.log('\n--- Scenario 1: Normal User (Tier 0-1) ---');
  
  const sessionId = 'user-normal-123';
  const request = {
    userId: 'user123',
    hardware: {
      deviceId: 'device-abc',
      screenResolution: '1920x1080',
      hasCamera: true,
      hasMicrophone: true
    },
    interaction: {
      type: 'click',
      duration: 250,
      coordinates: { x: 100, y: 200 }
    },
    device: {
      browser: 'Chrome 122',
      os: 'macOS 14',
      fingerprint: 'normal-fingerprint-abc'
    },
    network: {
      ip: '192.168.1.100',
      latency: 45,
      isp: 'Verizon'
    }
  };
  
  console.log('Request:', {
    userId: request.userId,
    device: request.device.browser,
    interaction: request.interaction.type
  });
  
  const result = await astra.processRequest(sessionId, request);
  
  console.log('Result:');
  console.log(`  Tier: ${result.tier} (${result.action})`);
  console.log(`  OOS Score: ${result.oosScore.toFixed(2)}`);
  console.log(`  Processing: ${result.processingTime}ms`);
  
  if (result.verificationRequired) {
    console.log(`  🔒 Verification Required: ${result.verification.challengeType}`);
  }
  
  return result;
}

async function demoHighOOSUser(astra) {
  console.log('\n--- Scenario 2: High OOS User (Tier 3-4) ---');
  
  const sessionId = 'user-high-oos-456';
  const request = {
    userId: 'user456',
    hardware: {
      deviceId: 'device-xyz',
      screenResolution: '800x600',
      hasCamera: false,
      hasMicrophone: false
    },
    interaction: {
      type: 'click',
      duration: 10, // Too fast for human
      coordinates: { x: 500, y: 500 }
    },
    device: {
      browser: 'Headless Chrome',
      os: 'Linux',
      fingerprint: 'bot-like-fingerprint-xyz'
    },
    network: {
      ip: '10.0.0.1',
      latency: 5, // Too low
      isp: 'Datacenter'
    }
  };
  
  console.log('Request (suspicious characteristics):');
  console.log('  - Headless browser');
  console.log('  - Very fast interaction (10ms)');
  console.log('  - Datacenter IP');
  
  const result = await astra.processRequest(sessionId, request);
  
  console.log('Result:');
  console.log(`  Tier: ${result.tier} (${result.action})`);
  console.log(`  OOS Score: ${result.oosScore.toFixed(2)}`);
  
  if (result.verificationRequired) {
    console.log(`  🔒 VERIFICATION TRIGGERED (OOS > 3)`);
    console.log(`  Challenge: ${result.verification.challengeType}`);
    console.log(`  Time Limit: ${result.verification.timeLimit}s`);
    
    // Simulate verification completion
    console.log('  ✅ User completes verification successfully');
    
    // Process again with verification completed
    request.verificationCompleted = true;
    const verifiedResult = await astra.processRequest(sessionId, request);
    console.log(`  Post-verification OOS: ${verifiedResult.oosScore.toFixed(2)}`);
  }
  
  return result;
}

async function demoHijackedSession(astra) {
  console.log('\n--- Scenario 3: Hijacked Session Detection ---');
  
  const sessionId = 'user-hijacked-789';
  
  // First, establish a normal session
  const normalRequest = {
    userId: 'user789',
    hardware: {
      deviceId: 'device-user-789',
      screenResolution: '1920x1080',
      hasCamera: true
    },
    interaction: {
      type: 'scroll',
      duration: 300,
      coordinates: { x: 150, y: 300 }
    },
    device: {
      browser: 'Safari 17',
      os: 'iOS 17',
      fingerprint: 'user-789-fingerprint'
    }
  };
  
  console.log('Step 1: Normal user establishes session');
  await astra.processRequest(sessionId, normalRequest);
  
  // Then simulate hijacking (different device/behavior)
  console.log('\nStep 2: Session hijacked (different device/behavior)');
  
  const hijackedRequest = {
    ...normalRequest,
    hardware: {
      deviceId: 'device-attacker-999', // Different device
      screenResolution: '1366x768'
    },
    interaction: {
      type: 'click',
      duration: 15, // Bot-like speed
      coordinates: { x: 500, y: 500 }
    },
    device: {
      browser: 'Firefox 122',
      os: 'Windows 11', // Different OS
      fingerprint: 'attacker-fingerprint-999'
    }
  };
  
  const result = await astra.processRequest(sessionId, hijackedRequest);
  
  console.log('Deep Layer Detection:');
  if (result.deepLayer) {
    console.log(`  Continuity: ${result.deepLayer.continuity ? '✅' : '❌'}`);
    console.log(`  Confidence: ${result.deepLayer.confidence.toFixed(2)}`);
    console.log(`  Verification Count: ${result.deepLayer.verificationCount}`);
    
    if (!result.deepLayer.continuity) {
      console.log('  🚨 HIJACK DETECTED!');
      console.log('  Recommended: Enhanced verification or session termination');
    }
  }
  
  return result;
}

async function demoSiteAccess(astra) {
  console.log('\n--- Scenario 4: Site Access with Gateway Check ---');
  
  const sessionId = 'site-access-101';
  const request = {
    userId: 'user101',
    isSiteAccess: true, // Triggers gateway check
    hardware: {
      deviceId: 'device-101',
      hasCamera: true,
      hasMicrophone: true
    },
    interaction: {
      type: 'page_load',
      duration: 1200
    },
    device: {
      browser: 'Chrome 122',
      os: 'Windows 11',
      fingerprint: 'normal-fingerprint-101'
    },
    network: {
      ip: '203.0.113.45', // Test IP
      latency: 120,
      isp: 'Comcast'
    },
    geo: {
      country: 'US',
      city: 'New York',
      latitude: 40.7128,
      longitude: -74.0060
    },
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9'
    },
    timing: {
      latency: 120,
      jitter: 25,
      packetLoss: 0.02
    }
  };
  
  console.log('Requesting site access with:');
  console.log('  - US location (New York)');
  console.log('  - Normal latency (120ms)');
  console.log('  - Standard browser headers');
  
  const result = await astra.processRequest(sessionId, request);
  
  console.log('\nGateway Check Result:');
  if (result.gatewayCheck) {
    console.log(`  Security Score: ${result.gatewayCheck.securityScore}`);
    console.log(`  Action: ${result.gatewayCheck.action}`);
    console.log(`  Passed: ${result.gatewayCheck.passed ? '✅' : '❌'}`);
    
    if (result.gatewayCheck.requiresVerification) {
      console.log('  🔒 Additional verification required');
      console.log('  UI Component: GatewayVerificationModal');
    } else {
      console.log('  ✅ Access granted');
      console.log('  UI Component: GatewayPassModal (auto-redirects)');
    }
  }
  
  // Demo blocked access
  console.log('\n--- Scenario 4b: Blocked Access ---');
  
  const blockedRequest = {
    ...request,
    network: {
      ip: '192.0.2.1', // TEST-NET (suspicious)
      latency: 5, // Too low
      isp: 'Datacenter'
    },
    geo: {
      country: 'KP', // North Korea (high risk)
      city: 'Pyongyang'
    },
    headers: {
      'user-agent': 'HeadlessChrome' // Suspicious UA
    }
  };
  
  console.log('Suspicious request:');
  console.log('  - TEST-NET IP');
  console.log('  - North Korea location');
  console.log('  - Headless browser');
  
  const blockedResult = await astra.processRequest('blocked-session-202', blockedRequest);
  
  if (blockedResult.gatewayCheck) {
    console.log(`\nGateway Result: ${blockedResult.gatewayCheck.action}`);
    console.log(`Security Score: ${blockedResult.gatewayCheck.securityScore}`);
    
    if (blockedResult.gatewayCheck.action === 'block') {
      console.log('  🚫 ACCESS BLOCKED');
      console.log('  UI Component: GatewayBlockModal');
      console.log('  User sees: Block message with support contact');
    }
  }
  
  return result;
}

// Run all demos
runDemo().catch(console.error);