const DAO = require('./dao');
const config = require('../../config');
const Pool = require('pg/lib').Pool;

function MessagesDaoPostgresDB() {
    this.pool = null;
}

MessagesDaoPostgresDB.prototype = Object.create(DAO.prototype);
MessagesDaoPostgresDB.prototype.constructor = MessagesDaoPostgresDB;
MessagesDaoPostgresDB.prototype.initialize = function () {
    if (this.pool) {
        return;
    }

    this.pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'test',
        password: 'admin',
        port: 3000,
    });
};

MessagesDaoPostgresDB.prototype.readByReceiver = async function (ws) {
    let validate = await this.pool.query('SELECT * FROM message ORDER BY time');
    validate.rows.forEach(message => {
        ws.send(JSON.stringify(message));
    });
};

MessagesDaoPostgresDB.prototype.create = async function (object) {
    await this.pool.query(`INSERT INTO message (time, receiver, sender, text, type) VALUES ('${object.time}', 'receiver', '${object.user}', '${object.text}', '${object.type}')`);
};
module.exports = MessagesDaoPostgresDB;