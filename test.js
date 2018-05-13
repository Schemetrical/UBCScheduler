function parseSessions() {
    function parse(data) {
        var sessions = []
        
        var pattern = /sessyr=(\d{4})&sesscd=(\w)/g;
        var match = pattern.exec(data)
        while (match !== null) {
            sessions.push({year: match[1], session: match[2]})
            match = pattern.exec(data);
        }
        console.log(sessions)
    }
    $.ajax({ url: 'https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main', success: parse });
}
parseSessions()
function parseSubjects(year, session) {
    function parse(data) {
        var subjects = []
        
        var pattern = />([A-Z]{4})<\/a>/g;
        var match = pattern.exec(data)
        while (match !== null) {
            subjects.push(match[1])
            match = pattern.exec(data);
        }
        console.log(subjects)
    }
    $.ajax({ url: `https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=0&sessyr=${year}&sesscd=${session}`, success: parse });
}
parseSubjects("2018", "W")
function parseCourses(year, session, subject) {
    function parse(data) {
        var courses = []
        
        var pattern = /course=(.+)"/g;
        var match = pattern.exec(data)
        while (match !== null) {
            courses.push(match[1])
            match = pattern.exec(data);
        }
        console.log(courses)
    }
    $.ajax({ url: `https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=1&sessyr=${year}&sesscd=${session}&dept=${subject}`, success: parse });
}
parseCourses("2018", "W", "CPSC")

function parseSections(year, session, subject, course, term, completion) {
    function parse(data) {
        var sections = []
        
        var parser = new DOMParser();
        var doc = $($.parseHTML(data))
        var rows = doc.find('.section-summary')[0].children[1].children
        
        for (let row of rows) {
            let items = row.children
            let status = $(items[0]).text()
            let section = $(items[1]).text()
            let activity = $(items[2]).text()
            let courseTerm = $(items[3]).text()
            // let interval = $(items[4]).text()
            let days = $(items[5]).text()
            let startTime = $(items[6]).text()
            let endTime = $(items[7]).text()
            // let comments = $(items[8]).text()
            if (courseTerm !== term && courseTerm !== "1-2") {
                sections.push({
                    status: status, 
                    section: section, 
                    activity: activity, 
                    times: []
                })
                continue // Ignore terms that do not apply but take note
            }
            if (section === "") {
                sections[sections.length - 1].times.push({
                    days: days, 
                    startTime: startTime, 
                    endTime: endTime
                })
                continue
            }
            sections.push({
                status: status, 
                section: section, 
                activity: activity, 
                times: [{
                    days: days, 
                    startTime: startTime, 
                    endTime: endTime
                }]
            })
        }
        completion(sections)
    }
    $.ajax({ url: `https://cors-anywhere.herokuapp.com/https://courses.students.ubc.ca/cs/main?pname=subjarea&tname=subjareas&req=3&sessyr=${year}&sesscd=${session}&dept=${subject}&course=${course}`, success: parse });
}
parseSections('2018', 'W', 'CPSC', '121', '1', function(sections) { console.log(sections) }) 