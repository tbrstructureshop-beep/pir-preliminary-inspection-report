function getUserMap() {
  const ss = SpreadsheetApp.openById(MASTER_ID);
  const sheet = ss.getSheetByName("USER");
  const rows = sheet.getDataRange().getValues().slice(1);

  const map = {};
  rows.forEach(r => {
    const id = r[0];
    const name = r[1];
    if (id) map[String(id).trim()] = name;
  });

  return map;
}
