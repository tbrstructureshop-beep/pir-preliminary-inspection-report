let findingCount = 0;

function addFinding() {
  findingCount++;

  const container = document.getElementById("findingList");

  const div = document.createElement("div");
  div.className = "card";
  div.dataset.index = findingCount;

  div.innerHTML = `
    <h3>Finding ${findingCount}</h3>

    <div class="form-group">
      <label>No. (W/O No + 01)</label>
      <input type="text" value="${document.getElementById("woNo").value}-${String(findingCount).padStart(2,"0")}">
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
  const img = input.nextElementSibling;

  const reader = new FileReader();
  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(file);
}

function cancelFinding() {
  const list = document.getElementById("findingList");
  if (list.lastChild) {
    list.removeChild(list.lastChild);
    findingCount--;
  }
}

function resetPIR() {
  if (!confirm("Reset all PIR data?")) return;
  document.querySelector("form")?.reset();
  document.getElementById("findingList").innerHTML = "";
  findingCount = 0;
}

async function submitPIR() {
  alert("Submit PIR → connect to Apps Script backend");
}
