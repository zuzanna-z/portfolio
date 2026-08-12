const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const config = require("config");
const _ = require("lodash");
const authenticate = require("../middleware/authenticate");
const adminAuth = require("../middleware/admin");
const Joi = require("joi");

router.get("/", [authenticate, adminAuth], async (req, res) => {
  try {
    console.log("started groups try and catch");
    const groups = await Group.getAllGroups();
    console.log("called function");
    return res.send(JSON.stringify(groups));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.get("/own", [authenticate], async (req, res) => {
  try {
    console.log("started groups own try and catch");
    const groups = await Group.getOwnGroups(req.account.userId);
    console.log(req.account.userId);
    console.log("called function");
    return res.send(JSON.stringify(groups));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.get("/:groupId", [authenticate], async (req, res) => {
  try {
    console.log("started groups own try and catch");
    console.log(req.params.groupId);

    const groups = await Group.getGroupById(req.params.groupId);
    console.log("called function");
    return res.send(JSON.stringify(groups));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.post("/", [authenticate], async (req, res) => {
  try {
    console.log("started groups try and catch");
    let validPayload = Group.validateUserInput(req.body);
    if (validPayload.error)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request",
        errorObj: err,
      };
    console.log("validated users payload");

    const groupName = _.pick(req.body, ["groupName"]);
    const groupDescription = _.pick(req.body, ["groupDescription"]);

    console.log("parsed payload");

    const group = await Group.createGroup(
      req.account.userId,
      groupName,
      groupDescription
    );
    console.log("called function");

    return res.send(JSON.stringify(group));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.put("/:groupId", [authenticate], async (req, res) => {
  try {
    console.log("started try and catch");
    const newDescription = req.body;
    console.log(`get the new description:`);
    console.log(newDescription);
    const schema = Joi.object({
      groupDescription: Joi.string().max(255).required(),
    });
    let validChangePayload = schema.validate(newDescription);
    console.log("payload validated");

    if (validChangePayload.error)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request payload",
        errorObj: error,
      };

    const group = await Group.changeDescription(
      req.params.groupId,
      newDescription
    );
    console.log(group);
    console.log("no error so far in put groups");
    return res.send(JSON.stringify(group));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.delete("/:groupId", [authenticate], async (req, res) => {
  try {
    const group = await Group.deleteGroup(req.account.userId, req.params.groupId);
    console.log('called function')
    return res.send(JSON.stringify(group));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
