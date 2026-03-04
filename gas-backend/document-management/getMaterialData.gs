// This replaces your Dev doGet logic
function getMaterialDataLogic(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  
  // --- INFO Sheet ---
  const info = ss.getSheetByName("INFO");
  const generalData = {
    woNo: info.getRange("C4").getValue(),
    partDesc: info.getRange("C5").getValue(),
    pn: info.getRange("C6").getValue(),
    sn: info.getRange("C7").getValue(),
    acReg: info.getRange("C3").getValue(),
    customer: info.getRange("C2").getValue()
  };

  // --- FINDING Sheet ---
  const findingSheet = ss.getSheetByName("FINDING");
  const lastRowF = findingSheet.getLastRow();
  const findingValues = lastRowF > 1 ? findingSheet.getRange("A2:D" + lastRowF).getValues() : [];
  
  const findings = findingValues.map(r => ({
    finding: r[0],
    image: r[1] ? `https://drive.google.com/thumbnail?id=${r[1].match(/[-\w]{25,}/) ? r[1].match(/[-\w]{25,}/)[0] : ""}&sz=w4000` : "",
    description: r[2] || "",
    action: r[3] || ""
  }));

  // --- MATERIAL LIST Sheet ---
  const materialSheet = ss.getSheetByName("MATERIAL LIST");
  const materialLastRow = materialSheet.getLastRow();
  let materialValues = [];
  if (materialLastRow >= 5) {
    materialValues = materialSheet.getRange(5, 1, materialLastRow - 4, 10).getValues();
  }

  const materialsByFinding = {};
  materialValues.forEach(r => {
    const findingNo = r[0];
    if (!findingNo) return;
    if (!materialsByFinding[findingNo]) materialsByFinding[findingNo] = [];
    materialsByFinding[findingNo].push({
      partNo: r[1], description: r[2], qty: r[3], uom: r[4], 
      availability: r[5], pr: r[6], po: r[7], note: r[8],
      dateChange: r[9] ? (r[9] instanceof Date ? Utilities.formatDate(r[9], Session.getScriptTimeZone(), "yyyy-MM-dd") : r[9]) : ""
    });
  });

  const valSheet = ss.getSheetByName("Data Validation");
  const availabilityOptions = valSheet ? valSheet.getRange("A2:A" + valSheet.getLastRow()).getValues().flat().filter(String) : [];

  return { generalData, findings, materialsByFinding, availabilityOptions };
}
