// src/forms/Questionnaires.jsx
import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

// ⭐ Redux
import { useDispatch } from "react-redux";
import { setQuestionnaires } from "../features/report/reportSlice";

export default function Questionnaires() {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch(); // ← Redux dispatcher

  const patientInfo = useSelector((state) => state.report.patientInfo);
  const labInputs = useSelector((state) => state.report.labInputs);

  const [answers, setAnswers] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
  });

  const marks = {
    0: "Never",
    1: "Rarely",
    2: "Sometimes",
    3: "Moderate",
    4: "Often",
    5: "Very Often",
  };

  const handleChange = (key, val) => {
    setAnswers({ ...answers, [key]: Number(val) });
  };

  // In Questionnaires.jsx - Update the handleNext function
const handleNext = () => {
  // Transform to match backend Q1-Q6 structure
  const transformedAnswers = {
    Q1: answers.q1,
    Q2: answers.q2,
    Q3: answers.q3,
    Q4: answers.q4,
    Q5: answers.q5,
    Q6: answers.q6
  };

  dispatch(setQuestionnaires(transformedAnswers));
  
  navigate("/preview", {
    state: {
      patientInfo,
      labInputs,
      questionnaires: transformedAnswers,
    },
  });
};

  const handlePrevious = () => {
    navigate("/lab-inputs", {
      state: { patientInfo, labInputs },
    });
  };

  return (
    <Layout activeStep={3}>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 max-w-[950px]">

        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            QUESTIONNAIRES (Q1–Q6)
          </h2>
          <p className="text-gray-500 text-base">
            Each response must be on a scale of 0–5.
          </p>
        </div>

        {/* QUESTIONS */}
        <div className="space-y-12">
          {[
            {
              id: "q1",
              title: "Q1 - Digestion & Bowel Rhythm",
              desc:
                "How often do you experience digestion issues such as bloating, discomfort, or irregular bowel movements?",
            },
            {
              id: "q2",
              title: "Q2 - Energy / Focus Dips",
              desc:
                "How often do you feel low energy, fatigue, or difficulty focusing during the day?",
            },
            {
              id: "q3",
              title: "Q3 - Infections / Allergies",
              desc:
                "How frequently do you experience infections, allergies, or immune-related symptoms?",
            },
            {
              id: "q4",
              title: "Q4 - Long Medication Use",
              desc:
                "How often do you take long-term or repeated medication courses (such as antibiotics, antacids, painkillers, steroids, or psychiatric medication)?",
            },
            {
              id: "q5",
              title: "Q5 - Sleep Regularity / Restfulness",
              desc:
                "How often do you struggle with poor sleep quality or irregular sleep timing?",
            },
            {
              id: "q6",
              title: "Q6 - Diet Pattern",
              desc:
                "How frequently do you eat packaged, restaurant, or outside food instead of home-cooked meals?",
            },
          ].map((q) => (
            <div key={q.id} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{q.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{q.desc}</p>
              </div>

              {/* SLIDER */}
              <div className="w-full">

                <div className="relative w-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={answers[q.id]}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="
                      w-full h-2 rounded-full appearance-none cursor-pointer
                      bg-gray-200 focus:outline-none
                    "
                    style={{
                      background: `linear-gradient(to right, #4A9B94 ${
                        (answers[q.id] / 5) * 100
                      }%, #E5E7EB ${(answers[q.id] / 5) * 100}%)`,
                    }}
                  />

                  <style>
                    {`
                      input[type="range"] {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 100%;
                        height: 8px;
                        border-radius: 9999px;
                        background: transparent;
                        cursor: pointer;
                      }

                      input[type="range"]::-webkit-slider-runnable-track {
                        height: 8px;
                        border-radius: 9999px;
                        background: transparent;
                      }

                      input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 9999px;
                        background: white;
                        border: 4px solid #4A9B94;
                        margin-top: -8px;
                      }

                      input[type="range"]::-moz-range-thumb {
                        height: 28px;
                        width: 28px;
                        border-radius: 9999px;
                        background: white;
                        border: 4px solid #4A9B94;
                      }

                      input[type="range"]::-moz-range-track {
                        height: 8px;
                        border-radius: 9999px;
                        background: transparent;
                      }
                    `}
                  </style>
                </div>

                {/* LABELS */}
                <div className="flex justify-between items-center text-gray-600 text-sm mt-2 w-full">
                  <span className="w-1/3 text-left">0 = Never</span>

                  <span className="w-1/3 text-center font-semibold text-gray-800">
                    {answers[q.id]} ({marks[answers[q.id]]})
                  </span>

                  <span className="w-1/3 text-right">5 = Very Often</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handlePrevious}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg 
                      border border-gray-300 hover:bg-gray-50 transition shadow-sm"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-12 py-3 bg-[#4A9B94] text-white rounded-lg text-base 
                      font-medium hover:bg-[#3d8580] transition shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}