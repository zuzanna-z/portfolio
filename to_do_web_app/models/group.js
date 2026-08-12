const config = require("config");
const con = config.get("dbConfig_UCN");
const sql = require("mssql");
const Joi = require("joi");
const { resolve } = require("path");
const { reject } = require("lodash");

class Group {
  constructor(groupObj) {
    if (groupObj.groupId) {
      this.groupId = groupObj.groupId;
    }
    this.userId = groupObj.userId;
    this.userName = groupObj.userName;
    this.groupName = groupObj.groupName;
    this.groupDescription = groupObj.groupDescription;
  }

  static validationSchema() {
    const schema = Joi.object({
      groupId: Joi.number().integer().min(1),
      userId: Joi.number().integer().min(1),
      userName: Joi.string().max(255),
      groupName: Joi.string().max(255),
      groupDescription: Joi.string().max(255),
    });
    return schema;
  }

  static validate(groupObj) {
    const schema = Group.validationSchema();
    return schema.validate(groupObj);
  }

  static validateUserInput(inputObj) {
    const schema = Joi.object({
      groupName: Joi.string().max(255).required(),
      groupDescription: Joi.string().max(255).required(),
    });
    return schema.validate(inputObj);
  }

  static createGroup(userId, groupName, groupDescription) {
    return new Promise((resolve, reject) => {
      (async () => {
        console.log("started 1 try block on create group");
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupName", sql.NVarChar(), groupName.groupName).query(`
          SELECT * 
          FROM stuorgGroup
          WHERE groupName = @groupName
          AND FK_userId = @userId
          `);

          if (result.recordset.length == 1)
            throw {
              statusCode: 401,
              errorMessage: `group already exists in the table`,
              errorObj: {},
            };

          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the database`,
              errorObj: {},
            };
        } catch (err) {
          reject(err);
        }
        sql.close();

        console.log("started 2 try block on create group");
        try {
          const pool = await sql.connect(con);

          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupName", sql.NVarChar(), groupName.groupName)
            .input(
              "groupDescription",
              sql.NVarChar(),
              groupDescription.groupDescription
            ).query(`
            INSERT INTO stuorgGroup
            ([FK_userId], [groupName], [groupDescription])
            VALUES
            (@userId, @groupName, @groupDescription)
            SELECT *
            FROM stuorgGroup
            WHERE groupId = SCOPE_IDENTITY()
            `);
          if (result.recordset.length != 1)
            throw {
              statusCode: 500,
              errorMessage: `insert failed`,
              errorObj: {},
            };

          const group = result.recordset[0];
          resolve(group);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static getAllGroups() {
    return new Promise((resolve, reject) => {
      (async () => {
        try {

          const pool = await sql.connect(con);
          const response = await pool.request().query(`
              SELECT *
              FROM stuorgGroup
              `);

          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no group found in the database`,
              errorObj: {},
            };

          let groupArray = [];

          response.recordset.forEach((group) => {
            this.validate(group);
            groupArray.push(group);
          });

          resolve(groupArray);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
  static getOwnGroups(userId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {

          const pool = await sql.connect(con);
          const response = await pool
            .request()
            .input("userId", sql.Int(), userId).query(`
              SELECT *
              FROM stuorgGroup
              WHERE FK_userId = @userId
              `);

          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no group found in the database`,
              errorObj: {},
            };
        

          let groupArray = [];

          response.recordset.forEach((group) => {
            this.validate(group);
            groupArray.push(group);
          });

          resolve(groupArray);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static getGroupById(groupId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {

          const pool = await sql.connect(con);
          const response = await pool
            .request()

            .input("groupId", sql.Int(), groupId).query(`
                SELECT *
                FROM stuorgGroup g
                JOIN stuorgUser u
                ON g.FK_userId = u.userId
                WHERE groupId = @groupId
                `);

          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no group found with id: ${groupId}`,
              errorObj: {},
            };
          if (response.recordset.length > 1)
            throw {
              statusCode: 401,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

      

          const group = {
            groupId: response.recordset[0].groupId,
            userId: response.recordset[0].userId,
            userName: response.recordset[0].userName,
            groupName: response.recordset[0].groupName,
            groupDescription: response.recordset[0].groupDescription,
          };


          this.validate(group);

          resolve(group);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static changeDescription(groupId, newDescription) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("groupId", sql.Int(), groupId)
            .input(
              "groupDescription",
              sql.NVarChar(),
              newDescription.groupDescription
            ).query(`
              UPDATE stuorgGroup
              SET groupDescription = @groupDescription
              WHERE groupId = @groupId
              SELECT *
              FROM stuorgGroup 
              WHERE groupId = @groupId
              `);

          if (result.recordset.length != 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const group = result.recordset[0];
          this.validate(group);

          resolve(group);
        } catch (err) {
          console.log("we are at the error");
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static deleteGroup(userId, groupId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupId", sql.Int(), groupId).query(`
            SELECT *
            FROM stuorgGroup
            WHERE groupId = @groupId
            AND FK_userId = @userId

            DELETE 
            FROM stuorgUserGroup
            WHERE FK_groupId = @groupId

            DELETE 
            FROM stuorgGroup
            WHERE groupId = @groupId
            AND FK_userId = @userId
            `);

          if (result.recordset.length != 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };


          const group = result.recordset[0];

          this.validate(group);

          resolve(group);
        } catch (err) {
          console.log("we are at the error");
          reject(err);
        }
        sql.close();
      })();
    });
  }
}

module.exports = Group;
