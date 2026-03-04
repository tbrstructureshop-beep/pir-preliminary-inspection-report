function createNewPIRLogic(params) {
  const infoData = [
    params.customer || "", params.acReg || "", params.woNo || "",
    params.partDesc || "", params.partNo || "", params.serialNo || "",
    params.qty || "", params.dateReceived || "", params.reason || "",
    params.adStatus || "", params.attachedParts || "", params.missingParts || "",
    params.modStatus || "", ""
  ];

  const fileName = `${params.woNo} ${params.partDesc}`.trim();
  const copy = DriveApp.getFileById(TEMPLATE_ID).makeCopy(fileName);
  copy.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  const copiedSheetId = copy.getId();
  const ss = SpreadsheetApp.open(copy);
  infoData[13] = copiedSheetId;
  ss.getSheetByName("INFO").getRange("C2:C15").setValues(infoData.map(v => [v]));

  appendToMasterIndex({
    woNo: params.woNo || "",
    partDesc: params.partDesc || "",
    acReg: params.acReg || "",
    sheetId: copiedSheetId,
    sheetUrl: copy.getUrl(),
    status: "DRAFT"
  });

  const findings = JSON.parse(params.findings || "[]");
  if (findings.length) {
    const findingSheet = ss.getSheetByName("FINDING");
    const rows = findings.map(f => [
      f.findingNo,
      saveFindingImage(f.imageBase64, `${f.findingNo}.jpg`, FINDING_FOLDER_ID),
      f.identification,
      f.action
    ]);
    findingSheet.getRange(2, 1, rows.length, 4).setValues(rows);
  }
  return { success: true, copiedDocId: copiedSheetId, copiedDocUrl: copy.getUrl() };
}
