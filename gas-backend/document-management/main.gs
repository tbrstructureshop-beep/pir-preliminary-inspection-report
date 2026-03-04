// --- CONSTANTS (COMBINED) ---
const DRIVE_FOLDER_ID = "1zu3F68ayIj9JqalTfWcOFKff8pP9zsGf"; // Manhour Evidence Folder
const FINDING_FOLDER_ID = "1IFFpETEdSapOhUe1vWl1L5SgoKP5KWRx"; // PIR Finding Image Folder
const MASTER_ID = "1klXxDb0C9Qsf7Xes3Pygu934lXnGcdu6eisc2Y7Q0zU";
const TEMPLATE_ID = "1SHznK7Wo04LI1TyeoIKuLvVLA8elsLoDIbqN-D5Oaio";
const MANPOWER_ID = "1Sa-vgo_pk-Mp0pMON8I67onO0hVD1KQKraizWseMnG4";
const TASK_FOLDER_ID = "19OpCty3k_WUO_4fZGYjmvvCqnS8oZOzE"; 

// --- MRO ENTERPRISE CONSTANTS ---
const PROFILE_FOLDER_ID = "1BXhXLTf8rhJL22zHLjTwbBk4jQKkWUoM";
const USER_SHEET_NAME = "USER";

/**
 * 1. POST HANDLER
 */
function doPost(e) {
  try {
    let params = {};
    if (e.parameter) {
      Object.keys(e.parameter).forEach(key => { params[key] = e.parameter[key]; });
    }
    if (e.postData && e.postData.contents) {
      try {
        const body = JSON.parse(e.postData.contents);
        Object.keys(body).forEach(key => { params[key] = body[key]; });
      } catch (jsonErr) {}
    }

    const action = params.action;
    const sheetId = params.sheetId || params.id;
    const payload = params.payload; // For MRO Enterprise payloads

    // --- 1. MRO ENTERPRISE ACTIONS ---
    if (action === 'updateProfile') return json(handleUpdateData(payload));
    if (action === 'updatePicture') return json(handleUpdateImg(payload));
    if (action === 'getUser') {
      const { sheet, row } = findUser(payload.userId);
      if (row === -1) throw new Error("User not found");
      const data = sheet.getRange(row, 1, 1, 6).getValues()[0];
      return json({ status: 'success', password: data[4] });
    }

    // --- 2. MANHOUR ACTIONS ---
    if (action === 'startManhour') return json(startManhour(params));
    if (action === 'stopManhour') return json(stopManhour(params));

    // --- 3. MATERIAL ACTIONS ---
    if (["save", "delete", "delete_row"].includes(action)) {
      if (!sheetId) throw new Error("Missing sheetId");
      if (action === "delete") return json(deleteFindingMaterials(sheetId, params.findingName));
      if (action === "delete_row") return json(deleteSingleMaterialRow(sheetId, params.findingName, params.rowIndex));
      if (action === "save") return json(saveUpdatedMaterial(sheetId, params.findingName, params.materials));
    }

    // --- 4. PIR & AUTH ACTIONS ---
    if (action === "login") return authenticateUser_({ parameter: params });
    if (action === "updatePIR") return handleUpdatePIR({ parameter: params });
    if (action === "deleteFinding") return json(deleteSingleFinding(sheetId, params.findingNo));

    // FIX FOR deleteGenerated: (Handles cases where helper might already return json)
    if (action === "deleteGenerated") {
      const result = deleteGeneratedByPirId_(params.pirId);
      return (result && typeof result === 'object' && result.getContent) ? result : json(result || {success: true});
    }

    // FIX FOR deletePIR: (Restores original behavior but adds safety)
    if (action === "deletePIR") {
      const result = deletePIR(sheetId);
      // If deletePIR already returns a TextOutput (like the original did), return it directly
      return (result && typeof result === 'object' && result.getContent) ? result : json(result || {success: true});
    }

    // RESTORED: generateDoc action
    if (action === "generateDoc") {
      const result = generateInspectionDoc(sheetId);
      return json({ success: true, copiedDocId: result.copiedDocId, copiedDocUrl: result.copiedDocUrl });
    }

    // --- 5. TASK CARD ACTIONS (POST) ---
    if (action === 'saveTaskCards' || action === 'updateTaskResult') {
       if (!sheetId) throw new Error("Task Card Action requires sheetId");
       return json(routeTaskPost(action, params, sheetId));
    }

    // --- 6. DEFAULT / FALLBACK ACTIONS ---
    // RESTORED: createPIR action
    if (action === "createPIR" || !action) {
      return json(createNewPIRLogic(params));
    }

    return json({ success: false, error: "Invalid action: " + action });
  } catch (err) {
    return json({ success: false, error: err.toString() });
  }
}

/**
 * 2. GET HANDLER
 */
function doGet(e) {
  const action = e.parameter.action;
  const sheetId = e.parameter.sheetId || e.parameter.id;

  try {
    if (!action || action === 'health') return json({ status: "active", version: "2.1.0" });

    // Original System Actions
    if (action === 'getWOData') return json(fetchWOData(sheetId));
    if (action === "getMaster") return json(getMaster());
    if (action === "getPIR") return json(getPIR(sheetId));
    if (action === "getGenerated") return json(getGenerated());
    if (action === "getMaterialData") return json(getMaterialDataLogic(sheetId));
    if (action === "getUserMap") return json(getUserMap());
    if (action === "updateStatus") {
      updateStatus(e);
      return json({ success: true });
    }

    // --- TASK CARD ACTIONS (GET) ---
    if (action === 'getInitialData' || action === 'getExistingTasks') {
      if (!sheetId) throw new Error("Action requires sheetId");
      return json(routeTaskRequest(action, e.parameter, sheetId));
    }

    return json({ error: "Invalid action" });
  } catch (err) {
    return json({ success: false, error: err.toString() });
  }
}

/**
 * HELPER: JSON Response
 */
function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

