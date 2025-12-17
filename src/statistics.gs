// statistics.gs

function generateStatistics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const resultsSheet = ss.getSheetByName("RESULTATS");
  const statsSheet = ss.getSheetByName("STATISTIQUES") || ss.insertSheet("STATISTIQUES");
  
  statsSheet.clear();
  statsSheet.setName("STATISTIQUES");
  
  if (!resultsSheet || resultsSheet.getLastRow() <= 1) {
    statsSheet.getRange(1, 1).setValue("❌ Aucune donnée disponible");
    return;
  }
  
  // Données brutes
  const data = resultsSheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1);
  
  // Extraire les notes
  const notes = rows.map(row => {
    const noteStr = row[1]?.toString(); // Colonne B = Note/20
    if (!noteStr) return null;
    
    // Chercher un nombre décimal ou entier
    const match = noteStr.match(/(\d+(?:[.,]\d+)?)/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return null;
  }).filter(note => note !== null && note >= 0 && note <= 20);
  
  if (notes.length === 0) {
    statsSheet.getRange(1, 1).setValue("❌ Aucune note valide trouvée");
    return;
  }
  
  // Calculer les statistiques
  const stats = calculateStatistics(notes);
  
  // Créer le tableau de bord
  createDashboard(statsSheet, stats, notes);
  
  // Créer un graphique
  createCharts(statsSheet, notes);
  
  // Formater la feuille
  formatStatisticsSheet(statsSheet);
  
  SpreadsheetApp.getUi().alert("✅ Statistiques générées !");
}

function calculateStatistics(notes) {
  const sorted = [...notes].sort((a, b) => a - b);
  
  return {
    count: notes.length,
    average: notes.reduce((a, b) => a + b, 0) / notes.length,
    median: calculateMedian(sorted),
    min: Math.min(...notes),
    max: Math.max(...notes),
    standardDeviation: calculateStandardDeviation(notes),
    q1: calculateQuartile(sorted, 0.25),
    q3: calculateQuartile(sorted, 0.75),
    passed: notes.filter(n => n >= 10).length,
    failed: notes.filter(n => n < 10).length,
    distribution: calculateDistribution(notes)
  };
}

function calculateMedian(sortedNotes) {
  const mid = Math.floor(sortedNotes.length / 2);
  return sortedNotes.length % 2 === 0
    ? (sortedNotes[mid - 1] + sortedNotes[mid]) / 2
    : sortedNotes[mid];
}

function calculateStandardDeviation(notes) {
  const avg = notes.reduce((a, b) => a + b, 0) / notes.length;
  const squareDiffs = notes.map(note => Math.pow(note - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

function calculateQuartile(sortedNotes, percentile) {
  const pos = (sortedNotes.length - 1) * percentile;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sortedNotes[base + 1] !== undefined) {
    return sortedNotes[base] + rest * (sortedNotes[base + 1] - sortedNotes[base]);
  } else {
    return sortedNotes[base];
  }
}

function calculateDistribution(notes) {
  const distribution = {};
  for (let i = 0; i <= 20; i += 2) {
    const range = `${i}-${i + 2}`;
    distribution[range] = notes.filter(n => n >= i && n < i + 2).length;
  }
  return distribution;
}

function createDashboard(sheet, stats, notes) {
  let row = 1;
  
  // Titre
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("📊 TABLEAU DE BORD DES NOTES")
    .setFontSize(16)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");
  row += 2;
  
  // Statistiques principales
  const mainStats = [
    ["Nombre de copies", stats.count],
    ["Moyenne générale", `${stats.average.toFixed(2)}/20`],
    ["Médiane", `${stats.median.toFixed(2)}/20`],
    ["Note minimale", `${stats.min.toFixed(1)}/20`],
    ["Note maximale", `${stats.max.toFixed(1)}/20`],
    ["Écart-type", stats.standardDeviation.toFixed(2)],
    ["Réussite (≥10)", `${stats.passed} (${((stats.passed/stats.count)*100).toFixed(1)}%)`],
    ["Échec (<10)", `${stats.failed} (${((stats.failed/stats.count)*100).toFixed(1)}%)`],
    ["1er quartile (Q1)", `${stats.q1.toFixed(2)}/20`],
    ["3ème quartile (Q3)", `${stats.q3.toFixed(2)}/20`],
    ["Étendue", `${(stats.max - stats.min).toFixed(2)} points`]
  ];
  
  mainStats.forEach(([label, value], index) => {
    sheet.getRange(row + index, 1).setValue(label);
    sheet.getRange(row + index, 2).setValue(value);
  });
  
  // Distribution des notes (tableau)
  row += mainStats.length + 2;
  sheet.getRange(row, 1).setValue("📈 DISTRIBUTION DES NOTES");
  sheet.getRange(row, 1, 1, 3).merge().setFontWeight("bold");
  row++;
  
  sheet.getRange(row, 1).setValue("Intervalle");
  sheet.getRange(row, 2).setValue("Nombre");
  sheet.getRange(row, 3).setValue("Pourcentage");
  
  Object.entries(stats.distribution).forEach(([range, count], index) => {
    sheet.getRange(row + 1 + index, 1).setValue(range);
    sheet.getRange(row + 1 + index, 2).setValue(count);
    sheet.getRange(row + 1 + index, 3)
      .setValue(`${((count/stats.count)*100).toFixed(1)}%`);
  });
  
  // Histogramme manuel
  const histRow = row;
  const histCol = 5;
  
  sheet.getRange(histRow, histCol).setValue("📊 HISTOGRAMME VISUEL");
  sheet.getRange(histRow, histCol, 1, 3).merge().setFontWeight("bold");
  
  Object.entries(stats.distribution).forEach(([range, count], index) => {
    const bar = "█".repeat(Math.ceil(count / stats.count * 20));
    sheet.getRange(histRow + 2 + index, histCol).setValue(range);
    sheet.getRange(histRow + 2 + index, histCol + 1).setValue(bar);
    sheet.getRange(histRow + 2 + index, histCol + 2).setValue(count);
  });
}

function createCharts(sheet, notes) {
  // Créer un graphique à barres pour la distribution
  const chartRow = sheet.getLastRow() + 3;
  const dataRange = sheet.getRange(chartRow - 10, 1, 11, 3);
  
  const chart = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dataRange)
    .setPosition(chartRow, 1, 0, 0)
    .setOption('title', 'Distribution des notes')
    .setOption('hAxis', { title: 'Intervalle de notes' })
    .setOption('vAxis', { title: 'Nombre d\'élèves' })
    .setOption('width', 600)
    .setOption('height', 400)
    .setOption('colors', ['#4CAF50'])
    .build();
  
  sheet.insertChart(chart);
}

function formatStatisticsSheet(sheet) {
  // Ajuster les colonnes
  sheet.autoResizeColumns(1, 10);
  
  // Appliquer des styles
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // En-têtes
  const headers = sheet.getRange(1, 1, lastRow, lastCol);
  headers.setFontFamily("Arial");
  
  // Alternance de couleurs pour les lignes
  for (let i = 1; i <= lastRow; i++) {
    if (i % 2 === 0) {
      sheet.getRange(i, 1, 1, lastCol).setBackground("#f9f9f9");
    }
  }
  
  // Bordures
  const dataRange = sheet.getRange(1, 1, lastRow, lastCol);
  dataRange.setBorder(true, true, true, true, true, true);
  
  // Congeler la première ligne
  sheet.setFrozenRows(1);
}

function showStatisticsUI() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      .container { padding: 20px; font-family: Arial; }
      .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
      .stat-card { background: white; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .stat-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
      .stat-label { font-size: 12px; color: #666; }
      button { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
      button:hover { background: #45a049; }
    </style>
    
    <div class="container">
      <h2>📊 Analyse statistique</h2>
      <p>Générez un rapport détaillé des résultats</p>
      
      <div style="margin: 20px 0;">
        <button onclick="generateStats()">📈 Générer les statistiques</button>
        <button onclick="viewInSheets()">📋 Voir dans la feuille</button>
        <button onclick="google.script.host.close()">Fermer</button>
      </div>
      
      <div id="statsPreview" class="stats-grid">
        <!-- Prévisualisation des stats -->
      </div>
      
      <div id="status" style="margin-top: 20px;"></div>
    </div>
    
    <script>
      function generateStats() {
        document.getElementById('status').innerHTML = '<p>⏳ Génération en cours...</p>';
        
        google.script.run
          .withSuccessHandler(function(result) {
            document.getElementById('status').innerHTML = 
              '<p style="color: green;">✅ ' + result + '</p>';
          })
          .withFailureHandler(function(error) {
            document.getElementById('status').innerHTML = 
              '<p style="color: red;">❌ Erreur: ' + error + '</p>';
          })
          .generateStatistics();
      }
      
      function viewInSheets() {
        google.script.run.openStatisticsSheet();
        google.script.host.close();
      }
    </script>
  `)
  .setWidth(600)
  .setHeight(500)
  .setTitle("Analyse statistique");
  
  SpreadsheetApp.getUi().showModalDialog(html, "Statistiques avancées");
}

function openStatisticsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("STATISTIQUES");
  
  if (sheet) {
    ss.setActiveSheet(sheet);
  } else {
    SpreadsheetApp.getUi().alert("Veuillez d'abord générer les statistiques");
  }
}