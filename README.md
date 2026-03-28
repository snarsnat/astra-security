# ASTRA Security System

<div align="center">

![ASTRA Logo](https://img.shields.io/badge/ASTRA-Security-blueviolet)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6)

**The Invisible Guardian - Human Verification System**

</div>

## 🚀 Overview

ASTRA represents a paradigm shift in security. Instead of asking "What do you know?" (passwords) or "What can you see?" (CAPTCHAs), ASTRA asks **"Do you breathe?"** - proving humanity through biological constraints and device interaction patterns.

### ✨ Key Features

- **Hardware Breath**: Quantum entropy from device sensors
- **Frequency Mapping**: Temporal pattern analysis across 3 time scales
- **Living Mutation System**: Hourly evolving challenges
- **Entanglement & Hijacking Defense**: Continuous verification
- **Friction Spectrum**: Adaptive security based on threat level
- **Zero-Knowledge Proofs**: Privacy-preserving verification

## 📦 Installation

```bash
# Install globally for CLI access
npm install -g astra-security

# Or install as project dependency
npm install astra-security
```

After installation, you'll see the ASTRA welcome message and can run:

```bash
astra setup
```

## 🛠️ Quick Start

### 1. Configure ASTRA for Your Project

```bash
cd your-project/
astra setup
```

This will:
- Generate a unique authentication ID for your project
- Open the ASTRA Security portal in your browser
- Connect your project to the ASTRA security network

### 2. Use ASTRA in Your Code

```typescript
import { Astra, ChallengeType } from 'astra-security';

// Initialize ASTRA
const astra = new Astra({
  apiKey: process.env.ASTRA_API_KEY,
  mode: 'development', // 'development' | 'production'
  frictionLevel: 'whisper' // 'ghost' | 'whisper' | 'nudge' | 'pause' | 'gate'
});

// Create a verification session
const session = await astra.createSession({
  userId: 'user_123',
  deviceId: 'device_456',
  context: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  }
});

// Generate a challenge
const challenge = await astra.generateChallenge(session.id, {
  type: ChallengeType.TAP_PATTERN,
  difficulty: 'medium',
  timeout: 30000 // 30 seconds
});

// Verify a response
const verification = await astra.verifyResponse(session.id, challenge.id, userResponse);

if (verification.success) {
  console.log('✅ Human verified!');
} else {
  console.log('❌ Verification failed:', verification.reason);
}
```

## 🏗️ Architecture

### Four Pillar System

1. **Hardware Breath**
   - Collects quantum entropy from device sensors
   - Creates unique device fingerprints
   - Detects anomalies in hardware behavior

2. **Frequency Mapping**
   - Analyzes interaction patterns across 3 time scales
   - Detects bot-like repetition or unnatural timing
   - Adapts to individual user behavior

3. **Living Mutation System**
   - Challenges evolve hourly
   - Prevents pattern recognition by bots
   - Maintains human-friendly interaction

4. **Entanglement & Hijacking Defense**
   - Continuous session verification
   - Detects session hijacking attempts
   - Real-time threat response

### Friction Spectrum

| Tier | Name | OOS Range | User Experience |
|------|------|-----------|-----------------|
| 0 | Ghost | 0.0-1.5 | Completely invisible |
| 1 | Whisper | 1.5-2.0 | 200ms micro-delay |
| 2 | Nudge | 2.0-2.5 | Single intuitive gesture |
| 3 | Pause | 2.5-3.0 | 10-second engaging challenge |
| 4 | Gate | 3.0+ | Manual review queue |

**Target**: 95% of humans never leave Tier 0-1. Bots never get past Tier 2.

## 🔧 CLI Commands

```bash
# Configure ASTRA for your project
astra setup

# Verify connection status
astra verify

# Check if ASTRA is configured
astra status

# Show help
astra help
```

## 🌐 Website Integration

The ASTRA website provides:
- **Project Dashboard**: Monitor security metrics
- **Authentication Portal**: Connect your projects
- **Analytics**: View verification statistics
- **Configuration**: Customize security settings

Visit: [https://astra-website-vercel-test.vercel.app](https://astra-website-vercel-test.vercel.app)

## 📁 Project Structure

```
astra-security/
├── bin/
│   └── astra.js          # CLI entry point
├── src/
│   ├── types/           # TypeScript interfaces
│   ├── engines/         # Security engines
│   ├── mutations/       # Challenge mutations
│   └── core/           # Core library
├── dist/               # Compiled JavaScript
├── package.json
├── README.md
└── setup.js           # Post-install script
```

## 🔌 API Reference

### Core Classes

#### `Astra(config: AstraConfig)`
Main class for interacting with ASTRA Security.

**Configuration:**
```typescript
interface AstraConfig {
  apiKey: string;
  mode?: 'development' | 'production';
  frictionLevel?: FrictionLevel;
  endpoint?: string;
}
```

#### `Session`
Represents a verification session with a user.

#### `Challenge`
A human verification challenge to be presented to the user.

### Challenge Types

```typescript
enum ChallengeType {
  TAP_PATTERN = 'tap_pattern',
  SWIPE_SEQUENCE = 'swipe_sequence',
  RHYTHM_MATCH = 'rhythm_match',
  PATTERN_DRAW = 'pattern_draw',
  MICRO_GESTURE = 'micro_gesture'
}
```

## 🔒 Security Model

### Threat Detection
- **Bot Detection**: Pattern analysis and timing anomalies
- **Replay Attacks**: One-time tokens and session binding
- **Device Spoofing**: Hardware fingerprint validation
- **Network Attacks**: IP reputation and geolocation analysis

### Privacy
- **Zero-Knowledge Proofs**: Verify without revealing data
- **Local Processing**: Sensitive data stays on device
- **Data Minimization**: Collect only what's necessary
- **GDPR Compliance**: Built-in privacy controls

## 🚢 Deployment

### Self-Hosted Option
```bash
# Clone the repository
git clone https://github.com/snarsnat/astra-security.git

# Install dependencies
cd astra-security
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Environment Variables
```bash
ASTRA_API_KEY=your_api_key_here
ASTRA_MODE=production
ASTRA_ENDPOINT=https://api.astra.security
ASTRA_DATABASE_URL=postgresql://...
```

## 📊 Monitoring & Analytics

ASTRA provides comprehensive monitoring:
- **Real-time Dashboard**: View active sessions and threats
- **Analytics API**: Programmatic access to metrics
- **Webhooks**: Receive events in real-time
- **Logging**: Structured logs for audit trails

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.astra.security](https://docs.astra.security)
- **Issues**: [GitHub Issues](https://github.com/snarsnat/astra-security/issues)
- **Discord**: [Join our community](https://discord.gg/astra)
- **Email**: support@astra.security

## 🙏 Acknowledgments

ASTRA Security is built on cutting-edge research in:
- Human-Computer Interaction
- Behavioral Biometrics
- Quantum Cryptography
- Machine Learning Security

---

<div align="center">

**"Protecting humans, not punishing them."**

[Get Started](#-quick-start) •
[Documentation](#) •
[Examples](#) •
[GitHub](https://github.com/snarsnat/astra-security)

</div>