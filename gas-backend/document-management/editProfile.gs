/**
 * FIXED: findUser
 * Uses your global MASTER_ID and the string "USER"
 */
function findUser(id) {
  try {
    const ss = SpreadsheetApp.openById(MASTER_ID); // Use global MASTER_ID
    const sh = ss.getSheetByName("USER");         // Hardcoded or use USER_SHEET_NAME
    const data = sh.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      // String comparison to prevent ID format mismatch
      if (data[i][0].toString() === id.toString()) {
        return { sheet: sh, row: i + 1 };
      }
    }
    return { sheet: null, row: -1 };
  } catch (e) {
    return { sheet: null, row: -1 };
  }
}

/**
 * FIXED: handleUpdateData
 * Returns a PLAIN OBJECT (No createRes)
 */
function handleUpdateData(payload) {
  const { userId, jobTitle, password } = payload;
  const { sheet, row } = findUser(userId);
  
  if (!sheet || row === -1) throw new Error("User row invalid.");

  sheet.getRange(row, 4).setValue(jobTitle); // Column D
  sheet.getRange(row, 5).setValue(password); // Column E
  
  return { status: 'success' }; // Return object, let doPost handle json()
}

/**
 * FIXED: handleUpdateImg
 * Includes Base64 cleaning and returns a PLAIN OBJECT
 */
function handleUpdateImg(payload) {
  const { userId, oldUrl, base64, mimeType, filename } = payload;
  const { sheet, row } = findUser(userId);
  
  if (!sheet || row === -1) throw new Error("User auth failed.");

  // 1. Clean old file if it exists
  if (oldUrl) {
    const oldId = oldUrl.match(/[-\w]{25,}/);
    if (oldId) { 
      try { DriveApp.getFileById(oldId[0]).setTrashed(true); } catch(e){ console.log("Old file delete failed"); } 
    }
  }

  // 2. Fix Base64 string (Strip header if present)
  var cleanBase64 = base64;
  if (base64.indexOf(",") > -1) {
    cleanBase64 = base64.split(",")[1];
  }

  // 3. Upload new
  const folder = DriveApp.getFolderById(PROFILE_FOLDER_ID); // Use your global PROFILE_FOLDER_ID
  const blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, filename);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // 4. Update Sheet
  const newUrl = `https://drive.google.com/file/d/${file.getId()}/view?usp=drivesdk`;
  sheet.getRange(row, 6).setValue(newUrl); // Column F

  return { status: 'success', newUrl: newUrl }; // Return object
}
