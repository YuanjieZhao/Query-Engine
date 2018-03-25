"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var fs = require("fs");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe("test add and remove dataset for courses", function () {
    var insight;
    var id = "courses";
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
    it("add courses.zip", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("add zip with one course", function () {
        var file = fs.readFileSync("MATH100.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var sectionObj = insight.myDataset[id][0];
            console.log(JSON.stringify(sectionObj, null, 4));
            console.log(JSON.stringify(response));
            chai_1.expect(response).to.equal(InsightFacade_1.response204);
            chai_1.expect(sectionObj.uuid).to.equal(3737);
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
        });
    });
    it("add same zip twice", function () {
        var file = fs.readFileSync("MATH100.zip", "base64");
        return insight.addDataset(id, file).then(function () {
            return insight.addDataset(id, file).then(function (response) {
                chai_1.expect(response).to.equal(InsightFacade_1.response201);
            }).catch(function (err) {
                Util_1.default.error(err);
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
        });
    });
    it("add only one file with valid section", function () {
        console.log(JSON.stringify(insight));
        var file = fs.readFileSync("only_one_file_with_valid_section.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            console.log(JSON.stringify(response));
            chai_1.expect(response.code).to.equal(204);
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
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
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("add zip with no valid course section", function () {
        var file = fs.readFileSync("invalid_no_valid_section.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response400);
        });
    });
    it("test course_year feature of addDataset", function () {
        console.log(JSON.stringify(insight));
        var file = fs.readFileSync("only_one_file_with_valid_section.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var sectionObj0 = insight.myDataset[id][0];
            var sectionObj1 = insight.myDataset[id][1];
            chai_1.expect(sectionObj0.year).to.equal(2015);
            chai_1.expect(sectionObj1.year).to.equal(1900);
        }).catch(function (err) {
            Util_1.default.error(err);
            chai_1.expect.fail();
        });
    });
    it("remove id not existing in myDataSet", function () {
        return insight.removeDataset("cat").then(function (response) {
            Util_1.default.trace(response.toString());
            chai_1.expect.fail();
        }).catch(function (response) {
            chai_1.expect(response).to.equal(InsightFacade_1.response404);
        });
    });
    it("add courses.zip and then remove it twice", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            return insight.removeDataset(id)
                .then(function (response) {
                chai_1.expect(insight.myDataset.hasOwnProperty(id)).to.equal(false);
                chai_1.expect(response).to.equal(InsightFacade_1.response204);
                return insight.removeDataset(id).then(function (response) {
                    chai_1.expect.fail();
                }).catch(function (response) { chai_1.expect(response).to.equal(InsightFacade_1.response404); });
            })
                .catch(function (err) {
                chai_1.expect.fail();
            });
        })
            .catch(function (err) {
        });
    });
});
//# sourceMappingURL=testAddAndRemoveDatasetForCourses.js.map