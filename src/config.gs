// config.gs

var CONFIG = {
  // Remplacez par votre vraie clé API
  DEEPSEEK_API_KEY: "",
  DEEPSEEK_MODEL: "deepseek-chat",
  
  // Paramètres
  DRAFT_MODE: true,
  MAX_FEEDBACK_LENGTH: 1000,
  DELAY_BETWEEN_REQUESTS: 1500, // ms
  
  // Templates disponibles
  TEMPLATES: ['default', 'detailed', 'simple']
};

// Fonction pour vérifier la configuration
function checkConfig() {
  const ui = SpreadsheetApp.getUi();
  const apiKey = CONFIG.DEEPSEEK_API_KEY;
  
  if (!apiKey || apiKey.trim() === "" || apiKey === "sk-votre-cle-api-ici") {
    ui.alert(
      '⚠️ Configuration requise',
      'Veuillez configurer votre clé API DeepSeek dans le fichier config.gs',
      ui.ButtonSet.OK
    );
    return false;
  }
  
  return true;
}