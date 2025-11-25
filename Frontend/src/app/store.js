// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice"; // if you have it
import reportReducer from "../features/report/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,   // optional — keep if you have auth slice
    report: reportReducer
  },
});