const express = require("express");
const router = express.Router();

const Account = require("../models/account");

const _ = require("lodash");
const Joi = require("joi");

//holy trinity
const auth = require("../middleware/authenticate");
const admin = require("../middleware/admin");
const check = require("../middleware/checkauthorisation");

//GET things //
//GET [auth, admin, check] /api/accounts
router.get("/", [auth, admin, check], async (req, res) => {
  console.log("is here");
  try {
    const schema = Joi.object({
      email: Joi.string().email(),
      roleId: Joi.number().integer().min(1),
    });
    const { error } = schema.validate(req.query);
    if (error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: error,
      };

    console.log("somethng");
    let accounts;
    if (req.query.email)
      accounts = await Account.readAll({
        query: "email",
        value: req.query.email,
      });
    if (req.query.roleId && !req.query.email)
      accounts = await Account.readAll({
        query: "roleId",
        value: req.query.roleId,
      });
    if (!req.query.roleId && !req.query.email)
      accounts = await Account.readAll();

    return res.send(JSON.stringify(accounts));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }
});

// GET [auth] /api/accounts/own
router.get("/own", [auth], async (req, res) => {
  try {
    const account = await Account.findAccountById(req.account.accountId);

    return res.send(JSON.stringify(account));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }

  // return res.send(JSON.stringify({ message: 'GET /api/accounts/own' }));
});

// GET [auth, admin, check] /api/accounts/:accountid
router.get("/:accountId", [auth, admin], async (req, res) => {
  try {
    // validate accountid
    const schema = Joi.object({
      accountId: Joi.number().integer().min(1).required(),
    });

    const { error } = schema.validate(req.params);
    if (error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: error,
      };

    // call Account.readById(accountid) --> the request parameters can be found in req.params.<name>
    const account = await Account.findAccountById(req.params.accountId);

    // respond with account
    return res.send(JSON.stringify(account));
  } catch (err) {
    // if error
    if (err.statusCode) {
      // if error with statusCode, send error with status: statusCode
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }

  // return res.send(JSON.stringify({ message: `GET /api/accounts/${req.params.accountid}` }));
});

router.post("/", async (req, res) => {
  try {
    const schemaPayload = Joi.object({
      password: Joi.string().required(),
      userId: Joi.number().integer().min(1).required(),
      userName: Joi.string().required(),
    });

    const validPayload = schemaPayload.validate(req.body);

    if (validPayload.error)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request payload",
        errorObj: error,
      };

    const newAccount = await Account.createAccount(
      req.body.password,
      req.body.userId,
      req.body.userName
    );

    return res.send(JSON.stringify(newAccount));
  } catch (err) {
    if (err.statusCode)
      return res.status(err.statusCode).send(JSON.stringify(err));

    return res.status(500).send(JSON.stringify(err));
  }
});

//PUTthings//
// PUT /api/accounts/own
router.put("/own/description", [auth], async (req, res) => {
  console.log(`this is token obj `);
  console.log(req.account);

  try {
    const changeMyDescription = req.body;

    let validPayload = Joi.object({
      newDescription: Joi.string(),
    });

    let validRes = validPayload.validate(changeMyDescription);
    if (validRes.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validRes.error,
      };

    const account = await Account.changeAccountDescription(
      req.account.userId,
      changeMyDescription.newDescription
    );

    console.log(account);
    return res.send(JSON.stringify(account));
  } catch (err) {
    // if error
    if (err.statusCode) {
      // if error with statusCode, send error with status: statusCode
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }
});

router.put("/own/name", [auth], async (req, res) => {
  console.log(`this is token obj `);
  console.log(req.account);

  try {
    const changeMyDisplayName = req.body;

    let validPayload = Joi.object({
      newDisplayName: Joi.string(),
    });

    let validRes = validPayload.validate(changeMyDisplayName);
    if (validRes.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validRes.error,
      };

    const account = await Account.changeDisplayName(
      req.account.userId,
      changeMyDisplayName.newDisplayName
    );

    console.log(account);
    return res.send(JSON.stringify(account));
  } catch (err) {
    // if error
    if (err.statusCode) {
      // if error with statusCode, send error with status: statusCode
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }
});

// PUT [auth, admin, check] /api/accounts/email
router.put("/email/:email", [auth, admin], async (req, res) => {
  console.log("start of the PUT");
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
    });
    console.log("we are at schema email");
    let validationResult = schema.validate(req.params);
    if (validationResult.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validationResult.error,
      };

    if (req.account.email == req.params.email)
      throw {
        statusCode: 403,
        errorMessage: `Request denied: endpoint cannot be used to change account resource, use instead >> PUT /api/accounts/other email`,
        errorObj: {},
      };

    const accountCurrent = await Account.findAccountByUser(req.params.email);
    console.log(accountCurrent);

    if (req.body.role && req.body.role.roleId) {
      accountCurrent.role.roleId = req.body.role.roleId;
    }

    // validate the modified accountCurrent
    validationResult = Account.validate(accountCurrent);
    if (validationResult.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validationResult.error,
      };

    // update the account in the DB
    const account = await accountCurrent.update();

    //respond with account
    return res.send(JSON.stringify(account));
  } catch (err) {
    // if error
    if (err.statusCode) {
      // if error with statusCode, send error with status: statusCode
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }

  // return res.send(JSON.stringify({ message: `PUT /api/accounts/${req.params.accountid}` }));
});

// PUT [auth, admin, check] /api/accounts/:accountid
router.put("/:accountId", [auth, admin, check], async (req, res) => {
  try {
    const schema = Joi.object({
      accountId: Joi.number().integer().min(1).required(),
    });

    let validationResult = schema.validate(req.params);
    if (validationResult.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validationResult.error,
      };

    if (req.account.accountId == req.params.accountId)
      throw {
        statusCode: 403,
        errorMessage: `Request denied: endpoint cannot be used to change account resource, use instead >> PUT /api/accounts/own`,
        errorObj: {},
      };

    const accountCurrent = await Account.findAccountById(req.params.accountId);

    if (req.body.displayName) {
      accountCurrent.displayName = req.body.displayName;
    }
    if (req.body.role && req.body.role.roleId) {
      accountCurrent.role.roleId = req.body.role.roleId;
    }

    // validate the modified accountCurrent
    validationResult = Account.validate(accountCurrent);
    if (validationResult.error)
      throw {
        statusCode: 400,
        errorMessage: `Badly formatted request`,
        errorObj: validationResult.error,
      };

    // update the account in the DB
    const account = await accountCurrent.update();

    //respond with account
    return res.send(JSON.stringify(account));
  } catch (err) {
    // if error
    if (err.statusCode) {
      // if error with statusCode, send error with status: statusCode
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err)); // if no statusCode, send error with status: 500
  }

  // return res.send(JSON.stringify({ message: `PUT /api/accounts/${req.params.accountid}` }));
});

//PUT things no more//

// DELETE /api/accounts/:accountid
router.delete("/:accountid", [auth], async (req, res) => {
  try {
    const deleteAccount = await Account.deleteAccount(
      req.account.accountId,
      req.account.userId,
      req.account.email
    );
    console.log("deleted the account");
    return res.send(JSON.stringify(deleteAccount));
  } catch (err) {
    console.log("we are at the error");
    if (err.statusCode)
      return res.status(err.statusCode).send(JSON.stringify(err));
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
