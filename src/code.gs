// code.gs
function startCorrectionFromPicker(courseId, workId, templateType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("RESULTATS") || ss.insertSheet("RESULTATS");
  
  sheet.clear();
  sheet.appendRow(["Élève", "Note/20", "Feedback IA", "Date", "Statut"]);
  
  // Récupérer les soumissions des élèves
  const submissions = getStudentSubmissions(courseId, workId);
  
  if (!submissions || submissions.length === 0) {
    return "❌ Aucune soumission trouvée";
  }
  
  let processed = 0;
  const total = submissions.length;
  
  for (const submission of submissions) {
    try {
      // Récupérer le texte du devoir
      const assignmentText = extractAssignmentText(submission);
      
      // Construire le prompt avec le template
      const prompt = buildPrompt(assignmentText, templateType);
      
      // Appeler l'IA
      const result = callDeepSeek(prompt);
      
      // Extraire la note
      const { note, feedback } = extractNoteAndFeedback(result);
      
      // Ajouter à la feuille
      sheet.appendRow([
        submission.studentName,
        note,
        feedback,
        new Date().toLocaleString("fr-FR"),
        "✅ Terminé"
      ]);
      
      processed++;
      
      // Mettre à jour l'UI (pour la progression)
      if (processed % 2 === 0) {
        updateProgressUI(processed, total);
      }
      
      // Pause pour éviter les limites d'API
      Utilities.sleep(1500);
      
    } catch (error) {
      sheet.appendRow([
        submission.studentName || "Inconnu",
        "ERREUR",
        error.toString(),
        new Date().toLocaleString("fr-FR"),
        "❌ Échec"
      ]);
    }
  }
  
  return `✅ Correction terminée : ${processed}/${total} copies corrigées`;
}

function getStudentSubmissions(courseId, workId) {
  try {
    const results = [];
    let pageToken = null;
    
    do {
      const submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, workId, {
        pageSize: 50,
        pageToken: pageToken
      });
      
      if (submissions.studentSubmissions) {
        for (const submission of submissions.studentSubmissions) {
          if (submission.state === 'TURNED_IN' || submission.state === 'RETURNED') {
            // Récupérer les infos de l'élève
            try {
              const student = Classroom.UserProfiles.get(submission.userId);
              
              results.push({
                submissionId: submission.id,
                studentId: submission.userId,
                studentName: student.name.fullName,
                attachments: submission.assignmentSubmission?.attachments || []
              });
            } catch (e) {
              console.warn(`Erreur récupération profil élève ${submission.userId}:`, e);
              results.push({
                submissionId: submission.id,
                studentId: submission.userId,
                studentName: "Élève Inconnu",
                attachments: submission.assignmentSubmission?.attachments || []
              });
            }
          }
        }
      }
      
      pageToken = submissions.nextPageToken;
    } while (pageToken);
    
    return results;
  } catch (error) {
    console.error('Erreur getStudentSubmissions:', error);
    throw error; // Propager l'erreur pour qu'elle soit visible
  }
}

function extractAssignmentText(submission) {
  let fullText = "";
  
  // Pour chaque pièce jointe
  for (const attachment of submission.attachments) {
    if (attachment.driveFile) {
      const fileId = attachment.driveFile.id;
      const fileType = attachment.driveFile.mimeType;
      
      // Extraire le texte selon le type de fichier
      if (fileType.includes('document')) {
        fullText += extractTextFromDoc(fileId) + "\n\n";
      } else if (fileType.includes('text/plain')) {
        try {
          const file = DriveApp.getFileById(fileId);
          fullText += file.getBlob().getDataAsString() + "\n\n";
        } catch (e) {
          Logger.log(`Erreur lecture fichier texte ${fileId}: ${e.toString()}`);
          fullText += "[Erreur de lecture du fichier texte]\n\n";
        }
      }
      // Ajouter d'autres types de fichiers si besoin
    }
  }
  
  return fullText || "[Aucun contenu texte trouvé]";
}

function updateProgressUI(current, total) {
  // Mettre à jour le toast de notification
  const msg = `Correction en cours : ${current}/${total} copie(s) traitée(s)`;
  SpreadsheetApp.getActiveSpreadsheet().toast(msg, "🤖 Correction IA", -1);
  Logger.log(msg);
}