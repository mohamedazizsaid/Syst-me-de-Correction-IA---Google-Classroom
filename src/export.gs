// export.gs

function exportResultsPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RESULTATS");
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert("❌ Aucun résultat à exporter. Lancez d'abord une correction.");
    return;
  }
  
  // Vérifier s'il y a des données
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("❌ Aucune donnée dans la feuille RESULTATS.");
    return;
  }
  
  // Demander un nom de fichier
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Nom du fichier PDF',
    'Entrez le nom du fichier :',
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() !== ui.Button.OK) {
    return;
  }
  
  const fileName = response.getResponseText() || 'Corrections_' + new Date().toISOString();
  
  // Créer le PDF
  createPDF(sheet, fileName);
}

function createPDF(sheet, fileName) {
  try {
    // Formater les données
    const dataRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
    const data = dataRange.getValues();
    
    // Créer un document Google pour le PDF
    const doc = DocumentApp.create(fileName);
    const body = doc.getBody();
    
    // Titre
    body.appendParagraph('📊 RÉSULTATS DE CORRECTION IA')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    body.appendParagraph(`Généré le : ${new Date().toLocaleString("fr-FR")}`)
      .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    body.appendParagraph('\n');
    
    // Tableau des résultats
    const table = body.appendTable();
    
    // En-têtes
    const headerRow = table.appendTableRow();
    data[0].forEach(cell => {
      headerRow.appendTableCell(cell)
        .setBackgroundColor('#4CAF50')
        .setForegroundColor('white')
        .setBold(true);
    });
    
    // Données
    for (let i = 1; i < data.length; i++) {
      const row = table.appendTableRow();
      data[i].forEach(cell => {
        const cellText = cell?.toString() || '';
        row.appendTableCell(cellText);
      });
    }
    
    // Statistiques
    body.appendParagraph('\n');
    body.appendParagraph('📈 STATISTIQUES')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    
    const notes = data.slice(1).map(row => {
      const noteStr = row[1]?.toString();
      const noteMatch = noteStr?.match(/(\d+(?:\.\d+)?)/);
      return noteMatch ? parseFloat(noteMatch[1]) : null;
    }).filter(n => n !== null);
    
    if (notes.length > 0) {
      const average = notes.reduce((a, b) => a + b, 0) / notes.length;
      const max = Math.max(...notes);
      const min = Math.min(...notes);
      
      body.appendParagraph(`Nombre de copies : ${notes.length}`);
      body.appendParagraph(`Moyenne : ${average.toFixed(2)}/20`);
      body.appendParagraph(`Meilleure note : ${max}/20`);
      body.appendParagraph(`Note la plus basse : ${min}/20`);
    }
    
    // Sauvegarder et convertir en PDF
    doc.saveAndClose();
    
    // Convertir en PDF
    const pdfBlob = DriveApp.getFileById(doc.getId())
      .getAs('application/pdf')
      .setName(fileName + '.pdf');
    
    // Créer un dossier pour les corrections
    const folder = createCorrectionsFolder();
    const pdfFile = folder.createFile(pdfBlob);
    
    // Supprimer le document Google (optionnel)
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    
    // Afficher le lien
    const htmlOutput = HtmlService.createHtmlOutput(`
      <h3>✅ PDF généré avec succès !</h3>
      <p>Fichier : <strong>${fileName}.pdf</strong></p>
      <p><a href="${pdfFile.getUrl()}" target="_blank">📎 Ouvrir dans Drive</a></p>
      <button onclick="google.script.host.close()">Fermer</button>
    `)
    .setWidth(400)
    .setHeight(200);
    
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Export PDF réussi');
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Erreur lors de la création du PDF : ' + error.toString());
  }
}

function createCorrectionsFolder() {
  const folderName = 'Corrections IA';
  const root = DriveApp.getRootFolder();
  const folders = root.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return root.createFolder(folderName);
  }
}

// Fonction rapide pour exporter
function quickExport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RESULTATS");
  if (!sheet) return;
  
  const fileName = `Corrections_${new Date().toISOString().split('T')[0]}`;
  createPDF(sheet, fileName);
}