const API = "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";
const params = new URLSearchParams(window.location.search);
const sheetId = params.get("id");

let findings = [];

/* ===================== INIT ===================== */
document.addEventListener("DOMContentLoaded", loadPIR);

/* ===================== LOAD PIR ===================== */
async function loadPIR() {
  if (!sheetId) return alert("No PIR ID provided");

  showLoading();
  const res = await fetch(`${API}?action=getPIR&id=${sheetId}`);
  const data = await res.json();

  fillInfo(data.info);
  findings = data.findings || [];
  renderFindings();
  hideLoading();
}

function fillInfo(info) {
  const fields = [
    "customer","acReg","woNo","partDesc","partNo","serialNo",
    "qty","dateReceived","reason","adStatus","attachedParts","missingParts","modStatus","sheetId"
  ];
  fields.forEach((id, i) => {
    document.getElementById(id).value = info[i] || "";
  });
}

/* ===================== FINDINGS ===================== */
function renderFindings() {
  const list = document.getElementById("findingList");
  list.innerHTML = "";

  findings.forEach((f, i) => {
    const div = document.createElement("div");
    div.className = "finding-card";

    div.innerHTML = `
      <label>Finding No: ${f.findingNo}</label>
      <textarea placeholder="Identification">${f.identification || ""}</textarea>
      <textarea placeholder="Action">${f.action || ""}</textarea>
      ${f.imageUrl ? `<img src="${f.imageUrl}" />` : ""}
      <button onclick="removeFinding(${i})" class="btn secondary">Remove</button>
    `;
    list.appendChild(div);
  });
}

function addFinding() {
  const nextNo = findings.length + 1;
  findings.push({ findingNo: nextNo, identification: "", action: "", imageUrl: "" });
  renderFindings();
}

function removeFinding(index) {
  findings.splice(index, 1);
  renderFindings();
}

function collectFindings() {
  const list = document.getElementById("findingList");
  return Array.from(list.children).map((div, i) => ({
    findingNo: findings[i].findingNo,
    identification: div.querySelector("textarea:nth-of-type(1)").value,
    action: div.querySelector("textarea:nth-of-type(2)").value,
    imageUrl: findings[i].imageUrl
  }));
}

/* ===================== SAVE ===================== */
async function savePIR() {
  showLoading();

  const infoFields = [
    "customer","acReg","woNo","partDesc","partNo","serialNo",
    "qty","dateReceived","reason","adStatus","attachedParts","missingParts","modStatus","sheetId"
  ];

  const info = infoFields.map(id => document.getElementById(id).value);

  const formData = new FormData();
  formData.append("sheetId", sheetId);
  formData.append("info", JSON.stringify(info));
  formData.append("findings", JSON.stringify(collectFindings()));

  await fetch(API, { method: "POST", body: formData });
  hideLoading();
  alert("PIR updated successfully");
}

/* ===================== CANCEL ===================== */
function cancelEdit() {
  window.history.back();
}

/* ===================== PDF BUTTON ===================== */
function generatePDF() {
  alert("PDF generation feature will be implemented here.");
}

/* ===================== LOADING ===================== */
function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

