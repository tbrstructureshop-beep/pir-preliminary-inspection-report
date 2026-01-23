const API =
  "https://script.google.com/macros/s/AKfycbyQnjhtbnMsKen2UJp7oxhJuJ8B9-rHUjhGY4DcgWr_KrqR7ZDdDPlJKvSvwTrDVlu4/exec";

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
    const woNo = r["W/O No"] || "";
    const acReg = r["A/C Reg"] || "";
    const partDesc = r["Part Description"] || "";
    const status = r["Status"] || "DRAFT";
    const sheetUrl = r["Sheet URL"] || "#";
    const sheetId = r["Sheet ID"] || "";

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${woNo}</td>
        <td>${acReg}</td>
        <td>${partDesc}</td>

        <td>
          <select class="status-select"
                  onchange="setStatus(${index + 2}, this.value)">
            ${["DRAFT", "OPEN", "CLOSED"]
              .map(s => `
                <option value="${s}" ${s === status ? "selected" : ""}>
                  ${s}
                </option>
              `)
              .join("")}
          </select>
        </td>

        <td class="action-cell">
          <div class="menu">
            <button class="menu-btn" onclick="toggleMenu(this)">⋮</button>

            <div class="menu-content">
              <a href="${sheetUrl}" target="_blank" rel="noopener">
                📄 Open Spreadsheet
              </a>

              <button type="button"
                      onclick="editPIR('${sheetId}')">
                ✏️ Edit in Web App
              </button>
            </div>
          </div>
        </td>
      </tr>
    `);
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
  console.log("Editing sheetId:", sheetId); // <-- debug
  if (!sheetId) {
    alert("No sheet ID found!");
    return;
  }
  window.location.href = `/editor/?id=${sheetId}`;
}


/*===== ACTION BUTTON BEHAVIOR*/

function toggleMenu(btn) {
  // close all other menus
  document.querySelectorAll(".menu-content").forEach(m => {
    if (m !== btn.nextElementSibling) m.style.display = "none";
  });

  const menu = btn.nextElementSibling;
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close menu when clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest(".menu")) {
    document.querySelectorAll(".menu-content")
      .forEach(m => m.style.display = "none");
  }
});


/* ================= INIT ================= */

loadDashboard();








