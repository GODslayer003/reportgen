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

export const generateLifestyleGuidance = (scores, overallStatus) => {
  // Define outcome-specific guidance texts
  const guidanceTexts = {
    'Balanced': {
      'Fresh Meals': 'Prioritize whole, unprocessed foods. Cook at home when possible to control ingredients and portion sizes.',
      'Fiber-Rich Foods': 'Include diverse plant fibers daily: vegetables, legumes, whole grains, and fruits to nourish beneficial bacteria.',
      'Sleep Consistency': 'Maintain regular sleep-wake cycles. Aim for 7-9 hours of quality sleep to support gut-brain axis health.',
      'Hydration': 'Drink (2-2.5L) water throughout the day. Proper hydration supports digestive function and nutrient absorption.',
      'Limit Sugar/Alcohol/Caffeine': 'Moderate intake of refined sugars, alcohol, and caffeine to maintain current healthy balance.',
      'Light Activity': 'Regular moderate exercise supports gut motility and microbial diversity. Continue with your current activity level.',
      'Avoid Self-Medication': 'Continue consulting healthcare providers before taking medications. Maintain your current cautious approach.'
    },
    'Mild Imbalance': {
      'Fresh Meals': 'Focus on home-cooked meals with whole ingredients. Limit processed foods and maintain regular meal timing.',
      'Fiber-Rich Foods': 'Increase intake of diverse plant fibers—vegetables, legumes, whole grains—to support microbial balance.',
      'Sleep Consistency': 'Establish consistent sleep schedule (7-9 hours) to help regulate gut-brain communication.',
      'Hydration': 'Ensure adequate water intake (2-2.5L daily) to support digestive processes during microbiome reset.',
      'Limit Sugar/Alcohol/Caffeine': 'Reduce refined sugars and alcohol intake, as these can exacerbate microbial imbalance.',
      'Light Activity': 'Incorporate daily moderate exercise like walking to support gut motility and microbial diversity.',
      'Avoid Self-Medication': 'Consult healthcare providers before supplements or medications to avoid disrupting gut flora.'
    },
    'Moderate Dysbiosis': {
      'Fresh Meals': 'Emphasize whole, unprocessed foods. Prepare meals at home to ensure quality ingredients and proper portions.',
      'Fiber-Rich Foods': 'Consistently include diverse fibers from vegetables, legumes, and whole grains to nourish beneficial bacteria.',
      'Sleep Consistency': 'Maintain strict sleep schedule (7-9 hours) to support gut-brain axis during recovery period.',
      'Hydration': 'Increase water intake to 2.5-3L daily to aid digestive function and support microbiome restoration.',
      'Limit Sugar/Alcohol/Caffeine': 'Significantly reduce sugars, alcohol, and caffeine as they can hinder microbial recovery.',
      'Light Activity': 'Engage in regular gentle exercise to promote gut motility without causing excessive stress.',
      'Avoid Self-Medication': 'Avoid unnecessary medications and supplements; always consult with healthcare provider first.'
    },
    'Significant Dysbiosis': {
      'Fresh Meals': 'Strictly adhere to whole, unprocessed foods. Home-cooked meals are essential for microbiome support.',
      'Fiber-Rich Foods': 'Prioritize diverse plant fibers daily to create optimal environment for beneficial bacteria growth.',
      'Sleep Consistency': 'Critical to maintain 7-9 hours of quality sleep nightly to support gut-brain axis recovery.',
      'Hydration': 'Essential to drink 2.5-3L water daily to support digestive function and microbial balance restoration.',
      'Limit Sugar/Alcohol/Caffeine': 'Eliminate or strictly limit refined sugars, alcohol, and caffeine during recovery period.',
      'Light Activity': 'Gentle daily activity is important but avoid strenuous exercise that may stress the system.',
      'Avoid Self-Medication': 'Absolutely avoid self-medication; all supplements and medications must be clinician-approved.'
    }
  };

  // Get the appropriate texts based on overall status
  const texts = guidanceTexts[overallStatus] || guidanceTexts['Balanced'];

  // Always return the same 7 items with status-specific text
  return [
    { title: 'Fresh Meals', text: texts['Fresh Meals'] },
    { title: 'Fiber-Rich Foods', text: texts['Fiber-Rich Foods'] },
    { title: 'Sleep Consistency', text: texts['Sleep Consistency'] },
    { title: 'Hydration', text: texts['Hydration'] },
    { title: 'Limit Sugar/Alcohol/Caffeine', text: texts['Limit Sugar/Alcohol/Caffeine'] },
    { title: 'Light Activity', text: texts['Light Activity'] },
    { title: 'Avoid Self-Medication', text: texts['Avoid Self-Medication'] }
  ];
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

    const bacterialStatus = inputs.B === 1 ? "Detected" : "Not Detected";
    const yeastStatus = inputs.Y === 1 ? "Detected" : "Not Detected";
    const specimenStatus = inputs.V === 1 ? "Valid" : "Invalid";

    const bacterialDescription =
      bacterialStatus === "Detected"
        ? "Bacterial activity was detected in the submitted specimen."
        : "No bacterial activity was detected.";

    const yeastDescription =
      yeastStatus === "Detected"
        ? "Yeast was detected in the submitted specimen."
        : "No significant yeast presence detected.";

    const specimenDescription =
      specimenStatus === "Valid"
        ? "Specimen was reported valid during data entry."
        : "Specimen was reported invalid during data entry.";

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
    // SUMMARY OBSERVATION (depends on overallStatus)
    const summaryObservation =
      overallStatus === "Balanced"
        ? "Your gut microbiome screening indicates an overall functional state with values within the optimal range."
        : overallStatus === "Mild Imbalance"
          ? "Your gut microbiome shows mild imbalance with certain markers slightly above ideal ranges."
          : overallStatus === "Moderate Dysbiosis"
            ? "Your gut microbiome indicates moderate dysbiosis with several markers requiring attention."
            : "Your gut microbiome exhibits significant dysbiosis, suggesting that clinical follow-up is recommended.";

    const recommendation = getRecommendation(overallStatus);
    const lifestyle = JSON.stringify(generateLifestyleGuidance(scores, overallStatus));
    const keyInsight = generateKeyInsight(scores);
    const testId = generateTestId();
    const functionalPercent = Math.round(
      overallStatus === "Balanced" ? 90 :
        overallStatus === "Mild Imbalance" ? 70 :
          overallStatus === "Moderate Dysbiosis" ? 45 :
            overallStatus === "Significant Dysbiosis" ? 20 :
              50
    );

    // --- PAGE 7 CONTENT GENERATION ---

    const narrativeText =
      overallStatus === "Balanced"
        ? "Based on the analytical observations from your Biome360 Health Check, your microbiome reflects a stable and well-regulated environment with functional markers falling within expected ranges. Your bacterial populations exhibit healthy patterns, particularly within Lactobacillus and Bifidobacterium groups, supporting optimal fermentation and immune modulation. Overall, your microbiome’s functional profile suggests strong stability with only routine lifestyle maintenance required"
        : overallStatus === "Mild Imbalance"
          ? "Based on the analytical observations from your Biome360 Health Check, your microbiome shows mild functional imbalance with certain bacterial or yeast markers slightly elevated above ideal thresholds. These patterns often arise due to dietary variability, irregular sleep, or stress influences, but they typically improve with targeted lifestyle adjustments within weeks. Your microbial ecosystem shows early signs of imbalance but remains highly responsive to supportive dietary and behavioral changes"
          : overallStatus === "Moderate Dysbiosis"
            ? "Based on the analytical observations from your Biome360 Health Check, your microbiome indicates moderate dysbiosis with several microbial functions outside expected ranges. These deviations may impact fermentation efficiency, immune tone, and microbial stability — often related to prolonged stress, inconsistent diet, or reduced diversity. A structured 4–6 week microbiome support plan is recommended to restore microbial balance"
            : "Based on the analytical observations from your Biome360 Health Check, your microbiome reflects significant imbalance across multiple functional markers. These patterns may contribute to inflammatory tendencies, digestive inconsistency, and metabolic inefficiencies. A structured multi-phase plan and potential clinical follow-up are recommended to restore microbial harmony"

    let keyFindings = [
      statuses.FS4 === "Elevated"
        ? "Yeast-associated activity is elevated, indicating potential overgrowth that may benefit from moderated sugar and refined carbohydrate intake."
        : null,

      statuses.FS3 !== "Within"
        ? "Bacterial balance shows measurable deviation from expected ranges, which may influence fermentation efficiency and immune modulation pathways."
        : null,

      statuses.FS6 !== "Within"
        ? "Gut–brain stress markers reflect reduced alignment between digestive and cognitive pathways, often linked to lifestyle or stress-related factors."
        : null,

      statuses.FS5 !== "Within"
        ? "Immune tone exhibits mild functional fluctuation, suggesting possible microbial–immune interaction imbalance."
        : null,

      "Overall microbial diversity remains functionally adequate with no significant pathogenic signatures observed."
    ].filter(Boolean);

    while (keyFindings.length < 3) {
      keyFindings.push(
        "General microbial patterns remain within functional thresholds, although continued lifestyle consistency is recommended."
      );
    }

    // Hard cap at 4 findings
    if (keyFindings.length > 4) keyFindings.length = 4;


    // Attach into final report
    const clinicalSummary = {
      narrative: narrativeText,
      keyFindings
    };


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
        keyInsight,
        bacterialStatus,
        yeastStatus,
        specimenStatus,
        bacterialDescription,
        yeastDescription,
        specimenDescription
      },
      summaryObservation,
      functionalPercent,
      clinicalSummary,

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