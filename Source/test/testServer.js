"use strict";
var Server_1 = require("../src/rest/Server");
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var chai = require("chai");
var chaiHttp = require("chai-http");
var fs = require("fs");
var local_url = "http://localhost:4321";
describe.only("test Server", function () {
    var server = new Server_1.default(4321);
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    before(function () {
        Util_1.default.test('Before: ' + this.test.parent.title);
        chai.use(chaiHttp);
        return server.start();
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
        var file1 = "rooms.json";
        var file2 = "courses.json";
        try {
            if (fs.existsSync(file1)) {
                fs.unlinkSync(file1);
            }
            if (fs.existsSync(file2)) {
                fs.unlinkSync(file2);
            }
        }
        catch (err) {
        }
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
        return server.stop();
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("DELETE request for non-existing dataset", function () {
        return chai.request(local_url)
            .del('/dataset/rooms')
            .then(function (res) {
            Util_1.default.trace('then:' + JSON.stringify(res));
            chai_1.expect.fail();
        }).catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect(err.status).to.equal(404);
        });
    });
    it("DELETE request for existing dataset", function () {
        var filename = "rooms_one_file.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            return chai.request(local_url)
                .del('/dataset/rooms')
                .then(function (res) {
                chai_1.expect(res.status).to.equal(204);
            }).catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
    it("PUT request", function () {
        var filename = "rooms_one_file.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
    it("PUT request with invalid resource id", function () {
        var filename = "rooms_one_file.zip";
        return chai.request(local_url)
            .put('/dataset/dog')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect(err.status).to.equal(400);
        });
    });
    it("PUT request twice for same dataset id", function () {
        var filename = "rooms_one_file.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('outer then:');
            chai_1.expect(res.status).to.equal(204);
            return chai.request(local_url)
                .put('/dataset/rooms')
                .attach("body", fs.readFileSync(filename), filename)
                .then(function (res) {
                Util_1.default.trace('inner then:');
                chai_1.expect(res.status).to.equal(201);
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
    it("PUT request twice for different dataset id", function () {
        var filename1 = "rooms_one_file.zip";
        var filename2 = "courses.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename1), filename1)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            return chai.request(local_url)
                .put('/dataset/courses')
                .attach("body", fs.readFileSync(filename2), filename2)
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.equal(204);
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
    it("POST request with invalid query for existing dataset", function () {
        var filename = "rooms.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            var invalidQueryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_namejj"], "ORDER": "rooms_name" } };
            return chai.request(local_url)
                .post('/query')
                .send(invalidQueryJSONObject)
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect.fail();
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect(err.status).to.equal(400);
            });
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
    it("POST request with valid query for non-existing dataset", function () {
        var queryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_name"], "ORDER": "rooms_name" } };
        return chai.request(local_url)
            .post('/query')
            .send(queryJSONObject)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect.fail();
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect(err.status).to.equal(424);
        });
    });
    it("POST request with valid query for existing dataset", function () {
        var filename = "rooms.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res) {
            Util_1.default.trace('then:');
            chai_1.expect(res.status).to.equal(204);
            var queryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": ["rooms_name"], "ORDER": "rooms_name" } };
            return chai.request(local_url)
                .post('/query')
                .send(queryJSONObject)
                .then(function (res) {
                Util_1.default.trace('then:');
                chai_1.expect(res.status).to.equal(200);
            })
                .catch(function (err) {
                Util_1.default.trace('catch:');
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
            Util_1.default.trace('catch:');
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=testServer.js.map