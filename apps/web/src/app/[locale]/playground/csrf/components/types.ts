export interface CSRFLevel {
  id: number;
  title: string;
  description: string;
  hint: string;
  scenario: string;
  type: 'form-based' | 'token-bypass' | 'same-site' | 'custom-header';
  validTokens?: string[];
}

export interface CSRFLevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
  preventionTips: string[];
}