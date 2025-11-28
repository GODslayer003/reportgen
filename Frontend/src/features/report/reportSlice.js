import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Axios setup
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", config.method.toUpperCase(), config.url, config.data);
  return config;
});

API.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// CREATE REPORT
export const createReport = createAsyncThunk(
  "report/createReport",
  async (payload, thunkAPI) => {
    try {
      console.log("Creating report with payload:", payload);
      const res = await API.post("/reports", payload);
      console.log("Report created successfully:", res.data);
      return res.data.report;
    } catch (err) {
      console.error("Create report error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const downloadPDF = createAsyncThunk(
  "report/downloadPDF",
  async (reportId, thunkAPI) => {
    try {
      console.log("Downloading PDF for report:", reportId);

      const res = await API.get(`/reports/${reportId}/pdf`, {
        responseType: "blob",
      });

      console.log("Browser received blob:", res.data);

      // Convert blob → arrayBuffer
      const arrayBuffer = await res.data.arrayBuffer();

      // Debug first 20 bytes
      const view = new Uint8Array(arrayBuffer.slice(0, 20));
      console.log("CLIENT FIRST 20 BYTES:", view);

      // Debug size
      console.log("CLIENT PDF SIZE:", arrayBuffer.byteLength);

      // Save
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        a.remove();
      }, 2000);

      return { success: true };
    } catch (err) {
      console.error("PDF download error:", err);
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);



const reportSlice = createSlice({
  name: "report",
  initialState: {
    patientInfo: {},
    labInputs: {},
    questionnaires: {},
    createdReport: null,
    loading: false,
    error: null,
  },

  reducers: {
    setPatientInfo: (state, action) => {
      console.log("Setting patient info:", action.payload);
      state.patientInfo = action.payload;
    },
    setLabInputs: (state, action) => {
      console.log("Setting lab inputs:", action.payload);
      state.labInputs = action.payload;
    },
    setQuestionnaires: (state, action) => {
      console.log("Setting questionnaires:", action.payload);
      state.questionnaires = action.payload;
    },
    resetReportState: () => ({
      patientInfo: {},
      labInputs: {},
      questionnaires: {},
      createdReport: null,
      loading: false,
      error: null,
    }),
  },

  extraReducers: (builder) => {
    builder.addCase(createReport.pending, (state) => {
      console.log("Create report pending...");
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createReport.fulfilled, (state, action) => {
      console.log("Create report fulfilled:", action.payload);
      state.loading = false;
      state.createdReport = action.payload;
    });
    builder.addCase(createReport.rejected, (state, action) => {
      console.error("Create report rejected:", action.payload);
      state.loading = false;
      state.error = action.payload;
    });

    builder.addCase(downloadPDF.fulfilled, (state, action) => {
  const blob = new Blob([action.payload], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.createdReport?._id || "Report"}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);

    });
  },
});

export const {
  setPatientInfo,
  setLabInputs,
  setQuestionnaires,
  resetReportState,
} = reportSlice.actions;

export default reportSlice.reducer;