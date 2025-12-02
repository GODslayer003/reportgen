// reportSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Axios setup
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 30000,
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("API Request:", config.method?.toUpperCase(), config.url, config.data);
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
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message || "Failed to create report");
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
        timeout: 45000
      });

      // Check if response is actually a PDF
      const contentType = res.headers["content-type"];
      console.log("Response content type:", contentType);
      
      if (contentType && contentType.includes("application/json")) {
        // This is an error response, not a PDF
        const text = await res.data.text();
        let errorMessage = "Failed to generate PDF";
        
        try {
          const jsonError = JSON.parse(text);
          errorMessage = jsonError.message || jsonError.error || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        
        console.error("Server returned JSON error:", errorMessage);
        return thunkAPI.rejectWithValue(errorMessage);
      }
      
      if (!contentType || !contentType.includes("application/pdf")) {
        console.error("Unexpected content type:", contentType);
        return thunkAPI.rejectWithValue("Server returned unexpected response format");
      }
      
      // Create and trigger download
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `microbiome-report-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("PDF download completed successfully");
      return { success: true, reportId };
      
    } catch (err) {
      console.error("PDF download error:", err);
      
      let errorMessage = "Failed to download PDF";
      
      if (err.response?.data) {
        const blob = err.response.data;
        if (blob instanceof Blob && blob.type.includes("application/json")) {
          try {
            const text = await blob.text();
            const jsonError = JSON.parse(text);
            errorMessage = jsonError.message || jsonError.error || errorMessage;
          } catch {
            errorMessage = "Server error occurred";
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// FETCH ALL REPORTS
export const fetchReports = createAsyncThunk(
  "report/fetchReports",
  async (_, thunkAPI) => {
    try {
      console.log("Fetching all reports...");
      const res = await API.get("/reports");
      console.log("Reports fetched successfully:", res.data);
      return res.data.reports;
    } catch (err) {
      console.error("Fetch reports error:", err.response?.data || err.message);
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch reports");
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
    reports: [],
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
    resetReportState: (state) => {
      state.patientInfo = {};
      state.labInputs = {};
      state.questionnaires = {};
      state.createdReport = null;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createReport.pending, (state) => {
        console.log("Create report pending...");
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        console.log("Create report fulfilled:", action.payload);
        state.loading = false;
        state.createdReport = action.payload;
        state.error = null;
      })
      .addCase(createReport.rejected, (state, action) => {
        console.error("Create report rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(downloadPDF.pending, (state) => {
        console.log("Download PDF pending...");
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadPDF.fulfilled, (state, action) => {
        console.log("Download PDF fulfilled:", action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(downloadPDF.rejected, (state, action) => {
        console.error("Download PDF rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchReports.pending, (state) => {
        console.log("Fetch reports pending...");
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        console.log("Fetch reports fulfilled:", action.payload);
        state.loading = false;
        state.reports = action.payload;
        state.error = null;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        console.error("Fetch reports rejected:", action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setPatientInfo,
  setLabInputs,
  setQuestionnaires,
  resetReportState,
  clearError,
} = reportSlice.actions;

export default reportSlice.reducer;