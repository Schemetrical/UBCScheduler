// Time is {days, beginTime, endTime}
// Course is {courseName, sections}
// Section is {sectionName, times:[Time], subactivities:[Subactivity]}
// Schedule is [Section]
// Subactivity is [Section]

// Generate schedules using **generative recursion**
function scheduleTimetable(courses, callback) {
    let schedules = scheduleListOfCourse(courses)
    schedules = scheduleLabsTuts(schedules)
    callback(schedules.map(convertSchedule))
}

// [Course] -> [Schedule]
function scheduleListOfCourse(listOfCourse) {
    if (listOfCourse.length == 0) {
        return []
    }
    let course = listOfCourse.pop()
    let listOfSchedules = scheduleListOfCourse(listOfCourse) // [[course, course],[],[]]
    return scheduleListOfSchedule(listOfSchedules, course.sections)
}

// [Schedule], [Section] -> [Schedule]
// [[A, B, C], [D, E, F]], [D1, D2, D3] -> [[A, B, C, D1], [A, B, C, D2], ..., [D, E, F, D2]]
function scheduleListOfSchedule(listOfSchedule, listOfSection) {
    if (listOfSchedule.length == 0) {
        return listOfSection.map(section => [section]) // [Section] -> [Schedule]
    }
    return listOfSchedule.flatMap(schedule => possibleSchedules(schedule, listOfSection))
}

// [Schedule] -> [Schedule]
function scheduleLabsTuts(listOfSchedule) {
    // for each schedule
    // generate a fuck ton of subschedules
    // then keep going until there are none left
    return listOfSchedule.flatMap(function (schedule) {
        listOfSubactivity = schedule.flatMap(function (section) {
            return Object.values(section.subactivities)
        })

        return scheduleListOfSubactivity(listOfSubactivity, [schedule])
    })
}

// [Subactivity] [Schedule] -> [Schedule]
function scheduleListOfSubactivity(listOfSubactivity, listOfSchedule) {
    if (listOfSubactivity.length == 0) {
        return listOfSchedule
    }
    let listOfSection = listOfSubactivity.pop()
    return scheduleListOfSubactivity(listOfSubactivity, scheduleListOfSchedule(listOfSchedule, listOfSection))
}

// Schedule, [Section] -> [Schedule]
// [A, B, C], [D1 D2 D3] => [[A, B, C, D1], [A, B, C, D2], ...]
function possibleSchedules(schedule, listOfSection) {
    return listOfSection.filter(function (section) {
        return fitsInSchedule(section, schedule)
    }).map(function (section) {
        return schedule.concat(section)
    })
}

// Section, Schedule -> Boolean
function fitsInSchedule(sectionA, schedule) {
    for (sectionB of schedule) {
        for (timeB of sectionB.times) {
            for (timeA of sectionA.times) {
                // false if same day and same time
                return !(timeA.days & timeB.days &&
                    timeCollides(timeA.beginTime, timeA.endTime, timeB.beginTime, timeB.endTime))
            }
        }
    }
    return true
}

// LocalTime, LocalTime, LocalTime, LocalTime -> Boolean
function timeCollides(startA, endA, startB, endB) {
    return endB.isAfter(startA) && endA.isAfter(startB)
}

// Schedule -> Schedule
// Converts Schedule to a new format easier for timetabling, final step
function convertSchedule(schedule) {
    function convertSection(section) {
        return section.times.map(function (time) {
            return {
                courseName: section.section.trim(),
                status: section.status,
                days: time.days,
                beginTime: time.beginTime,
                endTime: time.endTime
            }
        })
    }
    return schedule.flatMap(convertSection)
}