import Upload from "graphql-upload/Upload.mjs";
import { departments, employees } from "../data/data.js";
import { IEmployee, IEmployeeInput, IEmployeeModInput, IFile } from "../data/types.js";
import fs from "fs";
import { GraphQLError } from "graphql";

const uploadFolder = "/Users/user/project/back/public/upload/";

export const getEmployee = (id: string): IEmployee | undefined => {
  const employee = employees.find((e) => e.employeeId === id);
  if (!employee) return undefined;

  const department = departments.find((d) => d.departmentId === employee.departmentId);
  return { ...employee, department, passwd: "" };
};

export const addEmployee = (input: IEmployeeInput): IEmployee | undefined => {
  const dupEmployee = employees.find((e) => e.employeeId === input.employeeId);
  if (dupEmployee) throw new GraphQLError("ID DUPLICATION");

  employees.push(input);
  return getEmployee(input.employeeId);
};

export const modEmployee = (id: string, input: IEmployeeModInput): IEmployee | undefined => {
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

  employee.department = departments.find((d) => d.departmentId === employee.departmentId);
  return employee;
};

export const saveFile = (file: Upload, userId: string): IFile => {
  const { filename, mimetype, encoding } = file.file!;
  const rStream = file.file!.createReadStream();
  const newFileName = filename.replace(/[\w\d_-]+(\.[\w\d_-]+)$/i, userId + "$1");
  const wStream = fs.createWriteStream(uploadFolder + newFileName, { flags: "w" });
  rStream.pipe(wStream);
  return { filename: newFileName, mimetype, encoding };
};
