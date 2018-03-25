"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var fs = require("fs");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe("testAddAndRemoveDatasetForRooms", function () {
    var insight;
    var id = "rooms";
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    function resetDataset() {
        if (insight.myDataset.hasOwnProperty(id)) {
            delete insight.myDataset[id];
        }
        if (fs.existsSync(id + ".json")) {
            fs.unlinkSync(id + ".json");
        }
        if (!(insight.myDataset.hasOwnProperty(id)) && !(fs.existsSync(id + ".json"))) {
            Util_1.default.info("BeforeTest: dataset is reset");
        }
        else {
            Util_1.default.info("BeforeTest: dataset is NOT reset !!!");
        }
    }
    before(function () {
        insight = new InsightFacade_1.default();
        Util_1.default.test('Before: ' + this.test.parent.title);
    });
    beforeEach(function () {
        Util_1.default.test('BeforeTest: ' + this.currentTest.title);
        resetDataset();
    });
    after(function () {
        Util_1.default.test('After: ' + this.test.parent.title);
    });
    afterEach(function () {
        Util_1.default.test('AfterTest: ' + this.currentTest.title);
    });
    it("addDataset invalid id", function () {
        var file = fs.readFileSync("corrupt_zip.zip", "base64");
        return insight.addDataset("cat", file).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add rooms_no_valid_room_obj.zip", function () {
        var file = fs.readFileSync("rooms_no_valid_room_obj.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add corrupted zip", function () {
        var file = fs.readFileSync("corrupt_zip.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add empty zip", function () {
        var file = fs.readFileSync("invalid_empty_zip.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            Util_1.default.error(response.toString());
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add zip only has index html", function () {
        var file = fs.readFileSync("rooms_only_has_index_html.zip", "base64");
        return insight.addDatasetForRooms(id, file).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add rooms_few_files.zip", function () {
        var file = fs.readFileSync("rooms_few_files.zip", "base64");
        return insight.addDatasetForRooms(id, file).then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
        }).catch(function (response) {
            Util_1.default.error(JSON.stringify(response));
            chai_1.expect.fail();
        });
    });
    it("add rooms zip", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
            chai_1.expect(insight.myDataset[id].length).to.equal(364);
        }).catch(function (response) {
            Util_1.default.error(JSON.stringify(response));
            chai_1.expect.fail();
        });
    });
    it("addDataset twice", function () {
        var file = fs.readFileSync("rooms_one_file.zip", "base64");
        return insight.addDataset(id, file)
            .then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
            return insight.addDataset(id, file)
                .then(function (response) {
                Util_1.default.info(JSON.stringify(insight));
                chai_1.expect(response).to.equal(InsightFacade_1.response201);
            })
                .catch(function (response) {
                Util_1.default.error(JSON.stringify(response));
                chai_1.expect.fail();
            });
        }).catch(function (response) {
            Util_1.default.error(JSON.stringify(response));
            chai_1.expect.fail();
        });
    });
    it("add rooms_one_file.zip", function () {
        var file = fs.readFileSync("rooms_one_file.zip", "base64");
        return insight.addDataset(id, file)
            .then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
        }).catch(function (response) {
            Util_1.default.error(JSON.stringify(response));
            chai_1.expect.fail();
        });
    });
    it("add rooms_one_room_with_invalid_address_for_latlon.zip", function () {
        var file = fs.readFileSync("rooms_one_room_with_invalid_address_for_latlon.zip", "base64");
        return insight.addDataset(id, file)
            .then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
        }).catch(function (response) {
            Util_1.default.error(JSON.stringify(response));
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=testAddAndRemoveDatasetForRooms.js.map