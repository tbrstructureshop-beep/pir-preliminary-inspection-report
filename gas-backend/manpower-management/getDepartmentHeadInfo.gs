function getDepartmentHeadInfo(userId) {
  try {
    const userSheet = SpreadsheetApp.openById(CONFIG.MASTER_ID).getSheetByName("USER");
    const userData = userSheet.getDataRange().getValues();

    let userUnit = "";
    // 1. Find the current user's unit first
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][0].toString() === userId.toString()) {
        userUnit = userData[i][2];
        break;
      }
    }

    if (!userUnit) return { success: false, error: "User unit not found" };

    // 2. Find the DH for that unit
    for (let i = 1; i < userData.length; i++) {
      const row = userData[i]; // Get the full row
      const dhId     = row[0]; // Col A
      const dhName   = row[1]; // Col B
      const dhUnit   = row[2]; // Col C
      const jobTitle = row[3] ? row[3].toString() : ""; // Col D
      const rawUrl   = row[5] ? row[5].toString() : ""; // ✅ Col F: Profile URL

      if (dhUnit === userUnit && jobTitle.toUpperCase().includes("HEAD")) {
        const statusInfo = getDHAttendanceStatus(dhId);
        
        // ✅ 3. Extract GDrive ID and convert to Thumbnail URL
        let profileThumb = "";
        if (rawUrl) {
          const fileIdMatch = rawUrl.match(/[-\w]{25,}/); // Extracts the File ID
          if (fileIdMatch) {
            profileThumb = "https://drive.google.com/thumbnail?id=" + fileIdMatch[0] + "&sz=w4000";
          }
        }

        return {
          success: true,
          id: dhId,
          name: dhName,
          unit: dhUnit,
          jobTitle: jobTitle, // <--- ADD THIS LINE
          profile: profileThumb, // ✅ Now sending the photo URL
          attendanceStatus: statusInfo.status,
          statusCode: statusInfo.code
        };
      }
    }
    return { success: false, error: "DH not found" };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}
