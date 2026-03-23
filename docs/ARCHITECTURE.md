# ASTRA Architecture

## Overview

ASTRA is built on a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     ASTRA Core                          │
│                 (Entry Point)                           │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Tier System  │ │  Accessibility│ │    Mutation   │
│               │ │    System     │ │    System     │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  OOS Scorer   │ │  Adaptations  │ │   Mutation    │
│               │ │   Manager     │ │   Schedule    │
└───────────────┘ └───────────────┘ └───────────────┘
        │
        ▼
┌───────────────┐
│   Challenge   │
│    System     │
└───────────────┘
```

## Core Components

### 1. OOS Scorer
- Calculates risk scores (0.0-4.0+) based on user behavior
- Analyzes hardware breath, timing patterns, device fingerprints
- Determines which tier to activate

### 2. Tier System (5 Tiers)
- **Tier 0 (Ghost):** Invisible verification
- **Tier 1 (Whisper):** Imperceptible micro-delay
- **Tier 2 (Nudge):** 3-second delightful challenge
- **Tier 3 (Pause):** 10-second engaging challenge
- **Tier 4 (Gate):** Manual review with options

### 3. Challenge System
- Physical challenges (Pulse, Tilt, Breath, Flick)
- Never text-based or image-based
- Always fast, satisfying, and accessible

### 4. Accessibility System
- Detects user accessibility needs
- Adapts challenges for motor, visual, cognitive, hearing needs
- Ensures equal security for all users

### 5. Mutation System
- Hourly rotation of challenges
- Prevents user fatigue and attack preparation
- Provides transparency to users

## Data Flow

```
User Request
    │
    ▼
Session Data
    │
    ▼
OOS Scoring
    │
    ├─ Hardware Breath Analysis
    ├─ Timing Pattern Analysis
    ├─ Device Fingerprint
    └─ Behavioral Baseline
    │
    ▼
Tier Selection
    │
    ├─ Tier 0-1 (95% of users)
    │    └─ Proceed with minimal friction
    │
    ├─ Tier 2 (4% of users)
    │    └─ 3-second challenge
    │
    ├─ Tier 3 (0.9% of users)
    │    └─ 10-second challenge
    │
    └─ Tier 4 (0.1% of users)
         └─ Manual review
    │
    ▼
Challenge Selection
    │
    ├─ Apply Mutation Schedule
    ├─ Check User Preferences
    └─ Apply Accessibility Adaptations
    │
    ▼
User Completes Challenge
    │
    ▼
Verification
    │
    ├─ Success → Update Baseline → Continue
    └─ Failure → Retry → Escalate
```

## State Management

### Session State
- Session ID
- Timing data (last 100 interactions)
- Tier history (last 100 tiers)
- Pending challenges
- User ID (if authenticated)

### User State
- Behavioral baseline
- Challenge performance
- Accessibility profile
- Preferred challenges
- Mutation history

## Security Considerations

1. **Privacy:** Hardware breath and timing data never leave device
2. **Transparency:** Users can see mutation schedule
3. **Accessibility:** Never compromise security for accessibility
4. **Fallbacks:** Always provide alternative paths
5. **Rate Limiting:** Built into OOS scoring

## Performance

- OOS Scoring: <10ms
- Challenge Selection: <5ms
- Verification: <20ms
- Total overhead: <50ms for Tier 0-1

## Scalability

- Stateless scoring (except user baselines)
- Redis for session storage (optional)
- Microservices architecture ready
- Event-driven mutations