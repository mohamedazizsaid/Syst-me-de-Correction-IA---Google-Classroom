function extractTextFromDoc(fileId) {
  try {
    const doc = DocumentApp.openById(fileId);
    return doc.getBody().getText();
  } catch (e) {
    Logger.log(`Erreur lecture doc ${fileId}: ${e.toString()}`);
    return "[Erreur de lecture du document Google Doc]";
  }
}
