const USER_SHEET = "USER";

function authenticateUser_(e) {
  const userId = (e.parameter.userId || "").trim();
  const password = (e.parameter.password || "").trim();

  if (!userId || !password) {
    return output_({ success: false, message: "Missing credentials" });
  }

  const ss = SpreadsheetApp.openById(MASTER_ID);
  const sh = ss.getSheetByName(USER_SHEET);

  if (!sh) {
    return output_({ success: false, message: "USER sheet not found" });
  }

  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    return output_({ success: false, message: "No users found" });
  }

  // ✅ Updated: Fetch 7 columns (A → G)
  const data = sh.getRange(2, 1, lastRow - 1, 7).getValues();

  for (const row of data) {
    const id        = String(row[0]).trim(); // A
    const name      = String(row[1]).trim(); // B
    const unit      = String(row[2]).trim(); // C
    const jobTitle  = String(row[3]).trim(); // D
    const pwd       = String(row[4]).trim(); // E
    const rawUrl    = String(row[5]).trim(); // F (Profile URL)
    const userSheetId  = String(row[6]).trim(); // G (The new column)

    if (!id) continue;

    if (id === userId && pwd === password) {
      // ✅ Convert Column F URL to Thumbnail format
      let profileThumb = "";
      if (rawUrl) {
        const fileIdMatch = rawUrl.match(/[-\w]{25,}/); // Extract ID from URL
        if (fileIdMatch) {
          profileThumb = "https://drive.google.com/thumbnail?id=" + fileIdMatch[0] + "&sz=w4000";
        }
      }

      return output_({
        success: true,
        userId: id,
        name,
        unit,
        jobTitle,
        profile: profileThumb, // ✅ Added this line
        userSheetId: userSheetId
      });
    }
  }

  return output_({ success: false, message: "Invalid ID or password" });
}

function output_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
