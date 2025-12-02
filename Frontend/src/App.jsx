import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PatientInfo from "./forms/PatientInfo";
import LabInputs from "./forms/LabInputs";
import Questionnaires from "./forms/Questionnaires";
import Preview from "./forms/Preview";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

  const user = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Signup />} />
        <Route path="/Signup" element={<Signup />} />

        {/* LOGIN ROUTE — If logged in, go to patient-info */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/patient-info"
          element={
            <ProtectedRoute>
              <Layout activeStep={1}>
                <PatientInfo />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/lab-inputs"
          element={
            <ProtectedRoute>
              <Layout activeStep={2}>
                <LabInputs />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/questionnaires"
          element={
            <ProtectedRoute>
              <Layout activeStep={3}>
                <Questionnaires />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/preview"
          element={
            <ProtectedRoute>
              <Layout activeStep={4}>
                <Preview />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}