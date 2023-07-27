import Upload from "graphql-upload/Upload.mjs";
import { departments, employees } from "../data/data.js";
import {
  IEmployee,
  IEmployeeInput,
  IEmployeeModInput,
  IFile,
} from "../data/types.js";
import fs from "fs";

const uploadFolder = "/work/groupware-mock-server/public/upload/";

export const getEmployee = (id: Number): IEmployee | undefined => {
  const employee = employees.find((e) => e.employeeId === id);
  if (!employee) return undefined;

  const department = departments.find(
    (d) => d.departmentId === employee.departmentId
  );
  return { ...employee, department, passwd: "" };
};

export const addEmployee = (input: IEmployeeInput): number | undefined => {
  const maxId = employees
    .map((e) => e.employeeId)
    .reduce((max, curr) => (curr > max ? curr : max), 0);

  const employeeId = maxId + 1;
  employees.push({
    employeeId: employeeId,
    ...input,
  });

  const employee = getEmployee(employeeId);
  return employee?.employeeId;
};

export const modEmployee = (
  id: number,
  input: IEmployeeModInput
): IEmployee | undefined => {
  const employee = employees.find((e) => e.employeeId === id);
  if (!employee) return undefined;

  employee.userId = input.userId;
  employee.name = input.name;
  employee.email = input.email;
  employee.departmentId = input.departmentId;
  employee.contractType = input.contractType;
  employee.phone = input.phone;
  employee.position = input.position;
  employee.startDate = input.startDate;

  employee.department = departments.find(
    (d) => d.departmentId === employee.departmentId
  );
  return employee;
};

export const changePwd = (id: number, pwd: string): IEmployee | undefined => {
  const employee = employees.find((e) => e.employeeId === id);
  if (!employee) return undefined;

  employee.passwd = pwd;
  employee.department = departments.find(
    (d) => d.departmentId === employee.departmentId
  );
  return employee;
};

export const saveFile = (file: Upload, userId: string): IFile => {
  const { filename, mimetype, encoding } = file.file!;
  const rStream = file.file!.createReadStream();
  const newFileName = filename.replace(
    /[\w\d_-]+(\.[\w\d_-]+)$/i,
    userId + "$1"
  );
  const wStream = fs.createWriteStream(uploadFolder + newFileName, {
    flags: "w",
  });
  rStream.pipe(wStream);
  return { filename: newFileName, mimetype, encoding };
};
