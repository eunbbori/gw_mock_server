import { GraphQLError } from "graphql";
import { employeeWorkingToday } from "./data.js";
import { departments, employees } from "./data.js";
import { isToday } from "date-fns";
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
    "FULL_DAYOFF",
    "AM_DAYOFF",
    "AM_DAYOFF",
    "PM_DAYOFF",
    "SICK",
    "MILITARY",
];
const noneFullDayoffs = ["WORK", "AM_DAYOFF", "PM_DAYOFF"];
const sampleStartAt = [
    [9, 0],
    [9, 10],
    [9, 20],
    [9, 30],
    [9, 40],
    [9, 50],
    [10, 0],
    [8, 50],
    [8, 40],
    [8, 30],
];
const sampleStartAtNoon = [
    [13, 0],
    [13, 10],
    [13, 20],
    [13, 30],
    [13, 40],
    [13, 50],
    [14, 0],
    [14, 10],
    [14, 20],
    [14, 30],
];
const sampleEndAt = [
    [18, 0],
    [18, 10],
    [18, 20],
    [18, 30],
    [18, 40],
    [18, 50],
    [19, 0],
    [19, 10],
    [19, 20],
    [19, 30],
    [19, 40],
];
const sampleEndAtNoon = [
    [12, 30],
    [12, 40],
    [12, 50],
    [13, 0],
    [13, 10],
    [13, 20],
    [13, 30],
    [13, 40],
    [13, 50],
    [14, 0],
];
export const getEmployeeWorkingConditional = (employees, startDt, endDt, workingType) => {
    if (employees.length === 0)
        return [];
    const startDate = new Date(parseInt(startDt.substring(0, 4)), parseInt(startDt.substring(5, 7)) - 1, parseInt(startDt.substring(8, 11)));
    const endDate = new Date(parseInt(endDt.substring(0, 4)), parseInt(endDt.substring(5, 7)) - 1, parseInt(endDt.substring(8, 11)));
    const employeeWorkings = [];
    employees.forEach((e) => {
        let currDate = new Date(startDate.getTime());
        while (currDate <= endDate) {
            if (currDate.getDay() !== 0 && currDate.getDay() !== 6) {
                employeeWorkings.push(mockEmployeeWorking(e, new Date(currDate.getTime())));
            }
            currDate.setDate(currDate.getDate() + 1);
        }
    });
    return employeeWorkings
        .filter((e) => !workingType || workingType.length === 0 || workingType.includes(e.workingType || ""))
        .sort((e1, e2) => (!e1.startAt ? 1 : !e2.startAt ? -1 : e1.startAt < e2.startAt ? 1 : e1.startAt === e2.startAt ? 0 : -1));
};
export const mockTodayEmployeeWorking = (employee) => {
    const dept = departments.find((d) => d.departmentId === employee.departmentId);
    if (!dept)
        throw new GraphQLError("INVALID ACCESSTOKEN");
    let workingToday = employeeWorkingToday.find((e) => e.employeeId === employee.employeeId);
    if (!workingToday) {
        workingToday = {
            employeeId: employee.employeeId,
            userId: employee.userId,
            name: employee.name,
            position: employee.position,
            department: { ...dept },
            workingDate: new Date(),
            workingType: undefined,
            startAt: undefined,
            endAt: undefined,
        };
        employeeWorkingToday.push(workingToday);
    }
    return workingToday;
};
const mockEmployeeWorking = (employee, workingDate) => {
    const dept = departments.find((d) => d.departmentId === employee.departmentId);
    if (!dept)
        throw new GraphQLError("INVALID ACCESSTOKEN");
    if (isToday(workingDate))
        return mockTodayEmployeeWorking(employee);
    const workingType = WorkingType[Math.floor(Math.random() * WorkingType.length)];
    const doWork = noneFullDayoffs.includes(workingType);
    let startAtTime, endAtTime;
    let startAt, endAt;
    if (doWork) {
        if (workingType === "WORK") {
            startAtTime = sampleStartAt[Math.floor(Math.random() * sampleStartAt.length)];
            endAtTime = sampleEndAt[Math.floor(Math.random() * sampleEndAt.length)];
        }
        else if (workingType === "AM_DAYOFF") {
            startAtTime = sampleStartAtNoon[Math.floor(Math.random() * sampleStartAtNoon.length)];
            endAtTime = sampleEndAt[Math.floor(Math.random() * sampleEndAt.length)];
        }
        else {
            //if(workingType==="PM_DAYOFF")
            startAtTime = sampleStartAt[Math.floor(Math.random() * sampleStartAt.length)];
            endAtTime = sampleEndAtNoon[Math.floor(Math.random() * sampleEndAtNoon.length)];
        }
        startAt = new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate(), startAtTime[0], startAtTime[1]);
        endAt = new Date(workingDate.getFullYear(), workingDate.getMonth(), workingDate.getDate(), endAtTime[0], endAtTime[1]);
    }
    const curr = new Date();
    return {
        employeeId: employee.employeeId,
        userId: employee.userId,
        name: employee.name,
        position: employee.position,
        department: { ...dept },
        workingDate: workingDate,
        workingType: workingType,
        startAt: doWork ? startAt : undefined,
        endAt: doWork && endAt && endAt < curr ? endAt : undefined,
    };
};
export const getEmployeeWorking = (dt) => {
    const workingDate = new Date(parseInt(dt.substring(0, 4)), parseInt(dt.substring(5, 7)) - 1, parseInt(dt.substring(8, 11)));
    return workingDate.getDay() === 0 || workingDate.getDay() === 6
        ? []
        : employees
            .map((e) => {
            return mockEmployeeWorking(e, workingDate);
        })
            .sort((e1, e2) => (!e1.startAt ? 1 : !e2.startAt ? -1 : e1.startAt < e2.startAt ? 1 : e1.startAt === e2.startAt ? 0 : -1));
};
