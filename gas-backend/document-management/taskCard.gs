function routeTaskRequest(action, params, sheetId) {
  switch (action) {
    case 'getInitialData': return getInitialData(sheetId);
    case 'getExistingTasks': return getExistingTasks(sheetId, params.findingNo);
    default: throw new Error("Invalid GET task action");
  }
}

function routeTaskPost(action, payload, sheetId) {
  switch (action) {
    case 'saveTaskCards': return saveTaskCards(sheetId, payload);
    case 'updateTaskResult': return updateTaskResult(sheetId, payload);
    default: throw new Error("Invalid POST task action");
  }
}

function getInitialData(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  const infoSheet = ss.getSheetByName("INFO");
  const infoRaw = infoSheet.getRange("C2:C9").getValues();
  
  const info = {
    customer: infoRaw[0][0],
    acReg:    infoRaw[1][0],
    woNo:     infoRaw[2][0],
    partDesc: infoRaw[3][0],
    pn:       infoRaw[4][0],
    sn:       infoRaw[5][0]
  };

  const findingSheet = ss.getSheetByName("FINDING");
  const findingRows = findingSheet.getDataRange().getValues();
  findingRows.shift(); 

  const findings = findingRows
    .filter(row => row[0].toString().includes(info.woNo))
    .map(row => ({
      no: row[0],
      pic: convertToThumbnail(row[1]),
      identification: row[2],
      action: row[3]
    }));

  return { info, findings };
}

function saveTaskCards(sheetId, payload) {
  const ss = SpreadsheetApp.openById(sheetId);
  const taskSheet = ss.getSheetByName("TASK_CARDS");
  const refSheet = ss.getSheetByName("REFERENCES");
  const folder = DriveApp.getFolderById(TASK_FOLDER_ID);
  
  // Create headers if missing
  if (taskSheet.getLastRow() === 0) {
    taskSheet.appendRow(["W/O No", "Finding No", "Task ID", "Type", "Category", "MH", "Description", "Date", "Notes", "Ins. Result", "Ins. Report"]);
  }
  if (refSheet.getLastRow() === 0) {
    refSheet.appendRow(["W/O No", "Finding No", "Task ID", "Ref ID", "Doc Type", "Chapter/Task", "Rev No", "Rev Date", "File Link", "Log Date"]);
  }

  payload.tasks.forEach(task => {
    const taskData = [
      payload.wo, task.findingNo, task.taskNo, task.type, 
      task.category, task.mh, task.description, new Date(), 
      task.notes, "", "" 
    ];

    const taskRows = taskSheet.getDataRange().getValues();
    let taskFound = false;
    for (let i = 1; i < taskRows.length; i++) {
      if (taskRows[i][1] == task.findingNo && taskRows[i][2] == task.taskNo) {
        taskSheet.getRange(i + 1, 1, 1, taskData.length).setValues([taskData]);
        taskFound = true;
        break;
      }
    }
    if (!taskFound) taskSheet.appendRow(taskData);

    const refRows = refSheet.getDataRange().getValues();
    for (let i = refRows.length - 1; i >= 1; i--) {
      if (refRows[i][1] == task.findingNo && refRows[i][2] == task.taskNo) {
        refSheet.deleteRow(i + 1);
      }
    }

    task.references.forEach((ref, index) => {
      let fileUrl = "";
      if (ref.fileData && ref.fileData.base64) {
        const fileName = `${task.findingNo}_${task.taskNo}_R${index+1}_${ref.fileData.name}`;
        const blob = Utilities.newBlob(Utilities.base64Decode(ref.fileData.base64), ref.fileData.mimeType, fileName);
        fileUrl = folder.createFile(blob).getUrl();
      }

      refSheet.appendRow([
        payload.wo, task.findingNo, task.taskNo, 
        `${task.findingNo}${task.taskNo}R${index}`,
        ref.docType, ref.title, ref.rev, ref.date, fileUrl, new Date()
      ]);
    });
  });
  
  return { status: "success" };
}

function updateTaskResult(sheetId, payload) {
  const ss = SpreadsheetApp.openById(sheetId);
  const taskSheet = ss.getSheetByName("TASK_CARDS");
  const folder = DriveApp.getFolderById(TASK_FOLDER_ID);
  
  const rows = taskSheet.getDataRange().getValues();
  let fileUrl = "";

  if (payload.fileData && payload.fileData.base64) {
    const fileName = `RESULT_${payload.findingNo}_${payload.taskNo}_${payload.fileData.name}`;
    const blob = Utilities.newBlob(Utilities.base64Decode(payload.fileData.base64), payload.fileData.mimeType, fileName);
    fileUrl = folder.createFile(blob).getUrl();
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] == payload.findingNo && rows[i][2] == payload.taskNo) {
      taskSheet.getRange(i + 1, 10).setValue(payload.result);
      if (fileUrl) taskSheet.getRange(i + 1, 11).setValue(fileUrl);
      return { status: "success" };
    }
  }
  return { status: "error", message: "Task not found" };
}

function getExistingTasks(sheetId, findingNo) {
  const ss = SpreadsheetApp.openById(sheetId);
  const taskRows = ss.getSheetByName("TASK_CARDS").getDataRange().getValues();
  const refRows = ss.getSheetByName("REFERENCES").getDataRange().getValues();
  
  const tasks = taskRows.filter(r => r[1] == findingNo).map(r => ({
    taskNo: r[2],
    type: r[3],
    category: r[4],
    mh: r[5],
    description: r[6],
    notes: r[8],
    insResult: r[9],
    insReport: r[10]
  }));

  tasks.forEach(task => {
    task.references = refRows
      .filter(r => r[1] == findingNo && r[2] == task.taskNo)
      .map(r => ({
        docType: r[4],
        title: r[5],
        rev: r[6],
        date: r[7],
        link: r[8]
      }));
  });

  return tasks;
}

function convertToThumbnail(url) {
  if (!url || typeof url !== 'string') return "";
  let id = "";
  try {
    if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    else if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0];
    if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=s1000`;
  } catch (e) {}
  return url;
}
