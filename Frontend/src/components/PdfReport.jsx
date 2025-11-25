// src/components/PdfReport.jsx
import React from "react";

export default function PdfReport({ patient, labInputs, questionnaires }) {
  const qList = [
    { id: 1, label: "Digestion & Bowel Rhythm" },
    { id: 2, label: "Energy / Focus Dips" },
    { id: 3, label: "Infections / Allergies" },
    { id: 4, label: "Long Medication Use" },
    { id: 5, label: "Sleep Regularity" },
    { id: 6, label: "Diet Pattern" }
  ];

  const scoreLabels = {
    0: "Never",
    1: "Rarely",
    2: "Sometimes",
    3: "Moderate",
    4: "Often",
    5: "Very Often"
  };

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className="text-sm text-slate-800">

      {/* HEADER */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4A9B94] rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">Microbiome Report Generator</h1>
            <p className="text-xs text-gray-500 -mt-0.5">
              Clinical Health Assessment Platform
            </p>
          </div>
        </div>
      </div>

      {/* PATIENT DETAILS CARD */}
      <section className="bg-white rounded-lg outline outline-1 outline-slate-200 p-4 mb-6">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-bold text-black">Patient Details</h3>
          <span className="px-2 py-1 bg-sky-100 text-[#4A9B94] text-[10px] font-semibold rounded">
            Complete
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Info label="Patient Name" value={patient.patientName} />
          <Info label="Age" value={patient.age} />
          <Info label="Sex" value={patient.sex} />
          <Info label="Collection Date" value={formatDate(patient.collectionDate)} />

          <Info
            label="Clinician Name"
            value={patient.clinicianName || "-"}
            full
          />
        </div>
      </section>

      {/* LAB INPUTS */}
      <section className="bg-white rounded-lg outline outline-1 outline-slate-200 p-4 mb-6">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-bold text-black">Lab Inputs</h3>
          <span className="px-2 py-1 bg-sky-100 text-[#4A9B94] text-[10px] font-semibold rounded">
            Complete
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Info label="Specimen Validity" value={labInputs.specimenValidity} />
          <Info label="Bacterial Signal" value={labInputs.bacterialSignal} />
          <Info label="Yeast Signal" value={labInputs.yeastSignal} />
        </div>
      </section>

      {/* QUESTIONNAIRE SCORES */}
      <section className="bg-white rounded-lg outline outline-1 outline-slate-200 p-4">
        <div className="flex justify-between">
          <h3 className="text-base font-bold text-black">Questionnaire Scores</h3>
          <span className="px-2 py-1 bg-sky-100 text-[#4A9B94] text-[10px] font-semibold rounded">
            Complete
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {qList.map((q) => {
            const key = "q" + q.id;   // FIX: ensures q1, q2...
            const val = questionnaires[key] ?? 0;

            return (
              <div key={q.id} className="flex justify-between items-center">
                <span className="text-xs font-medium text-black">
                  Q{q.id} — {q.label}
                </span>

                <div className="h-6 px-2 rounded border border-slate-200 flex items-center">
                  <span className="text-xs font-medium text-black">
                    {val} — {scoreLabels[val]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* Small component for clean UI */
function Info({ label, value, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-xs font-medium text-black">{label}</div>
      <div className="text-sm text-gray-600">{value}</div>
    </div>
  );
}