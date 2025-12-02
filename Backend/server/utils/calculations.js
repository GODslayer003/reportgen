/**
 * MHC Calculation Engine - Version 7.1
 * Error-proof version with safe defaults for PDF generation
 */

export const clamp = (value, min = 0, max = 10) => {
  const numValue = Number(value);
  if (isNaN(numValue)) return min;
  return Math.max(min, Math.min(max, numValue));
};

export const calculateFunctionalScores = (inputs) => {
  const B = Number(inputs.B) || 0;
  const Y = Number(inputs.Y) || 0;
  const Q1 = Number(inputs.Q1) || 0;
  const Q2 = Number(inputs.Q2) || 0;
  const Q3 = Number(inputs.Q3) || 0;
  const Q4 = Number(inputs.Q4) || 0;
  const Q5 = Number(inputs.Q5) || 0;
  const Q6 = Number(inputs.Q6) || 0;

  const scores = {
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

  return scores;
};

export const mapFSToStatus = (fs) => {
  const score = Number(fs);
  if (isNaN(score)) return 'Within';
  if (score <= 3) return 'Within';
  if (score <= 6) return 'Borderline';
  return 'Elevated';
};

export const calculateOverallStatus = (inputs) => {
  const B = Number(inputs.B) || 0;
  const Y = Number(inputs.Y) || 0;
  const Q1 = Number(inputs.Q1) || 0;
  const Q2 = Number(inputs.Q2) || 0;
  const Q3 = Number(inputs.Q3) || 0;
  const Q4 = Number(inputs.Q4) || 0;
  const Q5 = Number(inputs.Q5) || 0;
  const Q6 = Number(inputs.Q6) || 0;

  const MSS = B * 3 + Y * 3;
  const LL = Math.round(((Q1 + Q2 + Q3 + Q4 + Q5 + Q6) / 30) * 4);
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
  return recommendations[status] || 'No recommendation available.';
};

export const generateLifestyleGuidance = (scores) => {
  const safeScores = {};
  Object.keys(scores).forEach(key => safeScores[key] = Number(scores[key]) || 0);

  const guidance = [];
  if (safeScores.FS8 >= 4) guidance.push('Focus on fresh, home-cooked meals with diverse fiber sources and regular meal timing.');
  if (safeScores.FS7 >= 4) guidance.push('Maintain a consistent sleep schedule with 7–8 hours of restful sleep each night.');
  if (safeScores.FS4 >= 4) guidance.push('Consider moderating sugar and alcohol intake to support yeast balance.');
  if (safeScores.FS9 >= 4) guidance.push('Avoid self-medication and review any long-term medication courses with your clinician.');
  if (safeScores.FS10 <= 3) guidance.push('Ensure adequate daily hydration to support recovery and metabolic function.');
  if (safeScores.FS6 >= 4 || safeScores.FS5 >= 4) guidance.push('Practice stress management techniques and moderate digital device exposure, especially before sleep.');

  return guidance.length > 0 ? guidance.join(' ') : 'Maintain current healthy lifestyle habits.';
};

export const generateTestId = () => {
  const date = new Date();
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `MHC-${yy}${mm}-${rand}`;
};


export const generateKeyInsight = (scores) => {
  if (!scores) {
    return "Small, consistent changes often produce the most sustainable results.";
  }

  if (scores.FS4 >= 4) {
    return "Stabilizing sugar intake and reducing alcohol can significantly improve yeast balance.";
  }

  if (scores.FS8 >= 4) {
    return "Improving diet quality can rapidly shift the microbiome toward healthier balance.";
  }

  if (scores.FS7 >= 4) {
    return "Strengthening sleep rhythm amplifies improvements across all functional areas.";
  }

  if (scores.FS6 >= 4) {
    return "Reducing daily stress load significantly benefits the gut–brain axis.";
  }

  if (scores.FS5 >= 4) {
    return "Supporting immune tone through consistent habits improves microbiome stability.";
  }

  if (scores.FS10 <= 3) {
    return "Even modest improvements in hydration produce noticeable recovery benefits.";
  }

  return "Small, consistent changes often produce the most sustainable results.";
};


export const generateCompleteReport = (patientData, labInputs, questionnaire) => {
  try {
    if (!labInputs || Number(labInputs.V) === 0) {
      throw new Error('Cannot generate report: Sample is invalid');
    }

    const inputs = {
      B: Number(labInputs.B) || 0,
      Y: Number(labInputs.Y) || 0,
      V: Number(labInputs.V) || 0,
      Q1: Number(questionnaire.Q1) || 0,
      Q2: Number(questionnaire.Q2) || 0,
      Q3: Number(questionnaire.Q3) || 0,
      Q4: Number(questionnaire.Q4) || 0,
      Q5: Number(questionnaire.Q5) || 0,
      Q6: Number(questionnaire.Q6) || 0
    };

    // ALL CORE CALCULATIONS
    const scores = calculateFunctionalScores(inputs);

    Object.keys(scores).forEach(key => {
      if (!isFinite(scores[key])) scores[key] = 0;
    });

    const statuses = {};
    for (let i = 1; i <= 10; i++) {
      statuses[`FS${i}`] = mapFSToStatus(scores[`FS${i}`]);
    }

    const overallStatus = calculateOverallStatus(inputs);
    const recommendation = getRecommendation(overallStatus);
    const lifestyle = generateLifestyleGuidance(scores);
    const keyInsight = generateKeyInsight(scores);
    const testId = generateTestId();

    // 🔥 FUNCTIONAL PERCENT — Correct Placement
    const functionalPercent = Math.round(
      overallStatus === "Balanced" ? 90 :
      overallStatus === "Mild Imbalance" ? 70 :
      overallStatus === "Moderate Dysbiosis" ? 45 :
      overallStatus === "Significant Dysbiosis" ? 20 : 
      50
    );

    return {
      testId,
      patient: {
        name: patientData?.name || 'Unknown',
        age: Number(patientData?.age) || 0,
        sex: patientData?.sex || 'Other',
        collectionDate: patientData?.collectionDate || new Date(),
        clinician: patientData?.clinician || ''
      },
      labInputs: {
        B: Number(labInputs.B) || 0,
        Y: Number(labInputs.Y) || 0,
        V: Number(labInputs.V) || 0
      },
      questionnaire: {
        Q1: Number(questionnaire.Q1) || 0,
        Q2: Number(questionnaire.Q2) || 0,
        Q3: Number(questionnaire.Q3) || 0,
        Q4: Number(questionnaire.Q4) || 0,
        Q5: Number(questionnaire.Q5) || 0,
        Q6: Number(questionnaire.Q6) || 0
      },

      calculatedData: {
        scores,
        statuses,
        overallStatus,
        recommendation,
        lifestyle,
        keyInsight
      },

      functionalPercent,

      aboutTest: {
        title: 'Microbiome Health Check',
        description: 'Comprehensive functional microbiome analysis'
      },

      reportDate: new Date(),
      version: '7.1'
    };

  } catch (error) {
    throw new Error(`Report generation failed: ${error.message}`);
  }
};