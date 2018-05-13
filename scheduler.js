window.onload = setup

function setup() {
    loadSessions()
    loadEmptyTimetable()
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
    for (let i = 1000; i <= 2100; i += 30) {
        row = $("<tr></tr>")
        row.append($(`<th scope=\"row\">${i}</th>`))
        for (let j = 0; j < 5; j++) {
            row.append($("<td></td>"))
        }
        timetable.append(row)
    }
}

function addCourse() {
    let yearSession = $("#inputSession").val()
    let year = yearSession.slice(0, -1)
    let session = yearSession.substr(-1);
    let subject = $("#inputSubject").val()
    let course = $("#inputCourse").val()
    let term = $("#inputTerm").val()
    if (course == "" || subject == "") {
        return
    }
    parseSections(year, session, subject, course, term, function(sections) { console.log(sections) })
}