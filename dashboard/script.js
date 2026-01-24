const API = "https://script.google.com/macros/s/AKfycbyQnjhtbnMsKen2UJp7oxhJuJ8B9-rHUjhGY4DcgWr_KrqR7ZDdDPlJKvSvwTrDVlu4/exec";

let MASTER_ROWS = [];

let currentPage = 1;
let rowsPerPage = 10;

/* ========== LOADING SPINNER =========== */

function showLoading(show = true) {
  document.getElementById("loadingOverlay").style.display = show ? "flex" : "none";
}

/* ================= LOAD ================= */

async function loadDashboard() {
  showLoading(true);
  try {
    const res = await fetch(`${API}?action=getMaster`);
    MASTER_ROWS = await res.json();
    currentPage = 1;
    paginateData(); // <-- call pagination instead of raw render
  } catch (err) {
    console.error(err);
    alert("Failed to load dashboard");
  } finally {
    showLoading(false);
  }
}


/* ================= RENDER ================= */

function render(rows) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  rows.forEach((r, idx) => {
    const woNo = r["W/O No"] || "";
    const acReg = r["A/C Reg"] || "";
    const partDesc = r["Part Description"] || "";
    const status = r["Status"] || "DRAFT";
    const sheetUrl = r["Sheet URL"] || "#";
    const sheetId = r["Sheet ID"] || "";

    // Find the index in MASTER_ROWS to use for delete
    const masterIndex = MASTER_ROWS.findIndex(item => item["Sheet ID"] === sheetId);

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${woNo}</td>
        <td>${acReg}</td>
        <td>${partDesc}</td>

        <td>
          <select class="status-select"
                  onchange="setStatus(${masterIndex + 2}, this.value)">
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

              <button type="button"
                      onclick="deletePIR('${sheetId}', ${masterIndex})"
                      style="color: red;">
                🗑️ Delete
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

function paginateData() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = MASTER_ROWS.slice(start, end);
  render(pageData);

  const totalPages = Math.ceil(MASTER_ROWS.length / rowsPerPage) || 1;
  document.getElementById("totalPages").textContent = totalPages;
  document.getElementById("currentPage").max = totalPages;
}

function changeRowsPerPage() {
  rowsPerPage = parseInt(document.getElementById("rowsPerPage").value, 10);
  currentPage = 1;
  paginateData();
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    paginateData();
  }
}

function nextPage() {
  const totalPages = Math.ceil(MASTER_ROWS.length / rowsPerPage) || 1;
  if (currentPage < totalPages) {
    currentPage++;
    paginateData();
  }
}

function goToPage(page) {
  const totalPages = Math.ceil(MASTER_ROWS.length / rowsPerPage) || 1;
  page = Math.max(1, Math.min(totalPages, parseInt(page, 10)));
  currentPage = page;
  paginateData();
}


/* ================= INIT ================= */

loadDashboard();










