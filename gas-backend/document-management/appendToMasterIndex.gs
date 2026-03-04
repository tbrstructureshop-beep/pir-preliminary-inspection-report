/* --- MISSING FUNCTIONS THAT NEED TO BE ADDED BACK --- */

function appendToMasterIndex({ woNo, partDesc, acReg, sheetId, sheetUrl, status }) {
  const MASTER_ID = "1klXxDb0C9Qsf7Xes3Pygu934lXnGcdu6eisc2Y7Q0zU";
  const SHEET_NAME = "Dashboard";

  const sheet = SpreadsheetApp
    .openById(MASTER_ID)
    .getSheetByName(SHEET_NAME);

  if (!sheet) throw new Error("Dashboard sheet not found");

  // Push existing data down
  sheet.insertRows(2, 1);

  // Write new data into row 2
  sheet.getRange(2, 1, 1, 10).setValues([[
    Utilities.getUuid(), // A - PIR ID
    woNo,                // B - W/O No
    partDesc,            // C - Part Description
    acReg,               // D - A/C Reg
    new Date(),          // E - Date Created
    sheetId,             // F - Sheet ID
    sheetUrl,            // G - Sheet URL
    status,              // H - Status
    new Date(),          // I - Last Edited
    ""                   // J - Edited By
  ]]);
}
