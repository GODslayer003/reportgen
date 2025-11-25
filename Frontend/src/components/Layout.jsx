// Layout.jsx - FIXED VERSION
import React from "react";
import { Save, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Patient Details", sub: "Information", path: "/patient-info" },
  { id: 2, label: "Lab Inputs", sub: "Laboratory test results", path: "/lab-inputs" },
  { id: 3, label: "Questionnaires", sub: "Health assessment", path: "/questionnaires" },
  { id: 4, label: "Preview & Generate", sub: "Review and create report", path: "/preview" }
];

export default function Layout({ children, activeStep = 1 }) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER - Fixed at top */}
      <header className="fixed top-0 left-0 right-0 bg-[#4A9B94] px-8 py-5 flex justify-between items-center shadow-sm z-50">
        {/* Left section */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          <div className="flex items-center gap-2 text-white leading-tight">
          {/* SVG LOGO */}
          <img src="../photos/theprovencode.svg"
           alt="The Proven Code Logo"
    className="h-10 w-auto"
    />
        </div>


          {/* Title */}
          <div className="ml-2">
            <h1 className="text-white text-lg font-semibold leading-tight">
              Microbiome Report Generator
            </h1>
            <p className="text-white text-sm font-normal mt-0.5">
              Clinical Health Assessment Platform
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <button className="px-5 py-2 bg-white rounded-md flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition">
            <Save className="w-4 h-4" />
            Save Progress
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition">
            <Bell className="w-5 h-5 text-white" />
          </button>

          <button className="p-2 rounded-lg hover:bg-white/10 transition">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Container with sidebar and main content */}
      <div className="flex pt-[20px]">
        {/* SIDEBAR - Fixed positioning */}
        <aside className="fixed left-0 top-[84px] w-[310px] bg-white h-[calc(100vh-84px)] pt-6 px-6 border-r border-gray-200 overflow-y-auto">
          <div className="space-y-0">
            {steps.map(step => {
              const active = step.id === activeStep;

              return (
                <Link
                  key={step.id}
                  to={step.path}
                  className={`flex items-center gap-4 p-4 rounded-xl mb-1 transition
                             ${active ? "bg-[#D4F1EE] border-2 border-[#4A9B94]" : "hover:bg-gray-50 border-2 border-transparent"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0
                                ${active ? "bg-[#4A9B94] text-white" : "bg-gray-200 text-gray-700"}`}
                  >
                    {step.id}
                  </div>

                  <div>
                    <p
                      className={`text-base font-semibold leading-tight ${
                        active ? "text-[#4A9B94]" : "text-gray-900"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-tight">{step.sub}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT - Offset by sidebar width */}
        <main className="ml-[180px] flex-1 px-16 py-10 min-h-[calc(100vh-84px)]">
          {children}
        </main>
      </div>
    </div>
  );
}