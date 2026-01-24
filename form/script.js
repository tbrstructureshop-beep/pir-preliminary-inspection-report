function addFinding() {
  const container = document.getElementById("findingList");
  const index = container.children.length + 1;

  const woNoInput = document.getElementById("woNo");
  const woNo = woNoInput.value.trim();

  // 🔒 BLOCK if W/O No is empty
  if (!woNo) {
    alert("Please enter W/O No first");
    woNoInput.focus();
    return;
  }

  const formattedIndex = String(index).padStart(2, "0");
  const findingNo = `${woNo}${formattedIndex}`;

  const div = document.createElement("div");
  div.className = "card finding";

  div.innerHTML = `
    <h3>PIR ${index}</h3>

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
      <textarea></textarea>
    </div>

    <div class="form-group">
      <label>Action</label>
      <textarea></textarea>
    </div>
  `;

  container.appendChild(div);
}


function previewImage(input) {
  const file = input.files[0];
  if (!file) return;

  const img = input.nextElementSibling;
  const reader = new FileReader();

  reader.onload = () => {
    img.src = reader.result;
    img.style.display = "block";
  };

  reader.readAsDataURL(file);
}

function cancelFinding() {
  const container = document.getElementById("findingList");
  if (!container.lastElementChild) return;

  container.removeChild(container.lastElementChild);
  renumberPIR();
}

function renumberPIR() {
  const woNo = document.getElementById("woNo").value || "WO";

  document.querySelectorAll(".finding").forEach((card, i) => {
    const num = i + 1;
    const formatted = String(num).padStart(2, "0");

    card.querySelector("h3").textContent = `PIR ${num}`;
    card.querySelector("[data-pir-no]").textContent = `${woNo}${formatted}`;
  });
}



function resetPIR(skipConfirm = false) {
  if (!skipConfirm && !confirm("Reset all PIR data?")) return;

  document.querySelectorAll(
    "input[type=text], input[type=number], input[type=date], textarea"
  ).forEach(el => el.value = "");

  document.getElementById("findingList").innerHTML = "";
}


function collectFindings() {
  const findings = [];

  document.querySelectorAll(".finding").forEach(card => {
    const findingNo = card.querySelector("[data-pir-no]")?.textContent || "";
    const textareas = card.querySelectorAll("textarea");
    const img = card.querySelector("img.preview");

    findings.push({
      findingNo: findingNo,
      identification: textareas[0]?.value || "",
      action: textareas[1]?.value || "",
      imageBase64: (img && img.src && img.src.startsWith("data:")) ? img.src : ""
    });
  });

  return findings;
}


async function submitPIR() {
  const woNo = document.getElementById("woNo")?.value.trim();
  if (!woNo) {
    alert("W/O No is required");
    return;
  }

  showLoading();

  const formData = new FormData();

  // INFO fields
  [
    "customer","acReg","woNo","partDesc","partNo","serialNo",
    "qty","dateReceived","reason","adStatus",
    "attachedParts","missingParts","modStatus","docId"
  ].forEach(id => {
    const el = document.getElementById(id);
    formData.append(id, el ? el.value : "");
  });

  // FINDINGS
  const findings = collectFindings();
  formData.append("findings", JSON.stringify(findings));

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbyQnjhtbnMsKen2UJp7oxhJuJ8B9-rHUjhGY4DcgWr_KrqR7ZDdDPlJKvSvwTrDVlu4/exec",
      {
        method: "POST",
        body: formData
      }
    );

    if (!res.ok) {
      throw new Error("HTTP Error " + res.status);
    }

    const result = await res.json();

    hideLoading();

    if (!result.success) {
      alert("Backend error:\n" + result.error);
      console.error("Backend error:", result.error);
      return;
    }

    // ✅ reset AFTER success only
    resetPIR(true);

    // ✅ redirect last
    // ✅ redirect AFTER success
    const redirectUrl = result.copiedDocUrl || result.fileUrl; // use copiedDocUrl first
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      console.warn("No redirect URL returned from backend:", result);
      alert("Submission succeeded, but cannot redirect. Check console for details.");
    }

  } catch (err) {
    hideLoading();
    console.error(err);
    alert("Connection / backend error.\nCheck console.");
  }
}


function showLoading() {
  const overlay = document.querySelector(".loading-overlay");
  if (overlay) overlay.classList.remove("hidden");
  document.body.classList.add("loading");
}

function hideLoading() {
  const overlay = document.querySelector(".loading-overlay");
  if (overlay) overlay.classList.add("hidden");
  document.body.classList.remove("loading");
}


// Toggle the user menu visibility
function toggleUserMenu() {
  const userMenuContent = document.querySelector('.user-menu-content');
  userMenuContent.classList.toggle('active');
}

// Function for redirecting to Home
function goHome() {
  window.location.href = "/home/index.html"; // Redirect to /home/index.html
}

// Function for Log Out (with placeholder functionality)
function logout() {
  alert("Logging out..."); // Placeholder for logout functionality
  // Add logout logic here, like clearing sessionStorage or redirecting to a login page
  sessionStorage.clear();  // Example: Clear sessionStorage on logout
  window.location.href = "/login.html";  // Redirect to a login page after logout
}

















