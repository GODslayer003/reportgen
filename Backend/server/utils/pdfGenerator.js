//PdfGenerator.js
import puppeteer from 'puppeteer';

export const generatePDF = async (reportData) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    const htmlContent = generateReportHTML(reportData);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdf;
  } finally {
    await browser.close();
  }
};

const generateReportHTML = (report) => {
  const { testId, patient, labInputs, calculatedData } = report;
  const { scores, statuses, overallStatus, recommendation, lifestyle } = calculatedData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          line-height: 1.6; 
          color: #333;
        }
        .page { 
          page-break-after: always; 
          padding: 40px;
          min-height: 297mm;
        }
        .cover { 
          text-align: center; 
          padding-top: 100px;
        }
        .cover h1 { 
          color: #4F46E5; 
          font-size: 48px; 
          margin-bottom: 20px;
        }
        .cover h2 { 
          font-size: 28px; 
          margin-bottom: 40px;
          color: #555;
        }
        .test-id { 
          font-size: 20px; 
          font-family: monospace; 
          border-top: 2px solid #ddd;
          border-bottom: 2px solid #ddd;
          padding: 20px;
          margin: 40px auto;
          max-width: 400px;
        }
        .patient-info { 
          text-align: left; 
          max-width: 500px; 
          margin: 40px auto;
          line-height: 2;
        }
        .patient-info p { font-size: 14px; }
        .patient-info strong { color: #4F46E5; }
        
        h2 { 
          color: #4F46E5; 
          margin-bottom: 20px; 
          font-size: 24px;
          border-bottom: 3px solid #4F46E5;
          padding-bottom: 10px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 20px 0;
        }
        .summary-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #4F46E5;
        }
        .summary-box .label {
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }
        .summary-box .value {
          font-size: 16px;
          font-weight: bold;
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid #ddd;
        }
        th { 
          background-color: #4F46E5; 
          color: white;
          font-weight: 600;
        }
        tr:hover { background-color: #f9fafb; }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-within { 
          background: #D1FAE5; 
          color: #065F46; 
        }
        .status-borderline { 
          background: #FEF3C7; 
          color: #92400E; 
        }
        .status-elevated { 
          background: #FEE2E2; 
          color: #991B1B; 
        }
        
        .overall-status {
          text-align: center;
          padding: 30px;
          margin: 30px 0;
          border: 3px solid #4F46E5;
          border-radius: 12px;
          background: #EEF2FF;
        }
        .overall-status h3 {
          font-size: 28px;
          color: #4F46E5;
          margin-bottom: 10px;
        }
        
        .recommendation-box {
          background: #EEF2FF;
          border-left: 6px solid #4F46E5;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .lifestyle-text {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          line-height: 1.8;
          margin: 20px 0;
        }
        
        .note-box {
          background: #FFFBEB;
          border-left: 6px solid #F59E0B;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <!-- Page 1: Cover -->
      <div class="page cover">
        <h1>The Proven Code</h1>
        <h2>Microbiome Health Check Report</h2>
        <div class="test-id">${testId}</div>
        <div class="patient-info">
          <p><strong>Patient:</strong> ${patient.name}</p>
          <p><strong>Age/Sex:</strong> ${patient.age} / ${patient.sex}</p>
          <p><strong>Collection Date:</strong> ${new Date(patient.collectionDate).toLocaleDateString()}</p>
          <p><strong>Report Date:</strong> ${new Date(report.reportDate).toLocaleDateString()}</p>
          ${patient.clinician ? `<p><strong>Clinician:</strong> ${patient.clinician}</p>` : ''}
          <p><strong>Version:</strong> 7.0</p>
        </div>
      </div>

      <!-- Page 2: About -->
      <div class="page">
        <h2>About the Test & Process</h2>
        <p style="margin: 20px 0;">
          The Microbiome Health Check (MHC) by The Proven Code is a functional screening tool 
          that provides a science-backed overview of your gut microbial health.
        </p>
        <h3 style="margin-top: 30px; color: #4F46E5;">Process</h3>
        <ol style="margin-left: 20px; line-height: 2;">
          <li><strong>Sample Collection</strong> at partner site</li>
          <li><strong>Cold-Chain Transport</strong> to lab</li>
          <li><strong>Laboratory Review</strong> via BiomeAnalysis360™</li>
          <li><strong>Report Generation & Review</strong></li>
        </ol>
      </div>

      <!-- Page 3: Summary -->
      <div class="page">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-box">
            <div class="label">Specimen Validity</div>
            <div class="value">✓ Valid</div>
          </div>
          <div class="summary-box">
            <div class="label">Bacterial Signal</div>
            <div class="value">${labInputs.B === 1 ? '⚠ Detected' : '✓ Not Detected'}</div>
          </div>
          <div class="summary-box">
            <div class="label">Yeast Signal</div>
            <div class="value">${labInputs.Y === 1 ? '⚠ Detected' : '✓ Not Detected'}</div>
          </div>
        </div>
        <div class="overall-status">
          <h3>${overallStatus}</h3>
          <p>Functional Status (Overall)</p>
        </div>
      </div>

      <!-- Page 4: Functional Assessment -->
      <div class="page">
        <h2>Functional Assessment</h2>
        <table>
          <thead>
            <tr>
              <th>Functional Aspect</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${generateFunctionalRows(statuses)}
          </tbody>
        </table>
      </div>

      <!-- Page 5: Recommendations -->
      <div class="page">
        <h2>Recommendations</h2>
        <div class="recommendation-box">
          <p style="font-size: 16px; font-weight: 600;">${recommendation}</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="font-size: 14px;">
            <strong>Note:</strong> Advanced Functional Microbiome Analysis is available on request 
            (typical turnaround 20–25 days).
          </p>
        </div>
      </div>

      <!-- Page 6: Lifestyle Guidance -->
      <div class="page">
        <h2>Lifestyle Guidance</h2>
        <div class="lifestyle-text">
          <p>${lifestyle}</p>
        </div>
        
        <div class="note-box">
          <p><strong>Expert Review Note:</strong> Gut health reflects diet, routine, medication, and stress. 
          If concerns persist, seek review with your clinician.</p>
        </div>
        
        <div class="footer">
          Prepared by The Proven Code | Microbiome Health Check | For clinical reference use.
        </div>
      </div>
    </body>
    </html>
  `;
};

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