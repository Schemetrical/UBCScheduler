window.onload = setup
var courses = []
var currBlock = 1
var schedules = []

function setup() {
    $('#coursesTable').on('click', '.delete', function () {
        let text = $(this).parents('tr').children('th').text()
        courses = courses.filter(function (course) {
            return course.courseName !== text
        })
        $(this).parents('tr').remove();
        if (courses.length == 0) {
            lockSectionAndTerm(false)
        }
    });

    $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
        totalPages: 1
    }))
    loadSessions()
    schedule()
    // debugSetup()
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
        $("#inputSessionLabel").text("Session")
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

    // TODO: Need better error handling here
    if (yearSession == null) {
        alert("Please select a session, or wait for it to load if there is none.")
        return
    }

    let courseName = $("#inputCourse").val().toUpperCase()
    let term = $("#inputTerm").val()
    let regex = /([A-Z]{4})\s?(\w+)/
    let match = regex.exec(courseName)

    // TODO: Need error handling here
    if (!match) {
        alert("Please enter a valid course code.")
        return
    }
    let subject = match[1]
    let course = match[2]
    courseName = subject + " " + course
    if (courses.filter(function (item) { return item.courseName === courseName }).length > 0) {
        alert("This course has already been added.")
        return
    }

    let year = yearSession.slice(0, -1) // 2017
    let session = yearSession.substr(-1); // W
    $("#buttonAdd").attr("disabled", true);
    $("#buttonAdd").text("Adding...")
    lockSectionAndTerm(true)
    parseSections(year, session, subject, course, term, function (sections) {
        if (!sections) {
            if (courses.length == 0) {
                lockSectionAndTerm(false)
            }
            alert("Course not found.")
            // TODO: Throw a nicer error here
        } else {
            addCourseToTable(courseName, sections)
        }
        $("#buttonAdd").attr("disabled", false);
        $("#buttonAdd").text("Add Course")
    })
}

function lockSectionAndTerm(locked) {
    $("#inputSession").attr("disabled", locked);
    $("#inputTerm").attr("disabled", locked);
    if (locked) {
        $("#timetableLabel").text(`${$("#inputSession").val() + $("#inputTerm").val()} Timetable`)
    } else {
        $("#timetableLabel").text("Timetable")
    }
}

function addCourseToTable(courseName, sections) {
    courses.push({ courseName: courseName, sections: sections })
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

    // TODO: Need validation here
    if (weekdayMask == Weekday.None) {
        alert("Please select one or more days of the week.")
        return
    }
    if (!beginTime) {
        alert("Please enter a beginning time.")
        return
    }
    if (!endTime) {
        alert("Please enter a ending time.")
        return
    }

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
    if (courses.filter(item => item.courseName === courseName).length > 0) {
        alert("You have already chosen to sleep in.")
        return
    }
    addCourseToTable(courseName, [{
        status: "", section: courseName, activity: "", subactivities:{}, times: [{
            days: Weekday.Monday | Weekday.Tuesday | Weekday.Wednesday | Weekday.Thursday | Weekday.Friday,
            beginTime: LocalTime.parse("08:00"),
            endTime: LocalTime.parse("09:00")
        }]
    }])
}

function schedule() {
    $("#schedule").attr("disabled", true);
    $("#schedule").text("Scheduling...")
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
        if (courses.length != 0) {
            alert("No timetable could be generated with these courses.")
        }
    }
    $("#schedule").attr("disabled", false);
    $("#schedule").text("Schedule")
}