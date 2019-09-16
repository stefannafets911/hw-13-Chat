const constants = require('./constants');

// module.exports = {
//     databaseType: constants.POSTGRES,
// };

module.exports = {
    databaseType: constants.MONGO,
    settings: {
        mongo: {
            connectionString: 'mongodb://localhost:27017',
        },
    },
};