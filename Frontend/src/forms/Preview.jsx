// Preview.jsx - Corrected Version
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { createReport, downloadPDF, clearError } from "../features/report/reportSlice";
import { HiOutlineDocumentText } from "react-icons/hi";
import PrintableReport from "../components/PrintableReport";
export default function Preview() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [advancedTest, setAdvancedTest] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const { patientInfo, labInputs, questionnaires, createdReport, loading, error } = useSelector((state) => state.report);

  // Clear any existing errors on component mount
  React.useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (!patientInfo || !labInputs || !questionnaires) {
    return (
      <Layout activeStep={4}>
        <div className="p-6 sm:p-8 md:p-10 text-center text-gray-600 text-sm sm:text-base">
          Missing information. Please complete previous steps.
        </div>
      </Layout>
    );
  }
const handlePrintPreview = () => {
  // Calculate final scores from questionnaires using the same logic as your document
  const calculateScore = (value) => Math.min(5, Math.round((value || 0) / 2));
  
  const getStatusAndClass = (score) => {
    if (score === 5) return { status: "High", class: "high" };
    if (score === 4) return { status: "Elevated", class: "elevated" };
    if (score === 3) return { status: "Borderline", class: "borderline" };
    return { status: "Normal", class: "normal" };
  };

  const finalScores = {
    digestiveRhythm: { 
      label: "Digestive Rhythm", 
      score: calculateScore(questionnaires.Q1),
      ...getStatusAndClass(calculateScore(questionnaires.Q1))
    },
    fermentationLoad: { 
      label: "Fermentation Load", 
      score: calculateScore(questionnaires.Q2),
      ...getStatusAndClass(calculateScore(questionnaires.Q2))
    },
    bacterialBalance: { 
      label: "Bacterial Balance", 
      score: calculateScore(labInputs.bacterialSignal * 10),
      ...getStatusAndClass(calculateScore(labInputs.bacterialSignal * 10))
    },
    yeastBalance: { 
      label: "Yeast Balance", 
      score: calculateScore(labInputs.yeastSignal * 10),
      ...getStatusAndClass(calculateScore(labInputs.yeastSignal * 10))
    },
    immuneTone: { 
      label: "Immune Tone", 
      score: calculateScore(questionnaires.Q3),
      ...getStatusAndClass(calculateScore(questionnaires.Q3))
    },
    gutBrainStress: { 
      label: "Gut-Brain Stress", 
      score: calculateScore(questionnaires.Q2),
      ...getStatusAndClass(calculateScore(questionnaires.Q2))
    },
    circadianSleep: { 
      label: "Circadian Sleep", 
      score: calculateScore(questionnaires.Q5),
      ...getStatusAndClass(calculateScore(questionnaires.Q5))
    },
    dietQuality: { 
      label: "Diet Quality", 
      score: calculateScore(questionnaires.Q6),
      ...getStatusAndClass(calculateScore(questionnaires.Q6))
    },
    medicationImpact: { 
      label: "Medication Impact", 
      score: calculateScore(questionnaires.Q4),
      ...getStatusAndClass(calculateScore(questionnaires.Q4))
    },
    hydrationRecovery: { 
      label: "Hydration & Recovery", 
      score: 2,
      ...getStatusAndClass(2)
    }
  };

  const printContent = `
    <html>
      <head>
        <title>Biome360 Report</title>
        <style>
  /* GLOBAL */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    margin: 0.4cm;
    color: #333;
    font-size: 11px;
    line-height: 1.4;
  }
  h1 {
    font-size: 20px;
    margin-bottom: 4px;
    color: #2D8275;
    text-align: center;
  }
  h2 {
    font-size: 14px;
    margin-top: 12px;
    margin-bottom: 8px;
    color: #333;
    border-bottom: 2px solid #2D8275;
    padding-bottom: 4px;
  }
  p {
    margin: 3px 0;
  }
  
  /* PATIENT INFO */
  .p6-info-card {
    background: #f8f9fa;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  .p6-info-row {
    font-size: 11px;
  }
  .p6-info-row strong {
    color: #555;
    font-weight: 600;
  }
  
  /* LAB RESULTS */
  .p6-table-card {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 12px;
  }
  .p6-table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    background: #2c5282;
    color: white;
    font-weight: 600;
    padding: 8px 10px;
    font-size: 11px;
  }
  .p6-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    padding: 8px 10px;
    border-bottom: 1px solid #e9ecef;
    font-size: 11px;
    align-items: center;
  }
  .p6-row:last-child {
    border-bottom: none;
  }
  .p6-row:nth-child(even) {
    background: #f8f9fa;
  }
  
  /* TABLE */
  .report-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 11px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 12px;
  }
  .report-table thead th {
    background: #2c5282;
    color: white;
    font-weight: 600;
    padding: 10px 12px;
    text-align: left;
    border: none;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .report-table thead th:first-child {
    border-top-left-radius: 8px;
  }
  .report-table thead th:last-child {
    border-top-right-radius: 8px;
    text-align: right;
  }
  .report-table tbody tr {
    background: white;
  }
  .report-table tbody tr:nth-child(even) {
    background: #f8f9fa;
  }
  .report-table td {
    padding: 10px 12px;
    border-bottom: 1px solid #e9ecef;
  }
  .report-table td:last-child {
    text-align: right;
    font-weight: 600;
    color: #2D8275;
  }
  .report-table tbody tr:last-child td {
    border-bottom: none;
  }
  .report-table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 8px;
  }
  .report-table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 8px;
  }
  
  /* BADGES - Using exact colors from your document */
  .badge {
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    display: inline-block;
    white-space: nowrap;
  }
  .normal { background: #E8F8EF; color: #12C254; }
  .high { background: #FFE5E3; color: #E44B47; }
  .borderline { background: #FFF7D9; color: #E2B420; }
  .elevated { background: #FFE9D9; color: #F77A21; }
  
  /* Legend / scoring system */
  .p6-legend {
    margin: 10px 0 12px;
    padding: 10px 14px;
    background: #fff; 
    border-radius: 6px;
    border: 1px solid rgba(0,0,0,0.06);
    display: flex; 
    align-items: center; 
    gap: 10px; 
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .p6-legend .legend-label { 
    font-weight: 600; 
    color: #1F4E79; 
    font-size: 11px; 
    margin-right: 8px; 
  }
  .p6-legend .legend-item { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    font-size: 10px; 
    color: #444; 
    margin-right: 8px; 
  }
  .p6-dot { 
    width: 10px; 
    height: 10px; 
    border-radius: 50%; 
    display: inline-block; 
  }
  .dot-green { background: #12C254; }
  .dot-yellow { background: #E2B420; }
  .dot-orange { background: #F77A21; }
  .dot-red { background: #E44B47; }
  
  /* FORCE SINGLE PAGE */
  @media print {
    body { 
      margin: 0.4cm;
    }
    @page {
      size: A4 portrait;
      margin: 0.4cm;
    }
  }
</style>
      </head>
      <body>
        <h1>Biome360 Health Check Report</h1>
        <p style="text-align: center; font-size: 10px; color:#666; margin-bottom: 12px;">
          Report Date: ${new Date().toLocaleDateString()}
        </p>
        
        <!-- PATIENT INFORMATION -->
        <h2>Patient Information</h2>
        <div class="p6-info-card">
          <div class="p6-info-row"><strong>Patient Name:</strong> ${patientInfo?.patientName || "N/A"}</div>
          <div class="p6-info-row"><strong>Age:</strong> ${patientInfo?.age || "N/A"}</div>
          <div class="p6-info-row"><strong>Sex:</strong> ${patientInfo?.sex || "N/A"}</div>
          <div class="p6-info-row"><strong>Collection Date:</strong> ${patientInfo?.collectionDate ? new Date(patientInfo.collectionDate).toLocaleDateString() : "N/A"}</div>
          <div class="p6-info-row" style="grid-column: 1 / -1;"><strong>Clinician:</strong> ${patientInfo?.clinicianName || "Not specified"}</div>
        </div>
        
        <!-- LAB RESULTS -->
        <h2>Laboratory Results</h2>
        <div class="p6-table-card">
          <div class="p6-table-header">
            <div>Test</div>
            <div>Result</div>
            <div>Status</div>
          </div>
          <div class="p6-row">
            <div>Specimen Validity</div>
            <div>${labInputs?.specimenValidity === 1 ? "Valid" : "Invalid"}</div>
            <div>
              <span class="badge ${labInputs?.specimenValidity === 1 ? 'normal' : 'high'}">
                ${labInputs?.specimenValidity === 1 ? "Pass" : "Fail"}
              </span>
            </div>
          </div>
          <div class="p6-row">
            <div>Bacterial Signal</div>
            <div>${labInputs?.bacterialSignal === 1 ? "Detected" : "Not Detected"}</div>
            <div>
              <span class="badge ${labInputs?.bacterialSignal === 1 ? "high" : "normal"}">
                ${labInputs?.bacterialSignal === 1 ? "Alert" : "Normal"}
              </span>
            </div>
          </div>
          <div class="p6-row">
            <div>Yeast Signal</div>
            <div>${labInputs?.yeastSignal === 1 ? "Detected" : "Not Detected"}</div>
            <div>
              <span class="badge ${labInputs?.yeastSignal === 1 ? "high" : "normal"}">
                ${labInputs?.yeastSignal === 1 ? "Alert" : "Normal"}
              </span>
            </div>
          </div>
        </div>
        
        <!-- QUESTIONNAIRE ASSESSMENT -->
        <h2>Functional Assessment</h2>
        
        <!-- Scoring Legend -->
        <div class="p6-legend">
          <div class="legend-label">Scoring System:</div>
          <div class="legend-item"><span class="p6-dot dot-green"></span>1-2 Normal</div>
          <div class="legend-item"><span class="p6-dot dot-yellow"></span>3 Borderline</div>
          <div class="legend-item"><span class="p6-dot dot-orange"></span>4 Elevated</div>
          <div class="legend-item"><span class="p6-dot dot-red"></span>5 High</div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Status</th>
              <th style="text-align: right;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(finalScores).map(([key, item]) => `
              <tr>
                <td>${item.label}</td>
                <td>
                  <span class="badge ${item.class}">
                    ${item.status}
                  </span>
                </td>
                <td>${item.score}/5</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }
};

  const handleDownloadPDF = async (reportId) => {
    try {
      console.log("Starting PDF download for report:", reportId);
      await dispatch(downloadPDF(reportId)).unwrap();
      alert("PDF downloaded successfully! Check your downloads folder.");
    } catch (err) {
      console.error("PDF download error:", err);
      alert(`Failed to download PDF: ${err || "Unknown error"}`);
    }
  };

  const handleGeneratePDF = async () => {
    // VALIDATIONS
    if (!patientInfo.patientName || !patientInfo.age || !patientInfo.sex) {
      return alert("Please complete patient info before generating report.");
    }

    if (labInputs.specimenValidity === 0) {
      return alert("Invalid specimen: cannot generate report.");
    }

    try {
      setIsGenerating(true);
      dispatch(clearError());

      // Build payload with proper type conversion and field mapping
      const payload = {
        patient: {
          name: patientInfo.patientName || "",
          age: Number(patientInfo.age) || 0,
          sex: patientInfo.sex || "",
          collectionDate: patientInfo.collectionDate || new Date().toISOString(),
          clinician: patientInfo.clinicianName || "",
        },
        labInputs: {
          B: Number(labInputs.bacterialSignal) || 0,
          Y: Number(labInputs.yeastSignal) || 0,
          V: Number(labInputs.specimenValidity) || 1,
        },
        questionnaire: {
          Q1: Number(questionnaires.Q1) || 0,
          Q2: Number(questionnaires.Q2) || 0,
          Q3: Number(questionnaires.Q3) || 0,
          Q4: Number(questionnaires.Q4) || 0,
          Q5: Number(questionnaires.Q5) || 0,
          Q6: Number(questionnaires.Q6) || 0,
        },
      };

      console.log("Sending payload to backend:", payload);
      
      // Create the report first
      const result = await dispatch(createReport(payload)).unwrap();
      console.log("Report created successfully:", result);

      if (result && result._id) {
        // Then download the PDF
        await handleDownloadPDF(result._id);
      } else {
        alert("Report created but could not generate PDF. Report ID missing.");
      }
    } catch (err) {
      console.error("PDF GENERATION ERROR:", err);
      alert(`Failed to generate report: ${err || "Unknown error"}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout activeStep={4}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {/* Advanced Test Toggle */}
        <div 
          className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setAdvancedTest(!advancedTest)}
        >
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all mt-0.5 ${advancedTest ? "bg-[#2D8275]" : "bg-white border border-gray-400"}`}>
              {advancedTest && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm sm:text-base">Availability of Advanced Test</p>
              <p className="text-gray-500 text-xs sm:text-sm">
                {advancedTest ? "You are available for Advanced Testing." : "Basic testing completed"}
              </p>
            </div>
          </div>
        </div>

        {/* Header & Actions */}
        <div className="border border-[#2D8275] bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 md:mb-10 relative">
          <div className="absolute right-4 top-4 sm:right-6 sm:top-6 text-[#2D8275]">
            <HiOutlineDocumentText className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Report Preview</h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8">
            Review all entered information before generating the final report
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating || loading}
              className="flex-1 py-2.5 sm:py-3 bg-[#2D8275] text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-[#256c65] transition-colors text-sm sm:text-base"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 3-3m-3 3-3-3m9 3v4.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5V15" />
                  </svg>
                  Generate PDF Report
                </>
              )}
            </button>
          <button
            onClick={handlePrintPreview}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-[#2D8275] text-[#2D8275] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#2D8275] hover:text-white transition-colors text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18h12v4H6v-4ZM4 9h16v6H4V9Z" />
            </svg>
            Print Preview
          </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Patient Details */}
          <SectionCard title="Patient Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Field label="Patient Name" value={patientInfo.patientName} />
              <Field label="Age" value={patientInfo.age} />
              <Field label="Sex" value={patientInfo.sex} />
              <Field label="Collection Date" value={new Date(patientInfo.collectionDate).toLocaleDateString()} />
              <Field label="Clinician Name" value={patientInfo.clinicianName || "Not specified"} full />
            </div>
          </SectionCard>

          {/* Lab Inputs */}
          <SectionCard title="Lab Inputs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Field label="Specimen Validity" value={labInputs.specimenValidity === 1 ? "✓ Valid" : "✗ Invalid"} />
              <Field label="Bacterial Signal" value={labInputs.bacterialSignal === 1 ? "⚠ Detected" : "✓ Not Detected"} />
              <Field label="Yeast Signal" value={labInputs.yeastSignal === 1 ? "⚠ Detected" : "✓ Not Detected"} />
            </div>
          </SectionCard>

          {/* Questionnaires */}
          <SectionCard title="Questionnaire Scores">
            <div className="space-y-3 sm:space-y-4">
              {Object.entries(questionnaires).map(([qKey, val]) => (
                <div key={qKey} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-b-0 gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium text-sm sm:text-base">
                      {qKey} — {questionLabels[qKey]}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="px-2 sm:px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm font-medium whitespace-nowrap">
                      {val} — {scoreLabels[val]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/questionnaires")}
              className="px-6 sm:px-8 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base w-full sm:w-auto order-2 sm:order-1"
            >
              ← Previous
            </button>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center order-1 sm:order-2 text-center sm:text-left">
              Review complete • Ready to generate report
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Reusable Components
function SectionCard({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
        <span className="text-xs font-semibold px-2 sm:px-3 py-1 rounded-full bg-[#e0f7f3] text-[#297E74] border border-[#c4ebe5] whitespace-nowrap self-start sm:self-auto">
          Complete
        </span>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, full = false }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-gray-900 font-medium text-sm sm:text-base break-words">{value}</p>
    </div>
  );
}

// Question labels
const questionLabels = {
  Q1: "Digestion & Bowel Rhythm",
  Q2: "Energy / Focus Dips",
  Q3: "Infections / Allergies",
  Q4: "Long Medication Use",
  Q5: "Sleep Regularity / Restfulness",
  Q6: "Diet Pattern",
};

// Score labels
const scoreLabels = {
  0: "Never", 
  1: "Rarely", 
  2: "Sometimes", 
  3: "Moderate", 
  4: "Often", 
  5: "Very Often",
};
