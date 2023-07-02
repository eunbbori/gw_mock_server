import { GraphQLError } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { isSameDay } from "date-fns";

import { codes, departments, employees, employeeWorkingToday } from "../data/data.js";
import { IDepartment, IEmployee, IEmployeeWorking, ILogin, IAuthInfo, IEmployeeInput, IMyContext, ICodes, IEmployeeWorkingCondition } from "../data/types.js";
import { getEmployeeWorking, getEmployeeWorkingConditional, mockTodayEmployeeWorking } from "../data/getMock.js";
import { addEmployee } from "./employee.js";
import { login, logout, refresh } from "./authenticate.js";

const pubsub = new PubSub();

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    codes: (parent: any, args: { parents: Array<string> }, { user, expired }: IMyContext): Array<ICodes> => {
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

    departments: (parent: any, args: any, { user, expired }: IMyContext): IDepartment[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return departments;
    },

    employees: (parent: any, args: any, { user, expired }: IMyContext): IEmployee[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return employees.map((e) => {
        const department = departments.find((d) => d.departmentId === e.departmentId);
        return { ...e, department, passwd: "" };
      });
    },

    employee: (parent: any, args: any, { user, expired }: IMyContext): IEmployee | undefined => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const employee: IEmployee | undefined = employees.find((e) => e.userId === args.userId);
      if (!employee) return undefined;

      const department = departments.find((d) => d.departmentId === employee?.departmentId);
      return { ...employee, department };
    },

    employeeWorking: (parent: any, args: { dt: string }, { user, expired }: IMyContext): IEmployeeWorking[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return getEmployeeWorking(args.dt);
    },

    employeeWorkingConditional: (parent: any, args: { searchCondition: IEmployeeWorkingCondition }, { user, expired }: IMyContext): IEmployeeWorking[] => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      const cond = args.searchCondition;
      if (!cond.workingDateFrom || !cond.workingDateTo) throw new GraphQLError("NO PERIOD");

      const employeesFiltered: IEmployee[] = employees
        .filter((e) => !cond.userId || e.userId === cond.userId)
        .filter((e) => !cond.name || e.name.includes(cond.name))
        .filter((e) => !cond.departmentId || e.departmentId === cond.departmentId);

      return getEmployeeWorkingConditional(employeesFiltered, cond.workingDateFrom, cond.workingDateTo, cond.workingType);
    },
  },

  Mutation: {
    login: (parent: any, { email, passwd }: ILogin, { req, res }: IMyContext): IAuthInfo => login({ email, passwd }, { req, res }),
    logout: (parent: any, {}, { req, res }: IMyContext): IEmployee | undefined => logout({ req, res }),
    refresh: (parent: any, {}, { req, res }: IMyContext): IAuthInfo => refresh({ req, res }),
    addEmployee: (parent: any, args: { input: IEmployeeInput }, { user, expired }: IMyContext) => {
      if (!user) throw new GraphQLError("NO TOKEN");
      if (expired) throw new GraphQLError("EXPIRED");

      return addEmployee(args.input);
    },

    goToWork: (parent: any, {}, { user, expired }: IMyContext) => {
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

    leaveWork: (parent: any, {}, { user, expired }: IMyContext) => {
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

export default resolvers;
