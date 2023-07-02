// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  scalar Date

  enum WorkingType {
    WORK
    FULL_DAYOFF
    AM_DAYOFF
    PM_DAYOFF
    SICK
    MILITARY
  }

  type Code {
    code: String
    name: String
  }

  type Codes {
    parentCode: String
    parentName: String
    codes: [Code]
  }

  type Employee {
    employeeId: ID
    userId: String
    name: String
    position: String
		department: Department
    contractType: String
    phone: String
    email: String
    startDate: Date
    photoUrl: String
  }

  input EmployeeInput {
    userId: String
    name: String
    position: String
    departmentId: Int
    contractType: String
    phone: String
    email: String
    startDate: Date
    passwd: String
  }

  type Department {
    departmentId: ID
    departmentName: String
  }

  input EmployeeWorkingCondition {
    userId: String
    name: String
    departmentId: ID
    workingDateFrom: String
    workingDateTo: String
    workingType: [WorkingType]
  }

  type EmployeeWorking {
    employeeId: Int
    userId: String
    name: String
    position: String
		department: Department
    workingDate: Date
    workingType: WorkingType
    startAt: Date
    endAt: Date
  }

  type AuthInfo {
    accessToken: String
    startAt: Date
    endAt: Date
    workingType: WorkingType 
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    codes(parents: [String]): [Codes]
    departments: [Department]
    employees: [Employee]
    employee(userId: String): Employee
    employeeWorking(dt: String): [EmployeeWorking]
    employeeWorkingConditional(searchCondition: EmployeeWorkingCondition): [EmployeeWorking]
  }

  type Mutation {
    login(email: String, passwd: String): AuthInfo
    logout: Employee
    refresh: AuthInfo
    goToWork: EmployeeWorking
    leaveWork: EmployeeWorking

    addEmployee(input: EmployeeInput): Employee
  }

  type Subscription {
    attended: EmployeeWorking
  }
`;
export { typeDefs };
