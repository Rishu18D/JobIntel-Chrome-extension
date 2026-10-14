export interface ExtractedPageData {
  title: string;
  url: string;
  text: string;
  isJobPosting: boolean;
}

export interface AnalysisResult {
  isJob: boolean;
  matchScore: number;
  summary: string[];
  keyRequirements: string[];
  matchedSkills: string[];
  missingSkills: string[];
  actionableInsights: string[];
}

export interface SavedClip {
  id: string;
  title: string;
  url: string;
  timestamp: number;
  matchScore?: number;
  summary: string[];
  tags: string[];
}

export interface UserSettings {
  apiKey: string;
  userSkills: string[];
}