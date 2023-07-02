import { serialize } from "cookie";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { getTokens } from "./token.js";
import { employeeWorkingToday, employees } from "../data/data.js";
import { isSameDay } from "date-fns";
import { GraphQLError } from "graphql";
const jwtPublicKey = path.resolve("") + "/src/keys/public.pem";
const jwtRefreshPublicKey = path.resolve("") + "/src/keys/public-refresh.pem";
const serializeHttpOnlyCookie = (name, content, maxAge) => serialize(name, content, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAge,
    domain: "localhost",
    path: "/",
});
export const verifyToken = (mode, token) => {
    let verified;
    try {
        const cert = fs.readFileSync(mode === "access" ? jwtPublicKey : jwtRefreshPublicKey);
        verified = jwt.verify(token, cert, {
            algorithms: ["RS256"],
            ignoreExpiration: mode === "access",
        }); // check validation
    }
    catch (err) {
        // AccessToken is invalid. Login needed.
        throw new GraphQLError("INVALID TOKEN");
    }
    return verified;
};
export const login = ({ email, passwd }, { res }) => {
    console.log("login start:" + email + "," + passwd);
    const userId = employees.find((e) => e.email === email)?.userId;
    if (!userId)
        throw new GraphQLError("IMPOSSIBLE");
    const tokens = getTokens("authenticate", { userId, passwd });
    res.setHeader("Set-Cookie", serializeHttpOnlyCookie("refreshToken", tokens.refreshToken, 60 * 60 * 24 * 30));
    const working = employeeWorkingToday.find((e) => e.userId === userId && isSameDay(e.workingDate, new Date()));
    return {
        accessToken: tokens.accessToken,
        startAt: working?.startAt,
        endAt: working?.endAt,
        workingType: working ? "WORK" : undefined,
    };
};
export const refresh = ({ req, res }) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
        throw new GraphQLError("NO REFRESH");
    const verified = verifyToken("refresh", refreshToken);
    const tokens = getTokens("refresh", { userId: verified.userId, refreshToken });
    res.setHeader("Set-Cookie", serializeHttpOnlyCookie("refreshToken", tokens.refreshToken, 60 * 60 * 24 * 30));
    const working = employeeWorkingToday.find((e) => e.userId === verified.userId && isSameDay(e.workingDate, new Date()));
    return {
        accessToken: tokens.accessToken,
        startAt: working?.startAt,
        endAt: working?.endAt,
        workingType: working ? "WORK" : undefined,
    };
};
export const logout = ({ req, res }) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
        throw new GraphQLError("NO REFRESH");
    const verified = verifyToken("refresh", refreshToken);
    res.setHeader("Set-Cookie", serializeHttpOnlyCookie("refreshToken", "none", 2));
    return employees.find((e) => e.userId === verified.userId);
};
