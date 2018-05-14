window.onload = setup
var courses = []
var currBlock = 1
var schedules = []
let defaultOptions = {
    visiblePages: 4,
    first: "⇤",
    last: "⇥",
    prev: "←",
    next: "→",
    startPage: 1,
    onPageClick: function (event, page) {
        loadTimetable(schedules[page - 1])
    }
}

function setup() {
    $('#coursesTable').on('click', '.delete', function () {
        let text = $(this).parents('tr').children('th').text()
        courses = courses.filter(function (course) {
            return course.courseName !== text
        })
        $(this).parents('tr').remove();
    });

    $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
        totalPages: 1
    }))
    loadSessions()
    schedule()
    debugSetup()
}

function debugSetup() {
    // addCourseToTable("CPSC 121", [])
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
            filteredSchedule = schedule.filter(function (item) {
                return (item.days & currWeekday) == currWeekday && time.isBefore(item.endTime) && !item.beginTime.isAfter(time)
            }) // Should result in one course or no course
            if (filteredSchedule.length == 0) {
                row.append($('<td></td>'))
                continue
            }
            let filteredCourse = filteredSchedule[0]
            if (time.equals(filteredCourse.beginTime)) {
                let duration = filteredCourse.beginTime.until(filteredCourse.endTime, JSJoda.ChronoUnit.MINUTES)
                row.append($(`<td rowspan="${duration / 30}" style="background-color:lightgray">${filteredCourse.courseName}<br>${filteredCourse.status}</td>`))
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
    if (courses.filter(function (item) { return item.courseName === courseName }).length > 0) return

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
    courses.push({ courseName: courseName, sections: sections })
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

    addCourseToTable("Block " + currBlock, [{
        status: "", section: "Block " + currBlock, activity: "", subactivities:{}, times: [{
            days: weekdayMask,
            beginTime: LocalTime.parse(beginTime),
            endTime: LocalTime.parse(endTime)
        }]
    }])
    currBlock++
}

function noDeathPls() {
    let courseName = "No 8am"
    if (courses.filter(function (item) { return item.courseName === courseName }).length > 0) return
    addCourseToTable(courseName, [{
        status: "", section: courseName, activity: "", subactivities:{}, times: [{
            days: Weekday.Monday | Weekday.Tuesday | Weekday.Wednesday | Weekday.Thursday | Weekday.Friday,
            beginTime: LocalTime.parse("08:00"),
            endTime: LocalTime.parse("09:00")
        }]
    }])
}

function schedule() {
    schedules = scheduleTimetable(courses.slice(0)) // schedule using a shallow copy
    $('#schedule-pagination').twbsPagination("destroy");
    if (schedules.length) {
        $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
            totalPages: schedules.length
        }))
        loadTimetable(schedules[0])
    } else {
        $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
            totalPages: 1
        }))
        loadTimetable(schedules)
    }
}