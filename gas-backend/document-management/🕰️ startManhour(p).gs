function startManhour(p) {
  const ss = SpreadsheetApp.openById(p.sheetId);
  const rowData = [p.startTime, p.woId, p.findingId, p.employeeId, "'" + p.taskCode, "START", "", "", ""];
  
  // Log to local Sheet
  ss.getSheetByName("MANHOUR_LOG").appendRow(rowData);
  
  // NEW: Log to Central MANPOWER_ID Sheet
  const globalSS = SpreadsheetApp.openById(MANPOWER_ID);
  globalSS.getSheetByName("LOG_MANHOUR").appendRow(rowData);

  const findingSheet = ss.getSheetByName("FINDING");
  const data = findingSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == p.findingId && (!data[i][4] || data[i][4] === "OPEN")) {
      findingSheet.getRange(i + 1, 5).setValue("PROGRESS"); break;
    }
  }
  return { success: true };
}
