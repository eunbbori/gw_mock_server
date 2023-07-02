// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  scalar Date

  enum WorkingType {
    WORK
    FULL_DAYOFF
    HALF_DAYOFF
    SICK
    MILITARY
  }

  type Employee {
    employeeId: Int
    userId: String
    employeeName: String
		department: Department
  }

  input EmployeeInput {
    userId: String
    employeeName: String
    departmentId: Int
    passwd: String
  }

  type Department {
	departmentId: Int
	departmentName: String
  }

  type EmployeeWorking {
    employeeId: Int
    userId: String
    employeeName: String
		department: Department
    workingDate: Date
    workingType: WorkingType
    startAt: Date
    endAt: Date
  }

  type Tokens {
    accessToken: String
    refreshToken: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    authenticate(userId: String, passwd: String): Tokens
    refresh(userId: String, refreshToken: String) : Tokens
    departments: [Department]
    employees: [Employee]
    employeeWorking(dt: String): [EmployeeWorking]
  }

  type Mutation {
    addEmployee(input: EmployeeInput): Employee
  }
`;
export { typeDefs, };
