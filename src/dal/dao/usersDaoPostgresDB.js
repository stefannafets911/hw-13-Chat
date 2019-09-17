const DAO = require('./dao');
const config = require('../../config');
const Pool = require('pg/lib').Pool;
const uuidv1 = require('uuid/v1');

function UsersDaoPostgresDB() {
    this.pool = null;
}

UsersDaoPostgresDB.prototype = Object.create(DAO.prototype);
UsersDaoPostgresDB.prototype.constructor = UsersDaoPostgresDB;

UsersDaoPostgresDB.prototype.initialize = function () {
    if (this.pool) {
        return;
    }

    //try/catch for error connection
    this.pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'test',
        password: 'admin',
        port: 3000,
    });
};

UsersDaoPostgresDB.prototype.create = async function (object) {
    let validate = await this.pool.query('SELECT COUNT(*) FROM users WHERE email = $1', [object.email]);
    console.log(validate.rows[0].count);

    if (validate.rows[0].count == 0){
        await this.pool.query(`INSERT INTO users (id, name, email, password) VALUES ('${uuidv1()}', '${object.name}', '${object.email}', '${object.password}')`);
    }else {

    }
};

UsersDaoPostgresDB.prototype.readUser = async function (email, password) {
    const result =  await this.pool.query('SELECT name FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (result.rowCount > 0){
        let User = {};
        User.name = result.rows[0].name;
        User.email = email;
        return User;
    }else {

    }
};

UsersDaoPostgresDB.prototype.readAll = async function () {
    let result = await this.pool.query('SELECT name, email FROM users');
    if (result.rowCount < 0) {
        throw new Error('error with all users');
    } else {
        return result.rows;
    }

};

module.exports = UsersDaoPostgresDB;