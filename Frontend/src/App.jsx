import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PatientInfo from "./forms/PatientInfo";
import LabInputs from "./forms/LabInputs";
import Questionnaires from "./forms/Questionnaires";
import Preview from "./forms/Preview";
import Layout from "./components/Layout";

export default function App() {
  const user = localStorage.getItem("token");

  const protect = (page) =>
    user ? page : <Navigate to="/login" />;

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Signup />} />

        <Route
          path="/login"
          element={user ? <Login /> : <Navigate to="/patient-info" />}
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/patient-info"
          element={
            <Layout activeStep={1}>
              {protect(<PatientInfo />)}
            </Layout>
          }
        />

        <Route
          path="/lab-inputs"
          element={
            <Layout activeStep={2}>
              {protect(<LabInputs />)}
            </Layout>
          }
        />

        <Route
          path="/questionnaires"
          element={
            <Layout activeStep={3}>
              {protect(<Questionnaires />)}
            </Layout>
          }
        />

        <Route
          path="/preview"
          element={
            <Layout activeStep={4}>
              {protect(<Preview />)}
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}