function deletePIR(sheetId) {
  try {
    if (!sheetId) throw new Error("Missing sheetId");

    // 1️⃣ Move the Google Sheet to Trash
    const file = DriveApp.getFileById(sheetId);
    file.setTrashed(true);

    // 2️⃣ Remove row from MASTER INDEX
    const sh = SpreadsheetApp.openById(MASTER_ID).getSheetByName("Dashboard");
    const data = sh.getDataRange().getValues();

    // Find the row with matching sheetId
    for (let i = 1; i < data.length; i++) { // start at 1 to skip headers
      if (data[i][5] === sheetId) { // Column F (index 5) = Sheet ID
        sh.deleteRow(i + 1); // +1 because sheet rows are 1-based
        break;
      }
    }

    // 3️⃣ Return success
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
