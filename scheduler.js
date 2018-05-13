window.onload = setup

function setup() {
    loadSessions()
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