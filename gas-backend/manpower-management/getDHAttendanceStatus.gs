function getDHAttendanceStatus(dhId) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.ATTENDANCE_ID).getSheetByName("ATTENDANCE");
    const data = sheet.getDataRange().getValues();
    const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");
    
    let latestAction = "";

    for (let i = data.length - 1; i >= 1; i--) {
      const rowId = data[i][0] ? data[i][0].toString() : "";
      const timestamp = data[i][4];
      const action = data[i][5] ? data[i][5].toString() : "";

      if (rowId === dhId.toString() && timestamp instanceof Date) {
        const rowDateStr = Utilities.formatDate(timestamp, CONFIG.TIMEZONE, "yyyy-MM-dd");
        if (rowDateStr === todayStr) {
          latestAction = action;
          break;
        }
      }
    }

    if (latestAction === "") return { status: "Not Yet Present", code: "absent" };
    if (latestAction.toLowerCase().includes("in")) return { status: "On Duty", code: "present" };
    if (latestAction.toLowerCase().includes("out")) return { status: "Shift Completed", code: "completed" };
    
    return { status: "Unknown", code: "idle" };
  } catch (err) {
    return { status: "Error Loading", code: "idle" };
  }
}
