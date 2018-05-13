window.onload = setup
var LocalTime = JSJoda.LocalTime;
var courses = {}

$('#coursesTable').on('click','.delete',function(){
    $(this).parents('tr').remove();
    delete courses[$(this).parents('tr').children('th').text()]
});

function setup() {
    loadSessions()
    loadEmptyTimetable()
    debugSetup()
}

function debugSetup() {
    addCourseToTable("CPSC 121", [])
}

function loadSessions() {
    parseSessions(function(sessions) {
        var dropdown = $("#inputSession")
        $.each(sessions, function() {
            dropdown.append($("<option />").val(this).text(this));
        });
        dropdown.val(sessions[0]);
    })
}

function loadEmptyTimetable() {
    var timetable = $("#timetable > tbody")
    let endTime = LocalTime.parse('21:00')
    let formatter = JSJoda.DateTimeFormatter.ofPattern('kk:mm')
    for (let i = LocalTime.parse('08:00'); !i.isAfter(endTime); i = i.plusMinutes(30)) {
        row = $("<tr></tr>")
        row.append($(`<th scope=\"row\">${i.format(formatter)}</th>`))
        for (let j = 0; j < 5; j++) {
            row.append($("<td></td>"))
        }
        timetable.append(row)
    }
}

function addCourse() {
    let yearSession = $("#inputSession").val() // 2017W
    let subject = $("#inputSubject").val()
    let course = $("#inputCourse").val()
    let term = $("#inputTerm").val()
    let courseName = subject + " " + course

    // TODO: Need error handling here
    if (course === "" || subject === "" || yearSession == null) return
    if (courseName in courses) return

    let year = yearSession.slice(0, -1) // 2017
    let session = yearSession.substr(-1); // W
    $("#buttonAdd").attr("disabled", true);
    lockSectionAndTerm()
    parseSections(year, session, subject, course, term, function(sections) { 
        $("#buttonAdd").attr("disabled", false);
        addCourseToTable(courseName, sections)
        console.log(sections) 
    })
}

function lockSectionAndTerm() {
    $("#inputSession").attr("disabled", true);
    $("#inputTerm").attr("disabled", true);
}

function addCourseToTable(courseName, sections) {
    courses[courseName] = sections
    var courseTable = $("#coursesTable > tbody")
    row = $("<tr></tr>")
    // TODO: Change this to dropdown allowing locking course sections
    row.append($(`<th scope=\"row\">${courseName}</th>`))
    row.append($("<td><button type=\"submit\" class=\"btn btn-danger btn-sm delete\">Remove</button></td>"))
    courseTable.append(row)
}

function addEmptyBlock() {
    
}