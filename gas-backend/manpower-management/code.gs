// --- SHARED CONSTANTS ---
const PEL_SHEET_NAME = 'PEL'; 
const TEMPLATE_DOC_ID = "1TJEKbF9ZQwNQ-O_IOxPwIO0vQfOR7jdDMG0IBn8Nm4g";
const SOURCE_RANGE_START_ROW = 4;

// Combined Config to avoid "Already Declared" errors
const CONFIG = {
  // From Script 1 (Attendance)
  ATTENDANCE_ID: "1Sa-vgo_pk-Mp0pMON8I67onO0hVD1KQKraizWseMnG4", 
  MASTER_ID: "1klXxDb0C9Qsf7Xes3Pygu934lXnGcdu6eisc2Y7Q0zU",
  SHEET_NAME: "ATTENDANCE", // Original Attendance sheet
  LOG_SHEET: "LOG_MANHOUR",
  TIMEZONE: "GMT+7",
  
  // From Script 2 (Overtime Dashboard)
  OVT_SS_ID: '1Sa-vgo_pk-Mp0pMON8I67onO0hVD1KQKraizWseMnG4',
  OVT_SHEET_NAME: 'OVERTIME_DATA',
  OVT_FOLDER_ID: '1lTRr5iki8AUjgNt0dspICQqr6Epk2qkh',
  OVT_THEME_COLOR: '#2b868c' 
};

/**
 * GET Request Router
 * Combined to serve BOTH the HTML Dashboard and the JSON API
 */
function doGet(e) {
  // If no parameters are provided, it's a person opening the browser -> Show Dashboard (Script 2)
  if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Aviation Ops Dashboard')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // If parameters exist, it's an API call (Script 1)
  try {
    const userId = e.parameter.userId;
    const action = e.parameter.action;
    const unit = e.parameter.unit;
    const sheetId = e.parameter.sheetId;

    let result;
    if (action === "getDHData") result = getDepartmentHeadInfo(userId);
    else if (action === "getAttendanceData") result = getTodayAttendance(unit);
    else if (action === "getActionLog") result = getActionLog(unit);
    else if (action === "getRecords") result = getRecords(); // Script 2 data fetch
    else if (sheetId && !userId) result = handleGetAction(sheetId);
    else if (userId) result = getTodayStatus(userId);
    else throw new Error("Invalid GET request");

    return sendJsonResponse(result);
  } catch (err) {
    return sendJsonResponse({ success: false, status: "error", message: err.toString() });
  }
}

/**
 * POST Request Router
 * Combined to handle Dashboard actions and Attendance actions
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheetId = body.sheetId;
    const args = body.data || []; // Dashboard (Script 2) uses this 'data' array
    
    // 1. Check for Dashboard Specific Actions (Script 2)
    const dashboardActions = ['getRecords', 'saveOvertime', 'uploadFile', 'changeStatus', 'rejectRecord', 'deleteRecord'];
    if (dashboardActions.includes(action)) {
      let data;
      if (action === 'getRecords')   data = getRecords();
      if (action === 'saveOvertime') data = saveOvertime(args[0]);
      if (action === 'uploadFile')   data = uploadFile(args[0], args[1]);
      if (action === 'changeStatus') data = changeStatus(args[0]);
      if (action === 'rejectRecord') data = rejectRecord(args[0]);
      if (action === 'deleteRecord') data = deleteRecord(args[0]);
      
      // Return in the format Script 2 expects
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Check for PEL/Sheet Actions (Script 1)
    if (sheetId) {
      let res;
      if (action === 'delete') res = handleDeleteAction(body, sheetId);
      else if (action === 'create') res = handleCreateAction(body, sheetId);
      else if (action === 'generatePEL') res = generatePEL(sheetId);
      else res = handleUpdateAction(body, sheetId);
      return sendJsonResponse(res);
    } 
    
    // 3. Check for Attendance Actions (Script 1)
    if (action === 'attendance' || body.userId || body.location) {
      return sendJsonResponse(processAttendance(body));
    }

    throw new Error("Action not recognized.");
  } catch (err) {
    return sendJsonResponse({ success: false, status: "error", message: err.toString() });
  }
}

/**
 * Standard Helper from Script 1
 */
function sendJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
