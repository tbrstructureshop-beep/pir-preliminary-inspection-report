/* ======= DELETION OF GENERATED FILE ======= */

function deleteGeneratedByPirId_(pirId) {
  if (!pirId) return { success: false, error: "Missing PIR ID" };

  pirId = String(pirId).trim();

  const ss = SpreadsheetApp.openById(MASTER_ID);
  const sh = ss.getSheetByName("Generated");
  if (!sh) return { success: false, error: "Generated sheet not found" };

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { success: false, error: "No data" };

  const data = sh.getRange(2, 1, lastRow - 1, 7).getValues();

  for (let i = 0; i < data.length; i++) {
    const rowPirId = String(data[i][0]).trim();
    const docId    = data[i][5];

    if (rowPirId === pirId) {

      if (docId) {
        try {
          DriveApp.getFileById(docId).setTrashed(true);
        } catch (e) {}
      }

      sh.deleteRow(i + 2);
      return { success: true };
    }
  }

  return { success: false, error: "PIR ID not found" };
}
