// src/components/PrintableReport.jsx
import React from "react";

const PrintableReport = ({ patientInfo, labInputs, questionnaires, advancedTest }) => {
  return (
    <div className="printable-report p-8">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-report, .printable-report * {
              visibility: visible;
            }
            .printable-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
          }
        `}
      </style>
      
      {/* Report Header */}
      <div className="text-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-[#2D8275]">Biome360 Health Check Report</h1>
        <p className="text-gray-600">Comprehensive Microbiome Assessment</p>
      </div>

      {/* Patient Info */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Patient Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Name:</strong> {patientInfo.patientName}
          </div>
          <div>
            <strong>Age:</strong> {patientInfo.age}
          </div>
          <div>
            <strong>Sex:</strong> {patientInfo.sex}
          </div>
          <div>
            <strong>Collection Date:</strong> {new Date(patientInfo.collectionDate).toLocaleDateString()}
          </div>
          <div className="col-span-2">
            <strong>Clinician:</strong> {patientInfo.clinicianName || "Not specified"}
          </div>
        </div>
      </div>

      {/* Lab Results */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Laboratory Results</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Test</th>
              <th className="border border-gray-300 p-2">Result</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2">Specimen Validity</td>
              <td className="border border-gray-300 p-2">
                {labInputs.specimenValidity === 1 ? "Valid" : "Invalid"}
              </td>
              <td className={`border border-gray-300 p-2 ${labInputs.specimenValidity === 1 ? "text-green-600" : "text-red-600"}`}>
                {labInputs.specimenValidity === 1 ? "✓ Pass" : "✗ Fail"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Bacterial Signal</td>
              <td className="border border-gray-300 p-2">
                {labInputs.bacterialSignal === 1 ? "Detected" : "Not Detected"}
              </td>
              <td className={`border border-gray-300 p-2 ${labInputs.bacterialSignal === 1 ? "text-yellow-600" : "text-green-600"}`}>
                {labInputs.bacterialSignal === 1 ? "⚠ Alert" : "✓ Normal"}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2">Yeast Signal</td>
              <td className="border border-gray-300 p-2">
                {labInputs.yeastSignal === 1 ? "Detected" : "Not Detected"}
              </td>
              <td className={`border border-gray-300 p-2 ${labInputs.yeastSignal === 1 ? "text-yellow-600" : "text-green-600"}`}>
                {labInputs.yeastSignal === 1 ? "⚠ Alert" : "✓ Normal"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Questionnaire Results */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Questionnaire Assessment</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Question</th>
              <th className="border border-gray-300 p-2">Score</th>
              <th className="border border-gray-300 p-2">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(questionnaires).map(([qKey, val]) => (
              <tr key={qKey}>
                <td className="border border-gray-300 p-2">
                  <strong>{qKey}:</strong> {questionLabels[qKey]}
                </td>
                <td className="border border-gray-300 p-2 text-center">{val}</td>
                <td className="border border-gray-300 p-2">{scoreLabels[val]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-300 rounded">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Summary</h3>
        <p>
          This report provides a comprehensive assessment of microbiome health based on 
          laboratory analysis and patient questionnaire responses. {advancedTest ? 
          "Advanced testing is available for further analysis." : 
          "Basic testing has been completed."}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Report generated on: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const questionLabels = {
  Q1: "Digestion & Bowel Rhythm",
  Q2: "Energy / Focus Dips",
  Q3: "Infections / Allergies",
  Q4: "Long Medication Use",
  Q5: "Sleep Regularity / Restfulness",
  Q6: "Diet Pattern",
};

const scoreLabels = {
  0: "Never", 
  1: "Rarely", 
  2: "Sometimes", 
  3: "Moderate", 
  4: "Often", 
  5: "Very Often",
};

export default PrintableReport;