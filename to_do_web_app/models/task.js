const config = require("config");
const con = config.get("dbConfig_UCN");
const sql = require("mssql");
const Joi = require("joi");
const { resolve } = require("path");
const { reject } = require("lodash");
const { stringify } = require("querystring");

class Task {
  constructor(taskObj) {
    if (taskObj.taskId) {
      this.taskId = taskObj.taskId;
    }
    if (taskObj.labelId) {
      this.labelId = taskObj.labelId;
    }
    if (taskObj.userId) {
      this.userId = taskObj.userId;
    }
    if (taskObj.taskdueDate) {
      this.taskDueDate = taskObj.taskDueDate;
    }
    if (taskObj.tasksubject) {
      this.tasksubject = taskObj.tasksubject;
    }
    this.completed = taskObj.completed;
  }

  static validationSchema() {
    const schema = Joi.object({
      taskId: Joi.number().integer().min(1),
      label: Joi.object({
        labelId: Joi.number().integer().min(1).required(),
        labelName: Joi.string().max(50),
      }),
      taskdueDate: Joi.number().integer(),
      tasksubject: Joi.string().max(255).min(1),
      tasksubject: Joi.boolean().required(),
    });
    return schema;
  }

  static validate(taskObj) {
    const schema = Task.validationSchema();
    return schema.validate(taskObj);
  }

  //create a new task
  static createTask(userId, labelId, taskdueDate, tasksubject) {
    return new Promise((resolve, reject) => {
      (async () => {

        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("labelId", sql.Int(), labelId)
            .input("taskdueDate", sql.BigInt(), taskdueDate)
            .input("tasksubject", sql.NVarChar(), tasksubject).query(`
          INSERT INTO stuorgTask 
          ([FK_userId], [FK_labelId], [taskdueDate], [tasksubject], [completed])
          VALUES
          (@userId, @labelId, @taskdueDate, @tasksubject, 0)
          SELECT *
          FROM stuorgTask
          WHERE taskId = SCOPE_IDENTITY()
          `);

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `task not found`,
              errorObj: {},
            };

          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the database`,
              errorObj: {},
            };

          const task = result.recordset[0];

          resolve(task);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static getAllTasks() {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const response = await pool.request().query(`
                  SELECT *
                  FROM stuorgTask
                  `);
          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no task found in the database`,
              errorObj: {},
            };

          let taskArray = [];

          response.recordset.forEach((task) => {
            this.validate(task);
            taskArray.push(task);
          });

          resolve(taskArray);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  //get OWN tasks
  static getOwnTasks(userId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const response = await pool
            .request()
            .input("userId", sql.Int(), userId).query(`
              SELECT *
              FROM stuorgTask
              WHERE FK_userId = @userId
              `);
          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no task found in the database`,
              errorObj: {},
            };

          let taskArray = [];

          response.recordset.forEach((task) => {
            this.validate(task);
            taskArray.push(task);
          });

          resolve(taskArray);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
  static getOwnTasksByLabelId(userId, labelId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const response = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("labelId", sql.Int(), labelId).query(`
              SELECT *
              FROM stuorgTask
              WHERE FK_userId = @userId
              AND FK_labelId = @labelId
              `);
          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no task found in the database`,
              errorObj: {},
            };

          let taskArray = [];

          response.recordset.forEach((task) => {
            this.validate(task);
            taskArray.push(task);
          });

          resolve(taskArray);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static deleteTask(userId, taskId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("taskId", sql.Int(), taskId).query(`
            SELECT *
            FROM stuorgTask
            WHERE taskId = @taskId
            AND FK_userId = @userId

            DELETE 
            FROM stuorgGroupTask
            WHERE FK_taskId = @taskId

            DELETE 
            FROM stuorgTask
            WHERE taskId = @taskId
            AND FK_userId = @userId
            `);

          if (result.recordset.length != 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const task = result.recordset[0];
          this.validate(task);
          resolve(task);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static finishTask(taskId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool.request().input("taskId", sql.Int(), taskId)
            .query(`
              UPDATE stuorgTask
              SET completed = 1
              WHERE taskId = @taskId

              SELECT *
              FROM stuorgTask
              WHERE taskId = @taskId
              `);

          if (result.recordset.length != 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };


          const task = result.recordset[0];
          this.validate(task);

          resolve(task);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
}

module.exports = Task;
