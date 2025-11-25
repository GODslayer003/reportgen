import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import reportReducer from "../features/report/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    report: reportReducer,
  },
});

