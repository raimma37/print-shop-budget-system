const fs = require('fs');
const PizZip = require('pizzip');

try {
  const content = fs.readFileSync('public/uploads/contracts/Contrato-ContratodeAluguelMODELO-1784558332706.docx');
  const zip = new PizZip(content);
  console.log("SUCCESS: DOCX is a valid ZIP file. Number of files inside:", Object.keys(zip.files).length);
} catch (e) {
  console.error("ERROR: DOCX is corrupted or not a valid ZIP file:", e.message);
}
