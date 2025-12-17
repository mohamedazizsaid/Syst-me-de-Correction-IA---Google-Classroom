// email.gs

function sendFeedbackEmails() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RESULTATS");
  
  if (!sheet || sheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert("❌ Aucune donnée à envoyer");
    return;
  }
  
  // Récupérer les données
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  // Compter les emails à envoyer
  const emailCount = rows.filter(row => 
    row[0] && row[1] && row[2] && row[1] !== "ERREUR"
  ).length;
  
  if (emailCount === 0) {
    SpreadsheetApp.getUi().alert("❌ Aucun feedback valide à envoyer");
    return;
  }
  
  // Demander confirmation
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Envoi des emails',
    `Vous allez envoyer ${emailCount} email(s) aux élèves. Continuer ?`,
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) return;
  
  // Afficher l'interface de configuration
  showEmailSender();
}

function showEmailSender() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      .container { padding: 20px; font-family: Arial; }
      .config-section { margin: 15px 0; }
      label { display: block; margin: 5px 0; font-weight: bold; }
      input, textarea, select { width: 100%; padding: 8px; margin: 5px 0; }
      textarea { height: 100px; }
      .preview { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
      .button-group { display: flex; gap: 10px; margin-top: 20px; }
      button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
      .primary { background: #4CAF50; color: white; }
      .secondary { background: #f0f0f0; }
      .status { margin-top: 15px; padding: 10px; border-radius: 4px; }
      .success { background: #d4edda; color: #155724; }
      .error { background: #f8d7da; color: #721c24; }
    </style>
    
    <div class="container">
      <h2>📧 Envoyer les feedbacks par email</h2>
      
      <div class="config-section">
        <label>Sujet de l'email :</label>
        <input type="text" id="subject" value="Feedback sur votre devoir" />
      </div>
      
      <div class="config-section">
        <label>Template de l'email :</label>
        <textarea id="template">
Bonjour {ELEVE},

Voici le feedback sur votre devoir :

Note : {NOTE}/20

Feedback :
{FEEDBACK}

Cordialement,
Votre professeur
        </textarea>
        <small>Variables disponibles : {ELEVE}, {NOTE}, {FEEDBACK}, {DATE}</small>
      </div>
      
      <div class="config-section">
        <label>Mode d'envoi :</label>
        <select id="mode">
          <option value="test">Mode test (envoyer à moi-même)</option>
          <option value="real" selected>Envoyer aux élèves</option>
        </select>
      </div>
      
      <div class="config-section">
        <label>Prévisualisation :</label>
        <div id="preview" class="preview">
          Chargement de la prévisualisation...
        </div>
      </div>
      
      <div class="button-group">
        <button class="primary" onclick="sendEmails()">🚀 Envoyer les emails</button>
        <button class="secondary" onclick="testEmail()">✉️ Tester un email</button>
        <button onclick="google.script.host.close()">Annuler</button>
      </div>
      
      <div id="status"></div>
      <div id="progress" style="margin-top: 15px;"></div>
    </div>
    
    <script>
      function updatePreview() {
        const template = document.getElementById('template').value;
        const preview = template
          .replace('{ELEVE}', 'Jean Dupont')
          .replace('{NOTE}', '16')
          .replace('{FEEDBACK}', 'Excellent travail, très bonne analyse.')
          .replace('{DATE}', new Date().toLocaleDateString('fr-FR'));
        
        document.getElementById('preview').innerHTML = 
          '<strong>Prévisualisation :</strong><pre>' + preview + '</pre>';
      }
      
      // Mettre à jour la prévisualisation quand le template change
      document.getElementById('template').addEventListener('input', updatePreview);
      updatePreview();
      
      function sendEmails() {
        const subject = document.getElementById('subject').value;
        const template = document.getElementById('template').value;
        const mode = document.getElementById('mode').value;
        
        if (!subject || !template) {
          alert('Veuillez remplir tous les champs');
          return;
        }
        
        document.getElementById('status').innerHTML = 
          '<div class="status">⏳ Préparation de l\'envoi...</div>';
        document.getElementById('progress').innerHTML = '';
        
        google.script.run
          .withSuccessHandler(handleSuccess)
          .withFailureHandler(handleError)
          .processEmailSending(subject, template, mode);
      }
      
      function testEmail() {
        const subject = document.getElementById('subject').value;
        const template = document.getElementById('template').value;
        
        google.script.run
          .withSuccessHandler(function(result) {
            alert('✅ Email de test envoyé ! Vérifiez votre boîte de réception.');
          })
          .withFailureHandler(handleError)
          .sendTestEmail(subject, template);
      }
      
      function handleSuccess(result) {
        if (result.success) {
          document.getElementById('status').innerHTML = 
            '<div class="status success">✅ ' + result.message + '</div>';
          
          if (result.progress) {
            document.getElementById('progress').innerHTML = result.progress;
          }
        } else {
          document.getElementById('status').innerHTML = 
            '<div class="status error">❌ ' + result.message + '</div>';
        }
      }
      
      function handleError(error) {
        document.getElementById('status').innerHTML = 
          '<div class="status error">❌ Erreur: ' + error + '</div>';
      }
    </script>
  `)
  .setWidth(700)
  .setHeight(800)
  .setTitle("Envoi des feedbacks par email");
  
  SpreadsheetApp.getUi().showModalDialog(html, "Notifications emails");
}

function processEmailSending(subject, template, mode) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("RESULTATS");
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);
    
    const validRows = rows.filter(row => 
      row[0] && row[1] && row[2] && row[1] !== "ERREUR"
    );
    
    let sentCount = 0;
    let errorCount = 0;
    const results = [];
    
    // Mode test : envoyer uniquement à soi-même
    if (mode === 'test') {
      const testResult = sendTestEmail(subject, template);
      return {
        success: true,
        message: `Email de test envoyé avec succès`,
        progress: testResult
      };
    }
    
    // Mode réel : envoyer à chaque élève
    for (let i = 0; i < validRows.length; i++) {
      const [studentName, note, feedback, date] = validRows[i];
      
      try {
        // Récupérer l'email de l'élève via Classroom
        const studentEmail = getStudentEmail(studentName);
        
        if (!studentEmail) {
          results.push(`❌ ${studentName}: Email non trouvé`);
          errorCount++;
          continue;
        }
        
        // Construire le contenu de l'email
        const emailBody = template
          .replace(/{ELEVE}/g, studentName)
          .replace(/{NOTE}/g, note)
          .replace(/{FEEDBACK}/g, feedback)
          .replace(/{DATE}/g, date || new Date().toLocaleDateString('fr-FR'));
        
        // Envoyer l'email
        GmailApp.sendEmail(studentEmail, subject, emailBody, {
          name: "Assistant de correction IA"
        });
        
        results.push(`✅ ${studentName}: Email envoyé`);
        sentCount++;
        
        // Mettre à jour le statut dans la feuille
        markAsSent(sheet, i + 2);
        
      } catch (emailError) {
        results.push(`❌ ${studentName}: ${emailError.toString()}`);
        errorCount++;
      }
      
      // Pause pour éviter les limites d'envoi
      if (i % 5 === 0 && i > 0) {
        Utilities.sleep(1000);
      }
    }
    
    return {
      success: true,
      message: `Envoi terminé : ${sentCount} envoyés, ${errorCount} erreurs`,
      progress: results.join('<br>')
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Erreur lors de l'envoi : ${error.toString()}`
    };
  }
}

function getStudentEmail(studentName) {
  try {
    // Essayer de trouver l'élève dans Classroom
    // Note : Cette fonction nécessite que vous ayez accès aux élèves dans Classroom
    
    // Pour l'instant, on retourne un email fictif
    // Vous pouvez adapter cette fonction selon vos besoins
    return `${studentName.toLowerCase().replace(/\s+/g, '.')}@ecole.fr`;
    
  } catch (error) {
    console.error("Erreur getStudentEmail:", error);
    return null;
  }
}

function markAsSent(sheet, row) {
  // Ajouter une colonne "Email envoyé" si elle n'existe pas
  const lastCol = sheet.getLastColumn();
  if (lastCol < 5) {
    sheet.getRange(1, lastCol + 1).setValue("Email envoyé");
  }
  
  const emailCol = Math.max(lastCol + 1, 6);
  sheet.getRange(row, emailCol).setValue("✅ " + new Date().toLocaleString('fr-FR'));
}

function sendTestEmail(subject, template) {
  try {
    const testEmail = Session.getActiveUser().getEmail();
    
    const emailBody = template
      .replace(/{ELEVE}/g, "Élève de test")
      .replace(/{NOTE}/g, "16.5")
      .replace(/{FEEDBACK}/g, "Ceci est un email de test. Excellent travail sur la structure.")
      .replace(/{DATE}/g, new Date().toLocaleDateString('fr-FR'));
    
    GmailApp.sendEmail(testEmail, "[TEST] " + subject, emailBody, {
      name: "Assistant de correction IA (Test)"
    });
    
    return "Email de test envoyé à : " + testEmail;
    
  } catch (error) {
    throw new Error("Erreur lors de l'envoi test : " + error.toString());
  }
}

// Fonction pour récupérer tous les emails des élèves d'un cours
function getClassroomStudentEmails(courseId) {
  try {
    const students = Classroom.Courses.Students.list(courseId).students || [];
    const studentEmails = {};
    
    students.forEach(student => {
      const profile = student.profile;
      studentEmails[profile.name.fullName] = profile.emailAddress;
    });
    
    return studentEmails;
    
  } catch (error) {
    console.error("Erreur getClassroomStudentEmails:", error);
    return {};
  }
}

// Fonction pour exporter la liste des emails
function exportEmailList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RESULTATS") || ss.getActiveSheet();
  
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);
  
  const emailList = rows.map(row => {
    const studentName = row[0];
    return {
      name: studentName,
      email: getStudentEmail(studentName) || "Non trouvé"
    };
  });
  
  // Créer une nouvelle feuille pour les emails
  const emailSheet = ss.getSheetByName("EMAILS") || ss.insertSheet("EMAILS");
  emailSheet.clear();
  emailSheet.appendRow(["Nom", "Email", "Statut"]);
  
  emailList.forEach(item => {
    emailSheet.appendRow([item.name, item.email, item.email !== "Non trouvé" ? "✅" : "❌"]);
  });
  
  SpreadsheetApp.getUi().alert(`Liste des emails exportée (${emailList.length} entrées)`);
  ss.setActiveSheet(emailSheet);
}