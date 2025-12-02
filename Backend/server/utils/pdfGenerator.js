// server/utils/pdfGenerator.js
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------------------------------
    SIMPLE UTILITIES
--------------------------------------------------------- */
const readFileSafe = (p) => {
  try {
    return fs.readFileSync(p);
  } catch {
    return null;
  }
};

const inlineLocalImages = (html) => {
  return html.replace(/src=(["'])([^"']+)\1/g, (match, q, src) => {
    if (/^(https?:|data:)/i.test(src)) return match;
    
    // Try to find the image
    const imagePaths = [
      path.resolve(__dirname, "..", "assets", path.basename(src)),
      path.resolve(__dirname, "..", "..", "assets", path.basename(src)),
      path.resolve(process.cwd(), "assets", path.basename(src)),
    ];
    
    for (const imagePath of imagePaths) {
      const buffer = readFileSafe(imagePath);
      if (buffer) {
        const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        const base64 = buffer.toString("base64");
        return `src="data:${mimeType};base64,${base64}"`;
      }
    }
    
    console.warn("[pdfGenerator] Could not find image:", src);
    return match;
  });
};

/* ---------------------------------------------------------
    YOUR EXACT HTML PAGES
--------------------------------------------------------- */

const getPage1HTML = (report) => {
  // Your exact Page 1 HTML with template placeholders replaced
  let page1HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Lato', sans-serif;
  background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
}
.page {
    width: 100%;
    height: 100%;
    padding: 60px 40px;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.logo {
  position: absolute;
  top: 20px;
  left: 20px;
  font-family: Poppins, sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #1f8093;
  line-height: 1.2;
}
.dropper {
  width: 180px;
    position: absolute;
    top: 15px;
    left: 42%;
    opacity: 0.8;
    z-index: 1;
    transform: translateX(-14%) rotate(8deg) scaleX(-1);
    transform-origin: center;}

.drop-shadow {
    width: 68px;
    height: 20px;
    position: absolute;
    top: 183px;
    left: 44%;
    background: linear-gradient(180deg, rgba(31, 128, 147, 0.3) 0%, rgba(31, 128, 147, 0) 100%);
    border-radius: 2px;
    z-index: 1;
    filter: blur(4px);
}
.dna {
  width: 185px;
    position: absolute;
    top: -14px;
    right: -42px;
    opacity: 0.2;
    z-index: 1;
}
.microscope {
  width: 238px;
    position: absolute;
    bottom: -37px;
    left: -74px;
    opacity: 0.3;
    z-index: 1;
    transform: scaleX(-1);
    transform-origin: center;
}
.title-wrap {
  margin-top: 165px;
  text-align: center;
}
.title {
  color: #1f8093;
  font-family: Poppins, sans-serif;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.25;
}
.subtitle {
  margin-top: 5px;
  color: #808080;
  font-size: 15px;
}
.card {
  background: linear-gradient(150deg, #fff 0%, rgba(255,255,255,0.85) 100%);
  min-width: 100%;
  margin: 32px auto 0;
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #e0e6eb;
  box-shadow: 0 6px 8px -4px rgba(0,0,0,0.12);
}
.row {
  padding: 14px 0;
  border-bottom: 1px solid rgba(224,230,235,0.5);
}
.row:last-child {
  border-bottom: none;
}
.label {
  font-size: 11px;
  text-transform: uppercase;
  color: #000;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}
.value {
  font-size: 14px;
  color: #808080;
}
.row-flex {
  display: flex;
  justify-content: space-between;
}
.col {
  width: 48%;
}
.status-section {
  margin-top: 35px;
  text-align: center;
}
.status-title {
  font-size: 11px;
  color: #000;
}
.bar {
  display: flex;
  gap: 6px;
  width: 220px;
  margin: 10px auto;
}
.bar div {
  height: 6px;
  flex: 1;
  background: #1f8093;
  border-radius: 100px;
}
.done {
  font-family: Poppins, sans-serif;
  font-size: 11px;
  color: #1f8093;
  font-weight: 500;
}
.version {
  margin-top: 22px;
  text-align: center;
  font-size: 10px;
  color: #808080;
}
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo">
    <img src="../assets/provencodee.png" alt="The Proven Code">
  </div>
  <img src="../assets/dropper.png" class="dropper" />
  <div class="drop-shadow"></div>
  <img src="../assets/dna.png" class="dna" />
  <img src="../assets/microscope.png" class="microscope" />
  
  <!-- TITLE -->
  <div class="title-wrap">
    <div class="title">Microbiome Health Check<br>Report</div>
    <div class="subtitle">Functional Screening Report</div>
  </div>
  
  <!-- PATIENT CARD -->
  <div class="card">
    <div class="row">
      <div class="label">Test ID</div>
      <div class="value">${report.testId || "N/A"}</div>
    </div>
    <div class="row">
      <div class="label">Patient Name</div>
      <div class="value">${report.patient?.name || "N/A"}</div>
    </div>
    <div class="row row-flex">
      <div class="col">
        <div class="label">Age</div>
        <div class="value">${report.patient?.age || "N/A"}</div>
      </div>
      <div class="col">
        <div class="label">Sex</div>
        <div class="value">${report.patient?.sex || "N/A"}</div>
      </div>
    </div>
    <div class="row">
      <div class="label">Sample Collection Date</div>
      <div class="value">
        ${report.patient?.collectionDate ? new Date(report.patient.collectionDate).toLocaleDateString() : "—"}
      </div>
    </div>
    <div class="row">
      <div class="label">Report Generated</div>
      <div class="value">
        ${report.reportDate ? new Date(report.reportDate).toLocaleDateString() : new Date().toLocaleDateString()}
      </div>
    </div>
    ${report.patient?.clinician ? 
      `<div class="row"><div class="label">Clinician</div><div class="value">${report.patient.clinician}</div></div>` 
      : ""}
  </div>
  
  <!-- STATUS -->
  <div class="status-section">
    <div class="status-title">Report Status</div>
    <div class="bar">
      <div></div><div></div><div></div><div></div>
    </div>
    <div class="done">✓ Report Generated</div>
  </div>
  
  <div class="version">Version 7.0 | Medical Report</div>
</div>
</body>
</html>`;

  // Inline images
  return inlineLocalImages(page1HTML);
};

const getPage2HTML = () => {
  // Your exact Page 2 HTML
  let page2HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Lato', sans-serif;
  background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
}
.page {
  width: 100%;
  padding: 28px 0 40px;
  position: relative;
  overflow: visible;
  min-width: 595px;
  margin: 0 auto;
  min-height: 843px;
}
.logo {
    position: absolute;
    top: 20px;
    left: 20px;
  }
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 75px auto 25px;
  }
.section-title {
  margin-top: 10px;
  font-family: Poppins, sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #1f8093;
}
.underline {
  width: 150px;
  height: 4px;
  background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
  border-radius: 9999px;
  margin-top: 8px;
}
.info-card {
  margin-top: 30px;
  background: white;
  width: 100%;
  padding: 28px 22px;
  border-radius: 16px;
  border: 1px solid rgba(224,230,235,0.5);
  box-shadow: 0 6px 8px -4px rgba(0,0,0,0.1);
  text-align: center;
  line-height: 26px;
  font-size: 15px;
  color: #1F2933;
}
.highlight {
  color: #1f8093;
  font-weight: 600;
}
.timeline-container {
  position: relative;
  margin-top: 48px;
}
.timeline-title {
  color: #1f8093;
  font-size: 22px;
  font-family: Poppins, sans-serif;
  font-weight: 600;
  text-align: left;
  margin-bottom: 30px;
}
.timeline {
  display: flex;
  justify-content: space-between;
  width: 100%;
  position: relative;
}
.timeline-line {
  position: absolute;
  top: 30px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: linear-gradient(90deg, rgba(31,128,147,0.2), #1f8093, rgba(31,128,147,0.2));
  z-index: 1;
}
.step {
  width: 22%;
  text-align: center;
  position: relative;
  z-index: 2;
}
.icon-box {
  width: 60px;
  height: 60px;
  background: #1f8093;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: relative;
  z-index: 3;
}
.icon-box img {
  width: 30px;
  height: 30px;
}
.step-label {
  margin-top: 8px;
  font-weight: 600;
  font-size: 14px;
}
.step-card {
  background: white;
  margin-top: 10px;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(224,230,235,0.6);
  box-shadow: 0 6px 8px -4px rgba(0,0,0,0.1);
}
.step-title {
  color: #1f8093;
  font-size: 12px;
  font-weight: 600;
}
.step-desc {
  font-size: 11px;
  color: #808080;
  margin-top: 6px;
  line-height: 15px;
}
.clinical-box {
  margin-top: 48px;
  background: white;
  padding: 22px;
  border-radius: 12px;
  border-left: 4px solid #1f8093;
  border-top: 1px solid rgba(224,230,235,0.5);
  border-right: 1px solid rgba(224,230,235,0.5);
  border-bottom: 1px solid rgba(224,230,235,0.5);
  box-shadow: 0 6px 10px -4px rgba(0,0,0,0.1);
}
.clinical-title {
  font-size: 15px;
  font-weight: 700;
}
.clinical-text {
  margin-top: 6px;
  color: #808080;
  font-size: 14px;
  line-height: 20px;
}
.footer {
  margin-top: 42px;
  text-align: center;
  font-size: 11px;
  color: #808080;
}
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- PAGE NUMBER -->
  <div class="page-tag">Page 3</div>
  <div class="header-line"></div>

  <h1 class="section-title">About Your Test</h1>
  <div class="underline"></div>

  <div style="
    margin-top: 30px;
    max-width: 560px;
    margin-left: auto;
    margin-right: auto;
    padding: 30px 28px;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid rgba(224,230,235,0.5);
    box-shadow: 0 6px 8px -4px rgba(0,0,0,0.1);
    font-size: 15px;
    line-height: 26px;
    text-align: center;
    color: #1F2933;
  ">
    The <span style="color:#1f8093; font-weight:600;">
        Microbiome Health Check (MHC)
    </span>
    is a functional screening test designed to provide insights into your gut microbiome status.
    This is not a diagnostic test — it screens for patterns that may warrant attention or further investigation.
  </div>

  <div class="timeline-container">
    <div class="timeline-title">Test Process Timeline</div>

    <div class="timeline">
      <div class="timeline-line"></div>

      <div class="step">
        <div class="icon-box">
          <img src="../assets/SVG.png">
        </div>
        <div class="step-label">Step 1</div>
        <div class="step-card">
          <div class="step-title">Sample Collection</div>
          <div class="step-desc">You collect your saliva sample at home.</div>
        </div>
      </div>

      <div class="step">
        <div class="icon-box">
          <img src="../assets/SVG1.png">
        </div>
        <div class="step-label">Step 2</div>
        <div class="step-card">
          <div class="step-title">Cold-Chain Transport</div>
          <div class="step-desc">Sample shipped in controlled conditions.</div>
        </div>
      </div>

      <div class="step">
        <div class="icon-box">
          <img src="../assets/SVG2.png">
        </div>
        <div class="step-label">Step 3</div>
        <div class="step-card">
          <div class="step-title">Laboratory Analysis</div>
          <div class="step-desc">Expert lab review & testing.</div>
        </div>
      </div>

      <div class="step">
        <div class="icon-box">
          <img src="../assets/SVG3.png">
        </div>
        <div class="step-label">Step 4</div>
        <div class="step-card">
          <div class="step-title">Report Generation</div>
          <div class="step-desc">Your personalized report is ready.</div>
        </div>
      </div>
    </div>
  </div>

  <div class="clinical-box">
    <div class="clinical-title">Clinical Reference Use</div>
    <div class="clinical-text">
      Raw laboratory data is not included in this patient-facing report.
      All findings are presented in functional terms for clinical interpretation.
    </div>
  </div>

  <div style="width: 100%; height: 1px; background: rgba(31,128,147,0.2); margin: 40px auto 20px;"></div>

  <div class="footer">
    Microbiome Health Check Report — Version 7.0
  </div>
</div>
</body>
</html>`;

  // Inline images
  return inlineLocalImages(page2HTML);
};

const getPage3HTML = (report) => {
  // Your Page 3 HTML with Table of Content
  let page3HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 100%;
    padding: 28px 0 40px;
    position: relative;
    overflow: visible;
    max-width: 600px;
    margin: 0 auto;
  }
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
  }
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 75px auto 25px;
  }
  .title {
    font-family: 'Poppins', sans-serif;
    font-size: 32px;
    font-weight: 600;
    color: #1f8093;
  }
  .underline {
    width: 150px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-top: 8px;
  }
  .toc-wrapper {
    margin-top: 50px;
    width: 100%;
    padding: 0 20px;
  }
  .toc-box {
    padding: 20px;
    border-radius: 14px;
    border: 1px solid rgba(31, 128, 147, 0.3);
    margin-bottom: 16px;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    box-shadow: 0 3px 10px rgba(31, 128, 147, 0.1);
  }
  .toc-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .icon-square {
    width: 48px;
    height: 48px;
    background: rgba(31,128,147,0.10);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .dummy-icon {
    width: 24px;
    height: 24px;
    border-radius: 4px;
  }
  .toc-title {
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    color: #000;
    font-weight: 500;
  }
  .toc-page {
    font-size: 24px;
    color: #1f8093;
    font-family: 'Poppins', sans-serif;
    margin-right: 4px;
    font-weight: 500;
  }
  .footer-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 45px auto 16px;
  }
  .footer {
    text-align: center;
    font-size: 11px;
    color: #808080;
    font-family: 'Poppins', sans-serif;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- PAGE NUMBER -->
  <div class="page-tag">Page 3</div>
  <div class="header-line"></div>
  <div class="title">Table Of Content</div>
  <div class="underline"></div>
  <div class="toc-wrapper">
    <!-- Row 1 -->
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about1.png" alt=""></div>
        </div>
        <div class="toc-title">About Your Test</div>
      </div>
      <div class="toc-page">${report._toc?.aboutTest || "3"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about2.png" alt=""></div>
        </div>
        <div class="toc-title">Your Snapshot</div>
      </div>
      <div class="toc-page">${report._toc?.snapshot || "4"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about3.png" alt=""></div>
        </div>
        <div class="toc-title">What We Observed</div>
      </div>
      <div class="toc-page">${report._toc?.observed || "5"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about4.png" alt=""></div>
        </div>
        <div class="toc-title">Your Functional Areas</div>
      </div>
      <div class="toc-page">${report._toc?.functionalAreas || "6"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about5.png" alt=""></div>
        </div>
        <div class="toc-title">Clinical Summary</div>
      </div>
      <div class="toc-page">${report._toc?.clinicalSummary || "7"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about6.png" alt=""></div>
        </div>
        <div class="toc-title">Next Step</div>
      </div>
      <div class="toc-page">${report._toc?.nextStep || "8"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about7.png" alt=""></div>
        </div>
        <div class="toc-title">Personalized Guidance</div>
      </div>
      <div class="toc-page">${report._toc?.guidance || "9"}</div>
    </div>
    <div class="toc-box">
      <div class="toc-left">
        <div class="icon-square">
          <div class="dummy-icon"><img src="../assets/about8.png" alt=""></div>
        </div>
        <div class="toc-title">Expert Review</div>
      </div>
      <div class="toc-page">${report._toc?.expertReview || "10"}</div>
    </div>
  </div>
  <div class="footer-line"></div>
  <div class="footer">Microbiome Health Check Report — Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page3HTML);
};

const getPage4HTML = (report) => {
  // Your Page 4 HTML with Snapshot
  let page4HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />
<style>
    * { box-sizing: border-box; }
    body {
        margin: 0; padding: 0;
        font-family: "Poppins", sans-serif;
        background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
        min-height: 100vh;
    }
    .page {
        width: 595px;
        min-height: 842px;
        margin: 0 auto;
        position: relative;
        overflow: visible;
        background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
        padding-bottom: 70px;
    }
    .logo {
    position: absolute;
    top: 20px;
    left: 20px;
  }
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 75px auto 25px;
  }
    .page-badge {
        background: rgba(31,128,147,0.08);
        padding: 6px 20px; border-radius: 9999px;
        color: #7a9ba5; font-size: 13px; font-weight: 500;
    }
    .title-block { margin-top: 36px; padding-left: 20px; }
    .title { color: #1f8093; font-size: 36px; font-weight: 600; }
    .underline {
        width: 100px; height: 4px; margin-top: 8px;
        background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.3));
        border-radius: 999px;
    }
    /* SNAPSHOT CARDS */
    .snapshot-row { display: flex; gap: 20px; justify-content: center; margin-top: 32px; padding: 0 20px; }
    .cardy {
        width: 270px; background: white; border-radius: 14px;
        border: 1px solid rgba(224,230,235,0.5);
        box-shadow: 0 4px 12px rgba(31,128,147,0.08);
        padding: 24px;
    }
    .card-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; font-weight: 500; margin-bottom: 20px; color: #333;
    }
    .sq-icon { width: 20px; height: 20px; border-radius: 4px; flex-shrink: 0; }
    .status-box {
        background: rgba(248,250,252,0.8);
        border-left: 3px solid #1f8093;
        border-radius: 8px;
        padding: 12px 14px; margin-bottom: 12px;
    }
    .status-label { font-size: 9px; text-transform: uppercase; margin-bottom: 6px; color: #555; }
    .pill {
        padding: 5px 12px; border-radius: 999px;
        font-size: 11px; display: inline-block; font-weight: 500;
    }
    .green { background: #d8ffe6; color: #21c45d; }
    .red { background: #fedfdf; color: #e92b2b; }
    .orange { background: #fef5e7; color: #fe7b02; }
    /* CIRCLE */
    .circle-wrap { width: 140px; height: 140px; margin: 20px auto; position: relative; }
    .circle-bg {
        width: 100px; height: 100px; position: absolute; top: 20px; left: 20px;
        border-radius: 50%; border: 10px solid #f3f5f7;
    }
    .circle-progress {
        width: 100px; height: 100px; position: absolute; top: 20px; left: 20px;
        border-radius: 50%;
        border: 10px solid #1f8093;
        border-bottom-color: #f3f5f7; border-left-color: #f3f5f7;
    }
    .circle-number {
        position: absolute; top: 58px; width: 100%; text-align: center;
        color: #fe7b02; font-size: 24px; font-weight: 700;
    }
    .circle-label { text-align: center; margin-top: 10px; }
    /* SUMMARY */
    .summary-card {
        width: 555px; margin: 32px auto 0 auto;
        background: white; border-radius: 12px;
        border: 1px solid rgba(224,230,235,0.5);
        padding: 22px 26px; box-shadow: 0 4px 10px rgba(31,128,147,0.06);
    }
    .summary-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; font-weight: 600; color: #333; margin-bottom: 14px;
    }
    .summary-text { font-size: 12px; line-height: 20px; color: #666; }
    /* NEXT STEP */
    .next-step {
        width: 555px; margin: 20px auto 0 auto;
        background: linear-gradient(90deg, rgba(31,128,147,0.08), rgba(31,128,147,0.03));
        border-left: 4px solid #1f8093; border-radius: 10px;
        padding: 18px 26px;
    }
    .next-title { font-size: 14px; font-weight: 700; color: #1f8093; margin-bottom: 8px; }
    .next-text { font-size: 12px; line-height: 20px; color: #555; }
    .footer-line {
        width: calc(100% - 40px); height: 1px;
        background: rgba(31,128,147,0.25);
        position: absolute; bottom: 50px; left: 20px;
    }
    .footer {
        width: 100%; text-align: center;
        position: absolute; bottom: 22px;
        font-size: 10px; color: #7a9ba5;
    }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- PAGE NUMBER -->
  <div class="page-tag">Page 4</div>
  <div class="header-line"></div>
    <!-- TITLE -->
    <div class="title-block">
        <div class="title">Your Snapshot</div>
        <div class="underline"></div>
    </div>
    <!-- SNAPSHOT ROW -->
    <div class="snapshot-row">
        <!-- LEFT CARD -->
        <div class="cardy">
            <div class="card-title">
                <div class="sq-icon">
                    <img src="../assets/okay.png" alt="">
                </div>
                Specimen Status
            </div>
            <!-- SPECIMEN VALIDITY -->
            <div class="status-box">
                <div class="status-label">Specimen Validity</div>
                <div class="pill ${report.labInputs?.V === 1 ? 'green' : 'red'}">
                    ${report.labInputs?.V === 1 ? 'Valid' : 'Invalid'}
                </div>
            </div>
            <!-- BACTERIAL -->
            <div class="status-box">
                <div class="status-label">Bacterial Signal</div>
                <div class="pill ${report.labInputs?.B > 0 ? 'red' : 'green'}">
                    ${report.labInputs?.B > 0 ? 'Detected' : 'Not Detected'}
                </div>
            </div>
            <!-- YEAST -->
            <div class="status-box">
                <div class="status-label">Yeast Signal</div>
                <div class="pill ${report.labInputs?.Y > 0 ? 'red' : 'green'}">
                    ${report.labInputs?.Y > 0 ? 'Detected' : 'Not Detected'}
                </div>
            </div>
        </div>
        <!-- RIGHT CARD -->
        <div class="cardy">
            <div class="card-title">
                <div class="sq-icon">
                    <img src="../assets/okay1.png" alt="">
                </div>
                Functional Status
            </div>
            <!-- CIRCLE -->
            <div class="circle-wrap">
                <div class="circle-bg"></div>
                <div class="circle-progress"
                    style="transform: rotate(${(report.functionalPercent || 0) * 1.8}deg);">
                </div>
                <div class="circle-number">${report.functionalPercent || 0}%</div>
            </div>
            <!-- LABEL -->
            <div class="circle-label">
                <div class="pill 
                  ${report.calculatedData?.overallStatus === 'Balanced' ? 'green' : ''}
                  ${report.calculatedData?.overallStatus === 'Mild Imbalance' ? 'orange' : ''}
                  ${report.calculatedData?.overallStatus === 'Moderate Dysbiosis' ? 'red' : ''}
                  ${report.calculatedData?.overallStatus === 'Significant Dysbiosis' ? 'red' : ''}
                ">
                  ${report.calculatedData?.overallStatus}
                </div>

            </div>
        </div>
    </div>
    <!-- SUMMARY -->
    <div class="summary-card">
        <div class="summary-title">
            <div class="sq-icon" style="background:rgba(31,128,147,0.08);">
                <img src="../assets/okay.png" alt="">
            </div>
            Summary Observation
        </div>
        <div class="summary-text">
            ${report.summaryObservation || "Your microbiome analysis shows moderate functional balance with specific areas requiring attention for optimal gut health."}
        </div>
    </div>
    <!-- NEXT STEP -->
    <div class="next-step">
        <div class="next-title">Suggested Next Step</div>
        <div class="next-text">
            ${report.calculatedData?.recommendation || "Consider implementing targeted dietary adjustments and lifestyle modifications based on your specific functional findings."}
        </div>
    </div>
    <div class="footer-line"></div>
    <div class="footer">Microbiome Health Check Report – Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page4HTML);
};

const getPage5HTML = (report) => {
  // Your Page 5 HTML with Observations
  let page5HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 1122px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
  }
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
  }
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
  }
  .title {
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-top: 8px;
    margin-left: 16px;
  }
  .observation-wrapper {
    margin-top: 30px;
    padding: 0 16px;
  }
  .obs-card {
    background: white;
    border-radius: 14px;
    border: 1px solid rgba(224,230,235,0.5);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 3px 10px rgba(31,128,147,0.08);
    border-left: 4px solid #1f8093;
  }
  .obs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .obs-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .icon-circle {
    width: 44px;
    height: 44px;
    background: rgba(31,128,147,0.1);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .icon-circle svg {
    width: 24px;
    height: 24px;
    stroke: #1f8093;
    stroke-width: 2;
    fill: none;
  }
  .obs-title {
    font-size: 16px;
    font-weight: 600;
    color: #000;
  }
  .status-badge {
    padding: 6px 16px;
    border-radius: 9999px;
    background: #fedfdf;
    color: #e92b2b;
    font-size: 12px;
    font-weight: 500;
  }
  .obs-description {
    font-size: 12px;
    color: #555;
    line-height: 1.6;
    margin-bottom: 10px;
  }
  .progress-bar {
    width: 100%;
    height: 6px;
    background: #e8f6f8;
    border-radius: 9999px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #1f8093;
    border-radius: 9999px;
  }
  .clinical-ref {
    background: rgba(31,128,147,0.05);
    border-radius: 14px;
    border: 1px solid rgba(31,128,147,0.2);
    padding: 20px;
    margin-top: 16px;
    border-left: 4px solid #1f8093;
  }
  .clinical-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }
  .clinical-title {
    font-size: 15px;
    font-weight: 600;
  }
  .clinical-text {
    font-size: 12px;
    color: #555;
    line-height: 1.7;
  }
  .footer-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    position: absolute;
    bottom: 50px;
  }
  .footer {
    text-align: center;
    font-size: 11px;
    color: #808080;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo">
    <img src="../assets/provencodee.png" alt="The Proven Code">
  </div>
  <!-- Page number -->
  <div class="page-tag">Page 5</div>
  <div class="header-line"></div>
  <div class="title">What We Observed</div>
  <div class="underline"></div>
  <div class="observation-wrapper">
    <!-- Observation 1: Specimen Validity -->
    <div class="obs-card">
      <div class="obs-header">
        <div class="obs-left">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12l3 3 5-5"/>
            </svg>
          </div>
          <div class="obs-title">Specimen Validity</div>
        </div>
        <div class="status-badge">
          ${report.calculatedData?.specimenStatus || "Invalid"}
        </div>
      </div>
      <div class="obs-description">
        ${report.calculatedData?.specimenDescription || "Specimen analysis indicates potential issues with sample collection or handling."}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.calculatedData?.specimenPercent || 30}%;"></div>
      </div>
    </div>
    <!-- Observation 2: Bacterial Signal -->
    <div class="obs-card">
      <div class="obs-header">
        <div class="obs-left">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"/>
              <circle cx="6" cy="8" r="2"/>
              <circle cx="18" cy="8" r="2"/>
              <circle cx="6" cy="16" r="2"/>
              <circle cx="18" cy="16" r="2"/>
            </svg>
          </div>
          <div class="obs-title">Bacterial Signal</div>
        </div>
        <div class="status-badge">
          ${report.calculatedData?.bacterialStatus || "Detected"}
        </div>
      </div>
      <div class="obs-description">
        ${report.calculatedData?.bacterialDescription || "Bacterial signal indicates presence of bacterial activity in the sample."}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.calculatedData?.bPercent || 60}%;"></div>
      </div>
    </div>
    <!-- Observation 3: Yeast Signal -->
    <div class="obs-card">
      <div class="obs-header">
        <div class="obs-left">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <circle cx="8" cy="10" r="1.5"/>
              <circle cx="16" cy="10" r="1.5"/>
            </svg>
          </div>
          <div class="obs-title">Yeast Signal</div>
        </div>
        <div class="status-badge">
          ${report.calculatedData?.yeastStatus || "Not Detected"}
        </div>
      </div>
      <div class="obs-description">
        ${report.calculatedData?.yeastDescription || "Yeast signal analysis shows no significant yeast presence."}
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.calculatedData?.yPercent || 20}%;"></div>
      </div>
    </div>
    <!-- Clinical Reference -->
    <div class="clinical-ref">
      <div class="clinical-header">
        <div class="icon-circle" style="width: 36px; height: 36px;">
          <svg viewBox="0 0 24 24" style="width: 20px; height: 20px;">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <div class="clinical-title">Clinical Reference</div>
      </div>
      <div class="clinical-text">
        These observations represent laboratory screening results and do not constitute a medical diagnosis.
        Consult your healthcare provider for clinical interpretation.
      </div>
    </div>
  </div>
  <div class="footer-line"></div>
  <div class="footer">Microbiome Health Check Report — Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page5HTML);
};

const getPage6HTML = (report) => {
  // Your Page 6 HTML with Functional Assessment
  let page6HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 900px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
  }
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
  }
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
  }
  .title {
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
    margin-top: 0;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-top: 8px;
    margin-left: 16px;
  }
  .functional-wrapper {
    margin-top: 30px;
    padding: 0 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .func-card {
    background: white;
    border-radius: 10px;
    padding: 12px 20px;
    box-shadow: 0 3px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  /* Dynamic border colors */
  .green { border-left: 3px solid #00C448; }
  .orange { border-left: 3px solid #FE7B02; }
  .red { border-left: 3px solid #F34E1B; }
  .func-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .func-icon {
    width: 44px;
    height: 44px;
    background: rgba(31,128,147,0.1);
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .func-icon svg {
    width: 22px;
    height: 22px;
    stroke: #1f8093;
    stroke-width: 2;
    fill: none;
  }
  .func-title {
    font-size: 14px;
    font-weight: 500;
  }
  .func-status {
    display: flex;
    justify-content: flex-end;
  }
  .status-pill {
    padding: 3px 10px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 500;
  }
  .status-pill.green { color: #00C448; background: #E8F9EE; }
  .status-pill.orange { color: #FE7B02; background: #FFF3E8; }
  .status-pill.red { color: #F34E1B; background: #FFE9E6; }
  .footer-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    position: absolute;
    bottom: 50px;
  }
  .footer {
    text-align: center;
    font-size: 11px;
    color: #808080;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <div class="logo">
    <img src="../assets/provencodee.png" alt="The Proven Code">
  </div>
  <div class="page-tag">Page 6</div>
  <div class="header-line"></div>
  <div class="title">Functional Assessment</div>
  <div class="underline"></div>
  <div class="functional-wrapper">
    <!-- CARD 1 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS1 || "green"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="func-title">Digestive Rhythm</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS1 || "green"}">
          ${report.calculatedData?.statuses?.FS1 || "Within Range"}
        </div>
      </div>
    </div>
    <!-- CARD 2 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS2 || "orange"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L12 22M8 6L16 6M8 10L16 10M10 14L14 14"/>
          </svg>
        </div>
        <div class="func-title">Fermentation Load</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS2 || "orange"}">
          ${report.calculatedData?.statuses?.FS2 || "Borderline"}
        </div>
      </div>
    </div>
    <!-- CARD 3 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS3 || "red"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3"/>
            <circle cx="6" cy="16" r="2"/>
            <circle cx="18" cy="16" r="2"/>
            <circle cx="12" cy="18" r="1.5"/>
          </svg>
        </div>
        <div class="func-title">Bacterial Balance</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS3 || "red"}">
          ${report.calculatedData?.statuses?.FS3 || "Elevated"}
        </div>
      </div>
    </div>
    <!-- CARD 4 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS4 || "green"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/>
            <path d="M8 12L12 16M16 12L12 16"/>
          </svg>
        </div>
        <div class="func-title">Yeast Balance</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS4 || "green"}">
          ${report.calculatedData?.statuses?.FS4 || "Within Range"}
        </div>
      </div>
    </div>
    <!-- CARD 5 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS5 || "orange"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L4 6v6c0 5 3 9 8 11 5-2 8-6 8-11V6l-8-4z"/>
          </svg>
        </div>
        <div class="func-title">Immune Tone</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS5 || "orange"}">
          ${report.calculatedData?.statuses?.FS5 || "Borderline"}
        </div>
      </div>
    </div>
    <!-- CARD 6 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS6 || "green"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 9h.01M16 9h.01M9 14h6"/>
          </svg>
        </div>
        <div class="func-title">Gut- Brain Stress</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS6 || "green"}">
          ${report.calculatedData?.statuses?.FS6 || "Within Range"}
        </div>
      </div>
    </div>
    <!-- CARD 7 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS7 || "red"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div class="func-title">Circadian Sleep</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS7 || "red"}">
          ${report.calculatedData?.statuses?.FS7 || "Elevated"}
        </div>
      </div>
    </div>
    <!-- CARD 8 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS8 || "orange"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/>
          </svg>
        </div>
        <div class="func-title">Diet Quality</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS8 || "orange"}">
          ${report.calculatedData?.statuses?.FS8 || "Borderline"}
        </div>
      </div>
    </div>
    <!-- CARD 9 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS9 || "green"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
        </div>
        <div class="func-title">Medication Impact</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS9 || "green"}">
          ${report.calculatedData?.statuses?.FS9 || "Within Range"}
        </div>
      </div>
    </div>
    <!-- CARD 10 -->
    <div class="func-card ${report.calculatedData?.statusColors?.FS10 || "red"}">
      <div class="func-header">
        <div class="func-icon">
          <svg viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
          </svg>
        </div>
        <div class="func-title">Hydration Recovery</div>
      </div>
      <div class="func-status">
        <div class="status-pill ${report.calculatedData?.statusColors?.FS10 || "red"}">
          ${report.calculatedData?.statuses?.FS10 || "Elevated"}
        </div>
      </div>
    </div>
  </div>
  <div class="footer-line"></div>
  <div class="footer">Microbiome Health Check Report — Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page6HTML);
};
const getPage7HTML = (report) => {
  // Your Page 7 HTML with Clinical Summary
  let page7HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 842px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
  }
  /* LOGO */
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #1f8093;
    line-height: 1.2;
  }
  /* PAGE TAG */
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  /* HEADER LINE */
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
  }
  /* TITLE */
  .title {
    font-family: 'Poppins', sans-serif;
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
    margin-top: 0;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-top: 8px;
    margin-left: 16px;
  }
  /* CONTENT WRAPPER */
  .content-wrapper {
    margin-top: 30px;
    padding: 0 16px;
  }
  /* INTERPRETIVE NARRATIVE BOX */
  .narrative-box {
    background: white;
    border-radius: 12px;
    border: 2px solid #e0e6eb;
    padding: 20px 28px;
    margin-bottom: 20px;
  }
  .narrative-title {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #1f8093;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }
  .narrative-text {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    color: #000;
    line-height: 1.6;
  }
  /* IMPORTANT NOTE BOX */
  .note-box {
    background: rgba(243, 245, 247, 0.6);
    border-radius: 10px;
    border-left: 4px solid #1f8093;
    padding: 18px 24px;
    display: flex;
    gap: 14px;
  }
  .note-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .note-icon svg {
    width: 20px;
    height: 20px;
    fill: #1f8093;
  }
  .note-content {
    flex: 1;
  }
  .note-title {
    font-family: 'Poppins', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #000;
    margin-bottom: 8px;
  }
  .note-text {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    color: #121212;
    line-height: 1.5;
  }
  /* FOOTER LINE */
  .footer-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    position: absolute;
    bottom: 50px;
  }
  /* FOOTER */
  .footer {
    text-align: center;
    font-size: 11px;
    color: #808080;
    font-family: 'Poppins', sans-serif;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- Page number -->
  <div class="page-tag">Page 7</div>
  <!-- Header line -->
  <div class="header-line"></div>
  <!-- Title -->
  <div class="title">Clinical Summary</div>
  <div class="underline"></div>
  <!-- CONTENT -->
  <div class="content-wrapper">
    <!-- Interpretive Narrative -->
    <div class="narrative-box">
      <div class="narrative-title">Interpretive Narrative</div>
      <div class="narrative-text">
        ${report.clinicalSummary?.narrative || "Your screening reveals mild functional imbalance with detected bacterial and yeast signals, primarily affecting fermentation load, sleep quality, and dietary patterns. This pattern typically responds well to targeted lifestyle modifications within 4-6 weeks."}
      </div>
    </div>
    <!-- Important Note -->
    <div class="note-box">
      <div class="note-icon">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L12 16M12 20L12 22"/>
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="note-content">
        <div class="note-title">Important Note</div>
        <div class="note-text">
          Interpretation Note: This summary is generated based on your laboratory signals and questionnaire responses. It reflects functional patterns and is not a medical diagnosis. Always consult with a healthcare provider for medical advice.
        </div>
      </div>
    </div>
  </div>
  <!-- Footer line -->
  <div class="footer-line"></div>
  <!-- Footer -->
  <div class="footer">Microbiome Health Check Report — Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page7HTML);
};

const getPage8HTML = (report) => {
  const durationMap = {
  "Balanced": "No structured reset required",
  "Mild Imbalance": "4-week reset routine recommended",
  "Moderate Dysbiosis": "Structured 4-week plan + clinician review",
  "Significant Dysbiosis": "Advanced analysis recommended"
};
  // Your Page 8 HTML with Recommendations
  let page8HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Lato', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 842px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
  }
  /* LOGO */
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #1f8093;
    line-height: 1.1;
  }
  /* PAGE TAG */
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Lato', sans-serif;
  }
  /* HEADER LINE - FIXED */
  .header-line {
    width: 100%;
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
  }
  /* TITLE */
  .title {
    font-family: 'Poppins', sans-serif;
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
    margin-top: 0;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-top: 8px;
    margin-left: 16px;
  }
  /* CONTENT WRAPPER */
  .content-wrapper {
    margin-top: 30px;
    padding: 0 16px;
  }
  /* MAIN RECOMMENDATION BOX */
  .rec-box {
    background: linear-gradient(159deg, #FEF5E7 0%, rgba(254, 245, 231, 0.5) 100%);
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 20px;
    box-shadow: 0 6px 8px -4px rgba(0,0,0,0.05);
    border: 1px solid rgba(254, 245, 231, 0.8);
  }
  .rec-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .rec-icon {
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.5);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .icon-outline {
    width: 27px;
    height: 27px;
    border: 2px solid #FE7B02;
    border-radius: 2px;
    position: relative;
  }
  .rec-title {
    font-family: 'Lato', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #000;
    line-height: 1.2;
  }
  .rec-description {
    background: rgba(255,255,255,0.3);
    border-radius: 9px;
    padding: 14px 18px;
    margin-bottom: 14px;
    backdrop-filter: blur(3px);
  }
  .rec-text {
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    color: #000;
    line-height: 1.6;
  }
  .check-item {
    background: rgba(255,255,255,0.5);
    border-radius: 9px;
    padding: 8px 15px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .check-icon {
    width: 18px;
    height: 18px;
    border: 1.5px solid #1f8093;
    border-radius: 2px;
    position: relative;
    flex-shrink: 0;
  }
  .check-icon::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 6px;
    border: solid #1f8093;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
    left: 6px;
    top: 3px;
  }
  .check-text {
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    color: #1f8093;
    font-weight: 500;
  }
  /* ADVANCED ANALYSIS BOX */
  .advanced-box {
    background: linear-gradient(175deg, rgba(31,128,147,0.1) 0%, rgba(31,128,147,0.05) 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .adv-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .adv-icon {
    width: 38px;
    height: 38px;
    background: rgba(31,128,147,0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .square-icon {
    width: 19px;
    height: 19px;
    background: #1f8093;
  }
  .adv-content {
    flex: 1;
  }
  .adv-title {
    font-family: 'Lato', sans-serif;
    font-size: 19px;
    font-weight: 600;
    color: #000;
    margin-bottom: 8px;
  }
  .adv-text {
    font-family: 'Lato', sans-serif;
    font-size: 12px;
    color: #000;
    line-height: 1.7;
  }
  .adv-bold {
    font-weight: 700;
  }
  /* IMPORTANT NOTE BOX */
  .important-box {
    background: rgba(243, 245, 247, 0.5);
    border-radius: 11px;
    border-left: 4px solid #1f8093;
    padding: 22px 26px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .imp-header {
    display: flex;
    align-items: flex-start;
    gap: 11px;
  }
  .imp-icon {
    width: 19px;
    height: 21px;
    padding-top: 2px;
  }
  .imp-icon-inner {
    width: 19px;
    height: 19px;
    position: relative;
  }
  .imp-icon-box {
    width: 16px;
    height: 16px;
    border: 1.6px solid #1f8093;
    border-radius: 2px;
    position: absolute;
    left: 2px;
    top: 2px;
  }
  .imp-icon-check {
    width: 5px;
    height: 3px;
    border: solid #1f8093;
    border-width: 0 1.6px 1.6px 0;
    transform: rotate(45deg);
    position: absolute;
    left: 7px;
    top: 8px;
  }
  .imp-text {
    font-family: 'Lato', sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #1F2933;
    padding-right: 8px;
  }
  .imp-bold {
    font-weight: 700;
    color: #000;
  }
  /* FOOTER LINE */
  .footer-line {
    width: 100%;
    height: 2px;
    background: rgba(31,128,147,0.3);
    position: absolute;
    bottom: 68px;
    left: 0;
  }
  /* FOOTER */
  .footer {
    text-align: center;
    font-size: 12px;
    color: #808080;
    font-family: 'Lato', sans-serif;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- Page number -->
  <div class="page-tag">Page 8</div>
  <!-- Header line -->
  <div class="header-line"></div>
  <!-- Title -->
  <div class="title">Recommendations</div>
  <div class="underline"></div>
  <!-- CONTENT -->
  <div class="content-wrapper">
    <!-- Main Recommendation Box -->
    <div class="rec-box">
      <div class="rec-header">
        <div class="rec-icon">
          <div class="icon-outline"></div>
        </div>
        <div class="rec-title">Begin a Microbiome Reset Routine</div>
      </div>
      <div class="rec-description">
        <div class="rec-text">
          ${report.calculatedData?.recommendation || "Your prANJAL indicates mild imbalance. We recommend beginning a 4 week microbiome reset routine focusing on dietary modifications, stress management, and sleep hygiene. Follow the lifestyle guidance provided in this report."}
        </div>
      </div>
      <div class="check-item">
        <div class="check-icon"></div>
        <div class="check-text">${durationMap[report.calculatedData?.overallStatus] || "4-week reset PRANJAL routine recommended"}</div>
      </div>
    </div>
    <!-- Advanced Analysis Box -->
    <div class="advanced-box">
      <div class="adv-header">
        <div class="adv-icon">
          <div class="square-icon"></div>
        </div>
        <div class="adv-content">
          <div class="adv-title">Want Advanced Analysis?</div>
          <div class="adv-text">
            ${report.recommendations?.advancedAnalysisText || "For those seeking deeper insights into their microbiome composition and function, our <span class='adv-bold'>Advanced Functional Microbiome Analysis</span> is available on request. (typical turnaround 20–25 days)."}
          </div>
        </div>
      </div>
    </div>
    <!-- Important Note Box -->
    <div class="important-box">
      <div class="imp-header">
        <div class="imp-icon">
          <div class="imp-icon-inner">
            <div class="imp-icon-box"></div>
            <div class="imp-icon-check"></div>
          </div>
        </div>
        <div class="imp-text">
          <span class="imp-bold">Important:</span> These recommendations are based on functional screening and should not replace medical advice. Please consult with your healthcare provider before making significant changes to your health routine.
        </div>
      </div>
    </div>
  </div>
  <!-- Footer line -->
  <div class="footer-line"></div>
  <!-- Footer -->
  <div class="footer">Microbiome Health Check Report - Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page8HTML);
};
const getPage9HTML = (report) => {

  console.log("PAGE 9 — FULL REPORT:", report);
console.log("PAGE 9 — KEY INSIGHT:", report.calculatedData?.keyInsight);
  // Your Page 9 HTML with Lifestyle Guidance
  let page9HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 842px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
    overflow: hidden;
  }
  /* LOGO */
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #1f8093;
    line-height: 1.1;
  }
  /* PAGE TAG */
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  /* HEADER LINE */
  .header-line {
    width: calc(100% - 32px);
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
    margin-left: 16px;
    margin-right: 16px;
  }
  /* TITLE */
  .title {
    font-family: 'Poppins', sans-serif;
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
    margin-top: 0;
    margin-bottom: 8px;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-left: 16px;
    margin-bottom: 20px;
  }
  /* CONTENT WRAPPER */
  .content-wrapper {
    margin-top: 10px;
    padding: 0 16px;
    height: 570px;
  }
  /* ICONS ROW */
  .icons-row {
    display: flex;
    justify-content: space-between;
    margin: 10px 0 20px;
    gap: 16px;
  }
  .icon-container {
    width: 48px;
    height: 48px;
    background: rgba(31,128,147,0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .icon {
    width: 24px;
    height: 24px;
    position: relative;
  }
  .icon-part {
    position: absolute;
    outline: 2px solid #1f8093;
    outline-offset: -1px;
  }
  /* MAIN GUIDANCE BOX */
  .guidance-box {
    background: linear-gradient(148deg, #FCFBF8 0%, white 50%, #C8E4EA 100%);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 20px;
    height: 320px;
    overflow: hidden;
  }
  .guidance-text {
    font-family: 'Poppins', sans-serif;
    font-size: 11.5px;
    line-height: 1.7;
    color: #000;
    margin: 0;
  }
  .guidance-bold {
    font-weight: 700;
  }
  /* KEY INSIGHT BOX */
  .insight-box {
    background: linear-gradient(90deg, rgba(31,128,147,0.1) 0%, rgba(31,128,147,0.05) 50%, rgba(31,128,147,0) 100%);
    border-radius: 12px;
    border-left: 4px solid #1f8093;
    padding: 16px 24px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-top: 10px;
    height: 110px;
  }
  .insight-icon {
    width: 33px;
    height: 33px;
    background: rgba(31,128,147,0.2);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .insight-icon-inner {
    width: 16px;
    height: 16px;
    position: relative;
  }
  .insight-icon-square {
    width: 8px;
    height: 8px;
    outline: 1.4px solid #1f8093;
    outline-offset: -0.7px;
    position: absolute;
    left: 4px;
    top: 1px;
  }
  .insight-content {
    flex: 1;
  }
  .insight-title {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #000;
    margin-bottom: 6px;
  }
  .insight-text {
    font-family: 'Poppins', sans-serif;
    font-size: 13.5px;
    color: #000;
    line-height: 1.5;
    margin: 0;
  }
  /* FOOTER LINE */
  .footer-line {
    width: calc(100% - 32px);
    height: 2px;
    background: rgba(31,128,147,0.3);
    position: absolute;
    bottom: 68px;
    left: 16px;
    right: 16px;
  }
  /* FOOTER */
  .footer {
    text-align: center;
    font-size: 12px;
    color: #808080;
    font-family: 'Poppins', sans-serif;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- Page number -->
  <div class="page-tag">Page 9</div>
  <!-- Header line -->
  <div class="header-line"></div>
  <!-- Title -->
  <div class="title">Lifestyle Guidance</div>
  <div class="underline"></div>
  <!-- CONTENT -->
  <div class="content-wrapper">
    <!-- Icons Row -->
    <div class="icons-row">
      <!-- Icon 1 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 8px; height: 9px; left: 3px; top: 2px;"></div>
          <div class="icon-part" style="width: 5px; height: 20px; left: 16px; top: 2px;"></div>
        </div>
      </div>
      <!-- Icon 2 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 18px; height: 18px; left: 3px; top: 3px;"></div>
        </div>
      </div>
      <!-- Icon 3 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 8px; height: 11px; left: 3px; top: 5px;"></div>
          <div class="icon-part" style="width: 12px; height: 19px; left: 9px; top: 3px;"></div>
        </div>
      </div>
      <!-- Icon 4 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 10px; height: 20px; left: 2px; top: 2px;"></div>
          <div class="icon-part" style="width: 10px; height: 20px; left: 12px; top: 2px;"></div>
          <div class="icon-part" style="width: 6px; height: 4px; left: 9px; top: 9px;"></div>
        </div>
      </div>
      <!-- Icon 5 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 20px; height: 20px; left: 2px; top: 2px;"></div>
        </div>
      </div>
      <!-- Icon 6 -->
      <div class="icon-container">
        <div class="icon">
          <div class="icon-part" style="width: 12px; height: 12px; left: 6px; top: 2px;"></div>
        </div>
      </div>
    </div>
    <!-- Main Guidance Box -->
    <div class="guidance-box">
      <div class="guidance-text">
      ${report.calculatedData.lifestyle}

      </div>
    </div>
    <!-- Key Insight Box -->
    <div class="insight-box">
      <div class="insight-icon">
        <div class="insight-icon-inner">
          <div class="insight-icon-square"></div>
        </div>
      </div>
      <div class="insight-content">
        <div class="insight-title">Key Insight</div>
       <div class="insight-text">${report.calculatedData.keyInsight}</div>

      </div>
    </div>
  </div>
  <!-- Footer line -->
  <div class="footer-line"></div>
  <!-- Footer -->
  <div class="footer">Microbiome Health Check Report - Version 7.0</div>
</div>
</body>
</html>`;

  return inlineLocalImages(page9HTML);
};


const getPage10HTML = (report) => {
  // Your Page 10 HTML with Expert Review
  let page10HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
<style>
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
  }
  .page {
    width: 595px;
    height: 842px;
    margin: 0 auto;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #e5fcff 100%);
    padding-top: 80px;
    overflow: hidden;
  }
  /* LOGO */
  .logo {
    position: absolute;
    top: 20px;
    left: 20px;
    font-family: 'Poppins', sans-serif;
    font-size: 22px;
    font-weight: 600;
    color: #1f8093;
    line-height: 1.1;
  }
  /* PAGE TAG */
  .page-tag {
    position: absolute;
    top: 22px;
    right: 22px;
    background: rgba(31,128,147,0.08);
    padding: 6px 22px;
    border-radius: 9999px;
    font-size: 14px;
    color: #7e8c9a;
    font-family: 'Poppins', sans-serif;
  }
  /* HEADER LINE */
  .header-line {
    width: calc(100% - 32px);
    height: 1px;
    background: rgba(31,128,147,0.2);
    margin: 20px auto 25px;
    margin-left: 16px;
    margin-right: 16px;
  }
  /* TITLE */
  .title {
    font-family: 'Poppins', sans-serif;
    font-size: 36px;
    font-weight: 600;
    color: #1f8093;
    padding-left: 16px;
    margin-top: 0;
    margin-bottom: 8px;
  }
  .underline {
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #1f8093, rgba(31,128,147,0.5));
    border-radius: 9999px;
    margin-left: 16px;
    margin-bottom: 20px;
  }
  /* CONTENT WRAPPER */
  .content-wrapper {
    margin-top: 10px;
    padding: 0 16px;
    height: 570px;
  }
  /* CLINICAL PERSPECTIVE BOX */
  .clinical-box {
    background: linear-gradient(175deg, #FCFBF8 0%, white 100%);
    border-radius: 14px;
    padding: 20px 28px;
    margin-bottom: 20px;
    border: 0.87px solid rgba(224, 230, 235, 0.5);
    border-left: none;
    position: relative;
    overflow: hidden;
  }
  .clinical-box:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #1f8093;
  }
  .clinical-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;
  }
  .clinical-icon {
    width: 49px;
    height: 49px;
    background: rgba(31,128,147,0.1);
    border-radius: 10.5px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .clinical-icon-inner {
    width: 24px;
    height: 24px;
    position: relative;
  }
  .clinical-icon-part {
    position: absolute;
    outline: 2px solid #1f8093;
    outline-offset: -1px;
  }
  .clinical-title {
    font-family: 'Lato', sans-serif;
    font-size: 17.5px;
    font-weight: 400;
    color: #000;
    margin-bottom: 5px;
  }
  .clinical-text {
    font-family: 'Lato', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: #1f8093;
    font-style: italic;
    margin: 0;
  }
  /* FIXED CERTIFIED BY BOX */
  .certified-box {
    background: linear-gradient(172deg, rgba(31,128,147,0.10) 0%, rgba(31,128,147,0.05) 100%);
    border-radius: 19px;
    padding: 1px 26px 26px;
    margin: 20px auto;
    width: 260px;
    border: 1.2px solid rgba(31,128,147,0.20);
    box-shadow: 0px 2.38px 4.76px -2.38px rgba(0, 0, 0, 0.1);
    position: relative;
    text-align: center;
  }
  /* TITLE */
  .certified-title {
    font-family: 'Lato', sans-serif;
    font-size: 17px;
    font-weight: 700;
    text-transform: uppercase;
    color: #000;
    margin-bottom: 12px;
  }
  .ribbon {
    width: 38px;
    height: 55px;
    position: relative;
  }
  .ribbon-body {
    width: 34.38px;
    height: 55px;
    background: #FF552F;
    position: absolute;
    left: 6.88px;
    top: 0;
    border-radius: 4px;
  }
  .ribbon-tail {
    position: absolute;
    left: 6.88px;
    bottom: -12px;
    width: 0;
    height: 0;
    border-left: 17px solid transparent;
    border-right: 17px solid transparent;
    border-top: 12px solid #FF552F;
  }
  /* PROVEN CODE LOGO */
  .proven-logo {
    font-family: 'Poppins', sans-serif;
    color: #1f8093;
    line-height: 1;
  }
  .proven-logo .logo-line1 {
    display: block;
    font-size: 18px;
    font-weight: 400;
  }
  .proven-logo .logo-line2 {
    display: block;
    font-size: 29px;
    font-weight: 600;
    margin-top: 2px;
  }
  .proven-logo .logo-line3 {
    display: block;
    font-size: 23px;
    font-weight: 500;
    margin-top: -2px;
  }
  /* CONTACT BOXES */
  .contact-container {
    display: flex;
    justify-content: center;
    gap: 13px;
    margin: 30px 0;
  }
  .contact-box {
    width: 178px;
    height: 85px;
    background: white;
    border-radius: 9.6px;
    border: 0.8px solid #E0E6EB;
    position: relative;
    padding-top: 40px;
  }
  .contact-icon {
    width: 19px;
    height: 19px;
    position: absolute;
    left: 50%;
    top: 14px;
    transform: translateX(-50%);
  }
  .contact-icon-part {
    position: absolute;
    outline: 1.6px solid #1f8093;
    outline-offset: -0.8px;
  }
  .contact-label {
    font-family: 'Lato', sans-serif;
    font-size: 9.6px;
    color: #000;
    text-align: center;
    margin-bottom: 2px;
  }
  .contact-value {
    font-family: 'Poppins', sans-serif;
    font-size: 11.2px;
    color: #808080;
    text-align: center;
  }
  /* FOOTER */
  .footer-section {
    border-top: 1.8px solid rgba(31,128,147,0.3);
    padding-top: 10px;
    margin-top: 108px;
  }
  .footer-text {
    font-family: 'Lato', sans-serif;
    font-size: 12px;
    color: #000;
    text-align: center;
    margin-bottom: 5px;
  }
  .footer-company {
    font-family: 'Lato', sans-serif;
    font-size: 16px;
    color: #1f8093;
    text-align: center;
    margin-bottom: 8px;
  }
  .footer-note {
    font-family: 'Lato', sans-serif;
    font-size: 10.7px;
    color: #808080;
    text-align: center;
    margin-bottom: 3px;
  }
  .footer-version {
    font-family: 'Lato', sans-serif;
    font-size: 10.7px;
    color: #7e8c9a;
    text-align: center;
  }
  /* FOOTER LINE */
  .footer-line {
    width: calc(100% - 32px);
    height: 2px;
    background: rgba(31,128,147,0.3);
    position: absolute;
    bottom: 68px;
    left: 16px;
    right: 16px;
  }
  /* FOOTER */
  .footer {
    text-align: center;
    font-size: 12px;
    color: #808080;
    font-family: 'Poppins', sans-serif;
    position: absolute;
    bottom: 22px;
    width: 100%;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Logo -->
  <div class="logo"><img src="../assets/provencodee.png" alt="The Proven Code"></div>
  <!-- Page number -->
  <div class="page-tag">Page 10</div>
  <!-- Header line -->
  <div class="header-line"></div>
  <!-- Title -->
  <div class="title">Expert Review</div>
  <div class="underline"></div>
  <!-- CONTENT -->
  <div class="content-wrapper">
    <!-- Clinical Perspective Box -->
    <div class="clinical-box">
      <div class="clinical-header">
        <div class="clinical-icon">
          <div class="clinical-icon-inner">
            <div class="clinical-icon-part" style="width: 16px; height: 20px; left: 4px; top: 2px;"></div>
          </div>
        </div>
        <div style="flex: 1;">
          <div class="clinical-title">Clinical Perspective</div>
          <div class="clinical-text">
            "${report.expertReview?.clinicalPerspective || "Gut health reflects diet, routine, medication, and stress. If concerns persist or recur after following the guidance, please seek a review with your clinician or a gut-health specialist."}"
          </div>
        </div>
      </div>
    </div>
    <!-- Certified By Box -->
    <div class="certified-box">
      <div class="ribbon">
        <div class="ribbon-body"></div>
        <div class="ribbon-tail"></div>
      </div>
      <div class="certified-title">CERTIFIED BY</div>
      <!-- Proven Code Logo -->
      <div class="proven-logo">
        <span class="logo-line1">the</span>
        <span class="logo-line2">proven</span>
        <span class="logo-line3">code</span>
      </div>
    </div>
    <!-- Contact Boxes -->
    <div class="contact-container">
      <!-- Phone Support -->
      <div class="contact-box">
        <div class="contact-icon">
          <div class="contact-icon-part" style="width: 16px; height: 16px; left: 2px; top: 2px;"></div>
        </div>
        <div class="contact-label">Phone Support</div>
        <div class="contact-value">${report.contactInfo?.phone || "+1 (555) 123-4567"}</div>
      </div>
      <!-- Email -->
      <div class="contact-box">
        <div class="contact-icon">
          <div class="contact-icon-part" style="width: 16px; height: 13px; left: 2px; top: 3px;"></div>
          <div class="contact-icon-part" style="width: 16px; height: 5px; left: 2px; top: 6px;"></div>
        </div>
        <div class="contact-label">Email</div>
        <div class="contact-value">${report.contactInfo?.email || "support@provencode.com"}</div>
      </div>
    </div>
    <!-- Footer Section -->
    <div class="footer-section">
      <div class="footer-text">Prepared by <span class="footer-company">The Proven Code</span></div>
      <div class="footer-note">Microbiome Health Check | For clinical reference use</div>
      <div class="footer-version">Version 7.0</div>
    </div>
  </div>
</div>
</body>
</html>`;

  return inlineLocalImages(page10HTML);
};

/* ---------------------------------------------------------
    BUILD FINAL MULTIPAGE HTML
--------------------------------------------------------- */

const buildFullHTML = (report) => {
  console.log("[pdfGenerator] Building 10-page HTML...");

  // Get all ten pages
  const page1HTML = getPage1HTML(report);
  const page2HTML = getPage2HTML();
  const page3HTML = getPage3HTML(report);
  const page4HTML = getPage4HTML(report);
  const page5HTML = getPage5HTML(report);
  const page6HTML = getPage6HTML(report);
  const page7HTML = getPage7HTML(report);
  const page8HTML = getPage8HTML(report);
  const page9HTML = getPage9HTML(report);
  const page10HTML = getPage10HTML(report);

  // Create final HTML with page breaks
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
/* -------- A4 PAGE WRAPPER (Correct + Final) -------- */
.pdf-page-wrapper {
    width: 794px;         /* A4 width @96 DPI */
    height: 1123px;       /* A4 height @96 DPI */
    overflow: hidden;
    position: relative;
    page-break-after: always;
    box-sizing: border-box;
}

/* Prevent internal pages from being overridden */
.pdf-page-wrapper html,
.pdf-page-wrapper body {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Allow each page’s own CSS to take full control */
.pdf-page-wrapper .page {
    width: 100% !important;
    min-height: 100% !important;
    height: auto !important;
    position: relative !important;
    overflow: visible !important;
}

  /* A4 PAGE SETTINGS */
  @page {
    size: A4;
    margin: 0;
  }
  
  body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
    position: relative;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  /* EACH PAGE WRAPPER */
  .pdf-page-wrapper {
    width: 210mm;
    height: 297mm;
    page-break-after: always;
    position: relative;
    background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
  }
  
  .pdf-page-wrapper:last-child {
    page-break-after: auto;
  }
  
  /* FOR PRINT */
  @media print {
    body {
      background: transparent !important;
    }
    
    .pdf-page-wrapper {
      break-after: page;
      background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%) !important;
    }
  }
</style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="pdf-page-wrapper">
    ${page1HTML}
  </div>
  
  <!-- PAGE 2 -->
  <div class="pdf-page-wrapper">
    ${page2HTML}
  </div>
  
  <!-- PAGE 3 -->
  <div class="pdf-page-wrapper">
    ${page3HTML}
  </div>
  
  <!-- PAGE 4 -->
  <div class="pdf-page-wrapper">
    ${page4HTML}
  </div>
  
  <!-- PAGE 5 -->
  <div class="pdf-page-wrapper">
    ${page5HTML}
  </div>
  
  <!-- PAGE 6 -->
  <div class="pdf-page-wrapper">
    ${page6HTML}
  </div>
  
  <!-- PAGE 7 -->
  <div class="pdf-page-wrapper">
    ${page7HTML}
  </div>
  
  <!-- PAGE 8 -->
  <div class="pdf-page-wrapper">
    ${page8HTML}
  </div>
  
  <!-- PAGE 9 -->
  <div class="pdf-page-wrapper">
    ${page9HTML}
  </div>
  
  <!-- PAGE 10 -->
  <div class="pdf-page-wrapper">
    ${page10HTML}
  </div>
</body>
</html>`;
};

/* ---------------------------------------------------------
    MAIN PDF GENERATOR - SIMPLE AND DIRECT
--------------------------------------------------------- */

export const generatePDF = async (report, outputPath = null) => {
  console.log("=== PDF GENERATION START ===");
  console.log("Generating for:", report.testId || report._id);

  let browser = null;

  try {
    // Build HTML with both pages
    const html = buildFullHTML(report);

    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      timeout: 10000,
    });

    const page = await browser.newPage();

    // Set A4 viewport
    await page.setViewport({
      width: 794,   // A4 width at 96 DPI
      height: 1123, // A4 height at 96 DPI
    });

    // Set content
    await page.setContent(html, {
      waitUntil: "load",
      timeout: 15000,
    });

    // Short wait for rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: true,
    });

    console.log("=== PDF GENERATION COMPLETE ===");

    // Save if needed
    if (outputPath) {
      fs.writeFileSync(outputPath, pdf);
      console.log(`PDF saved to: ${outputPath}`);
    }

    return pdf;

  } catch (err) {
    console.error("PDF GENERATION ERROR:", err.message);
    throw err; // Just throw the error, no fallback
    
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
};

export default generatePDF;