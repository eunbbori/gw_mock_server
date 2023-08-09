import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { isSameDay } from "date-fns";

import Upload from "graphql-upload/Upload.mjs";
import { codes, departments, employees, employeeWorkingToday } from "../data/data.js";
import {
  IDepartment,
  IEmployee,
  IEmployeeWorking,
  ILogin,
  IAuthInfo,
  IEmployeeInput,
  IMyContext,
  ICodes,
  IEmployeeWorkingCondition,
  IEmployeeWorkingPage,
  IFile,
  IEmployeeModInput,
} from "../data/types.js";
import { getEmployeeWorking, getEmployeeWorkingConditional, mockTodayEmployeeWorking } from "../data/getMock.js";
import { addEmployee, changePwd, modEmployee, saveFile } from "./employee.js";
import { login, logout, refresh } from "./authenticate.js";

const pubsub = new PubSub();

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    codes: (_: any, args: { parents: Array<string> }, { user, expired }: IMyContext): Array<ICodes> => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return args.parents.map((p) => {
        return {
          parentCode: p,
          parentName: codes.find((c) => c.parentCode === "-" && c.code === p)?.name || "",
          codes: codes
            .filter((c) => c.parentCode === p)
            .map((c) => {
              return {
                name: c.name,
                code: c.code,
              };
            }),
        };
      });
    },

    departments: (_: any, __: any, { user, expired }: IMyContext): IDepartment[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return departments;
    },

    employees: (_: any, __: any, { user, expired }: IMyContext): IEmployee[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return employees.map((e) => {
        const department = departments.find((d) => d.departmentId === e.departmentId);
        return { ...e, department, passwd: "" };
      });
    },

    employee: (_: any, args: any, { user, expired }: IMyContext): IEmployee | undefined => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const employee: IEmployee | undefined = args.employeeId
        ? employees.find((e) => e.employeeId === args.employeeId)
        : employees.find((e) => e.userId === args.userId);
      if (!employee) return undefined;

      const department = departments.find((d) => d.departmentId === employee?.departmentId);
      return { ...employee, department };
    },

    employeeWorking: (_: any, args: { dt: string }, { user, expired }: IMyContext): IEmployeeWorking[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return getEmployeeWorking(args.dt);
    },

    employeeWorkingConditional: (
      _: any,
      args: { searchCondition: IEmployeeWorkingCondition; page: number; size: number },
      { user, expired }: IMyContext
    ): IEmployeeWorkingPage => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const cond = args.searchCondition;
      if (!cond.workingDateFrom || !cond.workingDateTo) throw new GraphQLError("NO PERIOD");

      const employeesFiltered: IEmployee[] = employees
        .filter((e) => !cond.userId || e.userId === cond.userId)
        .filter((e) => !cond.name || e.name.includes(cond.name))
        .filter((e) => !cond.departmentId || cond.departmentId == -1 || e.departmentId == cond.departmentId)
        .filter((e) => !cond.position || e.position === cond.position);

      return getEmployeeWorkingConditional(employeesFiltered, cond.workingDateFrom, cond.workingDateTo, cond.workingType, args.page, args.size);
    },

    checkUserIdDuplication: (_: any, args: { userId: string }, { user, expired }: IMyContext): boolean => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return employees.filter((e) => e.userId === args.userId).length > 0;
    },
  },

  Mutation: {
    login: (_: any, { email, passwd }: ILogin, { req, res }: IMyContext): IAuthInfo => login({ email, passwd }, { req, res }),
    logout: (_: any, {}, { req, res }: IMyContext): IEmployee | undefined => logout({ req, res }),
    refresh: (_: any, {}, { req, res }: IMyContext): IAuthInfo => refresh({ req, res }),

    addEmployee: (_: any, args: { input: IEmployeeInput; file?: Upload }, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");
      if (user.adminYn === "NO") throw new GraphQLError("IMPOSSIBLE");

      addEmployee(args.input);
      const savedEmployee = employees.find((e) => e.employeeId === args.input.employeeId);
      savedEmployee && args.file && persistFile(savedEmployee, args.file);

      return savedEmployee;
    },

    modEmployee: (_: any, args: { employeeId: string; input: IEmployeeModInput; file?: Upload }, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");
      if (user.adminYn === "NO") throw new GraphQLError("IMPOSSIBLE");

      const employee = modEmployee(args.employeeId, args.input);

      employee && args.file && persistFile(employee, args.file);

      return employee;
    },

    changePwd: (_: any, args: { employeeId: string; pwd: string }, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return changePwd(args.employeeId, args.pwd);
    },

    goToWork: (_: any, {}, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const employeeWorking = mockTodayEmployeeWorking(user);

      if (!employeeWorking.workingType && !employeeWorking.startAt) {
        employeeWorking.startAt = new Date();
        employeeWorking.workingType = "WORK";

        pubsub.publish("ATTENDED", {
          attended: {
            ...employeeWorking,
          },
        });
      }

      return employeeWorking;
    },

    leaveWork: (_: any, {}, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const employeeWorking: IEmployeeWorking | undefined = employeeWorkingToday.find((e) => e.userId === user?.userId && isSameDay(e.workingDate, new Date()));
      if (employeeWorking) employeeWorking.endAt = new Date();

      pubsub.publish("ATTENDED", {
        attended: {
          ...employeeWorking,
        },
      });

      return employeeWorking;
    },

    singleUpload: (_: any, args: { employeeId: string; file: Upload }, { user, expired }: IMyContext): IFile => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const employee = employees.find((e) => e.employeeId === args.employeeId);
      let savedFile: IFile = { filename: "", mimetype: "", encoding: "" };

      employee && persistFile(employee, args.file);

      return savedFile;
    },
  },

  Subscription: {
    attended: {
      /* 
        The PubSub class is not recommended for production environment,
         because it's an in-memory event system that only supports a single server instance.
      */
      subscribe: () => pubsub.asyncIterator(["ATTENDED"]),
    },
  },
};

const persistFile = (employee: IEmployee, file: Upload) => {
  const { filename } = saveFile(file, employee.userId);
  employee.photoUrl = "upload/" + filename;
};

export default resolvers;
