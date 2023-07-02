import { departments, employees } from './data.js';
const toDateFormatWithoutDay = (dt) => {
    const year = dt.getFullYear();
    const month = dt.getMonth() + 1;
    const sMonth = month >= 10 ? month : '0' + month;
    const date = dt.getDate();
    const sDate = date >= 10 ? date : '0' + date;
    return year + '-' + sMonth + '-' + sDate;
};
const WorkingType = [
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "WORK",
    "FULL_DAYOFF",
    "FULL_DAYOFF",
    "FULL_DAYOFF",
    "HALF_DAYOFF",
    "SICK",
    "MILITARY"
];
const sampleStartAt = [
    [9, 0], [9, 10], [9, 20], [9, 30], [9, 40], [9, 50], [10, 0], [8, 50], [8, 40], [8, 30]
];
const sampleEndAt = [
    [18, 0], [18, 10], [18, 20], [18, 30], [18, 40], [18, 50], [10, 0], [8, 50], [8, 40], [8, 30]
];
export const getEmployeeWorking = (dt) => {
    const workingDate = new Date(parseInt(dt.substring(0, 4)), parseInt(dt.substring(5, 7)) - 1, parseInt(dt.substring(8, 11)));
    if (workingDate.getDay() === 0 || workingDate.getDay() === 6 || dt >= toDateFormatWithoutDay(new Date()))
        return [];
    return employees.map((e) => {
        const dept = departments.find((d) => d.departmentId === e.departmentId);
        const startAt = new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate(), Math.floor(Math.random() * 3 + 8), Math.floor(Math.random() * 60));
        const endAt = new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate(), Math.floor(Math.random() * 3 + 17), Math.floor(Math.random() * 60));
        return {
            employeeId: e.employeeId,
            userId: e.userId,
            employeeName: e.employeeName,
            department: { ...dept },
            workingDate: workingDate,
            workingType: WorkingType[Math.floor(Math.random() * WorkingType.length)],
            startAt: startAt,
            endAt: endAt
        };
    }).sort((e1, e2) => e1.startAt < e2.startAt ? 1 : e1.startAt === e2.startAt ? 0 : -1);
};
