function getPIR(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  const infoSheet = ss.getSheetByName("INFO");
  const infoValues = infoSheet.getRange("C2:C15").getValues().flat();
  const findingSheet = ss.getSheetByName("FINDING");
  const findingData = [];
  const lastRow = findingSheet.getLastRow();
  if (lastRow >= 2) {
    const values = findingSheet.getRange(2, 1, lastRow - 1, 4).getValues();
    values.forEach(row => {
      findingData.push({ findingNo: row[0], imageUrl: row[1], identification: row[2], action: row[3] });
    });
  }
  return { info: infoValues, findings: findingData };
}
