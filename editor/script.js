const API = "https://script.google.com/macros/s/AKfycbyQnjhtbnMsKen2UJp7oxhJuJ8B9-rHUjhGY4DcgWr_KrqR7ZDdDPlJKvSvwTrDVlu4/exec";
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

    /* ========= LOAD INFO ========= */
    const infoFields = [
      "customer", "acReg", "woNo", "partDesc", "partNo", "serialNo", "qty",
      "dateReceived", "reason", "adStatus", "attachedParts", "missingParts",
      "modStatus", "docId"
    ];

    infoFields.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;

      let value = data.info[i] || "";

      // ✅ LOCAL-SAFE date handling (NO timezone shift)
      if (el.type === "date" && value) {
        const d = new Date(value);

        if (!isNaN(d)) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          value = `${year}-${month}-${day}`; // yyyy-mm-dd
        } else {
          value = "";
        }
      }

      el.value = value;
    });

    /* ========= LOAD FINDINGS ========= */
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
  
  // Use existing identification or a placeholder for the header summary
  const summaryText = data.identification || "New Finding (Click to edit)";

  const div = document.createElement("div");
  div.className = "card finding"; 

  // ✅ IMPORTANT: Mark the card so we know if it exists in GAS or not
  if (isNew) {
    div.setAttribute("data-is-new", "true");
  }

  div.innerHTML = `
    <!-- HEADER BAR (Visible when collapsed) -->
    <div class="card-header" onclick="toggleFinding(this)">
      <div class="header-info">
        <span class="header-pir-no">${findingNo}</span>
        <span class="header-summary">${summaryText}</span>
      </div>
      <span class="toggle-icon">▼</span>
    </div>

    <!-- EXPANDABLE CONTENT (Hidden until clicked) -->
    <div class="card-content">
      <div class="form-group">
        <label>Finding No.</label>
        <div class="pir-no" data-pir-no>${findingNo}</div>
      </div>

      <div class="form-group">
        <label>Picture</label>
        <input type="file" accept="image/*">
        <img class="preview" style="max-width:100%;margin-top:8px;border-radius:8px;display:none;">
      </div>

      <div class="form-group">
        <label>Identification</label>
        <textarea class="ident-input" oninput="updateSummary(this)">${data.identification || ""}</textarea>
      </div>

      <div class="form-group">
        <label>Action</label>
        <textarea>${data.action || ""}</textarea>
      </div>

      <div style="text-align: right; margin-top: 10px;">
        <button class="btn ghost" type="button" onclick="removeFindingCard(this)" style="color:var(--danger); border-color:var(--danger);">
          ❌ Remove Finding
        </button>
      </div>
    </div>
  `;

  // --- Image Handling Logic (Your existing logic) ---
  const fileInput = div.querySelector('input[type="file"]');
  const img = div.querySelector(".preview");

  if (data.imageUrl) {
    img.src = convertDriveUrl(data.imageUrl);
    img.style.display = "block";
    fileInput.dataset.existing = data.imageUrl; // preserve original Drive URL
  }

  fileInput.addEventListener("change", function () {
    previewImage(this);
    delete this.dataset.existing; // mark as replaced if a new file is chosen
  });

  container.appendChild(div);
}

// Function to expand/collapse
function toggleFinding(header) {
  const card = header.closest(".card");
  card.classList.toggle("is-open");
}

// Function to update the header summary in real-time
function updateSummary(textarea) {
  const card = textarea.closest(".card");
  const summarySpan = card.querySelector(".header-summary");
  summarySpan.textContent = textarea.value || "New Finding (Click to edit)";
}

// Add new empty finding
function addFinding() {
  const container = document.getElementById("findingList");
  const woNo = document.getElementById("woNo").value || "PIR";
  const index = container.children.length;
  
  // Create the card
  addFindingCard(container, index, woNo);

  // ✅ ADD THIS LINE: Mark the last added card as NEW
  container.lastElementChild.setAttribute("data-is-new", "true");
  
  // NEW: Automatically open the newly added finding
  container.lastElementChild.classList.add("is-open");
}

// Remove finding card (with confirmation if data exists)
async function removeFindingCard(btn) {
  const card = btn.closest(".card");
  const findingNo = card.querySelector("[data-pir-no]").textContent;

  // ✅ Check if this card was just added and never saved
  const isNew = card.getAttribute("data-is-new") === "true";

  if (isNew) {
    // Just remove from UI, no server call needed
    if (confirm("Remove this unsaved finding?")) {
      card.remove();
      updateFindingNumbers(); // Renumber remaining cards (PIR01, PIR02...)
    }
    return;
  }  

  // VERIFY: Open your browser console (F12) to see if these are correct
  console.log("Deleting Finding:", findingNo);
  console.log("From Sheet ID:", sheetId);

  const message = `Are you sure delete finding No: ${findingNo}?\n\n⚠️ Material Listed for this finding will be deleted too!`;
  if (!confirm(message)) return;

  showLoading(true);

  try {
    const formData = new FormData();
    formData.append("action", "deleteFinding");
    formData.append("sheetId", sheetId); // Ensure this variable is the one from the URL
    formData.append("findingNo", findingNo);

    const res = await fetch(API, { method: "POST", body: formData });
    const result = await res.json();

    if (result.success) {
      alert(`Finding ${findingNo} deleted.`);
      await loadEditor(); // This re-fetches data to show new numbering
    } else {
      // THIS WILL NOW TELL YOU THE EXACT ERROR FROM GAS
      alert("Error: " + result.error);
    }
  } catch (err) {
    alert("Connection Error. See console.");
    console.error(err);
  } finally {
    showLoading(false);
  }
}

// Update finding numbering after deletion
function updateFindingNumbers() {
  const container = document.getElementById("findingList");
  const woNo = document.getElementById("woNo").value || "PIR";

  Array.from(container.children).forEach((div, i) => {
    const formattedIndex = String(i + 1).padStart(2, "0");
    const findingNo = `${woNo}${formattedIndex}`;
    
    // Update the hidden/internal PIR No
    const pirNoEl = div.querySelector("[data-pir-no]");
    if (pirNoEl) pirNoEl.textContent = findingNo;

    // Update the Header PIR No
    const headerNoEl = div.querySelector(".header-pir-no");
    if (headerNoEl) headerNoEl.textContent = findingNo;
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

// ================= SAVE PIR (EDITOR) =================
async function savePIR() {
  showLoading(true);

  try {
    const formData = new FormData();

    // -------- INFO FIELDS --------
    [
      "customer","acReg","woNo","partDesc","partNo","serialNo",
      "qty","dateReceived","reason","adStatus",
      "attachedParts","missingParts","modStatus","docId"
    ].forEach(id => {
      const el = document.getElementById(id);
      formData.append(id, el ? el.value : "");
    });

    formData.append("action", "updatePIR");
    formData.append("sheetId", sheetId);

    // -------- FINDINGS --------
    const container = document.getElementById("findingList");
    const findings = [];

    Array.from(container.children).forEach(card => {
      const findingNo = card.querySelector("[data-pir-no]")?.textContent || "";
      const textareas = card.querySelectorAll("textarea");
      const imgInput = card.querySelector('input[type="file"]');
      const img = card.querySelector(".preview");

      findings.push({
        findingNo,
        identification: textareas[0]?.value || "",
        action: textareas[1]?.value || "",
        // ✅ NEW IMAGE (base64)
        imageBase64:
          img && img.src && img.src.startsWith("data:")
            ? img.src
            : "",
        // ✅ EXISTING IMAGE (Drive URL)
        existingImage: imgInput?.dataset?.existing || ""
      });
    });

    formData.append("findings", JSON.stringify(findings));

    // -------- SEND --------
    const res = await fetch(API, {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    const result = await res.json();

    if (!result.success) {
      alert("Save failed:\n" + result.error);
      console.error(result.error);
      return;
    }

    alert("PIR updated successfully ✅");

  } catch (err) {
    console.error(err);
    alert("Error saving PIR.\nCheck console.");
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


async function generatePDF() {
  showLoading(true);

  try {
    const res = await fetch(API, {
      method: "POST",
      body: new URLSearchParams({
        action: "generateDoc",
        sheetId: sheetId // current PIR sheet
      })
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    const result = await res.json();

    if (!result.success) {
      alert("Failed to generate PDF:\n" + (result.error || "Unknown error"));
      console.error(result.error);
      return;
    }

    // ✅ Use copiedDocUrl from backend
    const docUrl = result.copiedDocUrl;
    if (docUrl) {
      window.open(docUrl, "_blank");
    } else {
      console.warn("Backend did not return copiedDocUrl:", result);
    }

  } catch (err) {
    console.error(err);
    alert("Error generating PDF. Check console for details.");
  } finally {
    showLoading(false);
  }
}


// Loading overlay
function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.classList.toggle("hidden", !show);
}

// Init
window.addEventListener("DOMContentLoaded", loadEditor);

