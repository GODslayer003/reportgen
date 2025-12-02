// PatientInfo.jsx - RESPONSIVE FIX
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPatientInfo } from "../features/report/reportSlice";
import Layout from "../components/Layout";

export default function PatientInfo() {
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    sex: "",
    collectionDate: "",
    clinicianName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNext = () => {
    dispatch(setPatientInfo(formData));
    navigate("/lab-inputs");
  };

  return (
    <Layout activeStep={1}>
      {/* CONTAINER - Responsive */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 max-w-4xl mx-auto">
        {/* HEADER - Responsive */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">PATIENT DETAILS</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Enter patient details for the microbiome health report
          </p>
        </div>

        {/* FORM - Responsive */}
        <div className="space-y-6 sm:space-y-8">
          {/* Patient Name */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-1.5">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Enter the patient's full name:</p>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 focus:ring-2 focus:ring-[#4A9B94] text-sm sm:text-base"
            />
          </div>

          {/* AGE */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-1.5">
              Age <span className="text-red-500">*</span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Enter the patient's age:</p>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 focus:ring-2 focus:ring-[#4A9B94] text-sm sm:text-base"
            />
          </div>

          {/* SEX - Responsive */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">
              Sex <span className="text-red-500">*</span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mb-3">Select the patient's sex:</p>
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8">
              {["Male", "Female", "Other"].map((option) => (
                <label key={option} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="sex"
                      value={option}
                      checked={formData.sex === option}
                      onChange={handleChange}
                      className="w-5 h-5 sm:w-6 sm:h-6 appearance-none border-2 border-gray-400 rounded-full checked:bg-[#4A9B94] checked:border-[#4A9B94] cursor-pointer transition"
                    />
                    {formData.sex === option && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-800 text-sm sm:text-base whitespace-nowrap">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Collection Date */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-1.5">
              Sample Collection Date <span className="text-red-500">*</span>
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Enter the sample collection date:</p>
            <input
              type="date"
              name="collectionDate"
              value={formData.collectionDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 focus:ring-2 focus:ring-[#4A9B94] text-sm sm:text-base"
            />
          </div>

          {/* Clinician Name */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-900 mb-1.5">
              Clinician / Partner Name (Optional)
            </label>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">
              Enter clinician or partner name (optional):
            </p>
            <input
              type="text"
              name="clinicianName"
              value={formData.clinicianName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 focus:ring-2 focus:ring-[#4A9B94] text-sm sm:text-base"
            />
          </div>
        </div>

        {/* BUTTON - Responsive */}
        <div className="flex justify-end mt-8 sm:mt-10 md:mt-12">
          <button
            onClick={handleNext}
            className="px-8 sm:px-10 md:px-12 py-2.5 sm:py-3 bg-[#4A9B94] text-white rounded-lg text-sm sm:text-base font-medium hover:bg-[#3d8580] transition-colors w-full sm:w-auto"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
}