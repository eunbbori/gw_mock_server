// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  scalar Date
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
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
    employeeId: Int
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

  input EmployeeModInput {
    userId: String
    name: String
    position: String
    departmentId: Int
    contractType: String
    phone: String
    email: String
    startDate: Date
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
    position: String
    workingDateFrom: String
    workingDateTo: String
    workingType: [String]
  }

  type EmployeeWorking {
    employeeId: Int
    userId: String
    name: String
    position: String
		department: Department
    workingDate: Date
    workingType: String
    startAt: Date
    endAt: Date
  }

  type EmployeeWorkingPage {
    content: [EmployeeWorking]
    totalElements: Int
    totalPages: Int
    page: Int
    size: Int
  }

  type AuthInfo {
    accessToken: String
    startAt: Date
    endAt: Date
    workingType: String 
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    codes(parents: [String]): [Codes]
    departments: [Department]
    employees: [Employee]
    employee(employeeId: Int, userId: String): Employee
    employeeWorking(dt: String): [EmployeeWorking]
    employeeWorkingConditional(searchCondition: EmployeeWorkingCondition, page: Int = 1, size: Int = 10): EmployeeWorkingPage
    checkUserIdDuplication(userId: String!): Boolean
  }

  type Mutation {
    login(email: String, passwd: String): AuthInfo
    logout: Employee
    refresh: AuthInfo
    goToWork: EmployeeWorking
    leaveWork: EmployeeWorking

    addEmployee(input: EmployeeInput, file: Upload): Employee
    modEmployee(employeeId: Int, input: EmployeeModInput, file:Upload): Employee
    changePwd(employeeId: Int, pwd: String): Employee
    singleUpload(employeeId: Int, file: Upload!): File!
  }

  type Subscription {
    attended: EmployeeWorking
  }
`;

export { typeDefs };
