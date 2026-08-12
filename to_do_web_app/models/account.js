//require needed modules
const config = require("config");
const con = config.get("dbConfig_UCN");
const sql = require("mssql");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const { resolve } = require("path");

class Account {
  constructor(accountObj) {
    if (accountObj.accountId) {
      this.accountId = accountObj.accountId;
    }
    this.userId = accountObj.userId;
    this.email = accountObj.email;
    this.displayName = accountObj.displayName;
    if (accountObj.accountDescription) {
      this.accountDescription = accountObj.accountDescription;
    }
    this.role = {
      roleId: accountObj.role.roleId,
    };
    if (accountObj.role.roleType) {
      this.role.roleType = accountObj.role.roleType;
    }
  }

  static validationSchema() {
    const schema = Joi.object({
      accountId: Joi.number().integer().min(1),
      displayName: Joi.string().max(255).required(),
      email: Joi.string().max(50).required(),
      accountDescription: Joi.string().allow(null),
      userId: Joi.number().integer().min(1),
      role: Joi.object({
        roleId: Joi.number().integer().min(1).required(),
        roleType: Joi.string().max(20),
      }),
    });
    return schema;
  }

  static validate(accountObj) {
    const schema = Account.validationSchema();
    return schema.validate(accountObj);
  }

  static validateCredentials(credentialsObj) {
    const schema = Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(3).required(),
    });
    return schema.validate(credentialsObj);
  }

  static checkCred(credObj) {
    return new Promise((resolve, reject) => {
      (async () => {
        console.log("we are here");
        try {
          console.log("started try and catch bloc");
          const account = await Account.findAccountByUser(credObj.email);
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("accountId", sql.Int(), account.accountId)
            .query(
              `SELECT *
            FROM stuorgPassword p
            WHERE p.FK_accountId = @accountId`
            );
          if (result.recordset.length != 1)
            throw { statusCode: 500, errorMessage: `Corrupt DB`, errorObj: {} };
          const hashedPas = result.recordset[0].hashedPassword;
          const okCred = bcrypt.compareSync(credObj.password, hashedPas);

          if (!okCred)
            throw {
              statusCode: 401,
            };
          resolve(account);
        } catch (err) {
          reject({
            statusCode: 401,
            errorMessage: `Invalid username or password`,
            errorObj: {},
          });
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static findAccountByUser(email) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("email", sql.NVarChar(), email)
            .query(
              `
              SELECT *
              FROM stuorgUser u
              JOIN stuorgAccount a 
              ON u.userId = a.FK_userId
              JOIN stuorgRole r
              ON a.FK_roleId = r.roleId
              WHERE u.email = @email
              `
            );

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt data in DB`,
              errorObj: {},
            };
          if ((result.recordset.length = 1)) {
            console.log(`one result found`);
          }

          const accountWanbe = {
            accountId: result.recordset[0].accountId,
            userId: result.recordset[0].userId,
            email: result.recordset[0].email,
            displayName: result.recordset[0].displayName,
            accountDescription: result.recordset[0].accountDescription,
            role: {
              roleId: result.recordset[0].roleId,
              roleType: result.recordset[0].roleType,
            },
          };

          const { error } = Account.validate(accountWanbe);

          if (error)
            throw {
              statusCode: 500,
              errorMessage: `Corrupted account data in the DB`,
              errorObj: error,
            };

          resolve(new Account(accountWanbe));
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static findAccountById(accountId) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("accountId", sql.Int(), accountId).query(`
          SELECT *
          FROM stuorgAccount ac
            JOIN stuorgRole r
            ON ac.FK_roleId = r.roleId
            INNER JOIN stuorgUser u
            ON ac.FK_userId = u.userId
          WHERE ac.accountId = @accountId
          `);
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt DB, mulitple accounts with accountId: ${accountId}`,
              errorObj: {},
            };
          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found by accountId: ${accountId}`,
              errorObj: {},
            };

          if ((result.recordset.length = 1)) {
            console.log(`one result found`);
          }

          const accountWanbe = {
            accountId: result.recordset[0].accountId,
            userId: result.recordset[0].userId,
            email: result.recordset[0].email,
            displayName: result.recordset[0].displayName,
            accountDescription: result.recordset[0].accountDescription,
            role: {
              roleId: result.recordset[0].roleId,
              roleType: result.recordset[0].roleType,
            },
          };
          const { error } = Account.validate(accountWanbe);
          if (error)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt DB, account does not validate: ${accountWanbe.accountid}`,
              errorObj: error,
            };

          resolve(new Account(accountWanbe));
        } catch (err) {
          reject(err);
        }

        sql.close();
      })();
    });
  }

  static readAll(queryObj) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const response = await pool.request().query(`
            SELECT *
            FROM stuorgAccount
          `);

          if (response.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `no account found in database`,
              errorObj: {},
            };

          let accountArray = [];

          response.recordset.forEach((account) => {
            this.validate(account);
            accountArray.push(account);
          });

          resolve(accountArray);
        } catch (err) {
          reject(err);
        }

        sql.close();
      })();
    });
  }

  static changeDisplayName(userId, displayName) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("displayName", sql.NVarChar(), displayName)
            .input("userId", sql.Int(), userId)
            .query(
              `
              UPDATE stuorgAccount
              SET displayName = @displayName
              WHERE FK_userId = @userId
              SELECT *
              FROM stuorgUser u
              JOIN stuorgAccount a 
              ON u.userId = a.FK_userId
              JOIN stuorgRole r
              ON a.FK_roleId = r.roleId
              WHERE u.userId = @userId
              `
            );

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt data in DB`,
              errorObj: {},
            };
          if ((result.recordset.length = 1)) {
            console.log(`one result found`);
          }

          const accountWanbe = {
            accountId: result.recordset[0].accountId,
            userId: result.recordset[0].userId,
            email: result.recordset[0].email,
            displayName: result.recordset[0].displayName,
            accountDescription: result.recordset[0].accountDescription,
            role: {
              roleId: result.recordset[0].roleId,
              roleType: result.recordset[0].roleType,
            },
          };

          const { error } = Account.validate(accountWanbe);
          console.log("account validated in readByUser function");

          if (error)
            throw {
              statusCode: 500,
              errorMessage: `Corrupted account data in the DB`,
              errorObj: error,
            };

          resolve(new Account(accountWanbe));
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }
  static changeAccountDescription(userId, accountDescription) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const result = await pool
            .request()
            .input("accountDescription", sql.NVarChar(), accountDescription)
            .input("userId", sql.Int(), userId)
            .query(
              `
              UPDATE stuorgAccount
              SET accountDescription = @accountDescription
              WHERE FK_userId = @userId
              SELECT *
              FROM stuorgUser u
              JOIN stuorgAccount a 
              ON u.userId = a.FK_userId
              JOIN stuorgRole r
              ON a.FK_roleId = r.roleId
              WHERE u.userId = @userId
              `
            );

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt data in DB`,
              errorObj: {},
            };
          if ((result.recordset.length = 1)) {
            console.log(`one result found`);
          }

          const accountWanbe = {
            accountId: result.recordset[0].accountId,
            userId: result.recordset[0].userId,
            email: result.recordset[0].email,
            displayName: result.recordset[0].displayName,
            accountDescription: result.recordset[0].accountDescription,
            role: {
              roleId: result.recordset[0].roleId,
              roleType: result.recordset[0].roleType,
            },
          };

          const { error } = Account.validate(accountWanbe);

          if (error)
            throw {
              statusCode: 500,
              errorMessage: `Corrupted account data in the DB`,
              errorObj: error,
            };

          resolve(new Account(accountWanbe));
          console.log("resolved with account");
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static deleteAccount(accountId, userId, email) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const findAccountToDelete = await Account.findAccountByUser(email);

          if (findAccountToDelete.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found`,
              errorObj: {},
            };

          if (findAccountToDelete.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `Corrupt data in DB`,
              errorObj: {},
            };

          resolve(findAccountToDelete.recordset[0]);
        } catch (err) {
          reject(err);
        }
        try {
          const pool = await sql.connect(con);

          const response = await pool
            .request()
            .input("accountId", sql.Int(), accountId)
            .input("userId", sql.Int(), userId).query(`
          DELETE 
          FROM stuorgUserGroup
          WHERE FK_userId = @userId

          DELETE 
          FROM stuorgGroupTask
          WHERE FK_userId = @userId

          DELETE 
          FROM stuorgGroup
          WHERE FK_userId = @userId
          
          DELETE 
          FROM stuorgTask
          WHERE FK_userId = @userId
          
          DELETE 
          FROM stuorgPassword
          WHERE FK_accountId = @accountId

          DELETE 
          FROM stuorgAccount
          WHERE accountId = @accountId

          DELETE 
          FROM stuorgUser
          WHERE userId = @userId

          SELECT *
          FROM stuorgUser u
          JOIN stuorgAccount a 
          ON u.userId = a.FK_userId
          WHERE u.userId = @userId
          `);

          resolve(response.recordset[0]);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  static createAccount(password, userId, userName) {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const pool = await sql.connect(con);
          const checkResult = await pool
            .request()
            .input("userName", sql.NVarChar(), userName)
            .input("userId", sql.Int(), userId).query(`
  
            SELECT *
            FROM stuorgAccount
            WHERE FK_userId = @userId
            `);

          if (checkResult.recordset.length == 1)
            throw {
              statusCode: 401,
              errorMessage: `Account with this userId: ${userId} already exists`,
              errorObj: {},
            };
          if (checkResult.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };
          const result = await pool
            .request()
            .input("userName", sql.NVarChar(), userName)
            .input("userId", sql.Int(), userId).query(`
            INSERT INTO stuorgAccount
            ([displayName],[FK_userId],[FK_roleId])
            VALUES
            (@userName, @userId, 2)
  
            SELECT *
            FROM stuorgAccount a
            JOIN stuorgUser u 
            ON a.FK_userId = u.userId
            JOIN stuorgRole r
            ON a.FK_roleId = r.roleId
            WHERE accountId = SCOPE_IDENTITY()
            `);

          if (result.recordset.length == 0)
            throw {
              statusCode: 404,
              errorMessage: `Account not found, insert failed`,
              errorObj: {},
            };
          if (result.recordset.length > 1)
            throw {
              statusCode: 500,
              errorMessage: `corrupted data in the DB`,
              errorObj: {},
            };
          const recivedAccount = result.recordset[0];
          const accountId = recivedAccount.accountId;

          const hashedPassword = bcrypt.hashSync(password);

          const resultPassword = await pool
            .request()
            .input("password", sql.NVarChar(), hashedPassword)
            .input("accountId", sql.Int(), accountId).query(`
                INSERT INTO stuorgPassword
                ([FK_accountId], [hashedPassword])
                VALUES
                (@accountId, @password)
                `);

          const newAccount = {
            accountId: recivedAccount.accountId,
            displayName: recivedAccount.displayName,
            email: recivedAccount.email,
            accountDescription: recivedAccount.accountDescription,
            userId: recivedAccount.userId,
            role: {
              roleId: recivedAccount.roleId,
              roleType: recivedAccount.roleType,
            },
          };

          Account.validationSchema(newAccount);

          resolve(newAccount);
        } catch (err) {
          reject(err);
        }
        sql.close();
      })();
    });
  }

  update() {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let tmpResult;
          tmpResult = await Account.findAccountById(this.accountId);

          const pool = await sql.connect(con);
          tmpResult = await pool
            .request()
            .input("accountId", sql.Int(), this.accountId)
            .input("roleId", sql.Int(), this.role.roleId)
            .input(
              "accountDescription",
              sql.NVarChar(),
              this.accountDescription
            ).query(`
                    UPDATE stuorgAccount
                    SET FK_roleId = @roleId, accountDescription = @accountDescription
                    WHERE accountId = @accountId
                `);

          sql.close();

          const account = await Account.findAccountById(this.accountId);

          resolve(account);
        } catch (err) {
          reject(err);
        }

        sql.close();
      })();
    });
  }
}

module.exports = Account;
