import { departments, employees } from "../data/data.js";
export const getEmployee = (id) => {
    const employee = employees.find((e) => e.employeeId === id);
    if (!employee)
        return undefined;
    const department = departments.find((d) => d.departmentId === employee.departmentId);
    return { ...employee, department, passwd: "" };
};
export const addEmployee = (input) => {
    const maxId = employees.map((e) => e.employeeId).reduce((max, curr) => (curr > max ? curr : max), 0);
    const employeeId = maxId + 1;
    employees.push({
        employeeId: employeeId,
        ...input,
    });
    const employee = getEmployee(employeeId);
    return employee;
};
