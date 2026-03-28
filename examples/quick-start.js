// Quick Start Example for Astra Security
const { AstraSecurity } = require('../dist/index.js');

console.log('🚀 Astra Security Quick Start Example\n');

// Create an instance
const astra = new AstraSecurity();

// 1. Get available challenges
console.log('📋 Available Challenges:');
const challenges = astra.getChallenges();
challenges.forEach((challenge, index) => {
  console.log(`  ${index + 1}. ${challenge.id} (${challenge.type}, ${challenge.difficulty})`);
});

// 2. Create a session
console.log('\n📋 Creating a session...');
const session = astra.createSession('user-123');
console.log(`   Session ID: ${session.sessionId}`);
console.log(`   Challenges in session: ${session.challenges.length}`);

// 3. Simulate a challenge response
console.log('\n📋 Simulating challenge verification...');
const challenge = session.challenges[0]; // First challenge in session
const response = {
  challengeId: challenge.id,
  data: { taps: 5 }, // Example response data
  timestamp: Date.now()
};

// 4. Verify the response
const result = astra.verifyChallenge(response);
console.log(`   Challenge: ${challenge.id}`);
console.log(`   Success: ${result.success}`);
console.log(`   Score: ${result.score.toFixed(2)}`);
console.log(`   Message: ${result.message}`);

// 5. Batch verification example
console.log('\n📋 Batch verification example...');
const batchResponses = [
  { challengeId: 'tap-1', data: { taps: 4 }, timestamp: Date.now() },
  { challengeId: 'swipe-1', data: { direction: 'right', speed: 0.8 }, timestamp: Date.now() },
  { challengeId: 'pattern-1', data: { pattern: [1, 2, 3, 4] }, timestamp: Date.now() }
];

const batchResults = astra.verifyBatch(batchResponses);
console.log(`   Batch results: ${batchResults.filter(r => r.success).length}/${batchResults.length} successful`);

console.log('\n✅ Example completed successfully!');
console.log('📦 Astra Security is ready to use in your application.');