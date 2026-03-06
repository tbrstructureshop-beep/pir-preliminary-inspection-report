function handleGetAction(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(PEL_SHEET_NAME);
  const lastRow = sheet.getLastRow();
  
  if (lastRow < SOURCE_RANGE_START_ROW) {
    return { status: "success", data: [] };
  }

  const data = sheet.getRange("A4:W" + lastRow).getDisplayValues();
  
  const results = data.map(row => {
    // Determine active Task Type from H-N (Indices 7-13)
    const taskTypes = ["FOT", "SGH", "R/I", "TS", "MOD", "REP", "INSP"];
    let activeTask = "";
    for(let i=0; i<7; i++) {
      if(row[7+i] === "✔") activeTask = taskTypes[i];
    }

    // Determine active Activity Type from O-R (Indices 14-17)
    const activityTypes = ["Training", "Perform", "Supervise", "CRS"];
    let activeActivity = "";
    for(let i=0; i<4; i++) {
      if(row[14+i] === "✔") activeActivity = activityTypes[i];
    }

    return {
      no: row[0],
      date: row[1] ? Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), "dd MMM yyyy") : "",
      location: row[2],
      acType: row[3],
      acReg: row[4],
      rating: row[5],
      privilege: row[6],
      taskType: activeTask,
      activityType: activeActivity,
      ata: row[18],
      operation: row[19],
      duration: row[20],
      maintRef: row[21],
      remarks: row[22]
    };
  });

  return { status: "success", data: results };
}
