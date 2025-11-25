// LabInputs.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import { setLabInputs } from "../features/report/reportSlice";

export default function LabInputs() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ⭐ Get patientInfo from Redux store
  const patientInfo = useSelector((state) => state.report.patientInfo);

  const [formData, setFormData] = useState({
    specimenValidity: "",
    bacterialSignal: "",
    yeastSignal: "",
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
  const converted = {
    specimenValidity: formData.specimenValidity === "Valid" ? 1 : 0,
    bacterialSignal: formData.bacterialSignal === "Detected" ? 1 : 0,
    yeastSignal: formData.yeastSignal === "Detected" ? 1 : 0,
  };

  dispatch(setLabInputs(converted));
  navigate("/questionnaires");
};


  const handlePrevious = () => {
    navigate("/patient-info");
  };

  return (
    <Layout activeStep={2}>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 max-w-[950px] mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">LAB INPUTS</h2>
          <p className="text-gray-500 text-base mt-1">Enter laboratory test results</p>
        </div>

        {/* FORM */}
        <div className="space-y-12">

          {/* Specimen Validity */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1.5">
              Specimen Validity <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">Was the specimen valid?</p>

            <div className="flex items-center gap-10">
              {["Valid", "Invalid"].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="specimenValidity"
                      value={option}
                      checked={formData.specimenValidity === option}
                      onChange={() => handleChange("specimenValidity", option)}
                      className="w-5 h-5 appearance-none border-2 border-gray-400 rounded-full
                        checked:bg-[#4A9B94] checked:border-[#4A9B94] cursor-pointer transition"
                    />
                    {formData.specimenValidity === option && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-800 text-base">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bacterial Signal */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1.5">
              Bacterial Signal <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">Was bacterial activity detected?</p>

            <div className="flex items-center gap-10">
              {["Detected", "Not Detected"].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="bacterialSignal"
                      value={option}
                      checked={formData.bacterialSignal === option}
                      onChange={() => handleChange("bacterialSignal", option)}
                      className="w-5 h-5 appearance-none border-2 border-gray-400 rounded-full
                        checked:bg-[#4A9B94] checked:border-[#4A9B94] cursor-pointer transition"
                    />
                    {formData.bacterialSignal === option && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-800 text-base">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Yeast Signal */}
          <div>
            <label className="block text-base font-medium text-gray-900 mb-1.5">
              Yeast Signal <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-3">Was yeast detected?</p>

            <div className="flex items-center gap-10">
              {["Detected", "Not Detected"].map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="yeastSignal"
                      value={option}
                      checked={formData.yeastSignal === option}
                      onChange={() => handleChange("yeastSignal", option)}
                      className="w-5 h-5 appearance-none border-2 border-gray-400 rounded-full
                        checked:bg-[#4A9B94] checked:border-[#4A9B94] cursor-pointer transition"
                    />
                    {formData.yeastSignal === option && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-800 text-base">{option}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-14">
          <button
            onClick={handlePrevious}
            className="px-8 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            className="px-12 py-3 bg-[#4A9B94] text-white rounded-lg text-base font-medium hover:bg-[#3d8580] transition shadow-sm"
          >
            Next
          </button>
        </div>

      </div>
    </Layout>
  );
}