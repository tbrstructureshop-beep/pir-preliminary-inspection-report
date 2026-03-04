function getGenerated() {
  const sh = SpreadsheetApp.openById(MASTER_ID).getSheetByName("Generated");
  const data = sh.getDataRange().getValues();
  if (data.length === 0) return [];
  const headers = data.shift();
  return data.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}
