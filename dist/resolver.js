import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { departments, employees } from './data';
import { accessTokenExpiresIn, refreshTokenExpiresIn } from './config';
import { getEmployeeWorking } from './getMock';
const jwtPrivateKey = path.resolve('') + '/src/keys/private.pem';
const jwtRefreshPrivateKey = path.resolve('') + '/src/keys/private-refresh.pem';
const getTokens = (mode, params) => {
    //console.log('employees='+employees.map(user => user.userId + "," + user.refreshToken))
    const user = employees.find(user => user.userId === params.userId && ((mode === 'authenticate' && user.passwd === params.passwd) ||
        (mode === 'refresh' && user.refreshToken === params.refreshToken)));
    if (!user)
        return null;
    const department = departments.find(e => e.departmentId === user.departmentId);
    const payload = {
        "userId": user.userId,
        "userName": user.employeeName,
        "departmentName": department.departmentName
    };
    const options = {
        algorithm: 'RS256',
        expiresIn: accessTokenExpiresIn
    };
    const cert = fs.readFileSync(jwtPrivateKey);
    const certRefresh = fs.readFileSync(jwtRefreshPrivateKey);
    const signedAccessToken = jwt.sign(payload, cert, {
        algorithm: 'RS256',
        expiresIn: accessTokenExpiresIn
    });
    const signedRefreshToken = jwt.sign(payload, certRefresh, {
        algorithm: 'RS256',
        expiresIn: refreshTokenExpiresIn
    });
    // save refreshToken in DB or other Storage
    user.refreshToken = signedRefreshToken;
    console.log('signedAccessToken=' + signedAccessToken);
    console.log('signedRefreshToken=' + signedRefreshToken);
    return { accessToken: signedAccessToken, refreshToken: signedRefreshToken };
};
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        authenticate: (parent, { userId, passwd }) => getTokens('authenticate', { userId, passwd }),
        refresh: (parent, { userId, refreshToken }) => getTokens('refresh', { userId, refreshToken }),
        departments: (parent, args, { user }) => {
            if (!user)
                throw new GraphQLError("not authenticated");
            return departments;
        },
        employees: (parent, args, { user }) => {
            if (!user)
                throw new GraphQLError("not authenticated");
            return employees;
        },
        employeeWorking: (parent, { dt }, { user }) => {
            if (!user)
                throw new GraphQLError("not authenticated");
            return getEmployeeWorking(dt);
        }
    },
    Mutation: {
        addEmployee: (parent, input, { user }) => {
            if (!user)
                throw new GraphQLError("not authenticated");
            employees.push({
                employeeId: employees.length + 1,
                ...input
            });
            return employees[employees.length - 1];
        }
    }
};
export default resolvers;
