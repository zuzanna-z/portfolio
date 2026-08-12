const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const config = require("config");
const _ = require("lodash");
const authenticate = require("../middleware/authenticate");
const adminAuth = require("../middleware/admin");
const Joi = require("joi");

// const taskData = require('../models/task');
// let currentLargestTaskId = taskData[taskData.length - 1].taskid;

//const admin = require('../middleware/admin'); - NOT CREATED

//GET /api/tasks/(?query options)
router.get("/", [authenticate, adminAuth], async (req, res) => {
  try {
    const tasks = await Task.getAllTasks();
    return res.send(JSON.stringify(tasks));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

//GET /api/tasks/own/:labelId - get own tasks with specific labelId
router.get("/own/:labelId", [authenticate], async (req, res) => {
  try {
    const tasks = await Task.getOwnTasksByLabelId(
      req.account.userId,
      req.params.labelId
    );
    return res.send(JSON.stringify(tasks));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

//GET /api/tasks/own - get own tasks
router.get("/own", [authenticate], async (req, res) => {
  try {
    const tasks = await Task.getOwnTasks(req.account.userId);
    return res.send(JSON.stringify(tasks));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

//POST /api/tasks/ - create a new task
router.post("/", [authenticate], async (req, res) => {
  try {
    const payload = Joi.object({
      labelId: Joi.number().integer(),
      taskdueDate: Joi.number(),
      tasksubject: Joi.string(),
    });

    let validPayload = payload.validate(req.body);

    if (validPayload.err)
      throw {
        statusCode: 400,
        errorMessage: "Badly formatted request",
        errorObj: err,
      };

    const task = await Task.createTask(
      req.account.userId,
      req.body.labelId,
      req.body.taskdueDate,
      req.body.tasksubject
    );

    return res.send(JSON.stringify(task));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

router.put("/completed/:taskId", [authenticate], async (req, res) => {
  try {
    const task = await Task.finishTask(req.params.taskId);
    return res.send(JSON.stringify(task));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

//DELETE /api/tasks/ - delete a task
router.delete("/:taskId", [authenticate], async (req, res) => {
  try {
    const task = await Task.deleteTask(req.account.userId, req.params.taskId);
    return res.send(JSON.stringify(task));
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).send(JSON.stringify(err));
    }
    return res.status(500).send(JSON.stringify(err));
  }
});

module.exports = router;
