import express from "express";

// Code
export interface ICode {
  code: string;
  name: string;
}

export interface ICodeWithParent extends ICode {
  parentCode: String;
}

export interface ICodes {
  parentCode: String;
  parentName: String;
  codes: Array<ICode>;
}

export interface IDepartment {
  departmentId: number;
  departmentName: string;
}

// Employee
export interface IEmployeeWorking {
  employeeId: string;
  userId: string;
  name: string;
  position: string;
  department?: IDepartment;
  workingDate: Date;
  workingType?: string;
  startAt?: Date;
  endAt?: Date;
}

export interface IEmployeeWorkingPage {
  content: IEmployeeWorking[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface IEmployeeWorkingCondition {
  userId: string;
  name: string;
  departmentId: number;
  position: string;
  workingDateFrom: String;
  workingDateTo: String;
  workingType: string[];
}

interface IEmployeeBaseInput {
  userId: string;
  name: string;
  email: string;
  contractType: string;
  phone: string;
  startDate?: Date;
  departmentId: number;
  position: string;
}

export interface IEmployeeModInput extends IEmployeeBaseInput {
  removePhoto: string;
}

export interface IEmployeeInput extends IEmployeeBaseInput {
  employeeId: string;
  passwd?: string;
}

export interface IEmployee extends IEmployeeInput {
  department?: IDepartment;
  photoUrl?: string;
  refreshToken?: string;
  adminYn?: string;
  lastLogin?: Date;
}

interface ICommonChangePwd {
  pwd: string;
  prevPwd?: string;
}

export interface IChangePwd extends ICommonChangePwd {
  employeeId: string;
}

export interface IChangeFirstPwd extends ICommonChangePwd {
  email: string;
}

export interface IFile {
  filename: string;
  mimetype: string;
  encoding: string;
}
// Authenticate
export type GetTokensMode = "authenticate" | "refresh";
export type TokenType = "access" | "refresh";

export interface ILogin {
  email: string;
  passwd: string;
}

export interface IGetTokensParam {
  userId: string;
  passwd?: string;
  refreshToken?: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAttendInfo {
  startAt?: Date;
  endAt?: Date;
  workingType?: string;
  lastLogin?: Date;
}

export interface IAuthInfo extends IAttendInfo {
  accessToken: string;
}

export interface IMyContext {
  req: express.Request<any, Record<string, any>>;
  res: express.Response<any, Record<string, any>>;
  user?: IEmployee;
  expired?: boolean;
}

export interface IPayload {
  userId: string;
  userName: string;
  departmentName: string;
  photoUrl: string;
  adminYn: string;
  iat: number;
  exp: number;
}
