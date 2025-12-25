function listCourses() {
  let courses = [];
  let pageToken = null;
  
  do {
    const response = Classroom.Courses.list({
      teacherId: "me",
      pageSize: 20,
      pageToken: pageToken
    });
    
    if (response.courses) {
      courses = courses.concat(response.courses);
    }
    
    pageToken = response.nextPageToken;
  } while (pageToken);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    ss.getSheetByName("COURS") ||
    ss.insertSheet("COURS");

  sheet.clear();
  sheet.appendRow(["Course ID", "Nom"]);

  if (courses.length > 0) {
    courses.forEach(c =>
      sheet.appendRow([c.id, c.name])
    );
  } else {
    sheet.appendRow(["Aucun cours trouvé", ""]);
  }
}
