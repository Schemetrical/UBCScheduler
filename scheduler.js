/**
 * A schedule, as a list of sections or list of section fragments
 * @typedef {Section[]|SectionFragment[]} Schedule
 */

/**
 * A part of a section, there can be one or many representing one section depending
 * on the complexity of the time block.
 * @typedef {Object} SectionFragment
 * @property {string} sectionName
 * @property {string} status
 * @property {number} days
 * @property {Time} beginTime
 * @property {Time} endTime
 */

// Generate schedules using **generative recursion**
function scheduleTimetable(courses, callback) {
    let schedules = scheduleListOfCourse(courses)
    schedules = scheduleLabsTuts(schedules)
    callback(schedules.map(convertSchedule))
}

/**
 * @param {Course[]} listOfCourse 
 * @returns {Schedule[]}
 */
function scheduleListOfCourse(listOfCourse) {
    if (listOfCourse.length == 0) {
        return []
    }
    let course = listOfCourse.pop()
    let listOfSchedules = scheduleListOfCourse(listOfCourse) // [[course, course],[],[]]
    return scheduleListOfSchedule(listOfSchedules, course.sections)
}

// [[A, B, C], [D, E, F]], [D1, D2, D3] -> [[A, B, C, D1], [A, B, C, D2], ..., [D, E, F, D2]]
/**
 * @param {Schedule[]} listOfSchedule 
 * @param {Section[]} listOfSection 
 * @returns {Schedule[]}
 */
function scheduleListOfSchedule(listOfSchedule, listOfSection) {
    if (listOfSchedule.length == 0) {
        return listOfSection.map(section => [section]) // [Section] -> [Schedule]
    }
    return listOfSchedule.flatMap(schedule => possibleSchedules(schedule, listOfSection))
}

/**
 * For each schedule, take each section's subactivities and use generative recursion to add to schedule
 * @param {Schedule[]} listOfSchedule 
 * @returns {Schedule[]}
 */
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

/**
 * Find the cross product of both lists
 * @param {Subactivity[]} listOfSubactivity 
 * @param {Schedule[]} listOfSchedule 
 * @returns {Schedule[]}
 */
function scheduleListOfSubactivity(listOfSubactivity, listOfSchedule) {
    if (listOfSubactivity.length == 0 || listOfSchedule.length == 0) {
        return listOfSchedule
    }
    let listOfSection = listOfSubactivity.pop()
    return scheduleListOfSubactivity(listOfSubactivity, scheduleListOfSchedule(listOfSchedule, listOfSection))
}

// [A, B, C], [D1 D2 D3] => [[A, B, C, D1], [A, B, C, D2], ...]
/**
 * Generate list of schedules by adding one of section onto each schedule
 * @param {Schedule} schedule 
 * @param {Section[]} listOfSection 
 * @returns {Schedule[]}
 */
function possibleSchedules(schedule, listOfSection) {
    return listOfSection.filter(function (section) {
        return fitsInSchedule(section, schedule)
    }).map(function (section) {
        return schedule.concat(section)
    })
}

/**
 * Returns whether section fits in schedule
 * @param {Section} sectionA 
 * @param {Schedule} schedule 
 * @returns {boolean}
 */
function fitsInSchedule(sectionA, schedule) {
    for (sectionB of schedule) {
        for (timeB of sectionB.times) {
            for (timeA of sectionA.times) {
                // false if same day and same time
                if (timeA.days & timeB.days &&
                    timeCollides(timeA.beginTime, timeA.endTime, timeB.beginTime, timeB.endTime))
                    return false
            }
        }
    }
    return true
}

/**
 * Returns whether these start and end times collide
 * @param {LocalTime} startA 
 * @param {LocalTime} endA 
 * @param {LocalTime} startB 
 * @param {LocalTime} endB 
 * @returns {boolean}
 */
function timeCollides(startA, endA, startB, endB) {
    return endB.isAfter(startA) && endA.isAfter(startB)
}

/**
 * Converts Schedule to a new format easier for timetabling, final step
 * @param {Schedule} schedule 
 * @returns {Schedule} 
 */
function convertSchedule(schedule) {
    function convertSection(section) {
        return section.times.map(function (time) {
            return {
                sectionName: section.sectionName,
                status: section.status,
                days: time.days,
                beginTime: time.beginTime,
                endTime: time.endTime
            }
        })
    }
    return schedule.flatMap(convertSection)
}