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
          <!-- Only the menu button triggers floating menu -->
          <button class="menu-btn"
                  onclick="toggleMenu(this, '${sheetId}', '${sheetUrl}', ${masterIndex})">
            ⋮
          </button>
        </td>
      </tr>
    `);
  });
}

/* ====== ACTION BUTTON FLOATING =========== */

let activeMenu = null;

function toggleMenu(btn, sheetId, sheetUrl, index) {
  // Close existing menu if open
  if (activeMenu) activeMenu.remove();

  // Get button position
  const rect = btn.getBoundingClientRect();

  // Create menu container
  const menu = document.createElement("div");
  menu.className = "menu-content-floating";
  menu.style.position = "absolute";
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;
  menu.style.zIndex = 1000;

  // Fill menu content
  menu.innerHTML = `
    <a href="${sheetUrl}" target="_blank" rel="noopener">📄 Open Spreadsheet</a>
    <button type="button" onclick="editPIR('${sheetId}')">✏️ Edit in Web App</button>
    <button type="button" onclick="deletePIR('${sheetId}', ${index})">🗑️ Delete PIR</button>
  `;

  document.body.appendChild(menu);
  activeMenu = menu;

  // Close menu on click outside
  document.addEventListener("click", function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.remove();
      activeMenu = null;
      document.removeEventListener("click", closeMenu);
    }
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


/*===== ACTION BUTTON BEHAVIOR =====*/

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

/*==== PAGNATION ======*/

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


/* ============= DELETING PIR ============= */

function deletePIR(sheetId, index) {
  if (!sheetId) {
    alert("No sheet ID found!");
    return;
  }

  const confirmed = confirm("Are you sure you want to delete this PIR?");
  if (!confirmed) return;

  // ✅ Show spinner while deleting
  showLoading(true);

  fetch(`${API}?action=deletePIR&sheetId=${sheetId}`, { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("PIR deleted successfully.");

        // Remove from local MASTER_ROWS
        MASTER_ROWS.splice(index, 1);

        // Refresh table with pagination
        paginateData();
      } else {
        alert("Failed to delete PIR: " + (data.error || ""));
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error deleting PIR.");
    })
    .finally(() => {
      // ✅ Hide spinner after operation completes
      showLoading(false);
    });
}

/* ======= TOGLE BUTTON ======== */

function toggleUserMenu() {
  const menu = document.querySelector(".user-menu-content");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close the user menu if clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest(".user-menu") && !e.target.closest(".user-menu-btn")) {
    document.querySelectorAll(".user-menu-content")
      .forEach(m => m.style.display = "none");
  }
});

/* ================= INIT ================= */

loadDashboard();













