var World, chai, chaiAsPromised;
chai = require('chai');
chaiAsPromised = require('chai-as-promised');

World = function World() {
    chai.use(chaiAsPromised);
    this.expect = chai.expect;
};

module.exports.World = World;