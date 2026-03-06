function getTodayStatus(userId) {
  const sheet = SpreadsheetApp.openById(CONFIG.ATTENDANCE_ID).getSheetByName(CONFIG.SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");
  
  let todayIn = null;
  let todayOut = null;
  let todayDuration = 0;
  let todayLastAction = null;

  // Loop backwards to find the LATEST entries for TODAY
  for (let i = data.length - 1; i >= 1; i--) {
    const rowId = data[i][0];
    const rowDate = Utilities.formatDate(new Date(data[i][4]), CONFIG.TIMEZONE, "yyyy-MM-dd");
    
    if (rowId == userId && rowDate === todayStr) {
      const rowTime = Utilities.formatDate(new Date(data[i][4]), CONFIG.TIMEZONE, "HH:mm:ss");
      const rowAction = data[i][5];
      const rowDuration = data[i][6] || 0;

      if (!todayLastAction) todayLastAction = rowAction;
      
      // Get the latest Clock In for today
      if (rowAction === "CLOCK IN" && !todayIn) {
        todayIn = rowTime;
      }
      // Get the latest Clock Out for today
      if (rowAction === "CLOCK OUT" && !todayOut) {
        todayOut = rowTime;
        todayDuration = rowDuration; // This is the seconds stored in column G
      }

      // Once we have a pair or at least the latest action, we can stop if we've found what we need
      if (todayIn && todayOut) break;
    }
  }

  return {
    lastAction: todayLastAction,
    clockIn: todayIn || "--:--",
    clockOut: todayOut || "--:--",
    durationSeconds: todayDuration // Send raw seconds to frontend
  };
}
