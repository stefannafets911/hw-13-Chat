function DAO() {
}
DAO.prototype.initialize = function() {
    throw new Error('not implemented method');
};
DAO.prototype.readAll = function() {
    throw new Error('not implemented method');
};
DAO.prototype.create = function (object) {
    throw new Error('not implemented method');
};

module.exports = DAO;