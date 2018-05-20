/** @type {Course[]} */
var courses = []

/**
 * @typedef {Object} Course
 * @property {string} courseName
 * @property {Section[]} sections
 */

/**
 * @param {string} courseName
 * @param {Section[]} sections
 */
function addCourseToTable(courseName, sections) {
    courses.push({ courseName: courseName, sections: sections })
    var courseTable = $("#coursesTable > tbody")
    let row = $("<tr></tr>")
    // TODO: Change this to dropdown allowing locking course sections
    row.append($(`<th scope=\"row\">${courseName}</th>`))
    row.append($("<td align='right'><button class='btn btn-danger btn-sm delete'>Remove</button></td>"))
    courseTable.append(row)
}

function removeCourse() {
    let text = $(this).parents('tr').children('th').text()
    courses = courses.filter(function (course) {
        return course.courseName !== text
    })
    $(this).parents('tr').remove();
    if (courses.length == 0 && $("#buttonAdd").text() === "Add Course") { // not in progress of adding course
        lockSectionAndTerm(false)
    }
}

function removeAll() {
    $("#coursesTable > tbody").empty();
    courses = []
    lockSectionAndTerm(false)
}