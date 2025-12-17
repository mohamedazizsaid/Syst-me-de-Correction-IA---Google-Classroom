function listCourses() {
  const courses =
    Classroom.Courses.list({ teacherId: "me" }).courses || [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    ss.getSheetByName("COURS") ||
    ss.insertSheet("COURS");

  sheet.clear();
  sheet.appendRow(["Course ID", "Nom"]);

  courses.forEach(c =>
    sheet.appendRow([c.id, c.name])
  );
}
