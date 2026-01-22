const API = "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";
const urlParams = new URLSearchParams(window.location.search);
const sheetId = urlParams.get("id");

// Load PIR editor
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

    // Load Findings as cards
    const container = document.getElementById("findingList");
    container.innerHTML = "";
    const woNo = document.getElementById("woNo").value || "PIR";

    data.findings.forEach((f, index) => {
      addFindingCard(container, index, woNo, f);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to load PIR data.");
  } finally {
    showLoading(false);
  }
}

// Add finding card
function addFindingCard(container, index, woNo, data = {}) {
  const formattedIndex = String(index + 1).padStart(2, "0");
  const findingNo = `${woNo}${formattedIndex}`;

  const div = document.createElement("div");
  div.className = "card finding";

  div.innerHTML = `
    <h3>PIR ${formattedIndex}</h3>

    <div class="form-group">
      <label>Finding No.</label>
      <div class="pir-no" data-pir-no>${findingNo}</div>
    </div>

    <div class="form-group">
      <label>Picture</label>
      <input type="file" accept="image/*" onchange="previewImage(this)">
      <img class="preview" style="max-width:100%;margin-top:8px;border-radius:8px;">
    </div>

    <div class="form-group">
      <label>Identification</label>
      <textarea>${data.identification || ""}</textarea>
    </div>

    <div class="form-group">
      <label>Action</label>
      <textarea>${data.action || ""}</textarea>
    </div>

    <button class="btn ghost" type="button" onclick="removeFindingCard(this)">❌ Remove Finding</button>
  `;

  // If existing image URL, show preview
  if (data.imageUrl) {
    const img = div.querySelector(".preview");
    img.src = convertDriveUrl(data.imageUrl);
    img.style.display = "block";
    div.querySelector("input[type=file]").style.display = "none";
  }

  container.appendChild(div);
}

// Add new empty finding
function addFinding() {
  const container = document.getElementById("findingList");
  const woNo = document.getElementById("woNo").value || "PIR";
  const index = container.children.length;
  addFindingCard(container, index, woNo);
}

// Remove finding card
// Remove finding card (with confirmation if data exists)
function removeFindingCard(btn) {
  const card = btn.closest(".card");

  const hasImage =
    card.querySelector("img.preview") &&
    card.querySelector("img.preview").src &&
    card.querySelector("img.preview").style.display !== "none";

  const hasIdentification =
    card.querySelector("textarea") &&
    card.querySelectorAll("textarea")[0].value.trim() !== "";

  const hasAction =
    card.querySelectorAll("textarea").length > 1 &&
    card.querySelectorAll("textarea")[1].value.trim() !== "";

  // If any data exists → confirm
  if (hasImage || hasIdentification || hasAction) {
    const ok = confirm("Are you sure you want to delete this finding?");
    if (!ok) return;
  }

  card.remove();
  updateFindingNumbers();
}

// Update finding numbering after deletion
function updateFindingNumbers() {
  const container = document.getElementById("findingList");
  const woNo = document.getElementById("woNo").value || "PIR";

  Array.from(container.children).forEach((div, i) => {
    const formattedIndex = String(i + 1).padStart(2, "0");
    const findingNo = `${woNo}${formattedIndex}`;
    div.querySelector("[data-pir-no]").textContent = findingNo;
    div.querySelector("h3").textContent = `PIR ${formattedIndex}`;
  });
}

// Preview image (works for both new upload and existing GDrive image)
function previewImage(input) {
  if (!input.files || !input.files[0]) return;

  const img = input.nextElementSibling;
  const reader = new FileReader();

  reader.onload = e => {
    img.src = e.target.result;   // base64
    img.style.display = "block";
  };

  reader.readAsDataURL(input.files[0]);
}


// Convert standard GDrive share link to direct viewable link
function convertDriveUrl(url) {
  if (!url) return "";

  // Already thumbnail
  if (url.includes("drive.google.com/thumbnail")) return url;

  // /file/d/FILE_ID/view
  let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }

  // ?id=FILE_ID
  match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }

  return ""; // fallback = hide image
}



// Save PIR
async function savePIR() {
  const infoFields = [
    "customer","acReg","woNo","partDesc","partNo","serialNo","qty",
    "dateReceived","reason","adStatus","attachedParts","missingParts",
    "modStatus","docId"
  ];
  const infoData = infoFields.map(id => document.getElementById(id).value);

  const container = document.getElementById("findingList");
  const findings = Array.from(container.children).map((div, i) => ({
    findingNo: div.querySelector("[data-pir-no]").textContent,
    imageUrl: div.querySelector(".preview").src || "",
    identification: div.querySelectorAll("textarea")[0].value,
    action: div.querySelectorAll("textarea")[1].value
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
    window.location.href = "/dashboard/";
  }
}

// PDF stub
function generatePDF() {
  alert("PDF generation not implemented yet.");
}

// Loading overlay
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

// Init
window.addEventListener("DOMContentLoaded", loadEditor);



