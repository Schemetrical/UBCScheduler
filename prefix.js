var LocalTime = JSJoda.LocalTime;
var Weekday = {
    None: 0,       // 0 *
    Monday: 1 << 0,  // 1
    Tuesday: 1 << 1,  // 2
    Wednesday: 1 << 2,  // 4
    Thursday: 1 << 3,  // 8
    Friday: 1 << 4,  // 16
};
const concat = (x, y) =>
    x.concat(y)

const flatMap = (f, xs) =>
    xs.map(f).reduce(concat, [])

Array.prototype.flatMap = function (f) { // why does this not exist by default idk
    return flatMap(f, this)
}
let defaultOptions = {
    visiblePages: 3,
    first: "⇤",
    last: "⇥",
    prev: "←",
    next: "→",
    startPage: 1,
    onPageClick: function (event, page) {
        loadTimetable(schedules[page - 1])
    }
}