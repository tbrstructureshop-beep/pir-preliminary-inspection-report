function updateStatus(e) {
  const row = Number(e.parameter.row);
  if (row < 2) return;
  const status = e.parameter.status;
  SpreadsheetApp.openById(MASTER_ID).getSheetByName("Dashboard").getRange(row, 8).setValue(status);
}
