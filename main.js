window.onload = setup
var courses = {}
var currBlock = 1
var schedules = []

$('#coursesTable').on('click', '.delete', function () {
    $(this).parents('tr').remove();
    delete courses[$(this).parents('tr').children('th').text()]
});

function setup() {
    loadSessions()
    schedule()
    debugSetup()
}

function debugSetup() {
    addCourseToTable("CPSC 121", [])
}

function loadSessions() {
    parseSessions(function (sessions) {
        var dropdown = $("#inputSession")
        $.each(sessions, function () {
            dropdown.append($("<option />").val(this).text(this));
        });
        dropdown.val(sessions[0]);
    })
}

function loadTimetable(schedule) {
    var timetable = $("#timetable > tbody")
    timetable.empty()

    // Generate times
    let endTime = LocalTime.parse('21:00')
    let times = []
    for (let i = LocalTime.parse('08:00'); !i.isAfter(endTime); i = i.plusMinutes(30)) {
        times.push(i)
    }

    // Generate row headers
    let formatter = JSJoda.DateTimeFormatter.ofPattern('kk:mm')
    for (time of times) {
        row = $("<tr></tr>")
        row.append($(`<th scope=\"row\">${time.format(formatter)}</th>`))
        timetable.append(row)
    }

    // Generate each column
    for (let i = 0; i < 5; i++) {
        let currWeekday = 1 << i
        // Generate each cell
        for (let j = 0; j < times.length; j++) {
            row = timetable.children().eq(j)
            time = times[j]
            filteredSchedule = schedule.filter(function(item) { 
                return (item.days & currWeekday) == currWeekday && time.isBefore(item.endTime) && !item.beginTime.isAfter(time)
            }) // Should result in one course or no course
            if (filteredSchedule.length == 0) {
                row.append($('<td></td>'))
                continue
            }
            let filteredCourse = filteredSchedule[0]
            if (time.equals(filteredCourse.beginTime)) {
                let duration = filteredCourse.beginTime.until(filteredCourse.endTime, JSJoda.ChronoUnit.MINUTES)
                row.append($(`<td rowspan="${duration / 30}" style="background-color:lightgray">${filteredCourse.courseName}</td>`))
            }
        }
    }
}

function addCourse() {
    let yearSession = $("#inputSession").val() // 2017W
    let subject = $("#inputSubject").val()
    let course = $("#inputCourse").val()
    let term = $("#inputTerm").val()
    let courseName = subject + " " + course

    // TODO: Need error handling here
    if (!course || !subject || yearSession == null) return
    if (courseName in courses) return

    let year = yearSession.slice(0, -1) // 2017
    let session = yearSession.substr(-1); // W
    $("#buttonAdd").attr("disabled", true);
    lockSectionAndTerm()
    parseSections(year, session, subject, course, term, function (sections) {
        $("#buttonAdd").attr("disabled", false);
        addCourseToTable(courseName, sections)
    })
}

function lockSectionAndTerm() {
    $("#inputSession").attr("disabled", true);
    $("#inputTerm").attr("disabled", true);
}

function addCourseToTable(courseName, sections) {
    courses[courseName] = sections
    console.log(courses)
    var courseTable = $("#coursesTable > tbody")
    row = $("<tr></tr>")
    // TODO: Change this to dropdown allowing locking course sections
    row.append($(`<th scope=\"row\">${courseName}</th>`))
    row.append($("<td><button type=\"submit\" class=\"btn btn-danger btn-sm delete\">Remove</button></td>"))
    courseTable.append(row)
}

function addEmptyBlock() {
    var weekdayMask = Weekday.None
    // This can be improved with a mask for example
    let mon = $("#weekdayM").attr("aria-pressed") === "true"
    let tue = $("#weekdayT").attr("aria-pressed") === "true"
    let wed = $("#weekdayW").attr("aria-pressed") === "true"
    let thu = $("#weekdayH").attr("aria-pressed") === "true"
    let fri = $("#weekdayF").attr("aria-pressed") === "true"
    let beginTime = $("#inputBeginTime").val()
    let endTime = $("#inputEndTime").val()
    if (mon) weekdayMask += Weekday.Monday
    if (tue) weekdayMask += Weekday.Tuesday
    if (wed) weekdayMask += Weekday.Wednesday
    if (thu) weekdayMask += Weekday.Thursday
    if (fri) weekdayMask += Weekday.Friday

    // TODO: Need error handling here
    if (!beginTime || !endTime || weekdayMask == Weekday.None) return

    console.log(beginTime)
    addCourseToTable("Block " + currBlock++, [{
        status: "", section: "", activity: "", times: [{
            days: weekdayMask,
            beginTime: beginTime,
            endTime: endTime
        }]
    }])
}

function schedule() {
    schedules = scheduleTimetable(courses)
    loadTimetable(schedules[1])
}