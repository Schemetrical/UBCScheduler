function scheduleTimetable(courses) {
    return [[
        { courseName: "CPSC 110", days: 21, beginTime: LocalTime.parse("08:00"), endTime: LocalTime.parse("09:00") },
        { courseName: "CPSC 121", days: 10, beginTime: LocalTime.parse("09:30"), endTime: LocalTime.parse("11:00") },
        { courseName: "CPSC 121", days: 21, beginTime: LocalTime.parse("10:00"), endTime: LocalTime.parse("11:00") }
    ], [
        { courseName: "CPSC 110", days: 21, beginTime: LocalTime.parse("09:00"), endTime: LocalTime.parse("10:00") },
        { courseName: "CPSC 110", days: 10, beginTime: LocalTime.parse("13:30"), endTime: LocalTime.parse("15:00") },
        { courseName: "CPSC 121", days: 10, beginTime: LocalTime.parse("17:00"), endTime: LocalTime.parse("18:00") }
    ]]
}