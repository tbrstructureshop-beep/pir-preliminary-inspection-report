function saveFindingImage(base64, fileName, folderId) {
  if (!base64 || !base64.startsWith("data:")) return "";

  const parts = base64.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  if (!mimeMatch) return "";

  const mime = mimeMatch[1];
  const bytes = Utilities.base64Decode(parts[1]);

  const blob = Utilities.newBlob(bytes, mime, fileName);
  const folder = DriveApp.getFolderById(folderId);
  const file = folder.createFile(blob);

  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  return file.getUrl();
}
