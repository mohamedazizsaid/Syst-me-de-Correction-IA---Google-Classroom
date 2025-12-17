function extractTextFromDoc(fileId) {
  const doc = DocumentApp.openById(fileId);
  return doc.getBody().getText();
}
