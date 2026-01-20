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


async function submitPIR() {
  const woNo = document.getElementById("woNo").value.trim();
  const partDesc = document.getElementById("partDesc").value.trim();

  if (!woNo) {
    alert("W/O No is required");
    return;
  }

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.remove("hidden");

  const formData = new FormData();

  // GENERAL INFO
  formData.append("customer", document.getElementById("customer").value);
  formData.append("acReg", document.getElementById("acReg").value);
  formData.append("woNo", woNo);
  formData.append("partDesc", partDesc);
  formData.append("partNo", document.getElementById("partNo").value);
  formData.append("serialNo", document.getElementById("serialNo").value);
  formData.append("qty", document.getElementById("qty").value);
  formData.append("dateReceived", document.getElementById("dateReceived").value);
  formData.append("reason", document.getElementById("reason").value);
  formData.append("adStatus", document.getElementById("adStatus").value);
  formData.append("attachedParts", document.getElementById("attachedParts").value);
  formData.append("missingParts", document.getElementById("missingParts").value);
  formData.append("modStatus", document.getElementById("modStatus").value);
  formData.append("docId", document.getElementById("docId").value);

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbxCRSeuuOvyc2G4RsLv59uNH8BsGU27v4dGnriHoJd9-TSGaFSsljhcCj4x0ZjVtfNpfg/exec",
      {
        method: "POST",
        body: formData
      }
    );

    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || "Unknown error");
    }

    // RESET FORM BEFORE REDIRECT
    resetPIR(true);

    // SHORT DELAY SO RESET IS VISIBLE
    setTimeout(() => {
      window.location.href = result.fileUrl;
    }, 400);

  } catch (err) {
    console.error(err);
    alert("Failed to submit PIR");
    overlay.classList.add("hidden");
  }
}




