// --- PEL GENERATION LOGIC ---

function generatePEL(sheetId) {
  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName(PEL_SHEET_NAME);
  const profilSheet = ss.getSheetByName("Profil");
  const logSheet = ss.getSheetByName("My Generated");

  const profilData = {
    name: profilSheet.getRange("C2").getDisplayValue(),
    surname: profilSheet.getRange("C3").getDisplayValue(),
    birthday: profilSheet.getRange("C4").getDisplayValue(),
    pob: profilSheet.getRange("C5").getDisplayValue(),
    idNo: profilSheet.getRange("C6").getDisplayValue(),
    unit: profilSheet.getRange("C9").getDisplayValue(),
    today: Utilities.formatDate(new Date(), "GMT+7", "dd MMM yyyy") 
  };
  
  const personnelName = (profilData.name + " " + profilData.surname).toUpperCase();
  const newFileName = "PEL " + personnelName;
  const newFile = DriveApp.getFileById(TEMPLATE_DOC_ID).makeCopy(newFileName);
  const newDocId = newFile.getId();
  
  DriveApp.getFileById(newDocId).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);

  const doc = DocumentApp.openById(newDocId);
  const tagMap = {
    "{{Date}}": profilData.today,
    "{{Personnel Name}}": personnelName,
    "{{Name}}": profilData.name,
    "{{Surname}}": profilData.surname,
    "{{Birthday}}": profilData.birthday,
    "{{Place of Birth}}": profilData.pob,
    "{{Unit}}": profilData.unit,
    "{{ID No}}": profilData.idNo
  };
  
  fillStaticTags(doc, tagMap);
  const dataRows = getLastRowWithData(sheet, SOURCE_RANGE_START_ROW);
  fillTableFromSheet(doc, dataRows);
  doc.saveAndClose();

  const totalPages = getTotalPages(newDocId);
  const section2Count = Math.max(1, totalPages - 5); 
  
  const finalDoc = DocumentApp.openById(newDocId);
  replaceFooterCount(finalDoc, section2Count);
  finalDoc.saveAndClose();

  if (logSheet) {
    logSheet.insertRowBefore(2);
    logSheet.getRange(2, 1, 1, 4).setValues([[
      newDocId, 
      Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss"), 
      dataRows.length, 
      newFile.getUrl()
    ]]);
  }

  return { status: 'success', url: newFile.getUrl() };
}

// --- HELPER FUNCTIONS ---


function fillStaticTags(doc, tagMap) {
  const body = doc.getBody();
  for (let tag in tagMap) { body.replaceText(tag, tagMap[tag]); }
  const parent = body.getParent();
  for (let i = 0; i < parent.getNumChildren(); i++) {
    const child = parent.getChild(i);
    const type = child.getType();
    if (type === DocumentApp.ElementType.HEADER_SECTION || type === DocumentApp.ElementType.FOOTER_SECTION) {
      const section = (type === DocumentApp.ElementType.HEADER_SECTION) ? child.asHeaderSection() : child.asFooterSection();
      for (let tag in tagMap) { section.replaceText(tag, tagMap[tag]); }
    }
  }
}

function getLastRowWithData(sheet, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return [];
  const values = sheet.getRange(startRow, 1, lastRow - startRow + 1, 23).getDisplayValues();
  const filtered = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i].join("").trim() !== "") filtered.push(values[i]);
  }
  return filtered;
}

function copyTemplate(templateId, newFileName) {
  return DriveApp.getFileById(templateId).makeCopy(newFileName);
}

function setFilePermission(fileId) {
  DriveApp.getFileById(fileId).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
}

function fillTableFromSheet(doc, dataRows) {
  const body = doc.getBody();
  const tables = body.getTables();
  let targetTable = null;
  let templateRow = null;
  let templateRowIndex = -1;
  const tableStyle = {};
  tableStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
  tableStyle[DocumentApp.Attribute.FONT_SIZE] = 8;
  
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    if (table.getText().indexOf("{{1}}") !== -1) {
      targetTable = table;
      for (let r = 0; r < table.getNumRows(); r++) {
        if (table.getRow(r).getText().indexOf("{{1}}") !== -1) {
          templateRow = table.getRow(r);
          templateRowIndex = r;
          break;
        }
      }
      break;
    }
  }
  if (!targetTable || !templateRow) return;
  for (let i = 0; i < dataRows.length; i++) {
    const rowData = dataRows[i];
    const newRow = targetTable.insertTableRow(templateRowIndex + i, templateRow.copy());
    newRow.setAttributes(tableStyle);
    for (let j = 0; j < 23; j++) {
      newRow.replaceText("\\{\\{" + (j + 1) + "\\}\\}", rowData[j] ? String(rowData[j]) : "");
    }
  }
  targetTable.removeRow(templateRowIndex + dataRows.length);
}

function getTotalPages(docId) {
  const blob = DriveApp.getFileById(docId).getAs('application/pdf');
  const content = blob.getDataAsString();
  const pageCount = content.match(/\/Type\s*\/Page[^s]/g).length;
  return pageCount;
}

function replaceFooterCount(doc, count) {
  const searchPattern = "\\{\\{count\\}\\}";
  const footerStyle = {};
  footerStyle[DocumentApp.Attribute.FONT_FAMILY] = 'Arial';
  footerStyle[DocumentApp.Attribute.FONT_SIZE] = 9;
  const body = doc.getBody();
  const parent = body.getParent();
  for (let i = 0; i < parent.getNumChildren(); i++) {
    const child = parent.getChild(i);
    if (child.getType() === DocumentApp.ElementType.FOOTER_SECTION) {
      const footer = child.asFooterSection();
      footer.replaceText(searchPattern, String(count));
      footer.getParagraphs().forEach(p => p.setAttributes(footerStyle));
      footer.getTables().forEach(t => t.setAttributes(footerStyle));
    }
  }
}
