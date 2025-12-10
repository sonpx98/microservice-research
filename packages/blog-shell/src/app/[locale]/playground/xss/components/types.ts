export interface XSSLevel {
  id: number;
  title: string;
  description: string;
  hint: string;
  filter?: (input: string) => string;
}

export interface LevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
}