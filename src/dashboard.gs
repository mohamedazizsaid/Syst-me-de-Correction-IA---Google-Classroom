// dashboard.gs

function showDashboard() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      .dashboard {
        padding: 20px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        color: white;
      }
      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }
      .card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        border: 1px solid rgba(255,255,255,0.2);
      }
      .card h3 {
        margin-top: 0;
        color: white;
        border-bottom: 2px solid rgba(255,255,255,0.3);
        padding-bottom: 10px;
      }
      .stats {
        font-size: 36px;
        font-weight: bold;
        margin: 10px 0;
      }
      .action-btn {
        display: block;
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
      .progress {
        height: 10px;
        background: rgba(255,255,255,0.2);
        border-radius: 5px;
        margin: 10px 0;
        overflow: hidden;
      }
      .progress-bar {
        height: 100%;
        background: #4CAF50;
        border-radius: 5px;
      }
    </style>
    
    <div class="dashboard">
      <h1>🎯 Tableau de bord - Correction IA</h1>
      <p>Centralisez toutes vos opérations de correction</p>
      
      <div class="cards">
        <div class="card">
          <h3>📚 Correction</h3>
          <p>Corriger les copies avec l'IA</p>
          <button class="action-btn" onclick="startCorrection()">
            ▶️ Lancer la correction
          </button>
          <button class="action-btn" onclick="showPicker()">
            🎯 Choisir un devoir
          </button>
        </div>
        
        <div class="card">
          <h3>📊 Analyse</h3>
          <p>Statistiques et visualisations</p>
          <button class="action-btn" onclick="showStats()">
            📈 Voir les statistiques
          </button>
          <button class="action-btn" onclick="exportPDF()">
            📤 Exporter en PDF
          </button>
        </div>
        
        <div class="card">
          <h3>📧 Communication</h3>
          <p>Notifier les élèves</p>
          <button class="action-btn" onclick="sendEmails()">
            ✉️ Envoyer les feedbacks
          </button>
          <button class="action-btn" onclick="exportEmailList()">
            📋 Liste des emails
          </button>
        </div>
        
        <div class="card">
          <h3>⚙️ Configuration</h3>
          <p>Paramètres et templates</p>
          <button class="action-btn" onclick="manageTemplates()">
            📝 Gérer les templates
          </button>
          <button class="action-btn" onclick="listCourses()">
            📚 Voir les cours
          </button>
        </div>
      </div>
      
      <div class="card">
        <h3>📈 Aperçu rapide</h3>
        <div id="quickStats">
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    </div>
    
    <script>
      function startCorrection() {
        google.script.run.startCorrection();
        google.script.host.close();
      }
      
      function showPicker() {
        google.script.run.showAssignmentPicker();
        google.script.host.close();
      }
      
      function showStats() {
        google.script.run.showStatisticsUI();
        google.script.host.close();
      }
      
      function exportPDF() {
        google.script.run.exportResultsPDF();
      }
      
      function sendEmails() {
        google.script.run.showEmailSender();
        google.script.host.close();
      }
      
      function exportEmailList() {
        google.script.run.exportEmailList();
        google.script.host.close();
      }
      
      function manageTemplates() {
        google.script.run.showTemplateManager();
        google.script.host.close();
      }
      
      function listCourses() {
        google.script.run.listCourses();
        google.script.host.close();
      }
      
      // Charger les stats rapides
      google.script.run.withSuccessHandler(updateQuickStats).getQuickStats();
      
      function updateQuickStats(stats) {
        document.getElementById('quickStats').innerHTML = stats;
      }
    </script>
  `)
  .setWidth(900)
  .setHeight(700)
  .setTitle("Tableau de bord");
  
  SpreadsheetApp.getUi().showModalDialog(html, "Tableau de bord - Correction IA");
}

function getQuickStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RESULTATS");
  
  if (!sheet || sheet.getLastRow() <= 1) {
    return "<p>Aucune donnée disponible. Lancez une correction !</p>";
  }
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  const notes = rows
    .map(row => {
      const match = row[1]?.toString().match(/(\d+(?:[.,]\d+)?)/);
      return match ? parseFloat(match[1].replace(',', '.')) : null;
    })
    .filter(n => n !== null && n >= 0 && n <= 20);
  
  if (notes.length === 0) {
    return "<p>Aucune note valide trouvée</p>";
  }
  
  const average = notes.reduce((a, b) => a + b, 0) / notes.length;
  const passed = notes.filter(n => n >= 10).length;
  const percentage = ((passed / notes.length) * 100).toFixed(1);
  
  return `
    <div class="stats">${notes.length} copies</div>
    <div>Moyenne : <strong>${average.toFixed(2)}/20</strong></div>
    <div>Réussite : <strong>${passed}/${notes.length} (${percentage}%)</strong></div>
    <div class="progress">
      <div class="progress-bar" style="width: ${percentage}%"></div>
    </div>
    <p><small>Dernière mise à jour : ${new Date().toLocaleString('fr-FR')}</small></p>
  `;
}