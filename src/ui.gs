// ui.gs - Version finale complète
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🤖 Correction IA')
    .addItem('🏠 Tableau de bord', 'showDashboard')
    .addSeparator()
    .addItem('🎯 Sélectionner un devoir', 'showAssignmentPicker')
    .addSeparator()
    .addItem('📊 Analyser les résultats', 'showStatisticsUI')
    .addItem('📧 Envoyer les feedbacks', 'showEmailSender')
    .addSeparator()
    .addItem('📚 Lister les cours', 'listCourses')
    .addItem('📝 Gérer les templates', 'showTemplateManager')
    .addSeparator()
    .addItem('📤 Exporter en PDF', 'exportResultsPDF')
    .addItem('📋 Liste des emails', 'exportEmailList')
    .addSeparator()
    .addItem('⚙️ Tester la connexion API', 'testAPI')
    .addToUi();
}