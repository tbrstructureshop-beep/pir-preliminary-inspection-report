function deleteSingleMaterialRow(sheetId, findingName, rowIndex) {
  const ss = SpreadsheetApp.openById(sheetId);
  const materialSheet = ss.getSheetByName("MATERIAL LIST");

  if (!materialSheet) throw new Error("Sheet 'MATERIAL LIST' not found");

  const lastRow = materialSheet.getLastRow();
  
  if (lastRow < 5) return { status: "error", message: "Sheet is empty" };

  // 1. CONVERT TO NUMBER (Crucial for array math)
  const indexToDelete = Number(rowIndex);

  // Get all data from row 5 onwards
  const range = materialSheet.getRange(5, 1, lastRow - 4, 10);
  const allData = range.getValues();

  // 2. Separate materials for OTHER findings
  const otherMaterials = allData.filter(row => String(row[0]) !== String(findingName));
  
  // 3. Get materials ONLY for THIS finding
  const targetMaterials = allData.filter(row => String(row[0]) === String(findingName));

  // 4. USE THE NUMBER VERSION HERE (indexToDelete)
  if (indexToDelete >= 0 && indexToDelete < targetMaterials.length) {
    targetMaterials.splice(indexToDelete, 1); // Removes exactly one row
  } else {
    return { status: "error", message: "Row index out of bounds: " + indexToDelete };
  }

  // 5. Put it all back together
  const newDataset = [...otherMaterials, ...targetMaterials];

  // 6. Update Spreadsheet
  range.clearContent();
  if (newDataset.length > 0) {
    materialSheet.getRange(5, 1, newDataset.length, 10).setValues(newDataset);
  }

  return { status: "success", message: "Material removed successfully" };
}
