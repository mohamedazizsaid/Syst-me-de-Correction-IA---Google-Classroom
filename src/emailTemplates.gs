// emailTemplates.gs

const EMAIL_TEMPLATES = {
  basic: `Bonjour {ELEVE},

Voici le retour sur votre devoir :

📊 Note : {NOTE}/20

📝 Feedback :
{FEEDBACK}

Pour toute question, n'hésitez pas à me contacter.

Cordialement,
Votre professeur
`,

  detailed: `Bonjour {ELEVE},

J'ai corrigé votre devoir. Voici le détail :

🔍 **RÉSULTAT**
Note obtenue : {NOTE}/20

📖 **ANALYSE DÉTAILLÉE**
{FEEDBACK}

💡 **CONSEILS POUR PROGRESSER**
1. Relisez attentivement les consignes
2. Structurez mieux vos idées
3. Illustrez vos arguments avec des exemples

📅 Date de correction : {DATE}

Je reste à votre disposition pour en discuter.

Bien cordialement,
Votre professeur
`,

  encouraging: `Bonjour {ELEVE},

Bravo pour votre travail ! Voici votre résultat :

🎯 Note : {NOTE}/20

🌟 Points forts relevés :
{FEEDBACK}

Votre progression est visible, continuez ainsi !

Avec mes encouragements,
Votre professeur
`
};

function getEmailTemplate(name) {
  return EMAIL_TEMPLATES[name] || EMAIL_TEMPLATES.basic;
}

function listEmailTemplates() {
  return Object.keys(EMAIL_TEMPLATES);
}