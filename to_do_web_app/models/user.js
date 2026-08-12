const config = require("config");
const con = config.get("dbConfig_UCN");
const sql = require("mssql");
const Joi = require("joi");
const { resolve } = require("path");
const { reject } = require("lodash");


class User {
  constructor(userObj) {
    if (userObj.userId) {
      this.userId = userObj.userId;
    }
    this.email = userObj.email;
    this.userName = userObj.userName;
  }

  static validationSchema() {
    const schema = Joi.object({
      userId: Joi.number().integer().min(1),
      userName: Joi.string().max(255).required(),
      email: Joi.string().max(50).required(),
    });
    return schema;
  }

  static validate(userObj) {
    const schema = User.validationSchema();
    return schema.validate(userObj);
  }

  static createUser(email, userName) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const checkresult = await pool
            .request()
            .input("email", sql.NVarChar(), email).query(`
          SELECT *
            FROM stuorgUser
            WHERE email = @email
          `);

          if (checkresult.recordset.length == 1)
            throw {
              statusCode: 401,
              errorMessage: `user with this email already exists in the database`,
              errorObj: {},
            };

          if (checkresult.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const result = await pool
            .request()
            .input("email", sql.NVarChar(), email)
            .input("userName", sql.NVarChar(), userName).query(`
            INSERT INTO stuorgUser
            ([userName], [email])
            VALUES
            (@userName, @email)

            SELECT *
            FROM stuorgUser
            WHERE userId = SCOPE_IDENTITY()  
            `);

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `user not found, insert failed`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          resolve(result.recordset[0]);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }


  static getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("email", sql.NVarChar(), email).query(`
          SELECT *
            FROM stuorgUser
            WHERE email = @email
          `);
          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `user with this email does not exists in the database`,
              errorObj: {},
            };

          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };

          const user = result.recordset[0];
          this.validate(user);

          resolve(user);
        } catch (err) {
          reject(err);
        }
      })();
    });
  }
}
module.exports = User;
