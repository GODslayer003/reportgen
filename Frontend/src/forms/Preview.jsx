// src/forms/Preview.jsx
import { React, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setQuestionnaires, createReport } from "../features/report/reportSlice";

export default function Preview() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [advancedTest, setAdvancedTest] = useState(true);

  const patientInfo = useSelector((state) => state.report.patientInfo);
const labInputs = useSelector((state) => state.report.labInputs);
const questionnaires = useSelector((state) => state.report.questionnaires);

  if (!patientInfo || !labInputs || !questionnaires) {
    return (
      <Layout activeStep={4}>
        <div className="p-10 text-center text-gray-600">
          Missing information. Please complete previous steps.
        </div>
      </Layout>
    );
  }

  /* -------------------------------------------------- */
  /* API CALL → CREATE REPORT                           */
  /* -------------------------------------------------- */
  const handleGeneratePDF = async () => {
    try {
      // Save questionnaires to Redux (same as previous pages)
      dispatch(setQuestionnaires(questionnaires));

      // Prepare data EXACTLY LIKE BACKEND REQUIRES
      const payload = {
        patient: {
          name: patientInfo.patientName,
          age: Number(patientInfo.age),
          sex: patientInfo.sex,
          collectionDate: patientInfo.collectionDate,
          clinician: patientInfo.clinicianName || "",
        },

       labInputs: {
  B: Number(labInputs.bacterialSignal),
  Y: Number(labInputs.yeastSignal),
  V: Number(labInputs.specimenValidity)
}
,

        questionnaire: {
          Q1: questionnaires.q1,
          Q2: questionnaires.q2,
          Q3: questionnaires.q3,
          Q4: questionnaires.q4,
          Q5: questionnaires.q5,
          Q6: questionnaires.q6,
        },
      };

      // CALL BACKEND
      const result = await dispatch(createReport(payload)).unwrap();

      alert("Report Created Successfully!\nPDF available on next screen.");

      // Optional: Navigate to reports list or stay here
      // navigate("/reports");

    } catch (err) {
      console.log("PDF GENERATION ERROR:", err);
      alert("Failed to generate report. Check console.");
    }
  };

  return (
    <Layout activeStep={4}>
      <div className="max-w-[1100px] mx-auto py-10">

        {/* ---- TOP SECTION 1: Availability of Advanced Test ---- */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-6 mb-8 cursor-pointer"
          onClick={() => setAdvancedTest(!advancedTest)}
        >
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div
              className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all
              ${advancedTest ? "bg-[#2D8275]" : "bg-white border border-gray-400"}`}
            >
              {advancedTest && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="white"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
            </div>

            <div>
              <p className="font-semibold text-gray-900">Availability of Advanced Test</p>
              <p className="text-gray-500 text-sm">
                {advancedTest ? "You are available for Test." : "There is no need for Tests"}
              </p>
            </div>
          </div>
        </div>

        {/* ---- HEADER BLOCK ---- */}
        <div className="border border-[#2D8275] bg-white rounded-xl p-8 mb-10 relative">

          <div className="absolute right-6 top-6 text-[#2D8275]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              className="w-10 h-10"
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19.5 14.25v-6a2.25 2.25 0 0 0-2.25-2.25h-6M15 19.5h-6A2.25 2.25 0 0 1 6.75 17.25V7.5m0 0L12 2.25l5.25 5.25M8.25 12h7.5"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Report Preview</h2>
          <p className="text-gray-500 text-sm mb-8">
            Review all entered information before generating the report
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleGeneratePDF}
              className="flex-1 py-3 bg-[#2D8275] text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={2} stroke="white"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 3v12m0 0 3-3m-3 3-3-3m9 3v4.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5V15"
                />
              </svg>
              Generate PDF Report
            </button>

            <button className="px-6 py-3 border border-[#2D8275] text-[#2D8275] rounded-lg font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 9V2h12v7M6 18h12v4H6v-4ZM4 9h16v6H4V9Z"
                />
              </svg>
              Print Report
            </button>
          </div>
        </div>

        {/* ---- MAIN WHITE WRAPPER ---- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10">

          {/* PATIENT DETAILS */}
          <SectionCard title="Patient Details">
            <div className="grid grid-cols-2 gap-y-6">
              <Field label="Patient Name" value={patientInfo.patientName} />
              <Field label="Age" value={patientInfo.age} />
              <Field label="Sex" value={patientInfo.sex} />
              <Field
                label="Collection Date"
                value={new Date(patientInfo.collectionDate).toLocaleDateString()}
              />
              <Field
                label="Clinician Name"
                value={patientInfo.clinicianName || "-"}
                full
              />
            </div>
          </SectionCard>

          {/* LAB INPUTS */}
          <SectionCard title="Lab Inputs">
            <div className="grid grid-cols-3 gap-y-6">
             <Field 
  label="Specimen Validity" 
  value={labInputs.specimenValidity === 1 ? "Valid" : "Invalid"} 
/>

<Field 
  label="Bacterial Signal" 
  value={labInputs.bacterialSignal === 1 ? "Detected" : "Not Detected"} 
/>

<Field 
  label="Yeast Signal" 
  value={labInputs.yeastSignal === 1 ? "Detected" : "Not Detected"} 
/>

            </div>
          </SectionCard>

          {/* QUESTIONNAIRE */}
          <SectionCard title="Questionnaire Scores">
            <div className="space-y-4 mt-2">
              {Object.entries(questionnaires).map(([qKey, val], i) => (
                <div className="flex justify-between items-center" key={i}>
                  <p className="text-gray-800 font-medium">
                    Q{i + 1} — {questionLabels[i]}
                  </p>

                  <span className="px-3 py-1 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium">
                    {val} — {scoreLabels[val]}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* PREVIOUS BUTTON */}
          <div className="flex justify-between mt-12">
            <button
              onClick={() =>
                navigate("/questionnaires", {
                  state: { patientInfo, labInputs },
                })
              }
              className="px-8 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Previous
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* --------------------------------------------- */
/* REUSABLE COMPONENTS                           */
/* --------------------------------------------- */
function SectionCard({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e0f7f3] text-[#297E74] border border-[#c4ebe5]">
          Complete
        </span>
      </div>

      {children}
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={`${full ? "col-span-2" : ""}`}>
      <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  );
}

const questionLabels = [
  "Digestion & Bowel Rhythm",
  "Energy / Focus Dips",
  "Infections / Allergies",
  "Long Medication Use",
  "Sleep Regularity / Restfulness",
  "Diet Pattern",
];

const scoreLabels = {
  0: "Never",
  1: "Rarely",
  2: "Sometimes",
  3: "Moderate",
  4: "Often",
  5: "Very Often",
};