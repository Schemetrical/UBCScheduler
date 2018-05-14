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

function parseSections(year, session, subject, course, term, completion) {
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
        }
        completion(postprocessSections(sections))
    }

    function parseRow(row, sections) {
        let items = row.children
        let status = $(items[0]).text()
        let section = $(items[1]).text()
        let activity = $(items[2]).text()
        let courseTerm = $(items[3]).text()
        // let interval = $(items[4]).text()
        let days = parseWeekdays($(items[5]).text())
        let beginTime = preprocessTime($(items[6]).text())
        let endTime = preprocessTime($(items[7]).text())
        // let comments = $(items[8]).text()
        if (courseTerm !== term && courseTerm !== "1-2") {
            sections.push({ status: status, section: section, activity: activity, times: [] })
            return // Ignore terms that do not apply but take note
        }
        if (section === "") {
            sections[sections.length - 1].times.push({
                days: days,
                beginTime: beginTime,
                endTime: endTime
            })
            return
        }
        sections.push({
            status: status, section: section, activity: activity, times: [{
                days: days,
                beginTime: beginTime,
                endTime: endTime
            }]
        })
    }

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

    $.ajax({ url: `https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=3&sessyr=${year}&sesscd=${session}&dept=${subject}&course=${course}`, success: parse });
}