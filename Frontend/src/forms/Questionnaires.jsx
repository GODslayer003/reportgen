// Questionnaires.jsx - RESPONSIVE FIX
import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setQuestionnaires } from "../features/report/reportSlice";

export default function Questionnaires() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const patientInfo = useSelector((state) => state.report.patientInfo);
  const labInputs = useSelector((state) => state.report.labInputs);
  
  const [answers, setAnswers] = useState({
    q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, q6: 0,
  });

  const marks = {
    0: "Never", 1: "Rarely", 2: "Sometimes", 3: "Moderate", 4: "Often", 5: "Very Often",
  };

  const handleChange = (key, val) => {
    setAnswers({ ...answers, [key]: Number(val) });
  };

  const handleNext = () => {
    const transformedAnswers = {
      Q1: answers.q1, Q2: answers.q2, Q3: answers.q3, 
      Q4: answers.q4, Q5: answers.q5, Q6: answers.q6
    };
    dispatch(setQuestionnaires(transformedAnswers));
    navigate("/preview", {
      state: { patientInfo, labInputs, questionnaires: transformedAnswers },
    });
  };

  const handlePrevious = () => {
    navigate("/lab-inputs", { state: { patientInfo, labInputs } });
  };

  return (
    <Layout activeStep={3}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
        {/* HEADER - Responsive */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            QUESTIONNAIRES (Q1–Q6)
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Each response must be on a scale of 0–5.
          </p>
        </div>

        {/* QUESTIONS - Responsive */}
        <div className="space-y-8 sm:space-y-10 md:space-y-12">
          {[
            { id: "q1", title: "Q1 - Digestion & Bowel Rhythm", desc: "How often do you experience digestion issues such as bloating, discomfort, or irregular bowel movements?" },
            { id: "q2", title: "Q2 - Energy / Focus Dips", desc: "How often do you feel low energy, fatigue, or difficulty focusing during the day?" },
            { id: "q3", title: "Q3 - Infections / Allergies", desc: "How frequently do you experience infections, allergies, or immune-related symptoms?" },
            { id: "q4", title: "Q4 - Long Medication Use", desc: "How often do you take long-term or repeated medication courses (such as antibiotics, antacids, painkillers, steroids, or psychiatric medication)?" },
            { id: "q5", title: "Q5 - Sleep Regularity / Restfulness", desc: "How often do you struggle with poor sleep quality or irregular sleep timing?" },
            { id: "q6", title: "Q6 - Diet Pattern", desc: "How frequently do you eat packaged, restaurant, or outside food instead of home-cooked meals?" },
          ].map((q) => (
            <div key={q.id} className="space-y-3 sm:space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{q.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">{q.desc}</p>
              </div>
              
              {/* SLIDER - Responsive */}
              <div className="w-full">
                <div className="relative w-full flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={answers[q.id]}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #4A9B94 ${(answers[q.id] / 5) * 100}%, #E5E7EB ${(answers[q.id] / 5) * 100}%)`,
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
                        height: 18px;
                        width: 18px;
                        border-radius: 9999px;
                        background: white;
                        border: 3px solid #4A9B94;
                        margin-top: -5px;
                      }
                      input[type="range"]::-moz-range-thumb {
                        height: 20px;
                        width: 20px;
                        border-radius: 9999px;
                        background: white;
                        border: 3px solid #4A9B94;
                      }
                      input[type="range"]::-moz-range-track {
                        height: 8px;
                        border-radius: 9999px;
                        background: transparent;
                      }
                    `}
                  </style>
                </div>
                
                {/* LABELS - Responsive */}
                <div className="flex justify-between items-center text-gray-600 text-xs sm:text-sm mt-2 w-full">
                  <span className="w-1/3 text-left truncate pr-1">0 = Never</span>
                  <span className="w-1/3 text-center font-semibold text-gray-800 whitespace-nowrap px-2">
                    {answers[q.id]} ({marks[answers[q.id]]})
                  </span>
                  <span className="w-1/3 text-right truncate pl-1">5 = Very Often</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BUTTONS - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mt-8 sm:mt-10 md:mt-12">
          <button
            onClick={handlePrevious}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition shadow-sm text-sm sm:text-base order-2 sm:order-1"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 sm:px-6 md:px-8 lg:px-12 py-2.5 sm:py-3 bg-[#4A9B94] text-white rounded-lg text-sm sm:text-base font-medium hover:bg-[#3d8580] transition shadow-sm order-1 sm:order-2"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}