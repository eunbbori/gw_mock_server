import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

import { accessTokenExpiresIn, refreshTokenExpiresIn } from "../configuration/config.js";

import { departments, employees } from "../data/data.js";
import { GetTokensMode, IGetTokensParam, ITokens } from "../data/types.js";
import { GraphQLError } from "graphql";

const jwtPrivateKey = path.resolve("") + "/src/keys/private.pem";
const jwtRefreshPrivateKey = path.resolve("") + "/src/keys/private-refresh.pem";

export const getTokens = (mode: GetTokensMode, params: IGetTokensParam): ITokens => {
  const user = employees.find(
    (user) =>
      user.userId === params.userId &&
      ((mode === "authenticate" && user.passwd === params.passwd) || (mode === "refresh" && user.refreshToken && user.refreshToken === params.refreshToken))
  );
  if (!user) throw new GraphQLError("IMPOSSIBLE");

  const department = departments.find((e) => e.departmentId === user.departmentId);

  const payload = {
    userId: user.userId,
    userName: user.name,
    departmentName: department?.departmentName,
    photoUrl: user.photoUrl || "",
    adminYn: user.adminYn,
  };

  const options = {
    algorithm: "RS256",
    expiresIn: accessTokenExpiresIn,
  };

  const cert = fs.readFileSync(jwtPrivateKey);
  const certRefresh = fs.readFileSync(jwtRefreshPrivateKey);
  const signedAccessToken = jwt.sign(payload, cert, {
    algorithm: "RS256",
    expiresIn: accessTokenExpiresIn,
  });
  const signedRefreshToken = jwt.sign(payload, certRefresh, {
    algorithm: "RS256",
    expiresIn: refreshTokenExpiresIn,
  });

  // save refreshToken in DB or other Storage
  user.refreshToken = signedRefreshToken;

  console.log("<getTokens> signedAccessToken=" + signedAccessToken);
  console.log("<getTokens> signedRefreshToken=" + signedRefreshToken);

  return { accessToken: signedAccessToken, refreshToken: signedRefreshToken };
};
