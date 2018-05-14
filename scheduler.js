function scheduleTimetable(courses, callback) {
    let schedules = scheduleCourses(courses)
    schedules = scheduleLabsTuts(schedules)
    callback(schedules.map(convertSchedule))
}

// => list of Schedules (where Schedules = list of sections)
function scheduleCourses(courses) {
    if (courses.length == 0) {
        return []
    }
    let course = courses.pop()
    let listOfSchedules = scheduleCourses(courses) // [[course, course],[],[]]
    return scheduleListOfSchedules(listOfSchedules, course.sections)
}

// [[A, B, C], [D, E, F]], [D1, D2, D3] => [[A, B, C, D1], [A, B, C, D2], ..., [D, E, F, D2]]
function scheduleListOfSchedules(listOfSchedules, sections) {
    if (listOfSchedules.length == 0) {
        // => [[D1], [D2], [D3]]
        return sections.map(section => [section])
    }
    return listOfSchedules.flatMap(schedule => possibleSchedules(schedule, sections))
}

function scheduleLabsTuts(schedules) {
    // for each schedule
    // generate a fuck ton of subschedules
    // then keep going until there are none left
    return schedules.flatMap(function (schedule) {
        listOfSections = schedule.flatMap(function (section) {
            return Object.values(section.subactivities)
        })

        return scheduleListOfSections(listOfSections, [schedule])
    })
}

// => [Schedule]
function scheduleListOfSections(listOfSections, listOfSchedules) {
    if (listOfSections.length == 0) {
        return listOfSchedules
    }
    let sections = listOfSections.pop()
    return scheduleListOfSections(listOfSections, scheduleListOfSchedules(listOfSchedules, sections))
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
    return endB.isAfter(startA) && endA.isAfter(startB)
}

function convertSchedule(schedule) {
    function convertSection(section) {
        return section.times.map(function (time) {
            return { 
                courseName: section.section.trim(), 
                status: section.status, 
                days: time.days, beginTime: 
                time.beginTime, 
                endTime: time.endTime 
            }
        })
    }
    return schedule.flatMap(convertSection)
}