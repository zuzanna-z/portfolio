//require the needed modules first
const express = require("express");
const router = express.Router();
//require our Account class from models
const Account = require("../models/account");
const jwt = require("jsonwebtoken");
//we need the const jwt = require('jsonwebtoken'); here but i forget if it is a module or what it is, and if we have then installed it?
const config = require("config");

//POST endpoint
router.post("/", async (req, res) => {
  res.header("Content-type", "application/json");
  try {
    //now we validate our req.body as credentials
    //stuck here because im stuck in the Account class in the models folder
    const { error } = Account.validateCredentials(req.body);

    if (error)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request payload",
        errorObj: error,
      };

    const account = await Account.checkCred(req.body);

    const token = jwt.sign(
      JSON.stringify(account),
      config.get("jwt_key")
    );

    res.header("x-authToken", token);
    return res.send(JSON.stringify(account));
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).send(JSON.stringify(err));
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
