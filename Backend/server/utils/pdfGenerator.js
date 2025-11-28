//PdfGenerator.js
import puppeteer from 'puppeteer';

export const generatePDF = async (report) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    const html = generateReportHTML(report);  // ← USE REAL HTML

    await page.setContent(html, { waitUntil: "load" });

    const pdf = await page.pdf({ format: "A4" });

    return pdf;

  } finally {
    await browser.close();
  }
};


const generateReportHTML = (report) => {
  const { testId, patient, labInputs, calculatedData, reportDate } = report;
  const { scores, statuses, overallStatus, recommendation, lifestyle } = calculatedData;

  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Microbiome Health Check Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            background: #fff;
        }

        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            page-break-after: always;
            position: relative;
        }

        .page:last-child {
            page-break-after: auto;
        }

        /* Header Styles */
        .header {
            background: linear-gradient(135deg, #4a9b9b 0%, #3d8080 100%);
            color: white;
            padding: 25px 30px;
            margin: -20mm -20mm 20px -20mm;
            border-radius: 0 0 15px 15px;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-section {
            display: flex;
            flex-direction: column;
        }

        .logo-text {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
            letter-spacing: -0.5px;
        }

        .logo-subtext {
            font-size: 11px;
            opacity: 0.95;
            font-weight: 400;
            letter-spacing: 0.5px;
        }

        .report-title {
            text-align: right;
            font-size: 22px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        /* Footer Styles */
        .footer {
            position: absolute;
            bottom: 15mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 9px;
            color: #666;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
        }

        .page-number {
            margin-top: 5px;
            color: #4a9b9b;
            font-weight: 600;
        }

        /* Content Styles */
        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #4a9b9b;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #4a9b9b;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
        }

        .info-label {
            font-size: 11px;
            color: #666;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
        }

        /* Status Box Styles */
        .status-box {
            background: #fff;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .status-row:last-child {
            border-bottom: none;
        }

        .status-label {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }

        .status-value {
            font-size: 14px;
            font-weight: 700;
            padding: 6px 16px;
            border-radius: 20px;
        }

        .status-valid {
            background: #d4edda;
            color: #155724;
        }

        .status-detected {
            background: #fff3cd;
            color: #856404;
        }

        .status-not-detected {
            background: #d4edda;
            color: #155724;
        }

        .status-optimal {
            background: #d4edda;
            color: #155724;
        }

        .status-suboptimal {
            background: #fff3cd;
            color: #856404;
        }

        .status-concern {
            background: #f8d7da;
            color: #721c24;
        }

        /* Table Styles */
        .functional-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-radius: 8px;
            overflow: hidden;
        }

        .functional-table thead {
            background: linear-gradient(135deg, #4a9b9b 0%, #3d8080 100%);
            color: white;
        }

        .functional-table th {
            padding: 14px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .functional-table td {
            padding: 14px;
            font-size: 13px;
            border-bottom: 1px solid #f0f0f0;
        }

        .functional-table tr:last-child td {
            border-bottom: none;
        }

        .functional-table tbody tr:hover {
            background: #f8f9fa;
        }

        /* Process Steps */
        .process-steps {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .process-step {
            background: #f8f9fa;
            padding: 18px;
            border-radius: 8px;
            border-left: 4px solid #4a9b9b;
        }

        .step-number {
            display: inline-block;
            width: 30px;
            height: 30px;
            background: #4a9b9b;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-weight: 700;
            margin-right: 12px;
            font-size: 14px;
        }

        .step-text {
            display: inline;
            font-size: 13px;
            color: #333;
            vertical-align: middle;
        }

        /* Alert Boxes */
        .alert {
            padding: 18px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 13px;
            line-height: 1.7;
        }

        .alert-info {
            background: #e7f3f8;
            border-left: 4px solid #4a9b9b;
            color: #0c5460;
        }

        .alert-warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
        }

        .alert-success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            color: #155724;
        }

        /* List Styles */
        .recommendation-list, .lifestyle-list {
            padding-left: 20px;
            margin: 15px 0;
        }

        .recommendation-list li, .lifestyle-list li {
            margin-bottom: 12px;
            font-size: 13px;
            line-height: 1.7;
            color: #333;
        }

        .recommendation-list li strong {
            color: #4a9b9b;
            font-weight: 600;
        }

        /* Cover Page Specific */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 257mm;
        }

        .cover-logo {
            font-size: 48px;
            font-weight: 700;
            color: #4a9b9b;
            margin-bottom: 10px;
        }

        .cover-subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 60px;
            letter-spacing: 1px;
        }

        .cover-report-title {
            font-size: 36px;
            font-weight: 700;
            color: #333;
            margin-bottom: 40px;
            line-height: 1.3;
        }

        .cover-patient-info {
            background: #f8f9fa;
            padding: 30px 40px;
            border-radius: 12px;
            margin: 30px 0;
            min-width: 400px;
        }

        .cover-info-row {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            font-size: 15px;
        }

        .cover-info-label {
            color: #666;
            font-weight: 600;
        }

        .cover-info-value {
            color: #333;
            font-weight: 500;
        }

        /* Disclaimer Box */
        .disclaimer {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-size: 11px;
            line-height: 1.6;
            color: #666;
        }

        .disclaimer-title {
            font-weight: 700;
            color: #333;
            margin-bottom: 10px;
            font-size: 12px;
            text-transform: uppercase;
        }

        /* Icons */
        .icon-check {
            color: #28a745;
            font-weight: 700;
            margin-right: 5px;
        }

        .icon-warning {
            color: #ffc107;
            font-weight: 700;
            margin-right: 5px;
        }

        /* Print Optimization */
        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>

    <!-- PAGE 1: COVER PAGE -->
    <div class="page">
        <div class="cover-page">
            <div class="cover-logo">the<br>Proven<br>code.</div>
            <div class="cover-subtitle">CLINICAL HEALTH ASSESSMENT PLATFORM</div>
            
            <div class="cover-report-title">Microbiome Health Check<br>Report</div>
            
            <div class="cover-patient-info">
                <div class="cover-info-row">
                    <span class="cover-info-label">Test ID:</span>
                    <span class="cover-info-value">${testId}</span>
                </div>
                <div class="cover-info-row">
                    <span class="cover-info-label">Patient:</span>
                    <span class="cover-info-value">${patient.name}</span>
                </div>
                <div class="cover-info-row">
                    <span class="cover-info-label">Age / Sex:</span>
                    <span class="cover-info-value">${patient.age} / ${patient.sex}</span>
                </div>
                <div class="cover-info-row">
                    <span class="cover-info-label">Collection Date:</span>
                    <span class="cover-info-value">${patient.collectionDate 
  ? new Date(patient.collectionDate).toLocaleDateString() 
  : "-"}
</span>
                </div>
                <div class="cover-info-row">
                <span class="cover-info-label">Report Date:</span>
                <span class="cover-info-value">
                    ${reportDate ? new Date(reportDate).toLocaleDateString() : "-"}


                </span>
                </div>
                ${patient.clinician ? `
                <div class="cover-info-row">
                    <span class="cover-info-label">Clinician:</span>
                    <span class="cover-info-value">${patient.clinician}</span>
                </div>
                ` : ''}
            </div>
            
            <div style="margin-top: 60px; color: #666; font-size: 13px;">
                Report Version 7.0<br>
                Confidential Medical Document
            </div>
        </div>
        
        <div class="footer">
            Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
            <div class="page-number">Page 1 of 10</div>
        </div>
    </div>

    <!-- PAGE 2: PATIENT & TEST INFORMATION -->
    <div class="page">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo-text">the Proven code.</div>
                    <div class="logo-subtext">Clinical Health Assessment Platform</div>
                </div>
                <div class="report-title">Microbiome Report Generator</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Patient Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Test ID</span>
                    <span class="info-value">${testId}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Patient Name</span>
                    <span class="info-value">${patient.name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Age</span>
                    <span class="info-value">${patient.age} years</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sex</span>
                    <span class="info-value">${patient.sex}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sample Collection Date</span>
                    <span class="info-value">${patient.collectionDate 
  ? new Date(patient.collectionDate).toLocaleDateString() 
  : "-"}
</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Report Generation Date</span>
                    <span class="info-value">${reportDate ? new Date(reportDate).toLocaleDateString() : "-"}

</span>
                </div>
                ${patient.clinician ? `
                <div class="info-item">
                    <span class="info-label">Clinician / Partner</span>
                    <span class="info-value">${patient.clinician}</span>
                </div>
                ` : ''}
                <div class="info-item">
                    <span class="info-label">Report Version</span>
                    <span class="info-value">7.0</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">About This Test</h2>
            <p style="margin-bottom: 15px; font-size: 13px; line-height: 1.8;">
                The <strong>Microbiome Health Check (MHC)</strong> by The Proven Code is a functional screening tool that provides 
                a science-backed overview of your gut microbial health. This comprehensive assessment evaluates the presence of 
                bacterial and yeast signals, offering insights into your digestive wellness and overall gut microbiome balance.
            </p>
            <p style="font-size: 13px; line-height: 1.8; color: #666;">
                The test utilizes advanced BiomeAnalysis360™ technology to analyze your sample and provide actionable insights 
                for optimizing your gut health through targeted lifestyle and dietary modifications.
            </p>
        </div>

        <div class="section">
            <h2 class="section-title">Testing Process</h2>
            <div class="process-steps">
                <div class="process-step">
                    <span class="step-number">1</span>
                    <span class="step-text"><strong>Sample Collection</strong><br>Sample collected at authorized partner site under controlled conditions</span>
                </div>
                <div class="process-step">
                    <span class="step-number">2</span>
                    <span class="step-text"><strong>Cold-Chain Transport</strong><br>Secure transport to laboratory maintaining sample integrity</span>
                </div>
                <div class="process-step">
                    <span class="step-number">3</span>
                    <span class="step-text"><strong>Laboratory Analysis</strong><br>Comprehensive review using BiomeAnalysis360™ platform</span>
                </div>
                <div class="process-step">
                    <span class="step-number">4</span>
                    <span class="step-text"><strong>Report Generation</strong><br>Expert review and generation of personalized health report</span>
                </div>
            </div>
        </div>

        <div class="disclaimer">
            <div class="disclaimer-title">Important Notice</div>
            This report is intended for clinical reference and educational purposes. It should be reviewed by a qualified 
            healthcare professional. This test is not a substitute for professional medical advice, diagnosis, or treatment. 
            Always consult your physician or qualified healthcare provider with any questions regarding a medical condition.
        </div>

        <div class="footer">
            Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
            <div class="page-number">Page 2 of 10</div>
        </div>
    </div>

    <!-- PAGE 3: EXECUTIVE SUMMARY -->
    <div class="page">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo-text">the Proven code.</div>
                    <div class="logo-subtext">Clinical Health Assessment Platform</div>
                </div>
                <div class="report-title">Microbiome Report Generator</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            
            <div class="status-box">
                <div class="status-row">
                    <span class="status-label">Specimen Validity</span>
                    <span class="status-value status-valid"><span class="icon-check">✓</span> Valid</span>
                </div>
                <div class="status-row">
                    <span class="status-label">Bacterial Signal</span>
                    <span class="status-value ${labInputs.B === 1 ? 'status-detected' : 'status-not-detected'}">
                        <span class="${labInputs.B === 1 ? 'icon-warning' : 'icon-check'}">${labInputs.B === 1 ? '⚠' : '✓'}</span>
                        ${labInputs.B === 1 ? 'Detected' : 'Not Detected'}
                    </span>
                </div>
                <div class="status-row">
                    <span class="status-label">Yeast Signal</span>
                    <span class="status-value ${labInputs.Y === 1 ? 'status-detected' : 'status-not-detected'}">
                        <span class="${labInputs.Y === 1 ? 'icon-warning' : 'icon-check'}">${labInputs.Y === 1 ? '⚠' : '✓'}</span>
                        ${labInputs.Y === 1 ? 'Detected' : 'Not Detected'}
                    </span>
                </div>
            </div>

            <div class="alert ${overallStatus.includes('Optimal') ? 'alert-success' : overallStatus.includes('Attention') ? 'alert-warning' : 'alert-info'}">
                <strong>Overall Functional Status:</strong><br>
                ${overallStatus}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Key Findings</h2>
            
            ${labInputs.B === 1 ? `
            <div class="alert alert-warning">
                <strong>Bacterial Signal Detected</strong><br>
                Your sample shows the presence of bacterial markers. This may indicate an imbalance in your gut microbiome 
                that could benefit from targeted dietary and lifestyle interventions. Please review the recommendations 
                section for specific guidance.
            </div>
            ` : `
            <div class="alert alert-success">
                <strong>No Bacterial Signal Detected</strong><br>
                Your sample shows no concerning bacterial markers at this time. Continue to maintain healthy gut practices 
                through balanced nutrition and lifestyle habits.
            </div>
            `}

            ${labInputs.Y === 1 ? `
            <div class="alert alert-warning">
                <strong>Yeast Signal Detected</strong><br>
                Your sample indicates the presence of yeast markers. This may suggest an overgrowth that could impact 
                digestive comfort and overall gut balance. Dietary modifications focusing on reducing sugar and refined 
                carbohydrates may be beneficial.
            </div>
            ` : `
            <div class="alert alert-success">
                <strong>No Yeast Signal Detected</strong><br>
                Your sample shows no elevated yeast markers, suggesting healthy yeast balance in your gut microbiome.
            </div>
            `}
        </div>

        <div class="section">
            <h2 class="section-title">What This Means</h2>
            <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
                The Microbiome Health Check provides a functional assessment of your gut microbial balance. The presence 
                or absence of bacterial and yeast signals helps identify potential areas for optimization in your digestive 
                health journey.
            </p>
            <p style="font-size: 13px; line-height: 1.8; color: #666;">
                This report includes personalized recommendations based on your results. For more comprehensive insights 
                into your microbiome composition, diversity, and specific bacterial populations, consider requesting our 
                Advanced Functional Microbiome Analysis.
            </p>
        </div>

        <div class="footer">
            Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
            <div class="page-number">Page 3 of 10</div>
        </div>
    </div>

    <!-- PAGE 4: FUNCTIONAL ASSESSMENT DETAILS -->
    <div class="page">
        <div class="header">
            <div class="header-content">
                <div class="logo-section">
                    <div class="logo-text">the Proven code.</div>
                    <div class="logo-subtext">Clinical Health Assessment Platform</div>
                </div>
                <div class="report-title">Microbiome Report Generator</div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Functional Assessment Details</h2>
            <p style="font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
                The following table provides a detailed breakdown of various functional aspects of your gut microbiome 
                health, along with their current status based on the analysis of your sample.
            </p>

            <table class="functional-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">Functional Aspect</th>
                        <th style="width: 20%; text-align: center;">Status</th>
                        <th style="width: 40%;">Interpretation</th>
                    </tr>
                </thead>
                <tbody>
                    ${generateFunctionalRows(statuses)}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2 class="section-title">Understanding Your Status</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                <div style="text-align: center; padding: 15px; background: #d4edda; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #155724; margin-bottom: 5px;">✓</div>
                    <div style="font-size: 12px; font-weight: 600; color: #155724;">OPTIMAL</div>
                    <div style="font-size: 11px; color: #155724; margin-top: 5px;">Functioning well</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fff3cd; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #856404; margin-bottom: 5px;">⚠</div>
                    <div style="font-size: 12px; font-weight: 600; color: #856404;">SUBOPTIMAL</div>
                    <div style="font-size: 11px; color: #856404; margin-top: 5px;">Room for improvement</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f8d7da; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #721c24; margin-bottom: 5px;">✗</div>
                    <div style="font-size: 12px; font-weight: 600; color: #721c24;">CONCERN</div>
                    <div style="font-size: 11px; color: #721c24; margin-top: 5px;">Requires attention</div>
                </div>
            </div>
        </div>

        <div class="alert alert-info" style="margin-top: 25px;">
            <strong>Note on Functional Assessment:</strong><br>
            This functional screening provides an overview of your gut health status. Individual variations are normal, 
            and results should be interpreted in the context of your overall health, symptoms, and lifestyle. For 
            deeper insights into specific bacterial populations and microbiome diversity, consider our Advanced 
            Functional Microbiome Analysis.
        </div>

        <div class="footer">
            Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
            <div class="page-number">Page 4 of 10</div>
        </div>
    </div>

  <!-- PAGE 5: CLINICAL INTERPRETATION -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Clinical Interpretation</h2>
        
        <h3 style="font-size: 15px; font-weight: 600; color: #4a9b9b; margin: 20px 0 12px 0;">
            Understanding Your Bacterial Signal
        </h3>
        ${labInputs.B === 1 ? `
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            The detection of bacterial signals in your sample suggests the presence of microbial markers that may 
            indicate an imbalance in your gut microbiome. This is not uncommon and can be influenced by various 
            factors including:
        </p>
        <ul class="lifestyle-list">
            <li><strong>Dietary patterns:</strong> Recent changes in diet, high intake of processed foods, or 
            insufficient fiber consumption</li>
            <li><strong>Antibiotic use:</strong> Recent or frequent antibiotic treatment can disrupt normal gut flora</li>
            <li><strong>Stress levels:</strong> Chronic stress can negatively impact gut microbiome composition</li>
            <li><strong>Lifestyle factors:</strong> Sleep quality, exercise patterns, and hydration status</li>
            <li><strong>Environmental factors:</strong> Exposure to certain medications, supplements, or environmental toxins</li>
        </ul>
        <p style="font-size: 13px; line-height: 1.8; margin-top: 15px; color: #666;">
            While bacterial presence is noted, this screening provides a functional overview. The specific types 
            and quantities of bacteria can be identified through our Advanced Functional Microbiome Analysis if 
            more detailed information is desired.
        </p>
        ` : `
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            The absence of concerning bacterial signals in your sample suggests that your gut microbiome is maintaining 
            a healthy balance at the screening level. This is a positive indicator of gut health, though it's important 
            to continue supporting your microbiome through:
        </p>
        <ul class="lifestyle-list">
            <li>Maintaining a diverse, fiber-rich diet with plenty of plant-based foods</li>
            <li>Regular physical activity to support gut motility and microbial diversity</li>
            <li>Adequate hydration throughout the day</li>
            <li>Stress management practices such as meditation, yoga, or deep breathing</li>
            <li>Consistent sleep patterns and quality rest</li>
        </ul>
        `}

        <h3 style="font-size: 15px; font-weight: 600; color: #4a9b9b; margin: 25px 0 12px 0;">
            Understanding Your Yeast Signal
        </h3>
        ${labInputs.Y === 1 ? `
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            The detection of yeast signals indicates the presence of fungal markers that may suggest an overgrowth 
            or imbalance. Yeast is naturally present in the gut, but certain conditions can lead to overgrowth:
        </p>
        <ul class="lifestyle-list">
            <li><strong>Dietary sugar:</strong> High intake of sugars and refined carbohydrates can fuel yeast growth</li>
            <li><strong>Antibiotic use:</strong> Can eliminate beneficial bacteria that normally keep yeast in check</li>
            <li><strong>Immune function:</strong> Weakened immunity may allow opportunistic yeast proliferation</li>
            <li><strong>pH imbalance:</strong> Altered gut pH can create favorable conditions for yeast</li>
            <li><strong>Hormonal changes:</strong> Can influence susceptibility to yeast overgrowth</li>
        </ul>
        <p style="font-size: 13px; line-height: 1.8; margin-top: 15px; color: #666;">
            Addressing yeast overgrowth typically involves dietary modifications, potential antifungal support,
            and restoration of beneficial bacteria. Consult with your healthcare provider for personalized guidance.
        </p>
        ` : `
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            The absence of elevated yeast signals suggests that fungal populations in your gut are within healthy
            ranges. This indicates good balance between yeast and beneficial bacteria. To maintain this balance:
        </p>
        <ul class="lifestyle-list">
            <li>Continue limiting refined sugars and processed carbohydrates</li>
            <li>Include probiotic-rich foods like yogurt, kefir, sauerkraut, and kimchi</li>
            <li>Consider prebiotic foods that feed beneficial bacteria</li>
            <li>Be mindful of antibiotic use and consider probiotic support during treatment</li>
        </ul>
        `}
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 5 of 10</div>
    </div>
</div>

<!-- PAGE 6: PERSONALIZED RECOMMENDATIONS -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Personalized Recommendations</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
            Based on your microbiome health assessment results, the following recommendations have been tailored 
            to support your gut health optimization journey. These suggestions are designed to address the specific 
            findings in your report.
        </p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4a9b9b; margin-bottom: 20px;">
            ${recommendation}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Dietary Guidance</h2>
        
        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 12px 0;">
            Foods to Emphasize
        </h3>
        <ul class="recommendation-list">
            <li><strong>Fiber-rich vegetables:</strong> Leafy greens, broccoli, Brussels sprouts, carrots, and bell peppers provide prebiotic fiber</li>
            <li><strong>Fermented foods:</strong> Plain yogurt, kefir, sauerkraut, kimchi, and kombucha support beneficial bacteria</li>
            <li><strong>Whole grains:</strong> Oats, quinoa, brown rice, and barley provide complex carbohydrates and fiber</li>
            <li><strong>Legumes:</strong> Lentils, chickpeas, black beans, and kidney beans are excellent for gut health</li>
            <li><strong>Prebiotic foods:</strong> Garlic, onions, leeks, asparagus, and Jerusalem artichokes feed good bacteria</li>
            <li><strong>Omega-3 sources:</strong> Fatty fish, flaxseeds, chia seeds, and walnuts support gut barrier function</li>
        </ul>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            Foods to Limit or Avoid
        </h3>
        <ul class="recommendation-list">
            <li><strong>Refined sugars:</strong> Candies, sodas, pastries, and processed desserts can promote harmful bacteria</li>
            <li><strong>Artificial sweeteners:</strong> May negatively impact beneficial gut bacteria populations</li>
            <li><strong>Processed foods:</strong> High in additives and low in nutrients beneficial for gut health</li>
            <li><strong>Excessive alcohol:</strong> Can disrupt gut microbiome balance and gut barrier integrity</li>
            <li><strong>Red and processed meats:</strong> High consumption may negatively impact microbiome diversity</li>
            ${labInputs.Y === 1 ? `<li><strong>High-sugar fruits:</strong> Temporarily reduce tropical fruits and dried fruits while addressing yeast</li>` : ''}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Supplement Considerations</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            Consider discussing the following supplements with your healthcare provider:
        </p>
        <ul class="recommendation-list">
            <li><strong>Probiotics:</strong> Multi-strain formulas containing Lactobacillus and Bifidobacterium species</li>
            <li><strong>Prebiotics:</strong> Inulin, FOS, or GOS to feed beneficial bacteria</li>
            <li><strong>Digestive enzymes:</strong> May support proper digestion and nutrient absorption</li>
            ${labInputs.Y === 1 ? `<li><strong>Antifungal support:</strong> Natural options like caprylic acid, oregano oil, or garlic extract (under professional guidance)</li>` : ''}
            <li><strong>L-Glutamine:</strong> Supports gut barrier function and intestinal health</li>
        </ul>
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 6 of 10</div>
    </div>
</div>

<!-- PAGE 7: LIFESTYLE GUIDANCE -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Lifestyle Guidance</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
            Your gut health is influenced by multiple lifestyle factors beyond diet. The following recommendations 
            address key areas that can significantly impact your microbiome balance and overall digestive wellness.
        </p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #4a9b9b; margin-bottom: 25px;">
            ${lifestyle}
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Comprehensive Lifestyle Recommendations</h2>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 12px 0;">
            <span style="background: #4a9b9b; color: white; padding: 4px 10px; border-radius: 4px; margin-right: 8px;">1</span>
            Physical Activity
        </h3>
        <ul class="lifestyle-list">
            <li>Aim for at least 150 minutes of moderate-intensity exercise per week</li>
            <li>Include both aerobic activities (walking, cycling, swimming) and resistance training</li>
            <li>Regular movement supports gut motility and microbiome diversity</li>
            <li>Even short walks after meals can significantly benefit digestive health</li>
        </ul>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            <span style="background: #4a9b9b; color: white; padding: 4px 10px; border-radius: 4px; margin-right: 8px;">2</span>
            Stress Management
        </h3>
        <ul class="lifestyle-list">
            <li>Practice daily stress-reduction techniques such as meditation, deep breathing, or yoga</li>
            <li>The gut-brain axis is bidirectional—chronic stress directly impacts gut health</li>
            <li>Consider mindfulness practices, even 5-10 minutes daily can make a difference</li>
            <li>Engage in activities you enjoy to naturally reduce stress hormones</li>
        </ul>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            <span style="background: #4a9b9b; color: white; padding: 4px 10px; border-radius: 4px; margin-right: 8px;">3</span>
            Sleep Optimization
        </h3>
        <ul class="lifestyle-list">
            <li>Aim for 7-9 hours of quality sleep per night on a consistent schedule</li>
            <li>Poor sleep can disrupt gut microbiome balance and increase inflammation</li>
            <li>Maintain a cool, dark sleeping environment</li>
            <li>Avoid screens 1-2 hours before bedtime to support natural melatonin production</li>
        </ul>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            <span style="background: #4a9b9b; color: white; padding: 4px 10px; border-radius: 4px; margin-right: 8px;">4</span>
            Hydration
        </h3>
        <ul class="lifestyle-list">
            <li>Drink adequate water throughout the day (typically 8-10 glasses)</li>
            <li>Proper hydration supports mucosal lining of the gut and regular bowel movements</li>
            <li>Herbal teas like ginger, peppermint, or chamomile can provide additional benefits</li>
            <li>Limit caffeinated and alcoholic beverages which can be dehydrating</li>
        </ul>
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 7 of 10</div>
    </div>
</div>

<!-- PAGE 8: MONITORING & FOLLOW-UP -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Monitoring Your Progress</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 20px;">
            Gut health improvement is a journey that requires consistent effort and monitoring. Track your progress 
            using the following guidelines to optimize your microbiome health over time.
        </p>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 12px 0;">
            Symptoms to Track
        </h3>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <ul class="lifestyle-list" style="margin: 0;">
                <li><strong>Digestive comfort:</strong> Bloating, gas, abdominal discomfort, regularity</li>
                <li><strong>Bowel movements:</strong> Frequency, consistency, ease of passage</li>
                <li><strong>Energy levels:</strong> Daily energy patterns and fatigue</li>
                <li><strong>Mood and cognition:</strong> Mental clarity, mood stability, brain fog</li>
                <li><strong>Skin health:</strong> Breakouts, rashes, overall skin appearance</li>
                <li><strong>Sleep quality:</strong> Ease of falling asleep and staying asleep</li>
            </ul>
        </div>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            Recommended Follow-Up Timeline
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: #e7f3f8; padding: 18px; border-radius: 8px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #4a9b9b; margin-bottom: 8px;">2-4</div>
                <div style="font-size: 11px; font-weight: 600; color: #333; text-transform: uppercase; margin-bottom: 5px;">WEEKS</div>
                <div style="font-size: 12px; color: #666; line-height: 1.5;">Initial symptom improvements may be noticed</div>
            </div>
            <div style="background: #e7f3f8; padding: 18px; border-radius: 8px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #4a9b9b; margin-bottom: 8px;">3</div>
                <div style="font-size: 11px; font-weight: 600; color: #333; text-transform: uppercase; margin-bottom: 5px;">MONTHS</div>
                <div style="font-size: 12px; color: #666; line-height: 1.5;">Recommended retest timeframe</div>
            </div>
            <div style="background: #e7f3f8; padding: 18px; border-radius: 8px; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #4a9b9b; margin-bottom: 8px;">6-12</div>
                <div style="font-size: 11px; font-weight: 600; color: #333; text-transform: uppercase; margin-bottom: 5px;">MONTHS</div>
                <div style="font-size: 12px; color: #666; line-height: 1.5;">Optimal interval for comprehensive assessment</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">When to Seek Professional Guidance</h2>
        <div class="alert alert-warning">
            <strong>Consult with your healthcare provider if you experience:</strong>
            <ul style="margin: 10px 0 0 20px; font-size: 13px;">
                <li>Persistent or worsening digestive symptoms despite implementing recommendations</li>
                <li>Unexplained weight loss or significant changes in appetite</li>
                <li>Blood in stool or severe abdominal pain</li>
                <li>Chronic diarrhea or constipation lasting more than a few weeks</li>
                <li>New or unusual symptoms that concern you</li>
                <li>Need for personalized supplement protocols or advanced testing</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Advanced Testing Options</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            For deeper insights into your microbiome composition, consider our <strong>Advanced Functional 
            Microbiome Analysis</strong>, which provides:
        </p>
        <ul class="lifestyle-list">
            <li>Comprehensive bacterial species identification and quantification</li>
            <li>Microbiome diversity metrics and comparative analysis</li>
            <li>Detailed assessment of beneficial, commensal, and pathogenic organisms</li>
            <li>Specific probiotic and prebiotic recommendations based on your unique profile</li>
            <li>Metabolic pathway analysis and functional capacity assessment</li>
            <li>Personalized dietary recommendations based on your microbiome composition</li>
        </ul>
        <p style="font-size: 13px; line-height: 1.8; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <strong>Typical turnaround time:</strong> 20-25 days from sample receipt<br>
            <strong>Contact:</strong> Speak with your healthcare provider or contact The Proven Code directly for more information
        </p>
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 8 of 10</div>
    </div>
</div>

<!-- PAGE 9: EDUCATIONAL RESOURCES -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Understanding the Gut Microbiome</h2>
        <p style="font-size: 13px; line-height: 1.8; margin-bottom: 15px;">
            Your gut microbiome is a complex ecosystem of trillions of microorganisms, including bacteria, fungi, 
            viruses, and other microbes. This diverse community plays crucial roles in your overall health.
        </p>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 20px 0 12px 0;">
            Key Functions of the Gut Microbiome
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: #f8f9fa; padding: 18px; border-radius: 8px; border-left: 3px solid #4a9b9b;">
                <div style="font-weight: 600; color: #4a9b9b; margin-bottom: 8px;">Digestive Health</div>
                <div style="font-size: 12px; line-height: 1.6; color: #666;">
                    Breaks down complex carbohydrates, produces short-chain fatty acids, and synthesizes essential vitamins
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 18px; border-radius: 8px; border-left: 3px solid #4a9b9b;">
                <div style="font-weight: 600; color: #4a9b9b; margin-bottom: 8px;">Immune Function</div>
                <div style="font-size: 12px; line-height: 1.6; color: #666;">
                    Trains and modulates immune system, protects against pathogens, and maintains gut barrier integrity
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 18px; border-radius: 8px; border-left: 3px solid #4a9b9b;">
                <div style="font-weight: 600; color: #4a9b9b; margin-bottom: 8px;">Mental Health</div>
                <div style="font-size: 12px; line-height: 1.6; color: #666;">
                    Produces neurotransmitters, influences mood and cognition through the gut-brain axis
                </div>
            </div>
            <div style="background: #f8f9fa; padding: 18px; border-radius: 8px; border-left: 3px solid #4a9b9b;">
                <div style="font-weight: 600; color: #4a9b9b; margin-bottom: 8px;">Metabolic Health</div>
                <div style="font-size: 12px; line-height: 1.6; color: #666;">
                    Influences weight management, blood sugar regulation, and inflammation throughout the body
                </div>
            </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 600; color: #333; margin: 25px 0 12px 0;">
            Factors That Influence Your Microbiome
        </h3>
        <ul class="lifestyle-list">
            <li><strong>Diet:</strong> The single most influential factor—what you eat directly feeds your microbes</li>
            <li><strong>Antibiotics and medications:</strong> Can temporarily or permanently alter microbial populations</li>
            <li><strong>Stress:</strong> Chronic stress negatively impacts microbial diversity and gut barrier function</li>
            <li><strong>Sleep:</strong> Circadian rhythms influence microbiome composition and function</li>
            <li><strong>Exercise:</strong> Regular physical activity promotes beneficial bacterial growth</li>
            <li><strong>Environment:</strong> Exposure to diverse environments enriches microbiome diversity</li>
            <li><strong>Age:</strong> Microbiome composition changes throughout life stages</li>
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Expert Review Note</h2>
        <div style="background: #e7f3f8; padding: 20px; border-radius: 8px; border-left: 4px solid #4a9b9b;">
            <p style="font-size: 13px; line-height: 1.8; margin-bottom: 12px;">
                Gut health is a reflection of multiple interconnected factors including diet, daily routine, 
                medication use, stress levels, and environmental exposures. While this screening provides valuable 
                insights into your current microbiome status, it represents a snapshot in time.
            </p>
            <p style="font-size: 13px; line-height: 1.8; margin-bottom: 12px;">
                The recommendations provided are based on current scientific understanding and your specific test 
                results. However, individual responses can vary, and what works best for you may require some 
                experimentation and personalization.
            </p>
            <p style="font-size: 13px; line-height: 1.8; margin: 0;">
                If concerns persist despite implementing these recommendations, or if you experience new or worsening 
                symptoms, please seek review with your clinician or qualified healthcare provider. They can provide 
                personalized guidance and determine if additional testing or interventions are appropriate for your 
                specific situation.
            </p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Scientific Foundation</h2>
        <p style="font-size: 12px; line-height: 1.7; color: #666;">
            This report is based on current microbiome science and functional medicine principles. The BiomeAnalysis360™ 
            platform utilizes validated screening methodologies to assess gut microbial markers. Recommendations are 
            derived from peer-reviewed research on gut health, nutrition science, and microbiome therapeutics.
        </p>
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 9 of 10</div>
    </div>
</div>

<!-- PAGE 10: DISCLAIMERS & CONTACT -->
<div class="page">
    <div class="header">
        <div class="header-content">
            <div class="logo-section">
                <div class="logo-text">the Proven code.</div>
                <div class="logo-subtext">Clinical Health Assessment Platform</div>
            </div>
            <div class="report-title">Microbiome Report Generator</div>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Important Disclaimers</h2>
        
        <div class="disclaimer" style="margin-bottom: 20px;">
            <div class="disclaimer-title">Medical Disclaimer</div>
            <p style="margin-bottom: 10px;">
                This report is intended for educational and informational purposes only and is not intended to be a 
                substitute for professional medical advice, diagnosis, or treatment. The Microbiome Health Check is a 
                functional screening tool and should not be used as the sole basis for medical decisions.
            </p>
            <p style="margin-bottom: 10px;">
                Always seek the advice of your physician or other qualified healthcare provider with any questions you 
                may have regarding a medical condition or treatment. Never disregard professional medical advice or 
                delay in seeking it because of information contained in this report.
            </p>
            <p>
                If you think you may have a medical emergency, call your doctor or emergency services immediately.
            </p>
        </div>

        <div class="disclaimer" style="margin-bottom: 20px;">
            <div class="disclaimer-title">Testing Limitations</div>
            <p style="margin-bottom: 10px;">
                The Microbiome Health Check provides a functional screening of bacterial and yeast markers. It does not:
            </p>
            <ul style="margin: 10px 0 10px 20px; font-size: 11px; line-height: 1.6;">
                <li>Identify specific bacterial species or strains</li>
                <li>Quantify exact microbial populations</li>
                <li>Assess microbiome diversity metrics</li>
                <li>Replace comprehensive diagnostic testing when clinically indicated</li>
                <li>Detect all potential gut health concerns or pathogenic organisms</li>
            </ul>
            <p>
                For more detailed microbiome analysis, consider our Advanced Functional Microbiome Analysis.
            </p>
        </div>

        <div class="disclaimer" style="margin-bottom: 20px;">
            <div class="disclaimer-title">Recommendation Disclaimer</div>
            <p style="margin-bottom: 10px;">
                Recommendations provided in this report are general guidelines based on your test results and current 
                scientific understanding. Individual results may vary, and these recommendations should be discussed 
                with your healthcare provider before implementation, especially if you:
            </p>
            <ul style="margin: 10px 0 0 20px; font-size: 11px; line-height: 1.6;">
                <li>Have existing medical conditions</li>
                <li>Are taking medications or supplements</li>
                <li>Are pregnant or nursing</li>
                <li>Have food allergies or sensitivities</li>
                <li>Are under 18 years of age</li>
            </ul>
        </div>

        <div class="disclaimer">
            <div class="disclaimer-title">Laboratory and Quality Assurance</div>
            <p>
                All testing is performed using validated methodologies in controlled laboratory conditions. Quality 
                control measures are implemented throughout the testing process. However, as with all laboratory 
                testing, results should be interpreted in the clinical context by qualified professionals.
            </p>
        </div>
    </div>

    <div class="section">
        <h2 class="section-title">Contact Information</h2>
        <div style="background: linear-gradient(135deg, #4a9b9b 0%, #3d8080 100%); color: white; padding: 25px; border-radius: 10px;">
            <div style="font-size: 24px; font-weight: 700; margin-bottom: 20px;">the Proven code.</div>
            <div style="font-size: 13px; line-height: 2; opacity: 0.95;">
                <strong>Clinical Health Assessment Platform</strong><br>
                Microbiome Health Check Division<br><br>
                
                For questions about your report:<br>
                Contact your healthcare provider or ordering clinician<br><br>
                
                For technical support or general inquiries:<br>
                Email: support@theprovencode.com<br>
                Website: www.theprovencode.com<br><br>
                
                For Advanced Microbiome Analysis:<br>
                Email: advanced@theprovencode.com<br>
                Turnaround time: 20-25 days
            </div>
        </div>
    </div>

    <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 8px;">
            Report Generated: ${reportDate ? new Date(reportDate).toLocaleDateString() : "-"}


        </div>
        <div style="font-size: 12px; color: #666;">
            Report Version 7.0 | Test ID: ${testId}
        </div>
        <div style="font-size: 11px; color: #999; margin-top: 10px;">
            © ${new Date().getFullYear()} The Proven Code. All rights reserved.<br>
            Confidential medical document. Unauthorized reproduction prohibited.
        </div>
    </div>

    <div class="footer">
        Prepared by The Proven Code | Microbiome Health Check | For clinical reference use only
        <div class="page-number">Page 10 of 10</div>
    </div>
</div>
</body>
</html>
            `;
  } ;

const generateFunctionalRows = (statuses) => {
  const aspects = [
    'Digestive Rhythm', 'Fermentation Load', 'Bacterial Balance', 'Yeast Balance',
    'Immune Tone', 'Gut–Brain Stress', 'Circadian Sleep', 'Diet Quality',
    'Medication Impact', 'Hydration & Recovery'
  ];

  return aspects.map((aspect, idx) => {
    const status = statuses[`FS${idx + 1}`];
    const statusClass = status.toLowerCase().replace(' ', '-');
    return `
      <tr>
        <td>${aspect}</td>
        <td><span class="status-badge status-${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join('');
};