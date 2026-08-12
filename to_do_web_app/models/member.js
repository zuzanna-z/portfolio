const config = require("config");
const con = config.get("dbConfig_UCN");
const sql = require("mssql");
const Joi = require("joi");
const { reject } = require("lodash");
const { group } = require("console");
const { resolve } = require("path");

class Member {
  constructor(memberObj) {
    this.groupId = memberObj.groupId;
    this.userId = memberObj.userId;
  }

  static validationSchema() {
    const schema = Joi.object({
      groupId: Joi.number().integer().min(1),
      userId: Joi.number().integer().min(1),
    });
    return schema;
  }

  static validate(memberObj) {
    const schema = Member.validationSchema();
    return schema.validate(memberObj);
  }

  static assignMember(groupId, userId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const resultExistsCheck = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupId", sql.Int(), groupId).query(`
            SELECT *
            FROM stuorgUserGroup
            WHERE FK_groupId = @groupId
            AND FK_userId = @userId
            `);

          if (resultExistsCheck.recordset.length == 1)
            throw {
              statusCode: 401,
              errorMessage: `user already exists in the group`,
              errorObj: {},
            };
          if (resultExistsCheck.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the database`,
              errorObj: {},
            };

          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupId", sql.Int(), groupId).query(`
            INSERT INTO stuorgUserGroup
            ([FK_groupId], [FK_userId])
            VALUES
            (@groupId, @userId)
            SELECT g.groupName, u.userName
            FROM stuorgUserGroup ug
            JOIN stuorgUser u
            ON ug.FK_userId = u.userId
            JOIN stuorgGroup g
            ON ug.FK_groupId = g.groupId
            WHERE ug.FK_userId = @userId
            AND ug.FK_groupId = @groupId       
            `);

          if (result.recordset.length == 0)
            throw {
              statusCode: 500,
              errorMessage: `insert failed`,
              errorObj: {},
            };

          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };


          const member = result.recordset[0];
          this.validate(member);
          resolve(member);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static getAllGroupMembers(groupId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("groupId", sql.Int(), groupId).query(`
                SELECT u.userName, u.email, u.userId, g.groupId, g.groupName, g.FK_userId
                FROM stuorgUserGroup ug
                JOIN stuorgUser u
                ON ug.FK_userId = u.userId
                JOIN stuorgGroup g
                ON ug.FK_groupId = g.groupId
                WHERE FK_groupId = @groupId
                `);


          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no members found for this groupId: ${groupId}`,
              errorObj: {},
            };

          const userSchema = Joi.object({
            groupId: Joi.number().integer().min(1),
            FK_userId: Joi.number().integer().min(1),
            userId: Joi.number().integer().min(1),
            groupName: Joi.string(),
            userName: Joi.string(),
            email: Joi.string(),
          });

          let membersArray = [];
          result.recordset.forEach((member) => {
            if (member.userId != member.FK_userId) {
              userSchema.validate(member);
              const memberObj = {
                userName: member.userName,
                email: member.email,
              };
              membersArray.push(memberObj);
            }
          });

          const responseObj = {
            groupName: result.recordset[0].groupName,
            groupId: result.recordset[0].groupId,
            groupMembers: membersArray,
          };

          const responseobjSchema = Joi.object({
            groupName: Joi.string(),
            groupId: Joi.number().integer().min(1),
            groupMembers: Joi.array(),
          });

          responseobjSchema.validate(responseObj);


          resolve(responseObj);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static leaveGroup(groupId, userId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupId", sql.Int(), groupId).query(`
          SELECT g.groupName, ug.FK_userId
          FROM stuorgUserGroup ug
          JOIN stuorgGroup g
          ON ug.FK_groupId = g.groupId
          WHERE ug.FK_groupId = @groupId
          AND ug.FK_userId = @userId
          
          DELETE 
          FROM stuorgUserGroup
          WHERE FK_groupId = @groupId
          AND FK_userId = @userId
          `);


          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no userId: ${userId} found for this groupId: ${groupId}`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const deletedMember = result.recordset[0];
          resolve(deletedMember);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
  static removeMember(userId, groupId, email) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const Adminresult = await pool
            .request()
            .input("userId", sql.Int(), userId)
            .input("groupId", sql.Int(), groupId).query(`
          SELECT g.groupName, g.FK_userId
          FROM stuorgUserGroup ug
          JOIN stuorgGroup g
          ON ug.FK_groupId = g.groupId
          WHERE ug.FK_groupId = @groupId
          AND ug.FK_userId = @userId
          `);


          if (Adminresult.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no userId: ${userId} found for this groupId: ${groupId}`,
              errorObj: {},
            };
          if (Adminresult.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const emailResult = await pool
            .request()
            .input("email", sql.NVarChar(), email).query(`
          SELECT userId
          FROM stuorgUser
          WHERE email = @email
          `);


          if (emailResult.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no userId found for this email: ${email}`,
              errorObj: {},
            };
          if (emailResult.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };


          if (Adminresult.recordset[0].FK_userId == delUserId)
            throw {
              statusCode: 500,
              errorMessage: `cannot remove admin`,
              errorObj: {},
            };

          const result = await pool
            .request()
            .input("email", sql.NVarChar(), email)
            .input("groupId", sql.Int(), groupId)
            .input("userId", sql.Int(), delUserId).query(`
          SELECT g.groupName, ug.FK_userId
          FROM stuorgUserGroup ug
          JOIN stuorgGroup g
          ON ug.FK_groupId = g.groupId
          WHERE ug.FK_groupId = @groupId
          AND ug.FK_userId = @userId
          
          DELETE 
          FROM stuorgUserGroup
          WHERE FK_groupId = @groupId
          AND FK_userId = @userId
          `);


          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no userId: ${userId} found for this groupId: ${groupId}`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const deletedMember = result.recordset[0];
          resolve(deletedMember);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static getAllMemberships(userId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool.request().input("userId", sql.Int(), userId)
            .query(`
      SELECT g.groupId, u.userName, g.groupName, g.groupDescription, g.FK_userId
      FROM stuorgUserGroup ug
      JOIN stuorgGroup g
      ON ug.FK_groupId = g.groupId
      JOIN stuorgUser u
      ON g.FK_userId = u.userId
      WHERE ug.FK_userId = @userId
      `);

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no group found for this userId: ${userId}`,
              errorObj: {},
            };

          let membership = [];
          result.recordset.forEach((group) => {
            this.validate(group);
            membership.push(group);
          });

          resolve(membership);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
}

module.exports = Member;
