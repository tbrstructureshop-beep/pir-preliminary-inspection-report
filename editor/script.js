const API = "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";
const urlParams = new URLSearchParams(window.location.search);
const sheetId = urlParams.get("edit");

async function loadEditor() {
  const res = await fetch(`${API}?action=getPIR&id=${sheetId}`);
  const data = await res.json();

  // Load INFO
  const infoFields = ["customer","acReg","woNo","partDesc","partNo","serialNo","qty","dateReceived","reason","adStatus","attachedParts","missingParts","modStatus","docId"];
  infoFields.forEach((id, i) => {
    document.getElementById(id).value = data.info[i] || "";
  });

  // Load FINDINGS
  const tbody = document.getElementById("findingBody");
  tbody.innerHTML = "";
  data.findings.forEach(f => {
    tbody.innerHTML += `
      <tr>
        <td>${f.findingNo}</td>
        <td><img src="${f.imageUrl}" class="thumb"/></td>
        <td><input type="text" value="${f.identification}"/></td>
        <td><input type="text" value="${f.action}"/></td>
        <td><button onclick="removeFinding(this)">❌</button></td>
      </tr>
    `;
  });
}

function addFinding() {
  const tbody = document.getElementById("findingBody");
  const newRow = tbody.insertRow();
  newRow.innerHTML = `
    <td></td>
    <td><input type="file" accept="image/*" onchange="previewImage(this)"/></td>
    <td><input type="text"/></td>
    <td><input type="text"/></td>
    <td><button onclick="removeFinding(this)">❌</button></td>
  `;
}

function removeFinding(btn) {
  btn.closest("tr").remove();
}

async function savePIR() {
  const infoFields = ["customer","acReg","woNo","partDesc","partNo","serialNo","qty","dateReceived","reason","adStatus","attachedParts","missingParts","modStatus","docId"];
  const infoData = infoFields.map(id => document.getElementById(id).value);

  const findings = Array.from(document.querySelectorAll("#findingBody tr")).map((tr, i) => ({
    findingNo: tr.cells[0].textContent || i + 1,
    imageUrl: tr.cells[1].querySelector("img")?.src || "",
    identification: tr.cells[2].querySelector("input").value,
    action: tr.cells[3].querySelector("input").value
  }));

  await fetch(API, {
    method: "POST",
    body: JSON.stringify({
      action: "updatePIR",
      sheetId,
      infoData,
      findings
    })
  });

  alert("PIR saved!");
}
