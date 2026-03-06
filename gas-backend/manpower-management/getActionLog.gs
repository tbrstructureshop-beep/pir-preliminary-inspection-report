function getActionLog(targetUnit) {
  if (!targetUnit) return [];
  
  const ss = SpreadsheetApp.openById(CONFIG.ATTENDANCE_ID);
  const attendanceSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  const logSheet = ss.getSheetByName(CONFIG.LOG_SHEET);
  
  if (!attendanceSheet || !logSheet) return [];

  const attData = attendanceSheet.getDataRange().getValues();
  const cleanTargetUnit = targetUnit.toString().toLowerCase().trim();
  
  const unitEmployeeIds = attData
    .filter(row => {
      const rowUnit = row[3] ? row[3].toString().toLowerCase().trim() : "";
      return rowUnit === cleanTargetUnit;
    })
    .map(row => row[0].toString().trim());

  const logRows = logSheet.getDataRange().getValues();
  if (logRows.length <= 1) return []; 
  logRows.shift(); 

  const todayStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd");

  const filteredLogs = logRows.filter(row => {
    const ts = row[0];
    const empId = row[3] ? row[3].toString().trim() : ""; 
    const isOurUnit = unitEmployeeIds.includes(empId);
    if (!ts || !isOurUnit) return false;
    
    const rowDate = (ts instanceof Date) ? ts : new Date(ts);
    const rowDateStr = Utilities.formatDate(rowDate, CONFIG.TIMEZONE, "yyyy-MM-dd");
    return rowDateStr === todayStr;
  }).map(row => {
    const logDate = (row[0] instanceof Date) ? row[0] : new Date(row[0]);
    return {
      employeeId: row[3] ? row[3].toString() : "", 
      workOrder: row[1] ? row[1].toString() : "",  
      task: row[4] ? row[4].toString() : "",       
      time: Utilities.formatDate(logDate, CONFIG.TIMEZONE, "HH:mm"),
      action: row[5],     
      status: row[7]      
    };
  });

  // --- NEW SORTING LOGIC ---
  return filteredLogs.sort((a, b) => {
    // 1. Sort by Employee ID
    if (a.employeeId !== b.employeeId) {
      return a.employeeId.localeCompare(b.employeeId);
    }
    // 2. Sort by Work Order
    if (a.workOrder !== b.workOrder) {
      return a.workOrder.localeCompare(b.workOrder);
    }
    // 3. Sort by Task
    if (a.task !== b.task) {
      return a.task.localeCompare(b.task);
    }
    // 4. Sort by Time (Chronological order for the same task)
    return a.time.localeCompare(b.time);
  });
}
