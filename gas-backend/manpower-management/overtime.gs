// ==========================================
// 2. DATABASE SERVICE
// ==========================================

const DB_Service = {
  getRef: function() {
    const ss = SpreadsheetApp.openById(CONFIG.ATTENDANCE_ID);
    let sheet = ss.getSheetByName(CONFIG.OVT_SHEET_NAME);
    
    const headers = [
      'ID', 'Timestamp', 'Employee', 'Personal Number', 'Unit',
      'From DateTime', 'Until DateTime', 'Rest Start', 'Rest End', 
      'Total Time', 'Remarks', 'Evidence File URL', 'Status', 
      'Submit Timestamp', 'Rejection Reason'
    ];

    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.OVT_SHEET_NAME);
      sheet.getRange(1, 1, 1, headers.length)
           .setValues([headers])
           .setBackground(CONFIG.THEME_COLOR).setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    } else {
      // Self-healing: check if Rejection Reason column exists
      const currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (currentHeaders.indexOf('Rejection Reason') === -1) {
        sheet.getRange(1, currentHeaders.length + 1).setValue('Rejection Reason')
             .setBackground(CONFIG.THEME_COLOR).setFontColor('white').setFontWeight('bold');
      }
    }
    return sheet;
  },

  readAll: function() {
    const sheet = this.getRef();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; 
    const data = sheet.getDataRange().getDisplayValues();
    const headers = data.shift().map(h => h.toString().trim());
    return data.map(row => {
      let obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] ? row[i].toString().trim() : ""; });
      return obj;
    }).filter(item => item.ID !== "").reverse();
  },

  create: function(d) {
    const sheet = this.getRef();
    const id = "OT-" + Utilities.getUuid().split('-')[0].toUpperCase();
    sheet.appendRow([
      id, new Date(), d.employee, d.pn, d.unit, d.from, d.until, d.rest_start, d.rest_end, 
      d.total, d.remarks, d.evidence, 'OPEN', '', ''
    ]);
    return id;
  },

  update: function(id, d) {
    const sheet = this.getRef();
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const rowIdx = ids.indexOf(id) + 2;
    if (rowIdx < 2) throw "Record " + id + " not found.";
    
    // Array now has 10 items instead of 9
    const vals = [[ d.employee, d.pn, d.unit, d.from, d.until, d.rest_start, d.rest_end, d.total, d.remarks, d.evidence ]];
    
    // Range changed from (rowIdx, 3, 1, 9) to (rowIdx, 3, 1, 10)
    sheet.getRange(rowIdx, 3, 1, 10).setValues(vals);
    return true;
  },

  patch: function(id, partial) {
    const sheet = this.getRef();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const rowIdx = ids.indexOf(id) + 2;
    if (rowIdx < 2) throw "Record Not Found: " + id;
    for (let key in partial) {
      const colIdx = headers.indexOf(key) + 1;
      if (colIdx > 0) sheet.getRange(rowIdx, colIdx).setValue(partial[key]);
    }
    return true;
  },

  delete: function(id) {
    const sheet = this.getRef();
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const rowIdx = ids.indexOf(id) + 2;
    if (rowIdx >= 2) {
      sheet.deleteRow(rowIdx);
      return true;
    }
    throw "Record " + id + " not found.";
  }
};

// ==========================================
// 3. DRIVE SERVICE
// ==========================================

const Drive_Service = {
  upload: function(base64, name) {
    try {
      if (!base64 || !base64.includes(',')) return "";
      const split = base64.split(',');
      const contentType = split[0].match(/:(.*?);/)[1];
      const blob = Utilities.newBlob(Utilities.base64Decode(split[1]), contentType, name);
      const folder = DriveApp.getFolderById(CONFIG.OVT_FOLDER_ID);
      const file = folder.createFile(blob);   
      return file.getUrl();
    } catch (e) {
      throw new Error("Upload Failed: " + e.toString());
    }
  }
};

// ==========================================
// 4. WRAPPER FUNCTIONS (Standard for GAS)
// ==========================================

function getRecords() { return DB_Service.readAll(); }
function saveOvertime(d) { return d.id ? DB_Service.update(d.id, d) : DB_Service.create(d); }
function uploadFile(base64, name) { return Drive_Service.upload(base64, name); }
function deleteRecord(id) { return DB_Service.delete(id); }

function changeStatus(id) { 
  const now = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "dd MMM yyyy, HH:mm:ss");
  return DB_Service.patch(id, { 'Status': 'SUBMITTED', 'Submit Timestamp': now });
}

function rejectRecord(data) { 
  return DB_Service.patch(data.id, { 'Status': 'REJECTED', 'Rejection Reason': data.reason });
}
