// Core type definitions for PaperForge

export interface ConfidenceLevel {
  value: 'high' | 'medium' | 'low' | 'missing';
  reasoning: string; // Why this confidence level was assigned
}

export interface ExtractedField<T> {
  value: T;
  confidence: ConfidenceLevel;
  sourceSection?: string; // Which part of the paper this came from
}

export interface ModelArchitecture {
  name: ExtractedField<string>;
  type: ExtractedField<string>; // e.g., "Transformer", "CNN", "RNN"
  layers: ExtractedField<string[]>;
  parameters: ExtractedField<Record<string, any>>;
  description: ExtractedField<string>;
}

export interface Dataset {
  name: ExtractedField<string>;
  description: ExtractedField<string>;
  size: ExtractedField<string>;
  preprocessing: ExtractedField<string>;
  splits: ExtractedField<Record<string, string>>; // train/val/test splits
}

export interface TrainingRecipe {
  optimizer: ExtractedField<string>;
  learningRate: ExtractedField<string>;
  batchSize: ExtractedField<number>;
  epochs: ExtractedField<number>;
  lossFunction: ExtractedField<string>;
  regularization: ExtractedField<string>;
  schedulers: ExtractedField<string[]>;
}

export interface EvaluationMetrics {
  primary: ExtractedField<string>; // e.g., "accuracy", "F1", "BLEU"
  secondary: ExtractedField<string[]>;
  benchmarks: ExtractedField<string[]>; // Datasets/tasks used for evaluation
  results: ExtractedField<Record<string, number>>;
}

export interface TechnicalSpec {
  modelArchitecture: ModelArchitecture;
  dataset: Dataset;
  trainingRecipe: TrainingRecipe;
  evaluationMetrics: EvaluationMetrics;
}

export interface AmbiguousField {
  fieldName: string;
  category: 'modelArchitecture' | 'dataset' | 'trainingRecipe' | 'evaluationMetrics';
  confidence: 'medium' | 'low' | 'missing';
  issue: string; // Specific description of what's ambiguous
  recommendation: string; // What the researcher should verify
}

export interface DifficultyScore {
  score: number; // 1-10 scale
  breakdown: {
    modelClarityScore: number; // 0-1
    dataClarityScore: number; // 0-1
    trainingClarityScore: number; // 0-1
    evaluationClarityScore: number; // 0-1
  };
  ambiguousFields: AmbiguousField[];
  overallAssessment: string; // Human-readable summary
}

export interface GeneratedCode {
  files: {
    path: string;
    content: string;
    language: string;
  }[];
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  arxivId?: string;
  pdfUrl?: string;
}

export interface ProcessingJob {
  id: string;
  status: 'uploading' | 'extracting' | 'analyzing' | 'generating' | 'complete' | 'failed';
  progress: number; // 0-100
  statusMessage: string;
  paperMetadata?: PaperMetadata;
  technicalSpec?: TechnicalSpec;
  difficultyScore?: DifficultyScore;
  generatedCode?: GeneratedCode;
  architectureDiagram?: string; // Mermaid.js syntax
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ReplicationHistory {
  id: string;
  userId: string;
  jobId: string;
  paperTitle: string;
  difficultyScore: number;
  createdAt: Date;
  githubRepoUrl?: string;
}
