// ASTRA Core Types
// Based on: ASTRA is a biological-frequency security layer that proves you're human by how you exist in time

export interface QuantumEntropySample {
  timestamp: number;
  accelerometer: { x: number; y: number; z: number };
  gyroscope: { x: number; y: number; z: number };
  magnetometer?: { x: number; y: number; z: number };
  tremorFrequency: number; // 8-12Hz for human neuromuscular jitter
  entropyScore: number; // 0-1, higher = more quantum randomness
}

export interface FrequencySpectrum {
  micro: number; // 0-50ms scale
  meso: number; // 50ms-5s scale  
  macro: number; // 5s-hours scale
  chaosIndex: number; // OOS: 0.0-3.0+
}

export interface NeuromuscularFingerprint {
  tremorPattern: number[]; // 8-12Hz frequency components
  reactionVariance: number; // 50-200ms biological noise
  coordinationScore: number; // Physical coordination metric
  timestamp: number;
}

export interface EntanglementToken {
  hardwareHash: string;
  biologyHash: string;
  timestampHash: string;
  combinedHash: string; // hash of (hardware + biology + time)
  expiresAt: number; // Regenerates every 30 seconds
}

export interface MutationChallenge {
  id: string;
  type: ChallengeType;
  parameters: Record<string, any>;
  expiresAt: number; // Hourly rotation
  difficulty: 'ghost' | 'whisper' | 'nudge' | 'pause' | 'gate';
}

export type ChallengeType = 
  | 'pulse'      // Tap in rhythm with vibration
  | 'tilt'       // Tilt phone to guide virtual object
  | 'breath'     // Hold phone still for tremor analysis
  | 'flick'      // Flick gesture with jitter analysis
  | 'entropy'    // Move mouse in any pattern
  | 'temporal'   // React to randomized interval
  | 'cognitive'  // Answer based on content just shown
  | 'social';    // Wait for other humans to join

export interface CanaryTrap {
  type: 'temporal' | 'spatial' | 'friction' | 'semantic';
  modification: any;
  expectedHumanResponse: any;
  botDetectionPattern: any;
}

export interface SessionState {
  sessionId: string;
  userId?: string;
  hardwareSignature: string;
  biologicalBaseline: NeuromuscularFingerprint;
  frequencyBaseline: FrequencySpectrum;
  entanglementToken: EntanglementToken;
  oosScore: number; // 0.0-3.0+
  tier: 'ghost' | 'whisper' | 'nudge' | 'pause' | 'gate';
  mutationHistory: MutationChallenge[];
  canaryHistory: CanaryTrap[];
  createdAt: number;
  lastVerified: number;
}

export interface VerificationResult {
  success: boolean;
  oosScore: number;
  tier: SessionState['tier'];
  requiresChallenge: boolean;
  challenge?: MutationChallenge;
  message: string;
  details?: Record<string, any>;
}

export interface ConsoleMetrics {
  projects: ProjectMetrics[];
  networkIntelligence: NetworkData;
  liveSessions: number;
  blockedAttacks: number;
  falsePositiveRate: number;
}

export interface ProjectMetrics {
  id: string;
  name: string;
  liveSessions: number;
  oosDistribution: number[]; // Histogram buckets
  mutationDeployment: Record<string, number>;
  challengeSuccessRate: number;
  lastAttackBlocked: number;
}

export interface NetworkData {
  sharedSignatures: string[];
  mutationRankings: Record<string, number>;
  attackCampaigns: AttackCampaign[];
  globalOOSBaseline: number;
}

export interface AttackCampaign {
  signature: string;
  firstSeen: number;
  sitesAffected: number;
  totalBlocked: number;
  mutationUsed: string;
}