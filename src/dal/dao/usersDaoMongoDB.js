const DAO = require('./dao');
const config = require('../../config');
const mongoose = require('mongoose');
const express = require('express');
const UserRoute = express.Router();

const userSchema = new mongoose.Schema({
        name: {type: String, required: true},
        email: {type: String, unique: true, required: true},
        password: {type: String, required: true},
        isActive: {type: Boolean}
    },
    {collection: 'users'});

function UsersDaoMongoDB() {
    this.connection = null;
    this.model = null;
}

UsersDaoMongoDB.prototype = Object.create(DAO.prototype);
UsersDaoMongoDB.prototype.constructor = UsersDaoMongoDB;
UsersDaoMongoDB.prototype.initialize = function () {
    if (this.connection) {
        return;
    }
    const url = `${config.settings.mongo.connectionString}/chatDB`;

    mongoose.createConnection(url, {useNewUrlParser: true})
        .then(connection => {
            this.connection = connection;
            this.model = connection.model('user', userSchema);
            console.log('Database is connected');
        })
        .catch((error) => {
            console.log('Can not connect to the database' + error);
        });
};

UsersDaoMongoDB.prototype.create = async function (object) {
    const user = this.model(object);
    await user.save();
    console.log('saved', user);
};

UsersDaoMongoDB.prototype.readAll = async function () {
    return await this.model.find({});
};

UsersDaoMongoDB.prototype.readUser = async function (email, password) {
    return await this.model.findOne({email, password});
};

UsersDaoMongoDB.prototype.readUserToId = async function (id) {
    return await this.model.find({_id: id});
};

module.exports = UsersDaoMongoDB;