//..models/Report.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patient: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    collectionDate: { type: Date, required: true },
    clinician: { type: String }
  },
  labInputs: {
    B: { type: Number, enum: [0, 1], required: true },
    Y: { type: Number, enum: [0, 1], required: true },
    V: { type: Number, enum: [0, 1], required: true }
  },
  questionnaire: {
    Q1: { type: Number, min: 0, max: 5, required: true },
    Q2: { type: Number, min: 0, max: 5, required: true },
    Q3: { type: Number, min: 0, max: 5, required: true },
    Q4: { type: Number, min: 0, max: 5, required: true },
    Q5: { type: Number, min: 0, max: 5, required: true },
    Q6: { type: Number, min: 0, max: 5, required: true }
  },
  calculatedData: {
    scores: {
      FS1: Number,
      FS2: Number,
      FS3: Number,
      FS4: Number,
      FS5: Number,
      FS6: Number,
      FS7: Number,
      FS8: Number,
      FS9: Number,
      FS10: Number
    },
    statuses: {
      FS1: String,
      FS2: String,
      FS3: String,
      FS4: String,
      FS5: String,
      FS6: String,
      FS7: String,
      FS8: String,
      FS9: String,
      FS10: String
    },
    overallStatus: {
      type: String,
      enum: ['Balanced', 'Mild Imbalance', 'Moderate Dysbiosis', 'Significant Dysbiosis']
    },
    recommendation: String,
    lifestyle: String
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: {
    type: String,
    default: '7.0'
  }
}, {
  timestamps: true
});

export default mongoose.model('Report', reportSchema);