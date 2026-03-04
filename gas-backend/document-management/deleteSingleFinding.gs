function deleteSingleFinding(sheetId, findingNo) {
  try {
    if (!sheetId) throw new Error("No Sheet ID provided to backend.");
    
    const ss = SpreadsheetApp.openById(sheetId);
    const findingSheet = ss.getSheetByName("FINDING");
    const materialSheet = ss.getSheetByName("MATERIAL LIST");
    const infoSheet = ss.getSheetByName("INFO");

    // 1. Get woNo for re-sequencing (Cell C4)
    const woNo = infoSheet.getRange("C4").getValue().toString().trim() || "PIR";

    // 2. Process FINDING Sheet
    const fLastRow = findingSheet.getLastRow();
    if (fLastRow < 2) throw new Error("No findings found to delete.");
    
    const fRange = findingSheet.getRange(2, 1, fLastRow - 1, 4);
    const fData = fRange.getValues();
    
    // Filter out the finding (using trim to be safe)
    const targetId = findingNo.toString().trim();
    const filteredFindings = fData.filter(row => row[0].toString().trim() !== targetId);

    if (filteredFindings.length === fData.length) {
      throw new Error("Finding ID '" + targetId + "' not found in sheet.");
    }

    // 3. Process MATERIAL LIST Sheet
    const mLastRow = materialSheet.getLastRow();
    let updatedMaterials = [];
    if (mLastRow >= 5) {
      const mData = materialSheet.getRange(5, 1, mLastRow - 4, 10).getValues();
      // Remove materials for the deleted finding
      const remainingMaterials = mData.filter(row => row[0].toString().trim() !== targetId);
      
      // Re-map finding numbers for materials that were AFTER the deleted one
      // We do this by checking the index in the original finding list
      const originalOrder = fData.map(r => r[0].toString().trim());
      const deletedIndex = originalOrder.indexOf(targetId);

      updatedMaterials = remainingMaterials.map(row => {
        let currentIdx = originalOrder.indexOf(row[0].toString().trim());
        if (currentIdx > deletedIndex) {
          // Shift number down (e.g., PIR03 becomes PIR02)
          row[0] = `${woNo}${String(currentIdx).padStart(2, "0")}`;
        }
        return row;
      });
    }

    // 4. Re-sequence the Findings themselves
    const reSequencedFindings = filteredFindings.map((row, index) => {
      row[0] = `${woNo}${String(index + 1).padStart(2, "0")}`;
      return row;
    });

    // 5. WRITE BACK (Clear first to avoid ghost data)
    findingSheet.getRange(2, 1, Math.max(fLastRow, 2), 4).clearContent();
    if (reSequencedFindings.length > 0) {
      findingSheet.getRange(2, 1, reSequencedFindings.length, 4).setValues(reSequencedFindings);
    }

    if (mLastRow >= 5) {
      materialSheet.getRange(5, 1, mLastRow - 4, 10).clearContent();
      if (updatedMaterials.length > 0) {
        materialSheet.getRange(5, 1, updatedMaterials.length, 10).setValues(updatedMaterials);
      }
    }

    return { success: true };

  } catch (err) {
    console.error(err.message);
    return { success: false, error: err.message };
  }
}
