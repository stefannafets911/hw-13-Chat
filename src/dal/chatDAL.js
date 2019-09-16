const constants = require('../constants');
const UsersDaoMongoDB = require('./dao/usersDaoMongoDB');
const UsersDaoPostgresDB = require('./dao/usersDaoPostgresDB');
const MessagesDaoMongoDB = require('./dao/messagesDaoMongoDB');
const MessagesDaoPostgresDB = require('./dao/messagesDaoPostgresDB');
const config = require('../config');

function ChatDAL() {
    this.messagesDAO = null;
    this.usersDAO = null;
}
ChatDAL.prototype.initialize = function () {
    this.messagesDAO = this.createMessagesDAO();
    this.messagesDAO.initialize();

    this.usersDAO = this.createUsersDAO();
    this.usersDAO.initialize();
};
ChatDAL.prototype.createMessagesDAO = function() {
    switch (config.databaseType) {
        case constants.MONGO:
            return new MessagesDaoMongoDB();
        case constants.POSTGRES:
            return new MessagesDaoPostgresDB();
        default:
            throw new Error('unknown databaseType');
    }
};
ChatDAL.prototype.createUsersDAO = function() {
    switch (config.databaseType) {
        case constants.MONGO:
            return new UsersDaoMongoDB();
        case constants.POSTGRES:
            return new UsersDaoPostgresDB();
        default:
            throw new Error('unknown databaseType');
    }
};
ChatDAL.prototype.readPublicMessages = async function (ws) {
    return await this.messagesDAO.readByReceiver(ws);
};
ChatDAL.prototype.readPrivateMessages = async function (sender, receiver) {
    return await this.messagesDAO.readBySenderAndReceiver(sender, receiver);
};
ChatDAL.prototype.createMessage = async function (message) {
    await this.messagesDAO.create(message);
};
ChatDAL.prototype.readAllUsers = async function () {
    return await this.usersDAO.readAll()
};
ChatDAL.prototype.createUser = async function (user) {
    await this.usersDAO.create(user);
};
ChatDAL.prototype.read = async function (user) {
    return await this.usersDAO.read(user);
};
ChatDAL.prototype.readUser = async function (email, password) {
    return await this.usersDAO.readUser(email, password);
};
ChatDAL.prototype.readUserToId = async function (id) {
    return await this.usersDAO.readUserToId(id);
};
ChatDAL.prototype.mergeMessageAndUser = function (messages, users) {
    const chat = [];

    for (let i = 0; i < messages.length; i++) {
        for (let j = 0; j < users.length; j++) {
            if(users[j]._id == messages[i].sender) {
                const message = {
                    message: messages[i].message,
                    date: messages[i].date,
                    name: users[j].name,
                    email: users[j].email
                };

                chat.push(message);
            }
        }
    }

    return chat;
};

module.exports = ChatDAL;