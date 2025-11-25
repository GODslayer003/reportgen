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
    collectionDate: { type: Date, default: Date.now },
    clinician: { type: String, default: 'Not specified' }
  },
  labInputs: {
    B: { type: Number, enum: [0, 1], required: true },
    Y: { type: Number, enum: [0, 1], required: true },
    V: { type: Number, enum: [0, 1], required: true }
  },
  questionnaire: {
    Q1: { type: Number, min: 0, max: 5, default: 0 },
    Q2: { type: Number, min: 0, max: 5, default: 0 },
    Q3: { type: Number, min: 0, max: 5, default: 0 },
    Q4: { type: Number, min: 0, max: 5, default: 0 },
    Q5: { type: Number, min: 0, max: 5, default: 0 },
    Q6: { type: Number, min: 0, max: 5, default: 0 }
  },
  calculatedData: {
    scores: {
      FS1: { type: Number, default: 0 },
      FS2: { type: Number, default: 0 },
      FS3: { type: Number, default: 0 },
      FS4: { type: Number, default: 0 },
      FS5: { type: Number, default: 0 },
      FS6: { type: Number, default: 0 },
      FS7: { type: Number, default: 0 },
      FS8: { type: Number, default: 0 },
      FS9: { type: Number, default: 0 },
      FS10: { type: Number, default: 0 }
    },
    statuses: {
      FS1: { type: String, default: 'Within' },
      FS2: { type: String, default: 'Within' },
      FS3: { type: String, default: 'Within' },
      FS4: { type: String, default: 'Within' },
      FS5: { type: String, default: 'Within' },
      FS6: { type: String, default: 'Within' },
      FS7: { type: String, default: 'Within' },
      FS8: { type: String, default: 'Within' },
      FS9: { type: String, default: 'Within' },
      FS10: { type: String, default: 'Within' }
    },
    overallStatus: {
      type: String,
      enum: ['Balanced', 'Mild Imbalance', 'Moderate Dysbiosis', 'Significant Dysbiosis'],
      default: 'Balanced'
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

// Add pre-save middleware to ensure all fields are populated
reportSchema.pre('save', function(next) {
  // Ensure all FS scores have values
  for (let i = 1; i <= 10; i++) {
    const fsKey = `FS${i}`;
    if (!this.calculatedData.scores[fsKey] || isNaN(this.calculatedData.scores[fsKey])) {
      this.calculatedData.scores[fsKey] = 0;
    }
    if (!this.calculatedData.statuses[fsKey]) {
      this.calculatedData.statuses[fsKey] = 'Within';
    }
  }
  
  next();
});

export default mongoose.model('Report', reportSchema);