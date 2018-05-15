/**
 * A particular section of a course
 * @typedef {Object} Section
 * @property {string} status
 * @property {string} sectionName
 * @property {string} activity
 * @property {Time} times
 * @property {boolean} subactivities
 */

/**
 * Time blocks defined by start and end times in particular days
 * @typedef {Object} Time
 * @property {number} days
 * @property {LocalTime} beginTime
 * @property {LocalTime} endTime
 */

/**
 * Subactivities of a Lecture such as Laboratory or Tutorial. When there is no Lecture,
 * the next available item (Laboratory or Tutorial) is chosen as the main activity and
 * the item after it is the subactivity.
 * @typedef {Object.<string, Section[]>} Subactivities
 */

/**
 * @callback sessionsCallback
 * @param {string[]} sessions
 */

/**
 * @param {sessionsCallback} completion
 */
function parseSessions(completion) {
    function parse(data) {
        var sessions = []

        var pattern = /sessyr=(\d{4})&sesscd=(\w)/g;
        var match = pattern.exec(data)
        while (match !== null) {
            sessions.push(match[1] + match[2])
            match = pattern.exec(data);
        }
        completion(sessions.sort().reverse())
    }
    $.ajax({ url: 'https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main', success: parse });
}

/**
 * @callback sesctionsCallback
 * @param {Section[]} sections
 */

/**
 * 
 * @param {string} campus 
 * @param {string} year 
 * @param {string} session 
 * @param {string} subject 
 * @param {string} course 
 * @param {string} term 
 * @param {sesctionsCallback} completion 
 */
function parseSections(campus, year, session, subject, course, term, completion) {
    function parse(data) {
        var sections = []

        var parser = new DOMParser();
        try {
            var doc = $($.parseHTML(data))
            var rows = doc.find('.section-summary')[0].children[1].children

            for (let row of rows) {
                parseRow(row, sections)
            }
        } catch (err) {
            console.log(err)
        }
        completion(postprocessSections(sections))
    }

    /**
     * @param {*} row 
     * @param {Section[]} sections 
     */
    function parseRow(row, sections) {
        let items = row.children
        let status = $(items[0]).text()
        let sectionName = $(items[1]).text().trim()
        let activity = $(items[2]).text()
        let courseTerm = $(items[3]).text()
        // let interval = $(items[4]).text()
        let days = parseWeekdays($(items[5]).text())
        let beginTime = preprocessTime($(items[6]).text())
        let endTime = preprocessTime($(items[7]).text())
        // let comments = $(items[8]).text()
        if (courseTerm !== term && courseTerm !== "1-2") {
            sections.push({ status: status, sectionName: sectionName, activity: activity, times: [] })
            return // Ignore terms that do not apply but take note
        }
        if (sectionName === "") {
            sections[sections.length - 1].times.push({
                days: days,
                beginTime: beginTime,
                endTime: endTime
            })
            return
        }
        sections.push({
            status: status, sectionName: sectionName, activity: activity, times: [{
                days: days,
                beginTime: beginTime,
                endTime: endTime
            }]
        })
    }

    /**
     * Converts weekday string to mask
     * @param {string} weekdayString 
     * @returns {number}
     */
    function parseWeekdays(weekdayString) {
        let weekdayMask = Weekday.None
        let days = weekdayString.split(" ")
        for (day of days) {
            if (day === "Mon") weekdayMask += Weekday.Monday
            if (day === "Tue") weekdayMask += Weekday.Tuesday
            if (day === "Wed") weekdayMask += Weekday.Wednesday
            if (day === "Thu") weekdayMask += Weekday.Thursday
            if (day === "Fri") weekdayMask += Weekday.Friday
        }
        return weekdayMask
    }

    /**
     * @param {Section[]} sections 
     * @returns {Section[]}
     */
    function postprocessSections(sections) {
        sections = sections.filter(function (section) {
            // filter out all sections with no times or waitlist
            return (section.times.length > 0 &&
                section.activity !== "Waiting List" &&
                section.times[0].days != Weekday.None &&
                section.times[0].beginTime !== "" &&
                section.times[0].endTime !== "")
        })
        if (sections.length <= 0) return
        // take the first item's activity as the main activity, such as "Lecture" or "Laboratory"
        let mainActivity = sections[0].activity
        newSections = []
        for (section of sections) {
            if (section.activity === mainActivity) {
                section.subactivities = {}
                newSections.push(section)
                continue
            }
            var subactivities = newSections[newSections.length - 1].subactivities
            if (!(section.activity in subactivities)) {
                subactivities[section.activity] = []
            }
            subactivities[section.activity].push(section)
        }
        return newSections
    }

    /**
     * @param {string} time 
     * @returns {LocalTime}
     */
    function preprocessTime(time) {
        if (time.length < 4) {
            // invalid time
            return ""
        } else if (time.length == 4) {
            return LocalTime.parse("0" + time)
        } else {
            return LocalTime.parse(time)
        }
    }

    $.ajax({ url: `https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=3&campuscd=${campus}&sessyr=${year}&sesscd=${session}&dept=${subject}&course=${course}`, success: parse });
}