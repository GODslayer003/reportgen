  // routes/reports.js
  import express from 'express';
  import { body, validationResult } from 'express-validator';
  import { authenticate } from '../middleware/auth.js';
  import {
    createReport,
    getReportPDF,
    getAllReports,
    getSingleReport,
    deleteReport,
    searchReports,
    debugAllReports
  } from '../controllers/reportController.js';

  const router = express.Router();

  // CREATE REPORT                                        
  router.post('/', authenticate, [
    body('patient.name').trim().notEmpty().withMessage('Patient name is required'),
    body('patient.age').isInt({ min: 1, max: 120 }).withMessage('Valid age is required'),
    body('patient.sex').isIn(['Male', 'Female', 'Other']).withMessage('Valid sex is required'),
    body('labInputs.B').isIn([0, 1]).withMessage('Bacterial signal must be 0 or 1'),
    body('labInputs.Y').isIn([0, 1]).withMessage('Yeast signal must be 0 or 1'),
    body('labInputs.V').isIn([0, 1]).withMessage('Validity must be 0 or 1'),
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }, createReport);

  // GET PDF
  router.get('/:id/pdf', authenticate, getReportPDF);

  // GET ALL REPORTS
  router.get('/', authenticate, getAllReports);

  // GET SINGLE REPORT
  router.get('/:id', authenticate, getSingleReport);

  // DELETE REPORT
  router.delete('/:id', authenticate, deleteReport);

  // SEARCH REPORTS
  router.get('/search/:query', authenticate, searchReports);

  // DEBUG ALL REPORTS
  router.get('/debug/all-reports', authenticate, debugAllReports);

  export default router;
