const API = "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";

async function loadDashboard() {
  const res = await fetch(`${API}?action=getMaster`);
  const data = await res.json();
  render(data);
}

function render(rows) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  rows.forEach((r, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${r["W/O No"]}</td>
        <td>${r["A/C Reg"]}</td>
        <td>${r["Part Description"]}</td>
        <td>
          <select onchange="setStatus(${i + 2}, this.value)">
            ${["DRAFT","OPEN","CLOSED"].map(s =>
              `<option ${s === r["Status"] ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </td>
        <td>
          <a href="${r["Sheet URL"]}" target="_blank">Sheet</a>
          |
          <button onclick="editPIR('${r["Sheet ID"]}')">Edit</button>
        </td>
      </tr>
    `;
  });
}

function setStatus(row, status) {
  fetch(`${API}?action=updateStatus&row=${row}&status=${status}`);
}

function editPIR(id) {
  alert("Next step: PIR editor for " + id);
}

loadDashboard();


