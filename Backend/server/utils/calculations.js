/**
 * MHC Calculation Engine - Version 7.0
 * Implements all formulas from the specification document
 */

export const clamp = (value, min = 0, max = 10) => {
  return Math.max(min, Math.min(max, value));
};

export const calculateFunctionalScores = (inputs) => {
  const { B, Y, Q1, Q2, Q3, Q4, Q5, Q6 } = inputs;
  
  return {
    FS1: clamp(Q1 * 2 + B * 2),
    FS2: clamp(Q1 * 1.5 + Q2 * 1 + B * 2),
    FS3: clamp(B * 8 + Q6 * 1 + Q4 * 1),
    FS4: clamp(Y * 8 + Q6 * 1 + Q2 * 0.5),
    FS5: clamp(Q3 * 2 + (B + Y) * 1),
    FS6: clamp(Q2 * 2 + Q5 * 1),
    FS7: clamp(Q5 * 2),
    FS8: clamp(Q6 * 2 + (B + Y) * 1),
    FS9: clamp(Q4 * 2),
    FS10: clamp(4 + Q1 * 0.5 + Q5 * 0.5 - Q6 * 0.2)
  };
};

export const mapFSToStatus = (fs) => {
  if (fs <= 3) return 'Within';
  if (fs <= 6) return 'Borderline';
  return 'Elevated';
};

export const calculateOverallStatus = (inputs) => {
  const { B, Y, Q1, Q2, Q3, Q4, Q5, Q6 } = inputs;
  
  // Microbial Severity Score (MSS)
  const MSS = B * 3 + Y * 3;
  
  // Lifestyle Load (LL)
  const LL = Math.round(((Q1 + Q2 + Q3 + Q4 + Q5 + Q6) / 30) * 4);
  
  // Overall Severity Score (OSS)
  const OSS = MSS + LL;
  
  if (OSS <= 2) return 'Balanced';
  if (OSS <= 5) return 'Mild Imbalance';
  if (OSS <= 7) return 'Moderate Dysbiosis';
  return 'Significant Dysbiosis';
};

export const getRecommendation = (status) => {
  const recommendations = {
    'Balanced': 'Maintain current routine; repeat after ~6 months.',
    'Mild Imbalance': 'Begin a 4-week microbiome reset routine.',
    'Moderate Dysbiosis': 'Follow a structured 4-week plan with a clinician review at 10–14 days.',
    'Significant Dysbiosis': 'Consider Advanced Functional Microbiome Analysis (typical turnaround 20–25 days) and an expert consult.'
  };
  return recommendations[status] || '';
};

export const generateLifestyleGuidance = (scores) => {
  const guidance = [];
  
  if (scores.FS8 >= 4) {
    guidance.push('Focus on fresh, home-cooked meals with diverse fiber sources and regular meal timing.');
  }
  if (scores.FS7 >= 4) {
    guidance.push('Maintain a consistent sleep schedule with 7–8 hours of restful sleep each night.');
  }
  if (scores.FS4 >= 4) {
    guidance.push('Consider moderating sugar and alcohol intake to support yeast balance.');
  }
  if (scores.FS9 >= 4) {
    guidance.push('Avoid self-medication and review any long-term medication courses with your clinician.');
  }
  if (scores.FS10 <= 3) {
    guidance.push('Ensure adequate daily hydration to support recovery and metabolic function.');
  }
  if (scores.FS6 >= 4 || scores.FS5 >= 4) {
    guidance.push('Practice stress management techniques and moderate digital device exposure, especially before sleep.');
  }
  
  return guidance.join(' ');
};

export const generateTestId = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `MHC-${yy}${mm}-${rand}`;
};

export const generateCompleteReport = (patientData, labInputs, questionnaire) => {
  // Validate specimen
  if (labInputs.V === 0) {
    throw new Error('Cannot generate report: Sample is invalid');
  }

  // Combine inputs
  const inputs = { ...labInputs, ...questionnaire };
  
  // Calculate scores
  const scores = calculateFunctionalScores(inputs);
  
  // Map to statuses
  const statuses = {};
  for (let i = 1; i <= 10; i++) {
    statuses[`FS${i}`] = mapFSToStatus(scores[`FS${i}`]);
  }
  
  // Calculate overall status
  const overallStatus = calculateOverallStatus(inputs);
  
  // Generate recommendation
  const recommendation = getRecommendation(overallStatus);
  
  // Generate lifestyle guidance
  const lifestyle = generateLifestyleGuidance(scores);
  
  // Generate test ID
  const testId = generateTestId();
  
  return {
    testId,
    patient: patientData,
    labInputs,
    questionnaire,
    calculatedData: {
      scores,
      statuses,
      overallStatus,
      recommendation,
      lifestyle
    },
    reportDate: new Date(),
    version: '7.0'
  };
};