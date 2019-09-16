const DAO = require('./dao');
const config = require('../../config');
const mongoose = require('mongoose');
const express = require('express');
const MessageRoute = express.Router();
const messageSchema = new mongoose.Schema({
    message: {type: String, required: true},
    sender: {type: String, required: true},
    receiver: {type: String, required: true},
    date: {type: Number, required: true},
}, {
    collection: 'messages'
});

function MessagesDaoMongoDB() {
    this.connection = null;
    this.model = null;
}

MessagesDaoMongoDB.prototype = Object.create(DAO.prototype);
MessagesDaoMongoDB.prototype.constructor = MessagesDaoMongoDB;
MessagesDaoMongoDB.prototype.initialize = function () {
    if (this.connection) {
        return;
    }
    const url = `${config.settings.mongo.connectionString}/chatDB`;

    mongoose.createConnection(url)
        .then(connection => {
            this.connection = connection;
            this.model = connection.model('message', messageSchema);
        })
        .catch((error) => {
            console.log(error);
        });
};
//
// MessagesDaoMongoDB.prototype.create = async function (object) {
//     const message = this.model(object);
//     await message.save();
//     console.log('saved', message);
// };
//
// MessagesDaoMongoDB.prototype.readByReceiver = async function (receiver) {
//     return await this.model.find({receiver});
// };
//
// MessagesDaoMongoDB.prototype.readBySenderAndReceiver = async function (sender, receiver) {
//     const sent = await this.model.find({sender, receiver});
//     const received = await this.model.find({sender: receiver, receiver: sender});
//     const messages = [...sent, ...received];
//     messages.sort(dynamicSort("date"));
//
//     return messages;
// };
//
// function dynamicSort(property) {
//     let sortOrder = 1;
//
//     if (property[0] === "-") {
//         sortOrder = -1;
//         property = property.substr(1);
//     }
//
//     return function (a, b) {
//         let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
//
//         return result * sortOrder;
//     }
// }

module.exports = MessagesDaoMongoDB;