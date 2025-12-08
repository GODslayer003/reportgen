// controllers/reportController.js
import Report from '../models/Report.js';
import { generateCompleteReport } from '../utils/calculations.js';
import { generatePDF } from '../utils/pdfGenerator.js';

// CREATE REPORT
export const createReport = async (req, res) => {
  try {
    const { patient, labInputs, questionnaire } = req.body;

    const reportData = generateCompleteReport(patient, labInputs, questionnaire);

    const report = new Report({
      ...reportData,
      createdBy: req.user.id
    });

    await report.save();

    res.status(201).json({
      message: 'Report generated successfully',
      report,
      success: true
    });
  } catch (error) {
    console.error('Error in report creation:', error);
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

// GET PDF REPORT
export const getReportPDF = async (req, res) => {
  try {
    const savedReport = await Report.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!savedReport) return res.status(404).json({ message: 'Report not found' });

    // REGENERATE REPORT so keyInsight exists
    const freshReport = generateCompleteReport(
      savedReport.patient,
      savedReport.labInputs,
      savedReport.questionnaire
    );

    // Keep DB metadata
    freshReport._id = savedReport._id;
    freshReport.testId = savedReport.testId;
    freshReport.createdBy = savedReport.createdBy;
    freshReport.createdAt = savedReport.createdAt;
    freshReport.updatedAt = savedReport.updatedAt;

    // DEBUG
    console.log("PAGE 9 — KEY INSIGHT:", freshReport.calculatedData.keyInsight);

    const pdfBuffer = await generatePDF(freshReport);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${freshReport.testId}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error in PDF generation route:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

// GET ALL REPORTS
export const getAllReports = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') filter = { createdBy: req.user._id };

    const reports = await Report.find(filter).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// GET SINGLE REPORT
export const getSingleReport = async (req, res) => {
  try {
    let report;
    if (req.user.role === 'admin') {
      report = await Report.findById(req.params.id);
    } else {
      report = await Report.findOne({ _id: req.params.id, createdBy: req.user._id });
    }

    if (!report) return res.status(404).json({ message: "Report not found" });

    res.json({ report });
  } catch (error) {
    console.error("Error fetching single report:", error);
    res.status(500).json({ error: error.message });
  }
};

// DELETE REPORT
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};

// SEARCH REPORTS
export const searchReports = async (req, res) => {
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
    res.status(500).json({ message: 'Error searching reports', error: error.message });
  }
};

// DEBUG: Get recent reports
export const debugAllReports = async (req, res) => {
  try {
    const allReports = await Report.find().sort({ createdAt: -1 }).limit(10);
    const userReports = await Report.find({ createdBy: req.user.id });

    const reportSummary = allReports.map(r => ({
      _id: r._id,
      testId: r.testId,
      patientName: r.patient.name,
      createdBy: r.createdBy,
      createdAt: r.createdAt
    }));

    res.json({
      currentUserId: req.user.id,
      totalReportsInDB: allReports.length,
      userReportCount: userReports.length,
      allReports: reportSummary,
      userReports: userReports.map(r => ({
        _id: r._id,
        testId: r.testId,
        patientName: r.patient.name
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
