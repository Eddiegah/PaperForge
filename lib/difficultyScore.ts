/**
 * Replication Difficulty Score — the core product differentiator.
 *
 * This module computes a genuinely grounded difficulty score based on real signals:
 * the per-field confidence levels from LLM extraction, NOT just asking the LLM to
 * "rate difficulty 1-10" (which would be ungrounded and unreliable).
 *
 * The score reflects how much ambiguity and missing information exists in the paper,
 * and produces a specific list of fields that need human verification before trusting
 * the generated code for exact replication.
 */

import { TechnicalSpec, DifficultyScore, AmbiguousField, ExtractedField } from '@/types';

/**
 * Compute a replication difficulty score from 1 (trivial) to 10 (extremely difficult).
 * The score is derived from field-level confidence signals captured during extraction.
 */
export function computeDifficultyScore(spec: TechnicalSpec): DifficultyScore {
  const ambiguousFields: AmbiguousField[] = [];

  // Helper to recursively check all extracted fields in a category
  function checkFields(
    obj: any,
    category: AmbiguousField['category'],
    prefix: string = ''
  ): { totalFields: number; highConfidence: number } {
    let totalFields = 0;
    let highConfidence = 0;

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && 'value' in value && 'confidence' in value) {
        // This is an ExtractedField
        const field = value as ExtractedField<any>;
        totalFields++;

        if (field.confidence.value === 'high') {
          highConfidence++;
        } else {
          // Medium, low, or missing confidence → flag as ambiguous
          ambiguousFields.push({
            fieldName: prefix + key,
            category,
            confidence: field.confidence.value as 'medium' | 'low' | 'missing',
            issue: field.confidence.reasoning,
            recommendation: generateRecommendation(key, field.confidence.reasoning),
          });
        }
      } else if (value && typeof value === 'object') {
        // Nested object, recurse
        const nested = checkFields(value, category, `${prefix}${key}.`);
        totalFields += nested.totalFields;
        highConfidence += nested.highConfidence;
      }
    }

    return { totalFields, highConfidence };
  }

  // Analyze each category
  const model = checkFields(spec.modelArchitecture, 'modelArchitecture');
  const data = checkFields(spec.dataset, 'dataset');
  const training = checkFields(spec.trainingRecipe, 'trainingRecipe');
  const evaluation = checkFields(spec.evaluationMetrics, 'evaluationMetrics');

  // Calculate per-category clarity scores (0-1, higher is better)
  const modelClarityScore =
    model.totalFields > 0 ? model.highConfidence / model.totalFields : 0;
  const dataClarityScore = data.totalFields > 0 ? data.highConfidence / data.totalFields : 0;
  const trainingClarityScore =
    training.totalFields > 0 ? training.highConfidence / training.totalFields : 0;
  const evaluationClarityScore =
    evaluation.totalFields > 0 ? evaluation.highConfidence / evaluation.totalFields : 0;

  // Overall clarity (simple average)
  const overallClarity =
    (modelClarityScore + dataClarityScore + trainingClarityScore + evaluationClarityScore) / 4;

  // Convert clarity (0-1, higher is clearer) to difficulty (1-10, higher is harder)
  // Score 1-3: High clarity (>0.8) — most details explicit
  // Score 4-6: Medium clarity (0.5-0.8) — some ambiguity
  // Score 7-10: Low clarity (<0.5) — significant ambiguity
  let score: number;
  if (overallClarity > 0.8) {
    score = 1 + Math.round((1 - overallClarity) * 10); // 1-3 range
  } else if (overallClarity > 0.5) {
    score = 4 + Math.round((0.8 - overallClarity) * 10); // 4-6 range
  } else {
    score = 7 + Math.round((0.5 - overallClarity) * 6); // 7-10 range
  }
  score = Math.max(1, Math.min(10, score)); // Clamp to 1-10

  const overallAssessment = generateOverallAssessment(score, ambiguousFields);

  return {
    score,
    breakdown: {
      modelClarityScore,
      dataClarityScore,
      trainingClarityScore,
      evaluationClarityScore,
    },
    ambiguousFields,
    overallAssessment,
  };
}

function generateRecommendation(fieldName: string, reasoning: string): string {
  // Generate actionable recommendations based on the field and reasoning
  const lowerField = fieldName.toLowerCase();

  if (lowerField.includes('learningrate') || lowerField.includes('learning_rate')) {
    return 'Verify the learning rate by checking figures, tables, or running a learning rate sweep to match reported results.';
  } else if (lowerField.includes('optimizer')) {
    return 'Confirm the optimizer type and its hyperparameters (momentum, weight decay, etc.) from the methodology section.';
  } else if (lowerField.includes('batchsize') || lowerField.includes('batch_size')) {
    return 'Check the batch size in the training setup section; effective batch size may differ from per-device batch size.';
  } else if (lowerField.includes('dataset')) {
    return 'Verify dataset preprocessing steps, splits, and any data augmentation techniques from the paper.';
  } else if (lowerField.includes('layers') || lowerField.includes('architecture')) {
    return 'Cross-reference the model architecture with any figures or equations in the paper; consider checking the appendix for full details.';
  } else {
    return `Verify "${fieldName}" by carefully reviewing the paper's methodology section and appendix. ${reasoning}`;
  }
}

function generateOverallAssessment(score: number, ambiguousFields: AmbiguousField[]): string {
  const ambiguousCount = ambiguousFields.length;

  if (score <= 3) {
    return `This paper provides clear, explicit details for most replication steps. ${ambiguousCount} field(s) require verification, but the generated code should serve as a strong starting point.`;
  } else if (score <= 6) {
    return `This paper contains moderate ambiguity. ${ambiguousCount} field(s) were not explicitly stated or require inference. Review the flagged fields carefully before relying on the generated code for exact replication.`;
  } else {
    return `This paper has significant ambiguity or missing details. ${ambiguousCount} field(s) could not be confidently extracted. The generated code is a reasonable scaffold, but substantial manual verification and tuning will be needed to replicate the results accurately.`;
  }
}
