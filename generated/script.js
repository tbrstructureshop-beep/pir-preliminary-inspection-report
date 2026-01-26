const API = "https://script.google.com/macros/s/AKfycbyQnjhtbnMsKen2UJp7oxhJuJ8B9-rHUjhGY4DcgWr_KrqR7ZDdDPlJKvSvwTrDVlu4/exec";
const SHEET_DOC = "Generated";

protectPage(); // MUST be first

let MASTER_ROWS = [];
let filteredRows = [];
let currentPage = 1;
let rowsPerPage = 10;

/* PAGE PROTECTION */
function protectPage() {
  const userId = sessionStorage.getItem("userId");
  if (!userId) window.location.replace("../index.html");
}

/* LOADING SPINNER */
function showLoading(show = true) {
  document.getElementById("loadingOverlay").style.display = show ? "flex" : "none";
}

/* LOAD GENERATED DOCS */
async function loadGeneratedDocs() {
  showLoading(true);
  try {
    const res = await fetch(`${API}?action=getGenerated`);
    MASTER_ROWS = await res.json();
    filteredRows = [...MASTER_ROWS];
    currentPage = 1;
    paginateData();
  } catch (err) {
    console.error(err);
    alert("Failed to load generated documents");
  } finally {
    showLoading(false);
  }
}

/* RENDER TABLE */
function render(rows) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = ""; // Clear previous rows

  rows.forEach((r, idx) => {
    const woNo = r["W/O No"] || "";            // W/O No
    const partDesc = r["Part Description"] || ""; // Part Description
    const acReg = r["A/C Reg"] || "";          // A/C Reg
    const dateCreated = r["Date Created"] || ""; // Date Created
    const docUrl = r["DocUrl"] || "#";         // Doc URL (for the action button)

    // Format the date to "dd MMM yyyy (HH:mm)"
    const formattedDate = formatDate(dateCreated);

    tbody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${woNo}</td>
        <td>${partDesc}</td>
        <td>${acReg}</td>
        <td>${formattedDate}</td>
        <td class="action-cell">
          <button class="menu-btn"
                  onclick="toggleActionMenu(this, '${woNo}', '${docUrl}', ${idx})">
            ⋮
          </button>
        </td>
      </tr>
    `);
  });
}

// Helper function to format the date
function formatDate(dateString) {
  const date = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date)) return dateString;

  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' }); // Get abbreviated month
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} (${hours}:${minutes})`;
}


/* FLOATING MENU */
let activeMenu = null;

function toggleActionMenu(btn, pirId, docUrl, index) {
  if (activeMenu) { activeMenu.remove(); activeMenu = null; }

  const rect = btn.getBoundingClientRect();
  const menu = document.createElement("div");
  menu.className = "menu-content-floating";

  menu.innerHTML = `
    <a href="${docUrl}" target="_blank" rel="noopener">📄 Open Document</a>
    <button type="button" onclick="deleteGenerated('${pirId}', ${index})">🗑️ Delete</button>
  `;

  document.body.appendChild(menu);

  const MENU_WIDTH = menu.offsetWidth;
  const MENU_HEIGHT = menu.offsetHeight;
  const MARGIN = 8;

  let top = rect.bottom + MARGIN + window.scrollY;
  let left = rect.right - MENU_WIDTH;

  if (left + MENU_WIDTH > window.innerWidth - MARGIN) left = window.innerWidth - MENU_WIDTH - MARGIN;
  if (left < MARGIN) left = MARGIN;
  if (top + MENU_HEIGHT > window.innerHeight + window.scrollY - MARGIN) top = rect.top - MENU_HEIGHT - MARGIN;
  if (top < MARGIN + window.scrollY) top = MARGIN + window.scrollY;

  menu.style.position = "absolute";
  menu.style.top = `${top}px`;
  menu.style.left = `${left}px`;
  menu.style.zIndex = 9999;

  activeMenu = menu;

  document.addEventListener("click", function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.remove();
      activeMenu = null;
      document.removeEventListener("click", closeMenu);
    }
  });
}

/* SEARCH */
function applySearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  filteredRows = MASTER_ROWS.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(q))
  );
  currentPage = 1;
  paginateData();
}

/* PAGINATION */
function paginateData() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredRows.slice(start, end);

  render(pageData);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  document.getElementById("totalPages").textContent = totalPages;
  document.getElementById("currentPage").max = totalPages;
}

function changeRowsPerPage() {
  rowsPerPage = parseInt(document.getElementById("rowsPerPage").value, 10);
  currentPage = 1;
  paginateData();
}

function prevPage() { if (currentPage > 1) { currentPage--; paginateData(); } }
function nextPage() {
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  if (currentPage < totalPages) { currentPage++; paginateData(); }
}
function goToPage(page) {
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  page = Math.max(1, Math.min(totalPages, parseInt(page, 10)));
  currentPage = page;
  paginateData();
}

/* DELETE GENERATED DOC */
function deleteGenerated(pirId) {
  if (!pirId) return alert("No PIR ID found!");

  if (!confirm("Are you sure you want to delete this document?")) return;

  console.log("Deleting PIR ID:", pirId); // ✅ log BEFORE fetch

  showLoading(true);

  fetch(`${API}?action=deleteGenerated&pirId=${pirId}`, {
    method: "POST"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const idx = MASTER_ROWS.findIndex(r => r["PIR ID"] === pirId);
        if (idx > -1) {
          MASTER_ROWS.splice(idx, 1);
        }
        applySearch();
        alert("Document deleted successfully.");
      } else {
        alert("Failed to delete document: " + (data.error || ""));
      }
    })
    .catch(err => {
      console.error("Delete error:", err);
      alert("Error deleting document.");
    })
    .finally(() => showLoading(false));
}


/* USER MENU */
function toggleUserMenu() {
  const menu = document.querySelector(".user-menu-content");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}
document.addEventListener("click", e => {
  if (!e.target.closest(".user-menu") && !e.target.closest(".user-menu-btn")) {
    document.querySelectorAll(".user-menu-content").forEach(m => m.style.display = "none");
  }
});

/* SIGN OUT */
function logout() { sessionStorage.clear(); window.location.replace("../index.html"); }

/* INIT */
loadGeneratedDocs();



