function fetchWOData(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  const infoSheet = ss.getSheetByName("INFO");
  const info = {
    customer: infoSheet.getRange("C2").getValue(),
    reg: infoSheet.getRange("C3").getValue(),
    woNo: infoSheet.getRange("C4").getValue(),
    description: infoSheet.getRange("C5").getValue(),
    pn: infoSheet.getRange("C6").getValue(),
    sn: infoSheet.getRange("C7").getValue()
  };
  const findingRows = ss.getSheetByName("FINDING").getDataRange().getValues().slice(1);
  const findings = findingRows.map(r => ({ no: r[0], imageUrl: r[1], description: r[2], actionGiven: r[3], status: r[4] || "OPEN", evidenceUrl: r[5] }));
  
  const matSheet = ss.getSheetByName("MATERIAL LIST");
  const matRows = matSheet ? matSheet.getRange("A5:F").getValues() : [];
  const materials = matRows.filter(r => r[0]).map(r => ({ findingNo: r[0], pn: r[1], desc: r[2], qty: r[3], uom: r[4], avail: r[5] }));
  
  const logRows = ss.getSheetByName("MANHOUR_LOG").getDataRange().getValues().slice(1);

  const userMap = getUserMap();
  
  const logs = logRows
  .filter(r => r[1] == info.woNo)
  .map(r => {
    const empId = String(r[3]).trim();
    return {
      timestamp: r[0],
      woId: r[1],
      findingNo: r[2],
      employeeId: empId,
      employeeName: userMap[empId] || "UNKNOWN",
      taskCode: r[4],
      action: r[5],
      duration: r[6],
      status: r[7]
    };
  });


  return { success: true, data: { info, findings, materials, logs } };
}
