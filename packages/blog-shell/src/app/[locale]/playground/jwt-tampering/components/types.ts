export interface JWTLevel {
  id: number;
  title: string;
  description: string;
  hint: string;
  scenario: string;
  targetClaim?: string;
  expectedValue?: string;
}

export interface JWTLevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
  preventionTips: string[];
}

export interface JWTValidationResult {
  success: boolean;
  message: string;
}

export interface JWTAttempt {
  id: number;
  token: string;
  result: JWTValidationResult;
}
