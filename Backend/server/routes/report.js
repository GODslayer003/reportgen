//report.js
import express from 'express';
import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';
import { authenticate } from '../middleware/auth.js';
import { generateCompleteReport } from '../utils/calculations.js';
import { generatePDF } from '../utils/pdfGenerator.js';

const router = express.Router();

// Create new report
router.post('/', authenticate, [
  body('patient.name').trim().notEmpty().withMessage('Patient name is required'),
  body('patient.age').isInt({ min: 1, max: 120 }).withMessage('Valid age is required'),
  body('patient.sex').isIn(['Male', 'Female', 'Other']).withMessage('Valid sex is required'),
  body('labInputs.B').isIn([0, 1]).withMessage('Bacterial signal must be 0 or 1'),
  body('labInputs.Y').isIn([0, 1]).withMessage('Yeast signal must be 0 or 1'),
  body('labInputs.V').isIn([0, 1]).withMessage('Validity must be 0 or 1'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { patient, labInputs, questionnaire } = req.body;

    const reportData = generateCompleteReport(patient, labInputs, questionnaire);
    
    const report = new Report({
      ...reportData,
      createdBy: req.user.id
    });

    await report.save();

    res.status(201).json({
      message: 'Report generated successfully',
      report
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating report', 
      error: error.message 
    });
  }
});

// Get all reports
router.get('/', authenticate, async (req, res) => {
  try {
    const reports = await Report.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');
    
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching reports', 
      error: error.message 
    });
  }
});

// Get single report
router.get('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching report', 
      error: error.message 
    });
  }
});

// Download report as PDF

router.get('/:id/pdf', authenticate, async (req, res) => {
  try {
    console.log("PDF generation requested for report:", req.params.id);

    const report = await Report.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!report) {
      console.log("Report not found for PDF generation");
      return res.status(404).json({ message: 'Report not found' });
    }

    console.log("Report found, generating PDF...");

    // Generate PDF — MUST return a buffer
    const pdfBuffer = await generatePDF(report);

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error("❌ PDF generation failed — buffer is empty or invalid.");
      return res.status(500).json({ 
        message: "PDF generation failed. Buffer empty.",
      });
    }

    console.log("PDF BUFFER SIZE:", pdfBuffer.length);
    console.log("FIRST 20 BYTES:", new Uint8Array(pdfBuffer.slice(0, 20)));

    // Send file safely
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${report.testId}.pdf`,
      "Content-Length": pdfBuffer.length,
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("🔥 Error generating PDF:", error);
    return res.status(500).json({
      message: "Error generating PDF",
      error: error.message,
    });
  }
});


// Delete report
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting report', 
      error: error.message 
    });
  }
});

// Search reports
router.get('/search/:query', authenticate, async (req, res) => {
  try {
    const { query } = req.params;
    
    const reports = await Report.find({
      createdBy: req.user.id,
      $or: [
        { testId: { $regex: query, $options: 'i' } },
        { 'patient.name': { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error searching reports', 
      error: error.message 
    });
  }
});

export default router;