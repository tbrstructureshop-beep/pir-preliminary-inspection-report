function saveUpdatedMaterial(sheetId, findingName, materials) {
  const ss = SpreadsheetApp.openById(sheetId);
  const materialSheet = ss.getSheetByName("MATERIAL LIST");

  if (!materialSheet) throw new Error("Sheet 'MATERIAL LIST' not found");

  const lastRow = materialSheet.getLastRow();

  // 1. Prepare "Today" in YYYY-MM-DD format as the default
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // 2. Fetch current data from row 5 downwards
  let allData = [];
  if (lastRow >= 5) {
    allData = materialSheet.getRange(5, 1, lastRow - 4, 10).getValues();
  }

  // 3. ERASE: Filter out all rows that belong to this findingName
  const otherMaterials = allData.filter(row => String(row[0]) !== String(findingName));

  // 4. RENEW: Prepare new rows from the frontend data
  const safeMaterials = (materials || []).filter(m => m.partNo || m.description);
  
  const newFindingRows = safeMaterials.map(m => {
    // Logic: If m.dateChange exists and isn't empty, use it. Otherwise, use 'today'.
    const finalDate = (m.dateChange && m.dateChange.trim() !== "") ? m.dateChange : today;

    return [
      findingName,
      m.partNo || "",
      m.description || "",
      m.qty || "",
      m.uom || "",
      m.availability || "",
      m.pr || "",
      m.po || "",
      m.note || "",
      finalDate // <--- This now defaults to today's date
    ];
  });

  // Combine others with the new updates
  const finalDataset = [...otherMaterials, ...newFindingRows];

  // 5. WRITE: Clear and rewrite the sheet
  if (lastRow >= 5) {
    materialSheet.getRange(5, 1, lastRow - 4, 10).clearContent();
  }
  if (finalDataset.length > 0) {
    materialSheet.getRange(5, 1, finalDataset.length, 10).setValues(finalDataset);
  }

  // 6. DATA VALIDATION: Update Availability options
  syncAvailabilityValidation(ss, safeMaterials);

  return { status: "success", count: finalDataset.length };
}

function syncAvailabilityValidation(ss, materials) {
  let valSheet = ss.getSheetByName("Data Validation");

  if (!valSheet) {
    valSheet = ss.insertSheet("Data Validation");
  }

  const valLastRow = valSheet.getLastRow();
  const submittedOptions = [...new Set(materials.map(m => String(m.availability).trim()).filter(a => a !== ""))];
  const existingOptions = valLastRow > 0 
    ? valSheet.getRange(1, 1, valLastRow, 1).getValues().flat().map(v => String(v).trim())
    : [];

  const brandNewOptions = submittedOptions.filter(opt => !existingOptions.includes(opt));
  if (brandNewOptions.length > 0) {
    const valuesToAdd = brandNewOptions.map(opt => [opt]);
    valSheet.getRange(valLastRow + 1, 1, valuesToAdd.length, 1).setValues(valuesToAdd);
  }
}


/**
 * HELPER: Standardize the output format
 */
function finalizeResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
