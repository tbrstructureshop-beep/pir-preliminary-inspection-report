function addFinding() {
  const container = document.getElementById("findingList");
  const index = container.children.length + 1;

  const div = document.createElement("div");
  div.className = "card finding";

  div.innerHTML = `
    <h3>PIR ${index}</h3>

    <div class="form-group">
      <label>Finding No.</label>
      <div class="pir-no" data-pir-no>PIR ${index}</div>
    </div>

    <div class="form-group">
      <label>Picture</label>
      <input type="file" accept="image/*" onchange="previewImage(this)">
      <img class="preview">
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
  renumberPIR(); // keep order safe
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
  document.querySelectorAll(".finding").forEach((card, i) => {
    const num = i + 1;
    card.querySelector("h3").textContent = `PIR ${num}`;
    card.querySelector("[data-pir-no]").textContent = `PIR ${num}`;
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
  alert("Submit PIR → connect to Apps Script backend");
}
