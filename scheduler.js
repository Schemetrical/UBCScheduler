function scheduleTimetable(courses) {
    let schedule = scheduleCourses(courses)
    console.log(schedule)
    return schedule.map(convertSchedule)
    // [[
    //     { courseName: "CPSC 110", days: 21, beginTime: LocalTime.parse("08:00"), endTime: LocalTime.parse("09:00") },
    //     { courseName: "CPSC 121", days: 10, beginTime: LocalTime.parse("09:30"), endTime: LocalTime.parse("11:00") },
    //     { courseName: "CPSC 121", days: 21, beginTime: LocalTime.parse("10:00"), endTime: LocalTime.parse("11:00") }
    // ], [
    //     { courseName: "CPSC 110", days: 21, beginTime: LocalTime.parse("09:00"), endTime: LocalTime.parse("10:00") },
    //     { courseName: "CPSC 110", days: 10, beginTime: LocalTime.parse("13:30"), endTime: LocalTime.parse("15:00") },
    //     { courseName: "CPSC 121", days: 10, beginTime: LocalTime.parse("17:00"), endTime: LocalTime.parse("18:00") }
    // ]]
}

// => list of Schedules (where Schedules = list of courses)
function scheduleCourses(courses) {
    if (courses.length == 0) {
        return []
    }
    let course = courses.pop()
    let listOfSchedules = scheduleCourses(courses) // [[course, course],[],[]]
    return scheduleListOfSchedules(listOfSchedules, course.sections)
}

function scheduleListOfSchedules(listOfSchedules, sections) {
    if (listOfSchedules.length == 0) {
        return sections.map(function (section) {
            return [section]
        })
    }
    return listOfSchedules.flatMap(function (schedule) {
        return possibleSchedules(schedule, sections)
    })
}

// [A, B, C], [D1 D2 D3] => [[A, B, C, D1], [A, B, C, D2], ...]
function possibleSchedules(schedule, sections) {
    return sections.filter(function (section) {
        return fitsInSchedule(section, schedule)
    }).map(function (section) {
        return schedule.concat(section)
    })
}

function fitsInSchedule(section, schedule) {
    for (otherSection of schedule) {
        for (otherTime of otherSection.times) {
            for (time of section.times) {
                // false if same day and same time
                if (time.days & otherTime.days && timeCollides(time.beginTime, time.endTime, otherTime.beginTime, otherTime.endTime)) {
                    return false
                }
            }
        }
    }
    return true
}

function timeCollides(startA, endA, startB, endB) {
    return !(endB.isBefore(startA) || endA.isBefore(startB))
}

function convertSchedule(schedule) {
    function convertSection(section) {
        return section.times.map(function (time) {
            return { courseName: section.section.trim(), days: time.days, beginTime: time.beginTime, endTime: time.endTime }
        })
    }
    return schedule.flatMap(convertSection)
}