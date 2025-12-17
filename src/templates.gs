// templates.gs

const TEMPLATES = {
  default: `
Tu es un professeur correcteur.
Corrige ce devoir sur 20 points et donne un feedback constructif.

Devoir de l'élève :
{{DEVOIR}}

Format de réponse requis :
Note : [note]/20
Points forts : [liste]
Points à améliorer : [liste]
Commentaire général : [texte]
`,

  detailed: `
Tu es un professeur exigeant mais bienveillant.
Corrige minutieusement ce devoir sur 20 points.

Devoir :
{{DEVOIR}}

Fournis une analyse détaillée avec :
1. Note sur 20
2. Respect des consignes (/5)
3. Qualité du contenu (/10)
4. Forme et présentation (/5)
5. Points forts (au moins 2)
6. Points à améliorer (au moins 2)
7. Conseils pour progresser
`,

  simple: `
Corrige ce devoir sur 20.

Devoir :
{{DEVOIR}}

Réponds simplement avec :
Note : X/20
Commentaire : [court feedback]
`
};

function buildPrompt(assignmentText, templateType = 'default') {
  const template = TEMPLATES[templateType] || TEMPLATES.default;
  return template.replace('{{DEVOIR}}', assignmentText);
}

function extractNoteAndFeedback(response) {
  let note = "N/A";
  let feedback = response;
  
  // Chercher la note dans différents formats
  const patterns = [
    /Note\s*:\s*(\d+(?:\.\d+)?)\/20/i,
    /(\d+(?:\.\d+)?)\/20/i,
    /note\s+(\d+(?:\.\d+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      note = match[1];
      break;
    }
  }
  
  // Limiter la longueur du feedback
  if (feedback.length > 1000) {
    feedback = feedback.substring(0, 1000) + "...";
  }
  
  return { note, feedback };
}

// Fonction pour gérer les templates personnalisés
function getTemplateManagerHtml() {
  const html = HtmlService.createHtmlOutput(`
    <h2>📝 Gestion des templates</h2>
    <p>Bientôt disponible : interface de création de templates personnalisés</p>
    <button onclick="google.script.host.close()">Fermer</button>
  `).setWidth(400).setHeight(200);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Gestion des templates');
}

function showTemplateManager() {
  getTemplateManagerHtml();
}