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



function resetPIR() {
  if (!confirm("Reset all PIR data?")) return;

  // Clear all text inputs & textareas
  document.querySelectorAll("input[type=text], input[type=date], textarea")
    .forEach(el => el.value = "");

  // Clear findings
  document.getElementById("findingList").innerHTML = "";
}

async function submitPIR() {
  const formData = new FormData();

  const fields = [
    "customer",
    "acReg",
    "woNo",
    "partDesc",
    "partNo",
    "serialNo",
    "qty",
    "dateReceived",
    "reason",
    "adStatus",
    "attachedParts",
    "missingParts",
    "modStatus",
    "docId"
  ];

  for (const id of fields) {
    const el = document.getElementById(id);
    formData.append(id, el ? el.value : "");
  }

  try {
    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbwJw0NmVGvN4gWy4sgOtQuBBTZzuSFdFnqc4lcjSSCLTevtTrO95F1Iz0PmevNHA_aw/exec",
      {
        method: "POST",
        body: formData
      }
    );

    const result = await res.json();

    if (!result.success) {
      alert(result.error);
      return;
    }

    window.location.href = result.fileUrl;

  } catch (err) {
    console.error(err);
    alert("Connection error");
  }
}

