const API = "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";

// Correctly get 'id' from query string
const urlParams = new URLSearchParams(window.location.search);
const sheetId = urlParams.get("id");

// Load editor data
async function loadEditor() {
  if (!sheetId) {
    alert("No PIR ID provided!");
    return;
  }

  showLoading(true);

  try {
    const res = await fetch(`${API}?action=getPIR&id=${sheetId}`);
    const data = await res.json();

    // Load INFO
    const infoFields = [
      "customer","acReg","woNo","partDesc","partNo","serialNo","qty",
      "dateReceived","reason","adStatus","attachedParts","missingParts",
      "modStatus","docId"
    ];
    infoFields.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.value = data.info[i] || "";
    });

    // Load FINDINGS into table
    const tbody = document.getElementById("findingBody");
    tbody.innerHTML = "";
    data.findings.forEach((f, i) => {
      tbody.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${f.findingNo || i+1}</td>
          <td>${f.imageUrl ? `<img src="${f.imageUrl}" class="thumb"/>` : `<input type="file" accept="image/*" onchange="previewImage(this)"/>`}</td>
          <td><input type="text" value="${f.identification || ""}"/></td>
          <td><input type="text" value="${f.action || ""}"/></td>
          <td><button type="button" onclick="removeFinding(this)">❌</button></td>
        </tr>
      `);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load PIR data.");
  } finally {
    showLoading(false);
  }
}

// Add a new empty finding row
function addFinding() {
  const tbody = document.getElementById("findingBody");
  const rowIndex = tbody.rows.length + 1;
  tbody.insertAdjacentHTML("beforeend", `
    <tr>
      <td>${rowIndex}</td>
      <td><input type="file" accept="image/*" onchange="previewImage(this)"/></td>
      <td><input type="text"/></td>
      <td><input type="text"/></td>
      <td><button type="button" onclick="removeFinding(this)">❌</button></td>
    </tr>
  `);
}

// Remove finding row
function removeFinding(btn) {
  btn.closest("tr").remove();
  updateFindingNumbers();
}

// Keep finding numbers sequential
function updateFindingNumbers() {
  const tbody = document.getElementById("findingBody");
  Array.from(tbody.rows).forEach((row, i) => {
    row.cells[0].textContent = i + 1;
  });
}

// Save PIR to backend
async function savePIR() {
  const infoFields = [
    "customer","acReg","woNo","partDesc","partNo","serialNo","qty",
    "dateReceived","reason","adStatus","attachedParts","missingParts",
    "modStatus","docId"
  ];
  const infoData = infoFields.map(id => document.getElementById(id).value);

  const findings = Array.from(document.querySelectorAll("#findingBody tr")).map((tr, i) => ({
    findingNo: tr.cells[0].textContent || i+1,
    imageUrl: tr.cells[1].querySelector("img")?.src || "",
    identification: tr.cells[2].querySelector("input").value,
    action: tr.cells[3].querySelector("input").value
  }));

  showLoading(true);

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "updatePIR",
        sheetId,
        infoData: JSON.stringify(infoData),
        findings: JSON.stringify(findings)
      })
    });

    const result = await res.json();
    if (result.success) {
      alert("PIR saved successfully!");
    } else {
      alert("Failed to save PIR: " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert("Error saving PIR.");
  } finally {
    showLoading(false);
  }
}

// Cancel edit
function cancelEdit() {
  if (confirm("Discard changes and go back to dashboard?")) {
    window.location.href = "/dashboard/"; // adjust if your dashboard path is different
  }
}

// PDF generation stub
function generatePDF() {
  alert("PDF generation is not implemented yet.");
  // TODO: send PIR data to Apps Script for PDF creation
}

// Loading overlay
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

// Optional: preview image before upload
function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.className = "thumb";
      input.replaceWith(img);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Initialize editor on page load
window.addEventListener("DOMContentLoaded", loadEditor);
