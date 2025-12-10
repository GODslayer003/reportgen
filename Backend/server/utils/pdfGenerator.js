// server/utils/pdfGenerator.js
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import axios from "axios";
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
/* ---------- GLOBAL ---------- */
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
  background: #FEFFFF;
}

.p1-page {
  width: 100%;
  min-height: 100vh;
  padding: 50px 40px 60px 40px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #F3FAFB;
}

/* ---------- LOGO ---------- */
.p1-logo {
  position: absolute;
  top: 25px;
  left: 25px;
}

.p1-logo img {
  width: 175px;
}

/* ---------- TOP ILLUSTRATIONS ---------- */
.p1-dropper {
    width: 200px;
    position: absolute;
    top: 40px;
    left: 54%;
    transform: translateX(-60%) rotate(9deg) scaleX(-1);
    opacity: 0.85;
}

.p1-drop-shadow {
    width: 102px;
    height: 15px;
    background: rgba(31, 128, 147, 0.25);
    filter: blur(6px);
    border-radius: 50px;
    position: absolute;
    top: 225px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0.5;
}

.p1-dna {
    width: 200px;
    position: absolute;
    top: -14px;
    right: -40px;
    opacity: 0.25;
}

.p1-microscope {
    width: 350px;
    position: absolute;
    bottom: -55px;
    left: -68px;
    opacity: 0.30;
    transform: scaleX(-1);
}

/* ---------- TITLE BLOCK ---------- */
.p1-title-wrap {
  margin-top: 200px;
  text-align: center;
  width: 100%;
}

.p1-title {
  color: #1F8093;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.35;
}

.p1-subtitle {
  margin-top: 8px;
  color: #808080;
  font-size: 13px;
  font-family: "Inter", sans-serif;
  line-height: 21px;
}

.p1-uk-line {
  margin-top: 14px;
  font-size: 13px;
  font-weight: 400;
  color: #1F8093;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;

  width: 100%;
}

/* ---------- PATIENT CARD ---------- */
.p1-card {
  background: #FFFFFF;
  width: 300px;            
  margin-top: 45px;        
  padding: 26px 26px;
  border-radius: 10px;
  border: 1px solid #DCDCDC;
  box-shadow: 0 3px 12px rgba(31,128,147,0.06);
}

.p1-card-header {
  font-size: 13px;
  font-weight: 600;
  color: #1F8093;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #EAEAEA;
  letter-spacing: 0.6px;
}

.p1-row {
  padding: 14px 0;
  border-bottom: 1px solid #EFEFEF;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.p1-row:last-child {
  border-bottom: none;
}

.p1-label {
  font-size: 13px;
  color: #737373;
  font-family: "Inter", sans-serif;
}

.p1-value {
  font-size: 13px;
  font-weight: 500;
  color: #29303D;
  font-family: "Inter", sans-serif;
}

/* ---------- FOOTER / STATUS ---------- */
.p1-bottom {
  margin-top: 50px;
  text-align: center;
}

.p1-version {
  font-size: 13px;
  font-family: "Inter", sans-serif;
  color: #888;
  margin-bottom: 8px;
}

.p1-status-bar {
  display: flex;
  justify-content: center;
  gap: 6px;
  width: 230px;
  margin: 10px auto;
}

.p1-status-bar div {
  flex: 1;
  height: 6px;
  background: #1F8093;
  border-radius: 8px;
}

.p1-status-text {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 500;
  color: #1F8093;
  margin-top: 6px;
}
</style>
</head>


<body>
<div class="p1-page">

  <!-- Logo -->
  <div class="p1-logo">
    <img src="../assets/provencodee.png" />
  </div>

  <!-- Background Illustrations -->
  <img src="../assets/dropper.png" class="p1-dropper" />
  <img src="../assets/gradient.png" class="p1-drop-shadow">
  <img src="../assets/dna.png" class="p1-dna" />
  <img src="../assets/microscope.png" class="p1-microscope" />

  <!-- TITLE SECTION -->
  <div class="p1-title-wrap">
    <div class="p1-title">Biome360 Health Check<br>Report</div>
    <div class="p1-subtitle">Functional Screening for Gut Microbial Balance</div>

    <div class="p1-uk-line">
      Developed in United Kingdom
      <img src="/Backend/server/assets/us.png" width="20" />
    </div>
  </div>

  <!-- PATIENT CARD -->
  <div class="p1-card">
    <div class="p1-card-header">Patient Information</div>

    <div class="p1-row">
      <div class="p1-label">Name</div>
      <div class="p1-value">${report.patient?.name || "N/A"}</div>
    </div>

    <div class="p1-row">
      <div class="p1-label">Age – Sex</div>
      <div class="p1-value">
        ${report.patient?.age || "N/A"} – ${report.patient?.sex || "N/A"}
      </div>
    </div>

    <div class="p1-row">
      <div class="p1-label">Sample Date</div>
      <div class="p1-value">
        ${report.patient?.collectionDate
      ? new Date(report.patient.collectionDate).toLocaleDateString()
      : "—"}
      </div>
    </div>
  </div>

  <!-- FOOTER / STATUS -->
  <div class="p1-bottom">
    <div class="p1-version">Version 7.0 | Medical Report</div>

    <div class="p1-status-bar">
      <div></div><div></div><div></div><div></div>
    </div>

    <div class="p1-status-text">✓ Report Generated</div>
  </div>

</div>
</body>
</html>
`;

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
/* ---------------- GLOBAL ---------------- */
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
  background: linear-gradient(180deg, #d4eef3 0%, #e8f6f8 50%, #f0f9fa 100%);
}

.p2-page {
  width: 100%;
  min-height: 100vh;
  padding: 28px 0 28px;
  position: relative;
  min-width: 595px;
  margin: 0 auto;
  background: #F3FAFB;
}

/* ---------------- HEADER ---------------- */
.p2-logo {
  position: absolute;
  top: 20px;
  left: 20px;
}

.p2-page-tag {
  position: absolute;
  top: 22px;
  right: 22px;
  background: rgba(31,128,147,0.1);
  padding: 6px 22px;
  border-radius: 9999px;
  font-size: 13px;
  color: #7e8c9a;
}

.p2-header-line {
  width: 100%;
  height: 1px;
  background: rgba(31,128,147,0.25);
  margin-top: 75px;
}

/* ---------------- TITLE ---------------- */
.p2-section-title {
  margin-top: 42px;           /* moved slightly down */
  margin-left: 40px;          /* aligned with paragraphs */
  font-size: 30px;
  font-weight: 600;
  color: #1F8093;
}

.p2-underline {
  width: 150px;
  height: 4px;
  background: linear-gradient(90deg, #1F8093 0%, rgba(31,128,147,0.5) 100%);
  border-radius: 999px;
  margin-left: 40px;          /* aligned with title */
  margin-top: 6px;
}

/* ---------------- TEXT CONTENT ---------------- */
.p2-paragraph-block {
  margin: 26px auto 0;
  width: 620px;               /* wider paragraph */
  font-size: 13px;
  color: #29303D;
  line-height: 24px;
  text-align: left;
}

.p2-turnaround {
  margin: 12px auto 0;
  width: 620px;
  color: #1F8093;
  font-size: 13px;
  font-weight: 500;
  font-style: italic;
}

/* ---------------- PROCESS ---------------- */
.p2-process-title {
  margin-top: 48px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #29303D;
}

.p2-process-container {
  width: 620px;
  margin: 28px auto 0;
  position: relative;
}

.p2-process-line {
  width: calc(100% - 140px);
  height: 2px;
  background: rgba(31,128,147,0.25);
  position: absolute;
  top: 38px;
  left: 70px;
  z-index: 1;
}

.p2-process-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  text-align: center;
  position: relative;
  z-index: 2;
}

.p2-step {
  width: 135px;
  text-align: center;
}

.p2-step-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 2px solid #1F8093;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.p2-step-icon img {
  width: 28px;
  filter: brightness(0) saturate(100%) invert(39%) sepia(71%)
          saturate(409%) hue-rotate(143deg) brightness(92%) contrast(92%);
}

.p2-step-title {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #29303D;
}

.p2-step-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #808080;
  line-height: 15px;
  padding: 0 6px;
}

/* ---------------- CONTACT BOX ---------------- */
.p2-contact-box {
  width: 620px;
  margin: 55px auto 0;
  background: #ffffff;
  padding: 24px 28px;
  border: 1px solid #D9D9D9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.p2-contact-title {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 16px;
  text-align: left;
  align-self: flex-start;   /* ← REQUIRED FIX */
}

.p2-contact-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.p2-contact-item {
  display: flex;
  flex-direction: column;
  align-items: center; /* This keeps icons centered but title overrides it */
}

.p2-contact-icon {
  width: 22px;
  margin-bottom: 6px;
  filter: brightness(0) saturate(100%) invert(39%) sepia(71%)
    saturate(409%) hue-rotate(143deg) brightness(92%) contrast(92%);
}

.p2-contact-text {
  font-size: 13px;
  color: #29303D;
}


/* ---------------- FOOTER ---------------- */
.p2-footer {
  width: 100%;
  margin-top: 165px;         /* pushes it down naturally */
  padding: 14px 0;
  border-top: 2px solid rgba(31,128,147,0.25);
  text-align: center;
  font-size: 13px;
  color: #808080;
}
</style>
</head>


<body>
<div class="p2-page">

  <div class="p2-logo">
    <img src="../assets/provencodee.png" width="100">
  </div>

  <div class="p2-page-tag">Page 2</div>

  <div class="p2-header-line"></div>

  <div class="p2-section-title">ABOUT THE TEST & PROCESS</div>
  <div class="p2-underline"></div>

  <div class="p2-paragraph-block">
    The Biome360 Health Check is a functional screening designed to analyze microbial balance and lifestyle influences. This report combines microbial signals detected from the sample with lifestyle data to provide a clinically meaningful overview.
  </div>

  <div class="p2-paragraph-block">
    The Biome360 Health Check has been performed for over 10,000 individuals across the globe, and is adopted as a test for initial indication of microbiome health.
  </div>

  <div class="p2-turnaround">
    (Turnaround Time: 7–10 business days from sample receipt.)
  </div>

  <div class="p2-process-title">Our Process</div>

  <div class="p2-process-container">

    <div class="p2-process-line"></div>

    <div class="p2-process-steps">

      <div class="p2-step">
        <div class="p2-step-icon"><img src="../assets/SVG.png"></div>
        <div class="p2-step-title">Sample Collection</div>
        <div class="p2-step-desc">Performed using sterile collection kits designed to capture and retain microbes in the sample.</div>
      </div>

      <div class="p2-step">
        <div class="p2-step-icon"><img src="../assets/SVG1.png"></div>
        <div class="p2-step-title">Transport</div>
        <div class="p2-step-desc">Transferred under cold chain to The Proven Code’s specialized lab in New Delhi.</div>
      </div>

      <div class="p2-step">
        <div class="p2-step-icon"><img src="../assets/SVG2.png"></div>
        <div class="p2-step-title">Laboratory Review</div>
        <div class="p2-step-desc">Analyzed using the proprietary BiomeAnalysis360™ framework.</div>
      </div>

      <div class="p2-step">
        <div class="p2-step-icon"><img src="../assets/SVG3.png"></div>
        <div class="p2-step-title">Report Generation</div>
        <div class="p2-step-desc">Reviewed through automated logic validated by clinical advisors.</div>
      </div>

    </div>
  </div>

  <div class="p2-contact-box">
    <div class="p2-contact-title">Contact Us</div>

    <div class="p2-contact-row">

      <div class="p2-contact-item">
        <img src="../assets/message.png" class="p2-contact-icon">
        <div class="p2-contact-text">support@theprovencode.com</div>
      </div>

      <div class="p2-contact-item">
        <img src="../assets/chat.png" class="p2-contact-icon">
        <div class="p2-contact-text">WhatsApp / Aratta</div>
      </div>

      <div class="p2-contact-item">
        <img src="../assets/phone.png" class="p2-contact-icon">
        <div class="p2-contact-text">+91 8226984272</div>
      </div>

    </div>
  </div>

  <div class="p2-footer">
    Made by The Proven Code | Biome360 Health Check | Wellness Tool
  </div>

</div>
</body>
</html>
`;

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
/* ---------------- GLOBAL ---------------- */
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
  background: #F3FAFB;
}

/* Maintain EXACT PDF width */
.p3-page {
  width: 100%;
  min-height: 100vh;
  padding: 28px 0 28px;
  position: relative;
  min-width: 595px;
  margin: 0 auto;
  background: #F3FAFB;
}

/* ---------------- HEADER ---------------- */
.p3-logo {
  position: absolute;
  top: 20px;
  left: 20px;
}

.p3-page-tag {
  position: absolute;
  top: 22px;
  right: 22px;
  background: rgba(31,128,147,0.08);
  padding: 6px 22px;
  border-radius: 9999px;
  font-size: 13px;
  color: #7e8c9a;
  font-family: "Poppins", sans-serif;
}

.p3-header-line {
  width: 100%;
  height: 2px;
  background: rgba(31,128,147,0.30);
  margin-top: 75px;
}

/* ---------------- TITLE ---------------- */
.p3-title-wrap {
  width: 100%;
  margin-top: 45px; /* Proper gap like Figma */
  padding-left: 20px;
}

.p3-title {
  font-size: 30px;
  font-weight: 600;
  color: #1F8093;
}

.p3-underline {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #1F8093, rgba(31,128,147,0.5));
  border-radius: 999px;
  margin-top: 8px;
}

/* ---------------- TABLE OF CONTENTS ---------------- */

/* Full-width table rows like Figma */
.p3-toc-wrapper {
  margin-top: 30px;
  width: calc(100% - 40px);
  margin-left: 20px;
}

.p3-toc-box {
  width: 100%;
  padding: 28px 0; 
  border-bottom: 1px solid #EDEDED;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.p3-toc-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* Number circle */
.p3-icon-square {
  width: 32px;
  height: 32px;
  background: #EDEDED;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.p3-icon-number {
  font-size: 13px;
  font-weight: 500;
  color: #1F8093;
  font-family: "Inter", sans-serif;
}

/* TOC title text */
.p3-toc-title {
  font-size: 20px;
  color: #000;
  font-weight: 500;
  font-family: "Inter", sans-serif;
  margin-top: 2px;
}

/* Right-side Page Number */
.p3-toc-page {
  font-size: 20px;
  font-weight: 500;
  color: #1F8093;
  font-family: "Poppins", sans-serif;
  margin-right: 8px;
}

/* ---------------- FOOTER ---------------- */
.p3-footer-line {
  width: 100%;
  height: 2px;
  background: rgba(31,128,147,0.30);
  margin-top: 70px;
}

.p3-footer {
  width: 100%;
  margin-top: 110px;         /* pushes it down naturally */
  padding: 14px 0;
  border-top: 2px solid rgba(31,128,147,0.25);
  text-align: center;
  font-size: 13px;
  color: #808080;
}

</style>
</head>
<body>
<div class="p3-page">

  <!-- LOGO -->
  <div class="p3-logo">
    <img src="../assets/provencodee.png" width="100">
  </div>

  <!-- PAGE NUMBER -->
  <div class="p3-page-tag">Page 3</div>

  <!-- HEADER LINE -->
  <div class="p3-header-line"></div>

  <!-- TITLE -->
  <div class="p3-title-wrap">
    <div class="p3-title">Table Of Content</div>
    <div class="p3-underline"></div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div class="p3-toc-wrapper">

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">2</div></div>
        <div class="p3-toc-title">About the Test & Process</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">4</div></div>
        <div class="p3-toc-title">Summary Page</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">5</div></div>
        <div class="p3-toc-title">Analytical Observations</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">6</div></div>
        <div class="p3-toc-title">Functional Assessment</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">7</div></div>
        <div class="p3-toc-title">Interpretive Narrative</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">8</div></div>
        <div class="p3-toc-title">Recommendations</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">9</div></div>
        <div class="p3-toc-title">Lifestyle Guidance</div>
      </div>
    </div>

    <div class="p3-toc-box">
      <div class="p3-toc-left">
        <div class="p3-icon-square"><div class="p3-icon-number">10</div></div>
        <div class="p3-toc-title">Expert Review Note & Disclaimer</div>
      </div>
    </div>

  </div>
  <div class="p3-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>
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
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">

<style>
/* ---------------- GLOBAL PAGE STYLE (Same as Page-1 & Page-2) ---------------- */
body {
  margin: 0;
  padding: 0;
  font-family: "Poppins", sans-serif;
  background: #F3FAFB;
}

.p4-page {
  width: 100%;
  min-height: 100vh;
  padding: 50px 40px 60px 40px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  font-family: "Poppins", sans-serif;
  background: #F3FAFB;
}

/* ---------------- HEADER ---------------- */
.p4-logo {
  position: absolute;
  top: 25px;
  left: 25px;
}

.p4-page-tag {
  position: absolute;
  top: 28px;
  right: 28px;
  background: rgba(31,128,147,0.08);
  padding: 6px 22px;
  border-radius: 9999px;
  font-size: 13px;
  color: #7E8C9A;
}

.p4-header-line {
  width: 150%;
  height: 2px;
  background: rgba(31,128,147,0.30);
  margin-top: 60px;
}

/* ---------------- TITLE ---------------- */
.p4-title-wrap {
  width: 100%;
  margin-top: 45px; /* Proper gap like Figma */
  padding-left: 20px;
}

.p4-title {
  font-size: 30px;
  font-weight: 600;
  color: #1F8093;
}

.p4-underline {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #1F8093, rgba(31,128,147,0.5));
  border-radius: 999px;
  margin-top: 8px;
}

/* ---------------- GRID BOXES ---------------- */
.grid-container {
  width: 100%;
  max-width: 620px;
  padding: 0 16px;
  margin-top: 40px;
}

.grid-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.info-box {
  width: 300px;
  padding: 22px;
  background: white;
  border: 1px solid #BDBDBD;
  box-shadow: 0px 1px 2px rgba(0,0,0,0.05);
}

.info-box-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-text { flex: 1; }

.info-label {
  color: #737373;
  font-size: 13px;
  font-family: "Inter", sans-serif;
  margin-bottom: 4px;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
}

/* ---------------- STATUS COLORS ---------------- */
.status-valid { color: #21C45D; }
.status-detected { color: #E92B2B; }
.status-elevated { color: #E7B008; }
.status-mild { color: #E7B008; }
.status-moderate,
.status-significant { color: #E92B2B; }

/* ---------------- ICONS ---------------- */
.info-icon {
  width: 26px;
  height: 26px;
}

/* CHECK (Green Circle) */
.icon-check {
  width: 26px;
  height: 26px;
  border: 2px solid #21C45D;
  border-radius: 50%;     /* <-- fully rounded */
  position: relative;
}

.icon-check::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 5px;
  left: 7px;
  top: 9px;
  border-left: 2.5px solid #21C45D;
  border-bottom: 2.5px solid #21C45D;
  transform: rotate(-45deg);
}


/* CROSS (Red Circle) */
.icon-cross {
  width: 26px;
  height: 26px;
  border: 2px solid #E92B2B;
  border-radius: 50%;     /* <-- fully rounded */
  position: relative;
}

.icon-cross::before,
.icon-cross::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 2px;
  background: #E92B2B;
  top: 12px;
  left: 6px;
}

.icon-cross::before { transform: rotate(45deg); }
.icon-cross::after { transform: rotate(-45deg); }


/* WARNING (Yellow Circle) */
.icon-warning {
  width: 26px;
  height: 26px;
  border: 2px solid #E7B008;
  border-radius: 50%;     /* <-- fully rounded */
  position: relative;
}

.icon-warning::before {
  content: '!';
  position: absolute;
  color: #E7B008;
  font-size: 13px;
  font-weight: 700;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -55%);
}

/* ---------------- FUNCTIONAL STATUS SCALE ---------------- */
.scale-container {
  width: 100%;
  max-width: 620px;
  padding: 0 16px;
  margin-top: 20px;
}

.scale-card {
  background: #fff;
  border: 1px solid #BDBDBD;
  padding: 22px;
  box-shadow: 0px 1px 2px rgba(0,0,0,0.05);
}

.scale-title {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.scale-icon {
  font-size: 20px;
  color: #1F8093;
}

.scale-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.scale-pill {
  padding: 10px 14px;
  background: #F5F5F5;
  border: 1px solid #E0E0E0;

  font-size: 13px;
  font-family: "Inter", sans-serif;   /* <-- FIXED (INTER FONT) */
  font-weight: 500;

  color: #666;
  white-space: nowrap;
}

.scale-pill.active {
  background: #FEAE00;
  border-color: #FEAE00;
  color: #fff;
  font-weight: 600;
  font-family: "Inter", sans-serif;   /* <-- FIXED */
}

/* ---------------- SUMMARY + NEXT STEP ---------------- */
.summary-section,
.nextstep-section {
  width: 100%;
  max-width: 620px;
  margin-top: 32px;
  padding-left: 16px;
  text-align: left;
}

.summary-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.summary-text {
  font-size: 13px;
  line-height: 22px;
  font-family: "Inter";
  color: #808080;
}

/* ---------------- FOOTER ---------------- */

.p4-footer {
  width: 150%;
  margin-top: 140px;         /* pushes it down naturally */
  padding: 14px 0;
  border-top: 2px solid rgba(31,128,147,0.25);
  text-align: center;
  font-size: 13px;
  color: #808080;

</style>
</head>
<body>

<div class="p4-page">

  <!-- LOGO -->
  <div class="p4-logo">
    <img src="../assets/provencodee.png" width="100">
  </div>

  <!-- PAGE TAG -->
  <div class="p4-page-tag">Page 4</div>

  <div class="p4-header-line"></div>

  <!-- TITLE -->
  <div class="p4-title-wrap">
    <div class="p4-title">Summary Page</div>
    <div class="p4-underline"></div>
  </div>

  <!-- GRID BOXES -->
<div class="grid-container">

  <!-- First Row -->
  <div class="grid-row">

    <!-- Specimen Validity -->
    <div class="info-box">
      <div class="info-box-content">
        <div class="info-text">
          <p class="info-label">Specimen Validity</p>
          <p class="info-value 
            ${report.labInputs?.V === 1 ? 'status-valid' : 'status-detected'}"
          >
            ${report.labInputs?.V === 1 ? "Valid" : "Invalid"}
          </p>
        </div>

        <div class="info-icon">
          <div class="${report.labInputs?.V === 1 ? 'icon-check' : 'icon-cross'}"></div>
        </div>
      </div>
    </div>

    <!-- Bacterial Signal -->
    <div class="info-box">
      <div class="info-box-content">
        <div class="info-text">
          <p class="info-label">Bacterial Signal</p>
          <p class="info-value 
            ${report.labInputs?.B > 0 ? 'status-detected' : 'status-valid'}"
          >
            ${report.labInputs?.B > 0 ? "Detected" : "Not Detected"}
          </p>
        </div>

        <div class="info-icon">
          <div class="${report.labInputs?.B > 0 ? 'icon-cross' : 'icon-check'}"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Second Row -->
  <div class="grid-row">

    <!-- Yeast Signal -->
    <div class="info-box">
      <div class="info-box-content">
        <div class="info-text">
          <p class="info-label">Yeast Signal</p>
          <p class="info-value 
            ${report.labInputs?.Y > 0 ? 'status-elevated' : 'status-valid'}"
          >
            ${report.labInputs?.Y > 0 ? "Elevated" : "Normal"}
          </p>
        </div>

        <div class="info-icon">
          <div class="${report.labInputs?.Y > 0 ? 'icon-warning' : 'icon-check'}"></div>
        </div>
      </div>
    </div>

    <!-- Functional Status -->
    <div class="info-box">
      <div class="info-box-content">
        <div class="info-text">
          <p class="info-label">Functional Status</p>

          <p class="info-value
            ${report.calculatedData?.overallStatus === "Balanced" ? "status-valid" :
      report.calculatedData?.overallStatus === "Mild Imbalance" ? "status-mild" :
        "status-detected"
    }"
          >
            ${report.calculatedData?.overallStatus}
          </p>
        </div>

        <div class="info-icon">
          <div class="${report.calculatedData?.overallStatus === "Balanced"
      ? "icon-check"
      : report.calculatedData?.overallStatus === "Mild Imbalance"
        ? "icon-warning"
        : "icon-cross"
    }"></div>
        </div>
      </div>
    </div>

  </div>
</div>


<!-- FUNCTIONAL STATUS SCALE -->
<div class="scale-container">
  <div class="scale-card">

    <h3 class="scale-title">
      <span class="scale-icon">
          <img src="../assets/uperneeche.png" >
      </span> Functional Status Scale
    </h3>

    <div class="scale-pills">

      <div class="scale-pill 
        ${report.calculatedData?.overallStatus === "Balanced" ? "active" : ""}">
        Balanced
      </div>

      <div class="scale-pill 
        ${report.calculatedData?.overallStatus === "Mild Imbalance" ? "active" : ""}">
        Mild Imbalance
      </div>

      <div class="scale-pill 
        ${report.calculatedData?.overallStatus === "Moderate Dysbiosis" ? "active" : ""}">
        Moderate Dysbiosis
      </div>

      <div class="scale-pill 
        ${report.calculatedData?.overallStatus === "Significant Dysbiosis" ? "active" : ""}">
        Significant Dysbiosis
      </div>

    </div>

  </div>
</div>

<!-- SUMMARY OBSERVATION -->
<div class="summary-section">
  <h3 class="summary-title">Summary Observation</h3>
  <p class="summary-text">
    ${report.summaryObservation}
  </p>
</div>

<!-- SUGGESTED NEXT STEP -->
<div class="nextstep-section">
  <h3 class="summary-title">Suggested Next Step</h3>
  <p class="summary-text">
    ${report.calculatedData?.recommendation}
  </p>
</div>

<div class="p4-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>

</div>

</body>
</html>
`;

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
/* ---------------- PAGE LAYOUT ---------------- */
.p5-wrapper {
  width: 100%;
  min-height: 100vh;
  padding: 50px 40px 60px 40px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  font-family: "Poppins", sans-serif;
  background: #F3FAFB;
}

/* ---------------- HEADER ---------------- */
.p5-logo {
  position: absolute;
  top: 20px;
  left: 20px;
}

.p5-tag {
  position: absolute;
  top: 22px;
  right: 22px;
  background: rgba(31,128,147,0.08);
  padding: 6px 22px;
  border-radius: 9999px;
  font-size: 13px;
  color: #7E8C9A;
}

.p5-header-line {
  width: 150%;
  height: 2px;
  background: rgba(31,128,147,0.30);
  margin-top: 50px;
}

/* ---------------- TITLE ---------------- */
.p5-title-wrap {
  width: 100%;
  margin-top: 45px; /* Proper gap like Figma */
  padding-left: 20px;
}

.p5-title {
  font-size: 30px;
  font-weight: 600;
  color: #1F8093;
}

.p5-underline {
  width: 120px;
  height: 4px;
  background: linear-gradient(90deg, #1F8093, rgba(31,128,147,0.5));
  border-radius: 999px;
  margin-top: 8px;
}

/* ---------------- TABLE CARD ---------------- */
.p5-table-card {
  width: calc(100% - 32px);
  margin: 40px auto 0;
  background: #fff;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.15);
  box-shadow: 0px 2px 6px rgba(0,0,0,0.05);
}

.p5-table-header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.6fr;
  background: #1F4E79;
  color: white;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
}

.p5-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1.6fr;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  align-items: center;
}

.p5-row:last-child {
  border-bottom: none;
}

/* ---------------- OBSERVATION BADGES ---------------- */
.p5-pill {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.p5-pill-green { 
  background: #D5F5E3; 
  color: #21C45D; 
}

.p5-pill-yellow { 
  background: #FFF4CC; 
  color: #E7B008; 
}

.p5-pill-red { 
  background: #FEDFDF; 
  color: #E92B2B; 
}

.p5-comment {
  font-size: 13px;
  color: #666;
}

/* ---------------- FOOTER ---------------- */
.p5-footer-line {
  width: 100%;
  height: 2px;
  background: rgba(31,128,147,0.30);
  position: absolute;
  bottom: 50px;
}

.p5-footer {
  text-align: center;
  width: 100%;
  position: absolute;
  bottom: 20px;
  font-size: 13px;
  color: #808080;
}
</style>
</head>

<body>

<div class="p5-wrapper">

  <!-- LOGO -->
  <img class="p5-logo" src="../assets/provencodee.png" width="100">

  <!-- PAGE TAG -->
  <div class="p5-tag">Page 5</div>

  <!-- HEADER LINE -->
  <div class="p5-header-line"></div>

  <!-- TITLE -->
  <div class="p4-title-wrap">
    <div class="p4-title">Summary Page</div>
    <div class="p4-underline"></div>
  </div>

  <!-- TABLE -->
  <div class="p5-table-card">

      <div class="p5-table-header">
        <div>Parameter</div>
        <div>Observation</div>
        <div>Comment</div>
      </div>

      <!-- ROW 1 : Bacterial Signal -->
      <div class="p5-row">
        <div>Bacterial Signal</div>

        <div>
          <span class="p5-pill ${report.calculatedData?.bacterialStatus === "Detected"
      ? "p5-pill-red"
      : "p5-pill-green"
    }">
            ${report.calculatedData?.bacterialStatus || "-"}
          </span>
        </div>

        <div class="p5-comment">
          ${report.calculatedData?.bacterialDescription ||
    "Bacterial signal indicates presence of bacterial activity in the sample."}
        </div>
      </div>

      <!-- ROW 2 : Yeast Signal -->
      <div class="p5-row">
        <div>Yeast Signal</div>

        <div>
          <span class="p5-pill ${report.calculatedData?.yeastStatus === "Detected"
      ? "p5-pill-red"
      : "p5-pill-green"
    }">
            ${report.calculatedData?.yeastStatus || "-"}
          </span>
        </div>

        <div class="p5-comment">
          ${report.calculatedData?.yeastDescription ||
    "Yeast signal analysis shows no significant yeast presence."}
        </div>
      </div>

      <!-- ROW 3 : Specimen Validity -->
      <div class="p5-row">
        <div>Specimen Validity</div>

        <div>
          <span class="p5-pill ${report.calculatedData?.specimenStatus === "Valid"
      ? "p5-pill-green"
      : "p5-pill-red"
    }">
            ${report.calculatedData?.specimenStatus || "-"}
          </span>
        </div>

        <div class="p5-comment">
          ${report.calculatedData?.specimenDescription ||
    "Specimen analysis indicates potential issues with sample collection or handling."}
        </div>
      </div>
  </div>

  <!-- FOOTER -->
  <div class="p5-footer-line"></div>
  <div class="p5-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>

</div>

</body>
</html>
`;

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
  /* Page layout - consistent with other pages */
  .p6-wrapper {
    width: 100%;
    min-height: 100vh;
    padding: 50px 40px 60px 40px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    font-family: "Poppins", sans-serif;
    background: #F3FAFB;
  }

  /* Header */
  .p6-logo { position: absolute; top: 20px; left: 20px; }
  .p6-tag {
    position: absolute; top: 22px; right: 22px;
    background: rgba(31,128,147,0.08); padding: 6px 22px; border-radius: 9999px;
    font-size: 13px; color: #7E8C9A;
  }
  .p6-header-line {
    width: 150%; height: 2px; background: rgba(31,128,147,0.30); margin-top: 50px;
  }

  .p5-title-wrap {
    width: 100%;
    margin-top: 45px;
    padding-left: 20px;
  }

  .p5-title {
    font-size: 30px;
    font-weight: 600;
    color: #1F8093;
  }

  .p5-underline {
    width: 120px;
    height: 4px;
    background: linear-gradient(90deg, #1F8093, rgba(31,128,147,0.5));
    border-radius: 999px;
    margin-top: 8px;
  }

  /* Legend / scoring system */
  .p6-legend {
    width: calc(100% - 32px);
    margin: 18px auto 0;
    padding: 12px 16px;
    background: #fff; border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.06);
    display:flex; align-items:center; gap:12px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  }
  .p6-legend .legend-label { font-weight:600; color:#1F4E79; font-size:13px; margin-right:12px; }
  .p6-legend .legend-item { display:flex; align-items:center; gap:8px; font-size:13px; color:#444; margin-right:10px; }
  .p6-dot { width:12px; height:12px; border-radius:50%; display:inline-block; }

  /* Scoring System Colors EXACTLY as shown in screenshot */
  .dot-green { background:#12C254; }
  .dot-yellow { background:#E2B420; }
  .dot-orange { background:#F77A21; }
  .dot-red { background:#E44B47; }

  /* Table card */
  .p6-table-card {
    width: 100%;
    max-width: 900px; /* Or whatever max width you want */
    margin: 20px auto 0;
    background: #fff;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.12);
    box-shadow: 0px 2px 6px rgba(0,0,0,0.05);
}

  .p6-table-header {
    display: grid;
    grid-template-columns: 1.4fr 1fr 0.6fr;
    background: #1F4E79;
    color: white;
    font-size: 13px;
    font-weight: 600;
    padding: 12px 16px;
    align-items: center;
  }

  .p6-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr 0.6fr;
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
    align-items: center;
  }

  .p6-row:last-child { border-bottom: none; }

  /* pills */
  .p6-pill {
    padding: 6px 10px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    display: inline-block;
  }

  .p6-pill-green { background: #E8F8EF; color: #12C254; }
  .p6-pill-yellow { background: #FFF7D9; color: #E2B420; }
  .p6-pill-orange { background: #FFE9D9; color: #F77A21; }
  .p6-pill-red { background: #FFE5E3; color: #E44B47; }

  .p6-score { font-weight:600; color:#1F8093; text-align:right; }

  /* Footer */
  .p6-footer-line { width: 100%; height: 2px; background: rgba(31,128,147,0.30); position: absolute; bottom: 50px; }
  .p6-footer { text-align:center; width:100%; position:absolute; bottom:22px; font-size:13px; color:#808080; }

</style>
</head>
<body>
  <div class="p6-wrapper">

    <!-- logo -->
    <img class="p6-logo" src="../assets/provencodee.png" width="100" alt="The Proven Code">

    <!-- page tag -->
    <div class="p6-tag">Page 6</div>

    <!-- header line -->
    <div class="p6-header-line"></div>

    <!-- TITLE -->
    <div class="p5-title-wrap">
      <div class="p5-title">Analytical Observations</div>
      <div class="p5-underline"></div>
    </div>

    <!-- scoring legend -->
    <div class="p6-legend">
      <div class="legend-label">Scoring System:</div>
      <div class="legend-item"><span class="p6-dot dot-green"></span>1-2 Normal</div>
      <div class="legend-item"><span class="p6-dot dot-yellow"></span>3 Borderline</div>
      <div class="legend-item"><span class="p6-dot dot-orange"></span>4 Elevated</div>
      <div class="legend-item"><span class="p6-dot dot-red"></span>5 High</div>
    </div>

    <!-- FUNCTIONAL TABLE -->
    <div class="p6-table-card">

      <div class="p6-table-header">
        <div>Parameter</div>
        <div>Status</div>
        <div style="text-align:right;">Score</div>
      </div>

      <!-- FIXED LOGIC FUNCTION (Inline JS Expression) -->
      <!-- Format reused for all rows -->

      <!-- FS1 -->
      <div class="p6-row">
        <div>Digestive Rhythm</div>
        <div>
          <span class="p6-pill ${(() => {
      const s = Math.min(5, Math.round((report.calculatedData?.scores?.FS1 || 0) / 2));
      if (s === 5) return "p6-pill-red";
      if (s === 4) return "p6-pill-orange";
      if (s === 3) return "p6-pill-yellow";
      return "p6-pill-green";
    })()
    }">
            ${(() => {
      const s = Math.min(5, Math.round((report.calculatedData?.scores?.FS1 || 0) / 2));
      if (s === 5) return "High";
      if (s === 4) return "Elevated";
      if (s === 3) return "Borderline";
      return "Normal";
    })()
    }
          </span>
        </div>
        <div class="p6-score">
          ${Math.min(5, Math.round((report.calculatedData?.scores?.FS1 || 0) / 2))}/5
        </div>
      </div>

      <!-- COPY–PASTE the same fixed logic for FS2–FS10 -->

      ${["FS2", "FS3", "FS4", "FS5", "FS6", "FS7", "FS8", "FS9", "FS10"].map((key, i) => {
      const labels = [
        "Fermentation Load",
        "Bacterial Balance",
        "Yeast Balance",
        "Immune Tone",
        "Gut–Brain Stress",
        "Circadian Sleep",
        "Diet Quality",
        "Medication Impact",
        "Hydration & Recovery"
      ];
      return `
        <div class="p6-row">
          <div>${labels[i]}</div>
          <div>
            <span class="p6-pill ${(() => {
          const s = Math.min(5, Math.round((report.calculatedData?.scores?.[key] || 0) / 2));
          if (s === 5) return "p6-pill-red";
          if (s === 4) return "p6-pill-orange";
          if (s === 3) return "p6-pill-yellow";
          return "p6-pill-green";
        })()
        }">
              ${(() => {
          const s = Math.min(5, Math.round((report.calculatedData?.scores?.[key] || 0) / 2));
          if (s === 5) return "High";
          if (s === 4) return "Elevated";
          if (s === 3) return "Borderline";
          return "Normal";
        })()
        }
            </span>
          </div>
          <div class="p6-score">
            ${Math.min(5, Math.round((report.calculatedData?.scores?.[key] || 0) / 2))}/5
          </div>
        </div>`;
    }).join("")}

    </div>

    <div class="p6-footer-line"></div>
    <div class="p6-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>

  </div>
</body>
</html>
`;

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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<style>
  body { margin:0; padding:0; background:#F3FAFB; font-family:'Poppins',sans-serif; }

  .p7-page {
    width:100%;
    min-height:100vh;
    padding:50px 40px 60px 40px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    align-items:center;
    position:relative;
    background:#F3FAFB;
  }

  .p7-logo { position:absolute; top:20px; left:20px; }
  .p7-tag {
    position:absolute; top:22px; right:22px;
    background:rgba(31,128,147,0.08);
    padding:6px 22px; border-radius:9999px;
    font-size:13px; color:#7E8C9A;
  }

  .p7-header-line { width:150%; height:2px; background:rgba(31,128,147,0.30); margin-top:50px; }

  .p7-title-wrap { width:100%; margin-top:45px; padding-left:20px; }
  .p7-title { font-size:30px; font-weight:600; color:#1F8093; }
  .p7-underline {
    width:120px; height:4px;
    background:linear-gradient(90deg,#1F8093,rgba(31,128,147,0.5));
    border-radius:999px; margin-top:8px;
  }

  .p7-narrative-box {
    width:640px; background:#FFF;
    margin-top:25px; padding:20px 28px; border:1px solid #BDBDBD;
  }

  .p7-narrative-title { font-size:13px; font-weight:600; color:#1F8093; margin-bottom:12px; }
  .p7-narrative-text {
    font-family:'Inter',sans-serif;
    font-size:13px; line-height:22px; color:#29303D;
    margin-bottom:12px;
  }

  .p7-key-title {
    width:695px; margin-top:25px;
    font-size:13px; font-weight:600; color:black;
    margin-bottom:20px;
  }

  .p7-key-item { width:695px; display:flex; gap:20px; margin-bottom:15px; align-items: center;}

  .p7-key-icon-wrap {
    width:32px; height:32px;
    background:rgba(104,166,166,0.10);
    border-radius:999px;
    display:flex; justify-content:center; align-items:center;
  }
  .p7-key-icon { width:12px; height:12px; background:#68A6A6; border-radius:999px; }

  .p7-key-text {
    width:494px;
    font-family:'Inter',sans-serif;
    font-size:13px; line-height:20px; color:#29303D;
  }

  .p7-footer-line {
    width:100%; height:2px;
    background:rgba(31,128,147,0.30);
    position:absolute; bottom:50px;
  }

  .p7-footer {
    width:100%; text-align:center;
    position:absolute; bottom:22px;
    color:#808080; font-size:13px;
    font-family:'Inter',sans-serif;
  }
</style>
</head>

<body>

<div class="p7-page">

  <!-- LOGO -->
  <img class="p7-logo" src="../assets/provencodee.png" width="100" alt="The Proven Code">

  <!-- PAGE TAG -->
  <div class="p7-tag">Page 7</div>

  <!-- HEADER LINE -->
  <div class="p7-header-line"></div>

  <!-- TITLE -->
  <div class="p7-title-wrap">
    <div class="p7-title">Interpretive Narrative</div>
    <div class="p7-underline"></div>
  </div>

  <!-- NARRATIVE BOX -->
  <div class="p7-narrative-box">

      ${(report.clinicalSummary?.narrative || "")
      .split(". ")
      .filter(p => p.trim().length > 0)
      .map(p => `<div class='p7-narrative-text'>${p.trim()}.</div>`)
      .join("")
    }
  </div>

  <!-- KEY FINDINGS TITLE -->
  <div class="p7-key-title">Key Findings</div>

  <!-- KEY FINDINGS ITEMS -->
  ${(report.clinicalSummary?.keyFindings || [])
      .map(f => `
        <div class="p7-key-item">
          <div class="p7-key-icon-wrap"><div class="p7-key-icon"></div></div>
          <div class="p7-key-text">${f}</div>
        </div>
      `)
      .join("")
    }

  <!-- FOOTER -->
  <div class="p7-footer-line"></div>
  <div class="p7-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>

</div>

</body>
</html>
`;

  return inlineLocalImages(page7HTML);
};

const getPage8HTML = (report) => {
  const durationMap = {
    "Balanced": "No structured reset required",
    "Mild Imbalance": "4-week reset routine recommended",
    "Moderate Dysbiosis": "Structured 4-week plan + clinician review",
    "Significant Dysbiosis": "Advanced analysis recommended"
  };

  const recColor = status => {
    switch (status) {
      case "Balanced": return "green";
      case "Mild Imbalance": return "yellow";
      case "Moderate Dysbiosis": return "orange";
      case "Significant Dysbiosis": return "red";
    }
  };
  // Your Page 8 HTML with Recommendations
  let page8HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">

<style>
  body {
    margin: 0;
    padding: 0;
    background: #F3FAFB;
    font-family: 'Poppins', sans-serif;
  }

  .p8-page {
    width:100%;
    min-height:100vh;
    padding:50px 40px 60px 40px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    align-items:center;
    position:relative;
    background:#F3FAFB;
  }

  .p7-logo { position:absolute; top:20px; left:20px; }
  .p7-tag {
    position:absolute; top:22px; right:22px;
    background:rgba(31,128,147,0.08);
    padding:6px 22px; border-radius:9999px;
    font-size:13px; color:#7E8C9A;
  }

  .p7-header-line { width:150%; height:2px; background:rgba(31,128,147,0.30); margin-top:50px; }

  .p7-title-wrap { width:100%; margin-top:45px; padding-left:20px; }
  .p7-title { font-size:30px; font-weight:600; color:#1F8093; }
  .p7-underline {
    width:120px; height:4px;
    background:linear-gradient(90deg,#1F8093,rgba(31,128,147,0.5));
    border-radius:999px; margin-top:8px;
  }

  .rec-wrapper { margin-top:40px; }

  .rec-box {
    width:560px;
    background:white;
    border:1px solid #BDBDBD;
    padding:18px 20px;
    border-radius:8px;
    margin-bottom:22px;
  }

  .rec-header {
    display:flex;
    justify-content:space-between;
    align-items:center;
  }

  .rec-title-wrap {
    display:flex;
    gap:14px;
    align-items:center;
  }

  /* Circular icons */
  .rec-icon {
    width:44px;
    height:44px;
    border-radius:50%;
    display:flex;
    justify-content:center;
    align-items:center;
  }

  .rec-icon-img {
    width:22px;
    height:22px;
    object-fit:contain;
  }

  /* Icon background colors */
  .icon-green  { background:#E8F8EF; }
  .icon-yellow { background:#FFF7D9; }
  .icon-orange { background:#FFE9D9; }
  .icon-red    { background:#FFE5E3; }

  /* Title dynamic colors */
  .title-green  { color:#12C254!important; }
  .title-yellow { color:#E2B420!important; }
  .title-orange { color:#F77A21!important; }
  .title-red    { color:#E44B47!important; }

  .rec-title {
    font-family:'Inter';
    font-size:16px;
    font-weight:600;
    color:#000;
  }

  .rec-desc {
    margin-top:12px;
    font-family:'Inter';
    font-size:13px;
    line-height:19px;
    color:#29303D;
  }

  /* Status badge */
  .status-badge {
    background:#1E3FA2;
    padding:4px 12px;
    border-radius:4px;
    color:white;
    font-size:11px;
    font-family:'Inter';
  }

  /* Advanced box */
  .adv-box {
    width:560px;
    margin-top:28px;
    background:white;
    border:1px solid #BDBDBD;
    padding:16px 20px;
    border-radius:6px;
  }

  .adv-row {
    display:flex;
    gap:12px;
  }

  .adv-box {
    width: calc(85% - 32px); /* Same as your table width */
    margin-top:28px;
    background:white;
    border:1px solid #BDBDBD;
    padding:16px 20px;
    border-radius:6px;
}

  .adv-title {
    font-size:16px;
    font-weight:600;
  }

  .adv-text {
    font-size:13px;
    color:#808080;
    line-height:16px;
  }

  .p8-footer-line {
    width:100%;
    height:2px;
    background:rgba(31,128,147,0.3);
    position:absolute;
    bottom:55px;
  }

  .p8-footer {
    width:100%;
    text-align:center;
    bottom:22px;
    position:absolute;
    font-size:13px;
    color:#808080;
  }
</style>
</head>

<body>

<div class="p8-page">

  <img class="p7-logo" src="../assets/provencodee.png" width="100">
  <div class="p7-tag">Page 8</div>
  <div class="p7-header-line"></div>

  <div class="p7-title-wrap">
    <div class="p7-title">Recommendations</div>
    <div class="p7-underline"></div>
  </div>

<div class="rec-wrapper">
${["Balanced", "Mild Imbalance", "Moderate Dysbiosis", "Significant Dysbiosis"]
      .map(status => {

        const colorMap = {
          "Balanced": "green",
          "Mild Imbalance": "yellow",
          "Moderate Dysbiosis": "orange",
          "Significant Dysbiosis": "red"
        };

        const color = colorMap[status];

        return `
    <div class="rec-box">

      <div class="rec-header">

        <div class="rec-title-wrap">

          <!-- Circular Icon -->
          <div class="rec-icon icon-${color}">
            <img 
              src="${status === 'Balanced' ? '../assets/tick.png' : '../assets/woah.png'}"
              class="rec-icon-img"
            />
          </div>

          <!-- Colored title if user status -->
          <div class="rec-title ${report.calculatedData?.overallStatus === status
            ? "title-" + color
            : ""
          }">${status}</div>
        </div>

        ${report.calculatedData?.overallStatus === status
            ? `<div class="status-badge">Your Status</div>`
            : ""
          }

      </div>

      <div class="rec-desc">
        ${status === "Balanced"
            ? "Maintain current lifestyle and dietary habits. Continue with regular wellness monitoring."
            : status === "Mild Imbalance"
              ? "Consider a 4-week gut reset program focusing on dietary modifications and probiotic support."
              : status === "Moderate Dysbiosis"
                ? "Consider a structured 4-week gut reset program with clinician review."
                : "Recommend Advanced Functional Microbiome Analysis for comprehensive assessment and personalized treatment plan."
          }
      </div>

    </div>
    `;
      }).join("")}
</div>

<div class="adv-box">
  <div class="adv-row">
    <div class="adv-icon">
  <img src="../assets/background.png" width="18" />
</div>
    <div>
      <div class="adv-title">Advanced Analysis Available</div>
      <div class="adv-text">
        For a more comprehensive understanding of your gut microbiome, consider our Advanced
        Functional Microbiome Analysis. This assessment provides species-level
        identification, metabolic pathway mapping, and personalized intervention recommendations.
      </div>
    </div>
  </div>
</div>

<div class="p8-footer-line"></div>
<div class="p8-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>
</div>
</body>
</html>
`;

  return inlineLocalImages(page8HTML);
};
const getPage9HTML = (report) => {
  let lifestyleData = [];

  // Handle both string and array cases
  if (report && report.calculatedData && report.calculatedData.lifestyle) {
    const lifestyle = report.calculatedData.lifestyle;
    if (typeof lifestyle === 'string') {
      try {
        lifestyleData = JSON.parse(lifestyle);
      } catch (e) {
        console.error('Error parsing lifestyle data:', e);
        lifestyleData = [];
      }
    } else if (Array.isArray(lifestyle)) {
      lifestyleData = lifestyle;
    }
  }

  let page9HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">

<style>

body{
 margin:0;
 background:#F3FAFB; 
 font-family:'Poppins',sans-serif;
}

.page9{
    width:100%;
    min-height:100vh;
    padding:50px 40px 60px 40px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    align-items:center;
    position:relative;
    background:#F3FAFB;
}


/* TOP */
.pg9-logo{
 position:absolute;
 top:22px;left:22px;
}

.pg9-tag{
 position:absolute;
 top:22px;right:22px;
 padding:5px 20px;
 border-radius:100px;
 background:rgba(31,128,147,.08);
 color:#7E8C9A;
 font-size:14px;
 font-family:'Lato';
}

.pg9-line{
 width:150%;
 height:2px;
 margin-top:70px;
 background:rgba(31,128,147,.30);
}


.p9-title-wrap { width:100%; margin-top:45px; padding-left:20px; }
  .p9-title { font-size:30px; font-weight:600; color:#1F8093; }
  .p9-underline {
    width:120px; height:4px;
    background:linear-gradient(90deg,#1F8093,rgba(31,128,147,0.5));
    border-radius:999px; margin-top:8px;
  }


/* BLOCK WRAPPER */
.pg9-wrap{
 margin-top:32px;
 width:100%;
 display:flex;
 flex-direction:column;
 gap:14px;
}


/* BLOCK */
.pg9-box{
 background:white;
 border:1px solid #BDBDBD;
 border-radius:6px;
 padding:16px 18px;
}


/* ROW */
.pg9-row{
 display:flex;
 align-items:flex-start;
 gap:12px;
}

/* ICON */
.pg9-ico{
 width:28px;height:28px;
 background:rgba(31,128,147,.08);
 border-radius:50%;
 display:flex;align-items:center;justify-content:center;
 margin-top:5px;
}

.pg9-ico-dot{
 width:12px;height:12px;
 border-radius:2px;
 border:1.4px solid #1F8093;
}


/* NUMBER */
.pg9-num{
 font-size:14px;
 font-weight:700;
 color:#1F8093;
 font-family:'Poppins';
}

/* TITLE */
.pg9-label{
 font-size:15px;margin-top:4px;
 font-weight:600;
 color:#1F8093;
 font-family:'Poppins';
}

/* TEXT */
.pg9-txt{
 margin-top:6px;
 font-size:13px;
 line-height:20px;
 color:#737373;
 font-family:'Inter';
}


/* FOOTER FIXED */
.pg9-footer-line{
 width:100%;
 height:2px;
 background:rgba(31,128,147,.30);
 position:absolute;
 bottom:50px;left:0;
}

.pg9-footer{
 position:absolute;
 bottom:20px;left:0;width:100%;
 text-align:center;
 font-size:12px;
 color:#808080;
 font-family:'Inter';
}

</style>
</head>

<body>

<div class="page9">

 <img class="pg9-logo" width="110" src="../assets/provencodee.png">
 <div class="pg9-tag">Page 9</div>

 <div class="pg9-line"></div>

 <div class="p9-title-wrap">
    <div class="p9-title">Lifestyle Guidance</div>
    <div class="p9-underline"></div>
  </div>

<!-- DYNAMIC BLOCKS -->
<div class="pg9-wrap">

${lifestyleData.map((item, i) => `

  <div class="pg9-box">
    <div class="pg9-row">

      <!-- ICON IMAGE -->
      <img 
        src="../assets/photo${i + 1}.png"
        class="pg9-icon-img"
        alt="icon${i + 1}"
      />

      <div>
        <div class="pg9-num">${i + 1}- ${item.title}</div>
        <div class="pg9-txt">${item.text}</div>
      </div>

    </div>
  </div>

`).join("")}

</div>

 <div class="pg9-footer-line"></div>
 <div class="pg9-footer">
  Made by The Proven Code | Biome360 Health Check | Wellness Tool
 </div>
</div>
</body>
</html>
`;

  return inlineLocalImages(page9HTML);
};

const getPage10HTML = (report) => {
  // Your Page 10 HTML with Expert Review
  let page10HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">

<style>
  body{
    margin:0;
    padding:0;
    background:#F3FAFB;
    font-family:'Poppins',sans-serif;
  }

  .p10-page{
    width:100%;
    min-height:100vh;
    padding:50px 40px 60px 40px;
    box-sizing:border-box;
    display:flex;
    flex-direction:column;
    align-items:center;
    position:relative;
    background:#F3FAFB;
  }

  /* TOP */
.pg10-logo{
 position:absolute;
 top:22px;left:22px;
}

.pg10-tag{
 position:absolute;
 top:22px;right:22px;
 padding:5px 20px;
 border-radius:100px;
 background:rgba(31,128,147,.08);
 color:#7E8C9A;
 font-size:14px;
 font-family:'Inter';
}

.pg10-line{
 width:150%;
 height:2px;
 margin-top:70px;
 background:rgba(31,128,147,.30);
}

  .p10-title-wrap { width:100%; margin-top:45px; padding-left:20px; }
  .p10-title { font-size:30px; font-weight:600; color:#1F8093; }
  .p10-underline {
    width:120px; height:4px;
    background:linear-gradient(90deg,#1F8093,rgba(31,128,147,0.5));
    border-radius:999px; margin-top:8px;
  }
  .p10-box{
    width:calc(100% - 40px);
    margin:28px auto;
    background:white;
    border-radius:5px;
    border:1px solid rgba(200,200,200,0.5);
    padding:18px 20px;
  }

  .p10-box h4{
    font-size:16px;
    font-weight:600;
    margin-bottom:8px;
    color:#1F8093;
  }

  .p10-box p{
    font-size:14px;
    line-height:22px;
    color:#29303D;
    font-family:'Inter';
    margin-bottom: 8px;
  }

  /* Contact Section */
.p10-contact-section {
    width: calc(100% - 40px);
    margin: 20px auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    box-sizing: border-box;
    gap: 0;
}

.p10-contact-left,
.p10-contact-right {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    flex: 1;
}

.p10-contact-left {
    justify-content: flex-start;
    padding-right: 20px;
}

.p10-contact-right {
    justify-content: flex-end;
    padding-left: 20px;
}

.p10-icon-container {
    flex-shrink: 0;
    width: 24px;
    height: 26px;
    padding-top: 2px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
}

.p10-icon {
    width: 24px;
    height: 24px;
    position: relative;
    flex-shrink: 0;
}

.p10-icon-outline {
    width: 16px;
    height: 20px;
    left: 4px;
    top: 2px;
    position: absolute;
    outline: 2px #1F8093 solid;
    outline-offset: -1px;
}

.p10-icon-dot {
    width: 6px;
    height: 6px;
    left: 9px;
    top: 7px;
    position: absolute;
    outline: 2px #1F8093 solid;
    outline-offset: -1px;
}

.p10-contact-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    flex: 1;
}

.p10-contact-title {
    color: #1F8093;
    font-size: 12px;
    font-family: 'Poppins';
    font-weight: 700;
    line-height: 20px;
    white-space: nowrap;
}

.p10-contact-text {
    color: #737373;
    font-size: 12px;
    font-family: 'Inter';
    font-weight: 400;
    line-height: 20px;
    white-space: pre-line;
    word-break: break-word;
}

.p10-contact-link {
    color: #737373;
    font-size: 12px;
    font-family: 'Inter';
    font-weight: 400;
    text-decoration: underline;
    line-height: 20px;
    display: inline-block;
}

.p10-right-align .p10-contact-title {
    text-align: right;
    width: 100%;
}

.p10-contact-right .p10-contact-content {
    align-items: flex-end;
    text-align: right;
}

  .p10-right-align {
    text-align: right;
  }

  .p10-footer-line{
    width:100%;
    height:2px;
    background:rgba(31,128,147,0.30);
    position:absolute;
    bottom:42px;
  }

  .p10-footer{
    position:absolute;
    width:100%;
    bottom:14px;
    text-align:center;
    font-size:12px;
    font-family:'Inter';
    color:#737373;
  }
</style>
</head>

<body>

<div class="p10-page">

<img class="pg10-logo" width="110" src="../assets/provencodee.png">
 <div class="pg10-tag">Page 10</div>

 <div class="pg10-line"></div>

  <div class="p10-title-wrap">
    <div class="p10-title">Expert Review</div>
    <div class="p10-underline"></div>
  </div>

  <!-- Content Box -->
<div class="p10-box">

  <h4>Expert Review Note:</h4>
  <p>
    ${ report?.summaryObservation || "Please consult your clinician for advanced interpretation and a personalized care plan." }
  </p>

  <br/>

  <h4>Disclaimer:</h4>
  <p>
    This <strong>Biome360 Health Check Report</strong> is a <strong>wellness-oriented microbiome assessment</strong> and is <strong>not intended for diagnosis or disease identification</strong>.
    All interpretations are based on <strong>microbial metabolite patterns and research-based scientific literature</strong>, and should <strong>not be considered a substitute for medical advice</strong>.
  </p>

  <p style="margin-top: 12px;">
    <strong>Always consult a qualified healthcare provider</strong> before making any changes to medication, supplements, or treatment plans.
  </p>

  <p style="margin-top: 12px;">
    <strong>In case of any concerning symptoms or medical emergencies, seek medical attention immediately.</strong>
  </p>

</div>

 <!-- Contact Section -->
<div class="p10-contact-section">
    <div class="p10-contact-left">
        <div class="p10-icon-container">
                <img class="p10-icon" src="../assets/location.png" alt="icon outline"/>
        </div>
        <div class="p10-contact-content">
            <div class="p10-contact-title">Visit Us:</div>
            <div class="p10-contact-text">3rd Floor, Plot 94
Near Radisson Blu
Dwarka Sector 13,
New Delhi 110078
Delhi (IN)</div>
        </div>
    </div>
    <div class="p10-contact-right">
        <div class="p10-contact-content">
            <div class="p10-contact-title p10-right-align">Know More:</div>
            <div>
                <a href="https://www.theprovencode.com" class="p10-contact-link">www.theprovencode.com</a>
            </div>
        </div>
    </div>
</div>

  <!-- Footer -->
  <div class="p10-footer-line"></div>
  <div class="p10-footer">Made by The Proven Code | Biome360 Health Check | Wellness Tool</div>

</div>

</body>
</html>
`;

  return inlineLocalImages(page10HTML);
};

/* ---------------------------------------------------------
    BUILD FINAL MULTIPAGE HTML
--------------------------------------------------------- */

const buildFullHTML = (report) => {
  console.log("[pdfGenerator] Building 10-page HTML...");

  const page1HTML = getPage1HTML(report);
  const page2HTML = getPage2HTML(report);
  const page3HTML = getPage3HTML(report);
  const page4HTML = getPage4HTML(report);
  const page5HTML = getPage5HTML(report);
  const page6HTML = getPage6HTML(report);
  const page7HTML = getPage7HTML(report);
  const page8HTML = getPage8HTML(report);
  const page9HTML = getPage9HTML(report);
  const page10HTML = getPage10HTML(report);

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>

  /* ---------------------------
      GLOBAL PAGE SETTINGS
  ----------------------------*/
  @page {
    size: A4;
    margin: 0;
  }

  html, body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: #ffffff;
  }

  /* ---------------------------
      PDF PAGE WRAPPER
  ----------------------------*/
  .pdf-page-wrapper {
    width: 210mm;
    min-height: 297mm;
    overflow: hidden;
    page-break-after: always;
    position: relative;
    background: #FEFFFF;
    display: block;
  }

  .pdf-page-wrapper:last-child {
    page-break-after: auto;
  }

  /* ---------------------------
      ALLOW PAGE BLOCKS INSIDE
  ----------------------------*/
  .pdf-page-wrapper > div {
    width: 100%;
    height: auto;
    max-width: 100%;
    position: relative;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* remove any rogue min-widths */
  * {
    max-width: 100% !important;
  }

</style>
</head>

<body>

  <div class="pdf-page-wrapper">${page1HTML}</div>
  <div class="pdf-page-wrapper">${page2HTML}</div>
  <div class="pdf-page-wrapper">${page3HTML}</div>
  <div class="pdf-page-wrapper">${page4HTML}</div>
  <div class="pdf-page-wrapper">${page5HTML}</div>
  <div class="pdf-page-wrapper">${page6HTML}</div>
  <div class="pdf-page-wrapper">${page7HTML}</div>
  <div class="pdf-page-wrapper">${page8HTML}</div>
  <div class="pdf-page-wrapper">${page9HTML}</div>
  <div class="pdf-page-wrapper">${page10HTML}</div>

</body>
</html>
`;
};

/* ---------------------------------------------------------
    MAIN PDF GENERATOR - SIMPLE AND DIRECT
--------------------------------------------------------- */

export const generatePDF = async (report, outputPath = null) => {
  // If an external HTML-to-PDF API key is configured, prefer that path to avoid Chromium entirely
  if (process.env.HTML2PDF_API_KEY) {
    try {
      const formattedReport = {
        ...report.toObject ? report.toObject() : report,
        patient: report.patient || { name: 'Unknown' },
        testId: report.testId || 'Unknown',
        calculatedData: report.calculatedData || {}
      };

      const htmlContent = buildFullHTML(formattedReport);

      // Example using html2pdf.app
      const resp = await axios.post(
        `https://api.html2pdf.app/v1/generate`,
        { html: htmlContent },
        {
          params: { apiKey: process.env.HTML2PDF_API_KEY },
          responseType: 'arraybuffer',
          timeout: 120000
        }
      );

      const pdfBuffer = Buffer.from(resp.data);

      if (outputPath) {
        fs.writeFileSync(outputPath, pdfBuffer);
      }
      return pdfBuffer;
    } catch (e) {
      console.error('[External PDF] HTML2PDF failed:', e?.response?.data || e.message);
      // Fall through to Chromium path if external service fails
    }
  }

  // Fallback: Use Chromium/Puppeteer path
  let browser;
  try {
    const { default: chromium } = await import('@sparticuz/chromium');
    const { default: puppeteerCore } = await import('puppeteer-core');
    const execPath = await chromium.executablePath();
    browser = await puppeteerCore.launch({
      headless: true,
      args: chromium.args,
      executablePath: execPath,
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true
    });
  } catch (e) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-zygote"
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (await puppeteer.executablePath())
    });
  }

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const url = req.url();
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return req.abort();
      }
      req.continue();
    });

    const formattedReport = {
      ...report.toObject ? report.toObject() : report,
      patient: report.patient || { name: 'Unknown' },
      testId: report.testId || 'Unknown',
      calculatedData: report.calculatedData || {}
    };

    const htmlContent = buildFullHTML(formattedReport);

    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 120000
    });

    await new Promise(r => setTimeout(r, 500));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm" },
    });

    if (outputPath) {
      const fs = await import('fs');
      fs.writeFileSync(outputPath, pdfBuffer);
    }

    return pdfBuffer;

  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error(`PDF generation failed: ${err.message}`);
  } finally {
    await browser.close();
  }
};

export default generatePDF;
