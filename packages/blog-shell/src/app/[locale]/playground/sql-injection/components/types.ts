export interface SQLLevelExplanation {
  attackName: string;
  howItWorks: string;
  whyItSucceeds: string;
  realWorldImpact: string;
}


export interface SQLResult {
  success: boolean;
  message: string;
  data?: any;
  query: string;
}

export interface SQLLevel {
  id: number;
  title: string;
  description: string;
  hint: string;
  type: 'login' | 'search' | 'user-lookup';
  validateInput: (username: string, password: string) => SQLResult;
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  email: string;
}