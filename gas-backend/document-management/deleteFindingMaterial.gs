// 1. ADD sheetId to the arguments list here
function deleteFindingMaterials(sheetId, findingName) {
  // 2. Now sheetId is correctly defined and can be used here
  const ss = SpreadsheetApp.openById(sheetId); 
  const materialSheet = ss.getSheetByName("MATERIAL LIST");
  
  if (!materialSheet) throw new Error("Sheet 'MATERIAL LIST' not found");
  
  const lastRow = materialSheet.getLastRow();
  
  // If no data exists yet, just return success
  if (lastRow < 5) return { status: "success", count: 0 };

  const range = materialSheet.getRange(5, 1, lastRow - 4, 10);
  const allData = range.getValues();

  // Keep everything EXCEPT the finding we want to delete
  const otherMaterials = allData.filter(row => String(row[0]) !== String(findingName));

  // Clear the existing block
  range.clearContent();

  // If there are materials left for other findings, write them back
  if (otherMaterials.length > 0) {
    materialSheet.getRange(5, 1, otherMaterials.length, 10).setValues(otherMaterials);
  }

  return { 
    status: "success", 
    message: "Materials for " + findingName + " deleted.", 
    count: otherMaterials.length 
  };
}
