// assignmentPicker.gs

function showAssignmentPicker() {
  const html = HtmlService.createHtmlOutputFromFile('AssignmentPicker')
    .setTitle('Sélection du devoir')
    .setWidth(500);
  
  SpreadsheetApp.getUi().showModalDialog(html, '🎯 Sélectionner un devoir');
}

// assignmentPicker.gs
function listCoursesForPicker() {
  try {
    const courses = Classroom.Courses.list({ teacherId: 'me' }).courses || [];
    
    // Log pour déboguer
    Logger.log("Cours trouvés : " + courses.length);
    courses.forEach(course => {
      Logger.log("- " + course.name + " (ID: " + course.id + ")");
    });
    
    return courses.map(course => ({
      id: course.id,
      name: course.name
    }));
  } catch (error) {
    Logger.log("Erreur listCoursesForPicker: " + error.toString());
    return [];
  }
}

function getCourseWork(courseId) {
  try {
    const courseWork = Classroom.Courses.CourseWork.list(courseId).courseWork || [];
    return courseWork.map(work => ({
      id: work.id,
      title: work.title,
      dueDate: work.dueDate ? formatDate(work.dueDate) : 'Non définie'
    }));
  } catch (error) {
    console.error('Erreur getCourseWork:', error);
    throw error;
  }
}

function formatDate(dueDate) {
  if (!dueDate) return '';
  return `${dueDate.day}/${dueDate.month}/${dueDate.year}`;
}
// assignmentPicker.gs - Ajoutez cette fonction

function getCourseStudents(courseId) {
  try {
    const students = Classroom.Courses.Students.list(courseId).students || [];
    return students.map(student => ({
      id: student.userId,
      name: student.profile.name.fullName,
      email: student.profile.emailAddress
    }));
  } catch (error) {
    console.error("Erreur getCourseStudents:", error);
    return [];
  }
}