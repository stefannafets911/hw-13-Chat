const DAO = require('./dao');
const config = require('../../config');
const mongoose = require('mongoose');
const express = require('express');
const messageSchema = new mongoose.Schema({
        text: {type: String,required: true},
        sender: {type: String, required: true},
        receiver: {type: String, required: true},
        time: {type: String, required: true},
        type: {type: String, required: true},
    },
    {collection: 'messages'});

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
            console.log('Database messages is connected');
        })
        .catch((error) => {
            console.log('Can not connect to the database' + error);
        });
};
//
MessagesDaoMongoDB.prototype.create = async function (object) {
    const message = this.model(object);
    await message.save();
};

MessagesDaoMongoDB.prototype.readByReceiver = async function (ws) {
    // return await this.model.find({receiver});
    let validate = await this.model.find({receiver: 'all'});
    validate.forEach(message => {
        ws.send(JSON.stringify(message));
    });
};
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