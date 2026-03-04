function handleUpdatePIR(e) {
  try {
    const sheetId = e.parameter.sheetId;
    if (!sheetId) throw new Error("Missing sheetId");
    const ss = SpreadsheetApp.openById(sheetId);
    
    const infoData = [
      e.parameter.customer || "", e.parameter.acReg || "", e.parameter.woNo || "",
      e.parameter.partDesc || "", e.parameter.partNo || "", e.parameter.serialNo || "",
      e.parameter.qty || "", e.parameter.dateReceived || "", e.parameter.reason || "",
      e.parameter.adStatus || "", e.parameter.attachedParts || "", e.parameter.missingParts || "",
      e.parameter.modStatus || "", e.parameter.docId || sheetId
    ];

    ss.getSheetByName("INFO").getRange("C2:C15").setValues(infoData.map(v => [v]));

    const findings = JSON.parse(e.parameter.findings || "[]");
    const findingSheet = ss.getSheetByName("FINDING");
    if (findingSheet.getLastRow() > 1) {
      findingSheet.getRange("A2:D" + findingSheet.getLastRow()).clearContent();
    }

    const rows = findings.map(f => {
      let imageUrl = f.existingImage || "";
      if (f.imageBase64) {
        imageUrl = saveFindingImage(f.imageBase64, `${f.findingNo}.jpg`, FINDING_FOLDER_ID);
      }
      return [f.findingNo, imageUrl, f.identification || "", f.action || ""];
    });

    if (rows.length) {
      findingSheet.getRange(2, 1, rows.length, 4).setValues(rows);
    }
    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: err.message });
  }
}
