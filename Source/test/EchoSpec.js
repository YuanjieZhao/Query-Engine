"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var chai = require("chai");
var chaiHttp = require("chai-http");
describe.only("EchoSpec", function () {
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("Test Server", function () {
        chai.use(chaiHttp);
        var server = new Server_1.default(4322);
        var URL = "http://127.0.0.1:4322";
        chai_1.expect(server).to.not.equal(undefined);
        try {
            Server_1.default.echo({}, null, null);
            chai_1.expect.fail();
        }
        catch (err) {
            chai_1.expect(err.message).to.equal("Cannot read property 'json' of null");
        }
        return server.start().then(function (success) {
            return chai.request(URL)
                .get("/");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return chai.request(URL)
                .get("/echo/Hello");
        }).catch(function (err) {
            chai_1.expect.fail();
        }).then(function (res) {
            chai_1.expect(res.status).to.be.equal(200);
            return server.start();
        }).then(function (success) {
            chai_1.expect.fail();
        }).catch(function (err) {
            chai_1.expect(err.code).to.equal('EADDRINUSE');
            return server.stop();
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Should be able to echo", function () {
        var out = Server_1.default.performEcho('echo');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: 'echo...echo' });
    });
    it("Should be able to echo silence", function () {
        var out = Server_1.default.performEcho('');
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(200);
        chai_1.expect(out.body).to.deep.equal({ message: '...' });
    });
    it("Should be able to handle a missing echo message sensibly", function () {
        var out = Server_1.default.performEcho(undefined);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
    it("Should be able to handle a null echo message sensibly", function () {
        var out = Server_1.default.performEcho(null);
        Util_1.default.test(JSON.stringify(out));
        sanityCheck(out);
        chai_1.expect(out.code).to.equal(400);
        chai_1.expect(out.body).to.have.property('error');
        chai_1.expect(out.body).to.deep.equal({ error: 'Message not provided' });
    });
});
//# sourceMappingURL=EchoSpec.js.map