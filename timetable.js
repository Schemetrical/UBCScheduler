/** @type {Schedule[]} */
var schedules = []
/** @type {Schedule[]} */
var filteredSchedules = []
/** @type {string[]} */
var lockedSections = []
/** @type {number} */
var currPage = 1

/**
 * Updates the pagination with new selected index and reloads the timetable
 * @param {number} index 
 */
function updatePaginationTimetable(index) {
    $('#schedule-pagination').twbsPagination("destroy");
    if (filteredSchedules.length) {
        $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
            totalPages: filteredSchedules.length,
            startPage: index + 1
        }))
        if (filteredSchedules.length > 1) {
            $("#pageJumper").show()
        } else {
            $("#pageJumper").hide()
        }
        loadTimetable(filteredSchedules[index])
    } else {
        $('#schedule-pagination').twbsPagination($.extend({}, defaultOptions, {
            totalPages: 1,
            startPage: 1
        }))
        $("#pageJumper").hide()
        loadTimetable(filteredSchedules)
        if (courses.length != 0) {
            alert("No timetable could be generated with these courses.")
        }
    }
}

function jumpToPage() {
    let pageInput = $("#inputPage").val()
    let page = 1
    if (pageInput) {
        page = Math.max(Math.min(parseInt(pageInput), filteredSchedules.length), 1)
    }
    currPage = page
    updatePaginationTimetable(page - 1)
}

/**
 * Loads the selected schedule into the graphical timetable
 * @param {Schedule} schedule 
 */
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
        let row = $("<tr></tr>")
        row.append($(`<th scope=\"row\">${time.format(formatter)}</th>`))
        timetable.append(row)
    }

    // Generate each column
    for (let i = 0; i < 5; i++) {
        let currWeekday = 1 << i
        // Generate each cell
        for (let j = 0; j < times.length; j++) {
            let row = timetable.children().eq(j)
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
                cell = $(`<td rowspan="${duration / 30}" id="courseBlock">${filteredCourse.sectionName}<br>${filteredCourse.status}</td>`)
                if (lockedSections.includes(filteredCourse.sectionName)) cell.addClass("course-locked")
                row.append(cell)
            }
        }
    }
}