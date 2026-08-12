const express = require("express");
const app = express();
const cors = require("cors");
const env = require("dotenv").config();
const config = require("config");
const login = require("./routes/login");
const accounts = require("./routes/accounts");
const resHeader = require("./middleware/setHeaderResponse");
const groups = require("./routes/groups");
const members = require("./routes/members");
const users = require("./routes/users");
const tasks = require("./routes/tasks");


app.use(express.json());
const corsOpt = {
  exposedHeaders: ["x-authToken"],
};
app.use(cors(corsOpt));
app.use(resHeader);
app.use("/api/accounts/login", login);
app.use("/api/accounts", accounts);
app.use("/api/groups", groups);
app.use("/api/groupmembers", members);
app.use("/api/users", users);
app.use("/api/tasks", tasks);


app.listen(
  config.get("port"),
  console.log(`listening on port ${config.get("port")}...`)
);
