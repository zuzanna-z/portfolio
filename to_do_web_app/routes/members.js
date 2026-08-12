const express = require("express");
const router = express.Router();
const Member = require("../models/member");
const config = require("config");
const _ = require("lodash");
const authenticate = require("../middleware/authenticate");
const adminAuth = require("../middleware/admin");
const Joi = require("joi");


router.get("/membership", [authenticate], async (req, res) => {
  try {
    const membershipArray = await Member.getAllMemberships(req.account.userId);
    return res.send(JSON.stringify(membershipArray));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.get("/:groupId", [authenticate], async (req, res) => {
  try {
    const memberArray = await Member.getAllGroupMembers(req.params.groupId);
    return res.send(JSON.stringify(memberArray));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.post("/:groupId", [authenticate], async (req, res) => {
  try {
    const newMember = req.body;
    const schema = Joi.object({
      newMember: Joi.number().integer().min(1),
    });

    let validPayload = schema.validate(newMember);
    if (validPayload.error)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request",
        errorObj: err,
      };

    const member = await Member.assignMember(
      req.params.groupId,
      newMember.newMember
    );

    return res.send(JSON.stringify(member));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});


router.delete("/:groupId/:email", [authenticate], async (req, res) => {
  try {
    const deletedMember = await Member.removeMember(
      req.account.userId,
      req.params.groupId,
      req.params.email
    );

    return res.send(JSON.stringify(deletedMember));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});
router.delete("/:groupId", [authenticate], async (req, res) => {
  try {

    const deletedMember = await Member.leaveGroup(
      req.params.groupId,
      req.account.userId
    );

    return res.send(JSON.stringify(deletedMember));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;

