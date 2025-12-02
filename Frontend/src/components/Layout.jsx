// Layout.jsx - WITH SWEETALERT LOGOUT
import React from "react";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { id: 1, label: "Patient Details", sub: "Information", path: "/patient-info" },
  { id: 2, label: "Lab Inputs", sub: "Laboratory test results", path: "/lab-inputs" },
  { id: 3, label: "Questionnaires", sub: "Health assessment", path: "/questionnaires" },
  { id: 4, label: "Preview & Generate", sub: "Review and create report", path: "/preview" }
];

export default function Layout({ children, activeStep = 1 }) {
  
  // Logout function with SweetAlert
  const handleLogout = () => {
    // Dynamic import for SweetAlert (no need to import at top)
    import('sweetalert2').then((Swal) => {
      Swal.default.fire({
        title: 'Are you sure?',
        text: "You will be logged out from the system!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, logout!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Remove token from localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Show success message before redirect
          Swal.default.fire({
            title: 'Logged out!',
            text: 'You have been successfully logged out.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            // Redirect to login page
            window.location.href = "/login";
          });
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-[#4A9B94] px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex justify-between items-center shadow-sm z-50">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
          {/* Logo */}
          <img 
            src="../photos/provenc.svg" 
            alt="The Proven Code Logo" 
            className="h-7 sm:h-8 md:h-9 lg:h-10 w-auto" 
          />
          {/* Title */}
          <div className="ml-1 sm:ml-2">
            <h1 className="text-white text-sm sm:text-base md:text-lg font-semibold leading-tight whitespace-nowrap">
              Microbiome Report Generator
            </h1>
            <p className="text-white text-xs sm:text-sm font-normal mt-0.5 hidden sm:block">
              Clinical Health Assessment Platform
            </p>
          </div>
        </div>

        {/* Right section - LOGOUT BUTTON */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button 
            onClick={handleLogout}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition group"
            title="Logout"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-red-200 transition-colors" />
          </button>
        </div>
      </header>

      {/* Container with sidebar and main content */}
      <div className="flex pt-7 sm:pt-2 md:pt-8">
        {/* SIDEBAR */}
        <aside className="hidden lg:block fixed left-0 top-16 sm:top-20 md:top-24 w-64 xl:w-72 bg-white h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] pt-4 sm:pt-6 px-3 sm:px-4 xl:px-6 border-r border-gray-200 overflow-y-auto">
          <div className="space-y-1">
            {steps.map(step => {
              const active = step.id === activeStep;
              return (
                <Link
                  key={step.id}
                  to={step.path}
                  className={`flex items-center gap-3 xl:gap-4 p-3 xl:p-4 rounded-xl mb-1 transition ${
                    active 
                      ? "bg-[#D4F1EE] border-2 border-[#4A9B94]" 
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 xl:w-9 xl:h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    active ? "bg-[#4A9B94] text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                    {step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight truncate ${
                      active ? "text-[#4A9B94]" : "text-gray-900"
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight truncate">
                      {step.sub}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="w-full lg:ml-24 xl:ml-42 flex-1 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}