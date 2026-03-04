function stopManhour(p) {
  const ss = SpreadsheetApp.openById(p.sheetId);
  const logSheet = ss.getSheetByName("MANHOUR_LOG");
  const logData = logSheet.getDataRange().getValues();
  let start = p.stopTime, code = "";
  
  // Clean the input IDs to ensure they match the sheet data
  const searchWoId = p.woId.toString().trim();
  const searchFindingId = p.findingId.toString().trim();
  const searchEmpId = p.employeeId.toString().trim();

  for (let i = logData.length - 1; i >= 0; i--) {
    // Stringify and trim sheet data during comparison
    const rowWoId = logData[i][1] ? logData[i][1].toString().trim() : "";
    const rowFindId = logData[i][2] ? logData[i][2].toString().trim() : "";
    const rowEmpId = logData[i][3] ? logData[i][3].toString().trim() : "";
    const rowAction = logData[i][5] ? logData[i][5].toString().trim() : "";

    if (rowWoId == searchWoId && rowFindId == searchFindingId && rowEmpId == searchEmpId && rowAction === "START") {
      start = logData[i][0]; 
      code = logData[i][4]; 
      break;
    }
  }

  const duration = Math.floor((new Date(p.stopTime) - new Date(start)) / 1000);

  let evidenceUrl = "";
  if (p.evidenceBase64) {
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const file = folder.createFile(Utilities.newBlob(Utilities.base64Decode(p.evidenceBase64), "image/jpeg", `WO_${p.woId}_F${p.findingId}.jpg`));
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    evidenceUrl = file.getUrl();
  }

  // Use "'" + code to preserve leading zeros like '0010
  const rowData = [p.stopTime, p.woId, p.findingId, p.employeeId, "'" + code, "STOP", duration, p.finalStatus, evidenceUrl];

  // Log to local Sheet
  logSheet.appendRow(rowData);

  // NEW: Log to Central MANPOWER_ID Sheet
  const globalSS = SpreadsheetApp.openById(MANPOWER_ID);
  globalSS.getSheetByName("LOG_MANHOUR").appendRow(rowData);

  if (p.finalStatus !== "IN_PROGRESS") {
    const findingSheet = ss.getSheetByName("FINDING");
    const data = findingSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == p.findingId) {
        const newStatus = (p.finalStatus === 'CLOSED') ? 'CLOSED' : 'PROGRESS';
        findingSheet.getRange(i + 1, 5).setValue(newStatus);
        if (evidenceUrl) findingSheet.getRange(i + 1, 6).setValue(evidenceUrl);
        break;
      }
    }
  }
  return { success: true };
}
