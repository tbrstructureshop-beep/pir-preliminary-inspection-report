function getMaster() {
  const sh = SpreadsheetApp.openById(MASTER_ID).getSheetByName("Dashboard");
  const data = sh.getDataRange().getValues();
  const headers = data.shift();
  return data.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
