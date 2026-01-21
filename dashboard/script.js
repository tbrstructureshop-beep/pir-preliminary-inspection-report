const API =
  "https://script.google.com/macros/s/AKfycbz8G8ZeUT_K0A0jbSVRbRxwbeR3nEtb4yO-EyjdsoPp5hbB2AAQh1PncKn36xo5USI8/exec";

let MASTER_ROWS = [];

/* ================= LOAD ================= */

async function loadDashboard() {
  const res = await fetch(`${API}?action=getMaster`);
  MASTER_ROWS = await res.json();
  render(MASTER_ROWS);
}

/* ================= RENDER ================= */

function render(rows) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  rows.forEach((r, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${r["W/O No"] || ""}</td>
        <td>${r["A/C Reg"] || ""}</td>
        <td>${r["Part Description"] || ""}</td>

        <td>
          <select onchange="setStatus(${index + 2}, this.value)">
            ${["DRAFT", "OPEN", "CLOSED"].map(s =>
              `<option value="${s}" ${s === r["Status"] ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        </td>

        <td class="action-cell">
          <a href="${r["Sheet URL"]}" target="_blank">Sheet</a>
          |
          <button onclick="editPIR('${r["Sheet ID"]}')">Edit</button>
        </td>
      </tr>
    `;
  });
}

/* ================= SEARCH ================= */

function applySearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  const filtered = MASTER_ROWS.filter(row =>
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(q)
    )
  );

  render(filtered);
}

/* ================= ACTIONS ================= */

function setStatus(row, status) {
  fetch(`${API}?action=updateStatus&row=${row}&status=${status}`);
}

function editPIR(sheetId) {
  // future: open form in edit mode
  window.location.href = `/form/?edit=${sheetId}`;
}

/* ================= INIT ================= */

loadDashboard();

