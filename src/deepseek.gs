// deepseek.gs - Version améliorée

function callDeepSeek(prompt) {
  // Vérifier la configuration
  if (!checkConfig()) {
    return "❌ API non configurée. Vérifiez config.gs";
  }
  
  // Mode brouillon pour les tests
  if (CONFIG.DRAFT_MODE) {
    Logger.log("Mode brouillon - Prompt : " + prompt.substring(0, 200));
    return simulateAIResponse();
  }
  
  const url = "https://api.deepseek.com/chat/completions";
  
  const payload = {
    model: CONFIG.DEEPSEEK_MODEL,
    messages: [
      { 
        role: "system", 
        content: "Tu es un professeur correcteur. Réponds toujours en français." 
      },
      { role: "user", content: prompt }
    ],
    max_tokens: 2000,
    temperature: 0.7
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + CONFIG.DEEPSEEK_API_KEY
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    timeout: 30000
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const text = response.getContentText();
    
    const data = JSON.parse(text);
    
    if (data.error) {
      Logger.log("Erreur API: " + JSON.stringify(data.error));
      return "❌ Erreur API: " + (data.error.message || "Inconnue");
    }
    
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim();
    }
    
    return "❌ Réponse vide de l'IA";
    
  } catch (error) {
    Logger.log("Erreur réseau: " + error.toString());
    return "❌ Erreur de connexion: " + error.toString();
  }
}

function simulateAIResponse() {
  const notes = ["15", "16", "17", "18", "14", "19"];
  const note = notes[Math.floor(Math.random() * notes.length)];
  
  return `Note : ${note}/20

Points forts :
- Bonne compréhension du sujet
- Structure claire

Points à améliorer :
- Développer davantage les exemples
- Soigner l'orthographe

Commentaire général : Bon travail, continuez ainsi !`;
}