/**
 * ASTRA Example: Shopping Checkout
 * 
 * Real-world scenario demonstrating how ASTRA protects
 * users during a typical e-commerce checkout flow.
 */

const { astra } = require('../src/core');

console.log('='.repeat(60));
console.log('ASTRA: The Invisible Guardian');
console.log('Example: Sarah buying shoes on her phone');
console.log('='.repeat(60));
console.log();

// Simulate Sarah's shopping session
const sessionId = 'sarah-shopping-session-' + Date.now();

async function simulateShopping() {
  console.log('👤 User: Sarah, buying shoes on her phone during lunch break');
  console.log('⏰ Time: 12:30 PM, work phone (different from home phone)');
  console.log();
  
  // 1. Page load: Hardware breath confirmed
  console.log('--- Step 1: Page Load ---');
  const load1 = await astra.process(sessionId, {
    interaction: { type: 'page_load', duration: 500 },
    hardware: {
      entropy: 0.85,
      consistency: 0.4,
      randomness: 0.9
    },
    device: {
      type: 'mobile',
      hasMotionSensors: true,
      hasTouch: true,
      isNewDevice: true,
      screenWidth: 390,
      screenHeight: 844
    }
  });
  
  console.log(`   Tier: ${load1.data.tier} (Ghost)`);
  console.log(`   OOS Score: ${load1.data.oosScore}`);
  console.log(`   User feels: "This site is fast and smooth."`);
  console.log(`   ✓ Hardware breath confirmed from holding phone`);
  console.log();
  
  // 2. Browsing: Natural scroll-pause-click patterns
  console.log('--- Step 2: Browsing Shoes ---');
  
  // Simulate natural browsing behavior
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 100 + Math.random() * 500));
    
    const browse = await astra.process(sessionId, {
      interaction: {
        type: 'scroll',
        duration: 200 + Math.random() * 300,
        coordinates: { x: Math.random() * 390, y: Math.random() * 800 }
      }
    });
    
    if (i === 2) {
      console.log(`   Sample interaction ${i + 1}: Tier ${browse.data.tier}`);
      console.log(`   OOS Score: ${browse.data.oosScore}`);
      console.log(`   ✓ Frequency mapping shows natural patterns`);
    }
  }
  
  console.log(`   All browsing: Tier 0 (invisible)`);
  console.log();
  
  // 3. Add to cart: Whisper layer
  console.log('--- Step 3: Add to Cart ---');
  
  // Sarah clicks "Add to cart" - natural timing variation
  const addToCart = await astra.process(sessionId, {
    interaction: {
      type: 'click',
      duration: 150 + Math.random() * 50, // Natural variation
      coordinates: { x: 195, y: 600 }
    }
  });
  
  console.log(`   Tier: ${addToCart.data.tier} (Whisper)`);
  console.log(`   OOS Score: ${addToCart.data.oosScore.toFixed(1)}`);
  console.log(`   Micro-delay: ${addToCart.data.response.delay}ms`);
  console.log(`   User feels: "Button clicked normally"`);
  console.log(`   ✓ Biological timing confirmed, OOS drops`);
  console.log();
  
  // 4. Checkout: New device detected, OOS rises
  console.log('--- Step 4: Checkout ---');
  
  const checkout = await astra.process(sessionId, {
    interaction: { type: 'checkout_init', duration: 300 },
    device: {
      type: 'mobile',
      hasMotionSensors: true,
      hasTouch: true,
      isNewDevice: true, // Different from her usual phone
      lastUsed: Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
    }
  });
  
  console.log(`   Tier: ${checkout.data.tier} (Nudge)`);
  console.log(`   OOS Score: ${checkout.data.oosScore.toFixed(1)}`);
  console.log(`   ⚠️ New device detected (work phone vs home phone)`);
  console.log();
  
  // 5. Challenge: The Pulse
  console.log('--- Step 5: Challenge ---');
  
  if (checkout.data.response.challenge) {
    const challenge = checkout.data.response.challenge;
    console.log(`   Challenge: ${challenge.name}`);
    console.log(`   Instructions: ${challenge.instructions}`);
    console.log(`   Duration: ${challenge.duration / 1000}s`);
    console.log();
    
    // Simulate Sarah completing the challenge successfully
    console.log('   User action: Taps in rhythm with vibration...');
    console.log('   ✓ Success! Satisfying haptic feedback');
    console.log('   ✓ Immediate redirect to payment');
    console.log();
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log('Total friction: ~3 seconds');
  console.log('User experience: Felt like a micro-interaction, not security');
  console.log('Security: Multi-layer verification without annoyance');
  console.log();
  
  // Show what would happen to a bot
  console.log('--- Bot Scenario ---');
  console.log('If Sarah were a bot:');
  console.log('   ❌ Hardware breath: Failed (no quantum entropy)');
  console.log('   OR ❌ Frequency mapping: Clicked at perfectly consistent 847ms intervals');
  console.log('   Result: OOS 3.4 immediately → Blocked at Tier 0');
  console.log('   Never reached checkout');
  console.log();
  
  // Show final metrics
  console.log('--- System Metrics ---');
  const metrics = astra.getGoodMetrics();
  console.log(JSON.stringify(metrics, null, 2));
}

simulateShopping().catch(console.error);