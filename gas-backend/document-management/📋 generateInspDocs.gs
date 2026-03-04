const SHEET_DOC = 'Generated';

function generateInspectionDoc(sheetId) {
  const TEMPLATE_DOC_ID = '1mSg7aovGLjt34T4AIbNHDiKA_bKZOJx61GEOx8Tb53Q';
  
  // Use passed sheetId instead of hardcoded
  const ss = SpreadsheetApp.openById(sheetId);
  const info = ss.getSheetByName('INFO');

  const meta = {
    woNo: info.getRange('C4').getValue(),
    partDesc: info.getRange('C5').getValue(),
    acReg: info.getRange('C3').getValue()
  };

  const finding = ss.getSheetByName('FINDING');

  /* ========= COPY TEMPLATE (CUSTOM NAME) ========= */
  const docName = `${info.getRange('C4').getValue()} ${info.getRange('C5').getValue()}`;

  const copyFile = DriveApp
    .getFileById(TEMPLATE_DOC_ID)
    .makeCopy(docName);

  const docId = copyFile.getId();
  const docUrl = copyFile.getUrl();

  /* ========= SET PERMISSION ========= */
  copyFile.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.EDIT
  );

  /* ========= OPEN DOC ========= */
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();
  const header = doc.getHeader();
  const footer = doc.getFooter();


  /* ========= UTIL ========= */
  const formatDate = d =>
    Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), 'dd MMM yyyy');

  /* ========= SIMPLE TAGS ========= */
  const tagMap = {
    '<<1>>': info.getRange('C2').getValue(),
    '<<2>>': info.getRange('C5').getValue(),
    '<<3>>': info.getRange('C6').getValue(),
    '<<4>>': info.getRange('C7').getValue(),
    '<<5>>': info.getRange('C8').getValue(),
    '<<6>>': formatDate(info.getRange('C9').getValue()),
    '<<7>>': info.getRange('C4').getValue(),
    '<<8>>': info.getRange('C3').getValue(),
    '<<9>>': 'CHECK',
    '<<10>>': info.getRange('C11').getValue(),
    '<<11>>': info.getRange('C12').getValue(),
    '<<12>>': info.getRange('C13').getValue(),
    '<<13>>': info.getRange('C14').getValue(),
    '<<Date>>': formatDate(info.getRange('C9').getValue())
  };

  Object.keys(tagMap).forEach(tag => {
    body.replaceText(tag, tagMap[tag]);

    if (header) {
      header.replaceText(tag, tagMap[tag]);
    }

    if (footer) {
      footer.replaceText(tag, tagMap[tag]);
    }
  });

  /* ========= FINDINGS ========= */
  const findingData = finding.getRange('A2:D').getValues()
    .filter(r => r.join('').trim() !== '');

  if (findingData.length === 0) {
    doc.saveAndClose();

    // ===== LOG GENERATION =====
    logGeneration_(meta, docId, docUrl);

    return {
      copiedDocId: docId,
      copiedDocUrl: docUrl
    };
  }

  const tables = body.getTables();
  let targetTable = null;
  let templateRowIndex = -1;

  tables.some(t => {
    for (let r = 0; r < t.getNumRows(); r++) {
      if (t.getRow(r).getText().includes('<<F1>>')) {
        targetTable = t;
        templateRowIndex = r;
        return true;
      }
    }
    return false;
  });

  if (!targetTable) {
    throw new Error('Finding table with <<F1>> tag not found in document.');
  }

  const templateRow = targetTable.getRow(templateRowIndex);
  targetTable.removeRow(templateRowIndex);

  findingData.forEach((dataRow, index) => {
    const newRow = targetTable.appendTableRow();

    for (let c = 0; c < templateRow.getNumCells(); c++) {
      const srcCell = templateRow.getCell(c);
      const dstCell = newRow.appendTableCell();
      dstCell.setText(srcCell.getText());
    }
    replaceFindingRow(newRow, dataRow, index + 1); // ✅ 1., 2., 3.
  });

  doc.saveAndClose();

  // ===== LOG GENERATION =====
  logGeneration_(meta, docId, docUrl);

  return {
    copiedDocId: docId,
    copiedDocUrl: docUrl
  };
}


/* ========= HELPERS ========= */
function replaceFindingRow(row, data, rowNumber) {
  const [, imgUrl, text1, text2] = data;

  // ---------- TEXT REPLACEMENT ----------
  row.replaceText('<<F1>>', `${rowNumber}.`);
  row.replaceText('<<F2>>', '');
  row.replaceText('<<F3>>', text1);
  row.replaceText('<<F4>>', text2);

  // ---------- TEXT FORMATTING ----------
  formatCell(row.getCell(0), DocumentApp.HorizontalAlignment.CENTER); // F1
  formatCell(row.getCell(1), DocumentApp.HorizontalAlignment.CENTER); // F2 (image column placeholder)
  formatCell(row.getCell(2), DocumentApp.HorizontalAlignment.LEFT);   // F3
  formatCell(row.getCell(3), DocumentApp.HorizontalAlignment.LEFT);   // F4

  // ---------- IMAGE ----------
  if (imgUrl) {
    const fileId = imgUrl.match(/[-\w]{25,}/)?.[0];
    if (!fileId) return;

    const blob = DriveApp.getFileById(fileId).getBlob();
    const cell = row.getCell(1);

    // ⚠️ clearing removes paragraph → must reformat AFTER
    cell.clear();

    const img = cell.insertImage(0, blob);

    // ---- FORCE CENTER ALIGNMENT FOR IMAGE ----
    const p = cell.getChild(0).asParagraph();
    p.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    // ---- IMAGE SIZE CONTROL ----
    const ow = img.getWidth();
    const oh = img.getHeight();
    const isHorizontal = ow >= oh;

    const maxW = cmToPx(isHorizontal ? 6.65 : 4.45);
    const maxH = cmToPx(isHorizontal ? 3.38 : 5.58);

    const scale = Math.min(maxW / ow, maxH / oh);
    img.setWidth(ow * scale);
    img.setHeight(oh * scale);
  }
}


function cmToPx(cm) {
  return cm * 37.795275591;
}

function formatCell(cell, alignment) {
  // Vertical alignment (cell-level — supported)
  cell.setVerticalAlignment(DocumentApp.VerticalAlignment.MIDDLE);

  // Apply to ALL paragraphs in the cell
  const attrs = {};
  attrs[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = alignment;
  attrs[DocumentApp.Attribute.FONT_FAMILY] = 'Lato';
  attrs[DocumentApp.Attribute.FONT_SIZE] = 8;
  attrs[DocumentApp.Attribute.BOLD] = false;

  for (let i = 0; i < cell.getNumChildren(); i++) {
    const el = cell.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH) {
      el.asParagraph().setAttributes(attrs);
    }
  }
}


function logGeneration_(meta, docId, docUrl) {
  const ss = SpreadsheetApp.openById(MASTER_ID);
  const sh = ss.getSheetByName(SHEET_DOC);

  const existing = sh.getRange('F2:F').getValues().flat();
  if (existing.includes(docId)) return; // already logged

  // Always push old data down
  sh.insertRowBefore(2);

  const row = [
    Utilities.getUuid(), // PIR ID
    meta.woNo,           // W/O No
    meta.partDesc,       // Part Description
    meta.acReg,          // A/C Reg
    new Date(),          // Date Created
    docId,               // DocId
    docUrl               // DocUrl
  ];

  sh.getRange(2, 1, 1, row.length).setValues([row]);
}


