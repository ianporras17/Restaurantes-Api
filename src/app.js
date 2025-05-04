import express from "express";
import routes from "./routes.js";

const app = express();

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "JSON inválido" });
    }
    next();
  });
app.use(routes);

export default app;
