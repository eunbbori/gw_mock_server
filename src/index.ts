import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

import { JwtPayload } from "jsonwebtoken";
import { typeDefs } from "./graphql/schema.js";
import resolvers from "./graphql/resolver.js";
import { IEmployee, IMyContext } from "./data/types.js";
import { employees } from "./data/data.js";
import { GraphQLError } from "graphql";
import { verifyToken } from "./graphql/authenticate.js";

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server
const app = express();
const httpServer = createServer(app);

// Creating our WebSocket server using the HTTP server we just set up
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscription",
});

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
  includeStacktraceInErrorResponses: false,
});

// Note you must call `start()` on the `ApolloServer`
// instance before passing the instance to `expressMiddleware`
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  "/",
  graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }),
  cors<cors.CorsRequest>({
    //origin: process.env.CORS_ORIGIN_URL.split(","),
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  }),
  bodyParser.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const myContext: IMyContext = { req, res };

      if (req.headers.authorization) {
        const accessToken = req.headers.authorization.substring(7);

        const verified: JwtPayload = verifyToken("access", accessToken) as JwtPayload;

        const user: IEmployee | undefined = employees.find((user) => user.userId === verified.userId);
        if (!user) {
          throw new GraphQLError("NO MATCH");
        }

        myContext.user = user;
        const now = Date.now().valueOf() / 1000;
        if (verified.exp && verified.exp < now) {
          // AccessToken is expired. Refresh needed.
          myContext.expired = true;
        } else {
          myContext.expired = false;
        }
      }

      return myContext;
    },
  })
);

const firstOperationDefinition = (ast: any) => ast.definitions[0];
const firstFieldValueNameFromOperation = (operationDefinition: any) => operationDefinition.selectionSet.selections[0].name.value;

/************************************** 
  error:
    UNAUTHORIZED: No Token
    EXPIRED: Token Expired
    INVALID TOKEN: Token Invalid
    NO MATCH: No User
    NO TOKEN: No Authentication Header
    NO DEPARTMENT: No Department
    NO REFRESH: No Refresh Token
**************************************/

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`🚀  Server ready at: http://localhost:${PORT}/`);
});
