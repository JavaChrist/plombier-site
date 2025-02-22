import * as functions from "firebase-functions";
import next from "next";
import express from "express";


const isDev = process.env.NODE_ENV !== "production";
const app = next({ dev: isDev, conf: { distDir: ".next" } });
const handle = app.getRequestHandler();
const server = express();

server.all("*", (req, res) => {
  return handle(req, res);
});

export const nextApp = functions.https.onRequest(server);
