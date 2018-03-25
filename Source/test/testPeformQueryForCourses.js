"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var fs = require("fs");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe("test performQuery for courses", function () {
    var insight;
    var id = "courses";
    function sanityCheck(response) {
        chai_1.expect(response).to.have.property('code');
        chai_1.expect(response).to.have.property('body');
        chai_1.expect(response.code).to.be.a('number');
    }
    function checkResults(first, second) {
        if (first.length !== second.length) {
            chai_1.expect.fail("length different");
        }
        chai_1.expect(first).to.deep.include.members(second);
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
    it("simple query for d1??", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_avg": 98.5 } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "nurs", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.58, "courses_instructor": "grow, laura" }, { "courses_dept": "epse", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "nurs", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.7, "courses_instructor": "cole, kenneth" }, { "courses_dept": "nurs", "courses_avg": 98.71, "courses_instructor": "" }, { "courses_dept": "nurs", "courses_avg": 98.71, "courses_instructor": "brew, nancy" }, { "courses_dept": "eece", "courses_avg": 98.75, "courses_instructor": "" }, { "courses_dept": "eece", "courses_avg": 98.75, "courses_instructor": "coria, lino" }, { "courses_dept": "epse", "courses_avg": 98.76, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.76, "courses_instructor": "grow, laura" }, { "courses_dept": "epse", "courses_avg": 98.8, "courses_instructor": "grow, laura" }, { "courses_dept": "spph", "courses_avg": 98.98, "courses_instructor": "" }, { "courses_dept": "spph", "courses_avg": 98.98, "courses_instructor": "frank, erica" }, { "courses_dept": "cnps", "courses_avg": 99.19, "courses_instructor": "cox, daniel" }, { "courses_dept": "math", "courses_avg": 99.78, "courses_instructor": "" }, { "courses_dept": "math", "courses_avg": 99.78, "courses_instructor": "gomez, jose" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                console.log(iserr);
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("simple query for course_year=========", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_year": 2017 } }, "OPTIONS": { "COLUMNS": ["courses_year"], "ORDER": "courses_year" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid EBNF", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_avg": 98.5 } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDERo": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            console.log("==========2===========");
            chai_1.expect.fail();
        });
    });
    it("Complext query", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "OR": [{ "AND": [{ "GT": { "courses_avg": 90 } }, { "IS": { "courses_dept": "adhe" } }] }, { "EQ": { "courses_avg": 95 } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_id", "courses_avg"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "adhe", "courses_id": "329", "courses_avg": 90.02 }, { "courses_dept": "adhe", "courses_id": "412", "courses_avg": 90.16 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 90.17 }, { "courses_dept": "adhe", "courses_id": "412", "courses_avg": 90.18 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 90.5 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 90.72 }, { "courses_dept": "adhe", "courses_id": "329", "courses_avg": 90.82 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 90.85 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 91.29 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 91.33 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 91.33 }, { "courses_dept": "adhe", "courses_id": "330", "courses_avg": 91.48 }, { "courses_dept": "adhe", "courses_id": "329", "courses_avg": 92.54 }, { "courses_dept": "adhe", "courses_id": "329", "courses_avg": 93.33 }, { "courses_dept": "rhsc", "courses_id": "501", "courses_avg": 95 }, { "courses_dept": "bmeg", "courses_id": "597", "courses_avg": 95 }, { "courses_dept": "bmeg", "courses_id": "597", "courses_avg": 95 }, { "courses_dept": "cnps", "courses_id": "535", "courses_avg": 95 }, { "courses_dept": "cnps", "courses_id": "535", "courses_avg": 95 }, { "courses_dept": "cpsc", "courses_id": "589", "courses_avg": 95 }, { "courses_dept": "cpsc", "courses_id": "589", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "crwr", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "sowk", "courses_id": "570", "courses_avg": 95 }, { "courses_dept": "econ", "courses_id": "516", "courses_avg": 95 }, { "courses_dept": "edcp", "courses_id": "473", "courses_avg": 95 }, { "courses_dept": "edcp", "courses_id": "473", "courses_avg": 95 }, { "courses_dept": "epse", "courses_id": "606", "courses_avg": 95 }, { "courses_dept": "epse", "courses_id": "682", "courses_avg": 95 }, { "courses_dept": "epse", "courses_id": "682", "courses_avg": 95 }, { "courses_dept": "kin", "courses_id": "499", "courses_avg": 95 }, { "courses_dept": "kin", "courses_id": "500", "courses_avg": 95 }, { "courses_dept": "kin", "courses_id": "500", "courses_avg": 95 }, { "courses_dept": "math", "courses_id": "532", "courses_avg": 95 }, { "courses_dept": "math", "courses_id": "532", "courses_avg": 95 }, { "courses_dept": "mtrl", "courses_id": "564", "courses_avg": 95 }, { "courses_dept": "mtrl", "courses_id": "564", "courses_avg": 95 }, { "courses_dept": "mtrl", "courses_id": "599", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "musc", "courses_id": "553", "courses_avg": 95 }, { "courses_dept": "nurs", "courses_id": "424", "courses_avg": 95 }, { "courses_dept": "nurs", "courses_id": "424", "courses_avg": 95 }, { "courses_dept": "obst", "courses_id": "549", "courses_avg": 95 }, { "courses_dept": "psyc", "courses_id": "501", "courses_avg": 95 }, { "courses_dept": "psyc", "courses_id": "501", "courses_avg": 95 }, { "courses_dept": "econ", "courses_id": "516", "courses_avg": 95 }, { "courses_dept": "adhe", "courses_id": "329", "courses_avg": 96.11 }], isresponse.body["result"]);
            }).catch(function (er) {
                console.log("===============222222222222===============");
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Partial name", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "IS": { "courses_instructor": "*estwood*" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "cnps", "courses_avg": 80.93, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 81.77, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 84.21, "courses_instructor": "olson, trevor;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 84.55, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 84.82, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 85, "courses_instructor": "tavormina, ezula ;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 85.08, "courses_instructor": "koert, emily;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 85.92, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 86, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 86, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 86.33, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 86.5, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 86.67, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.09, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.2, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.4, "courses_instructor": "nitkin, patricia;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.53, "courses_instructor": "klubben, laura;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.73, "courses_instructor": "mccullough, lucy;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 87.93, "courses_instructor": "klubben, laura;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 88.29, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 88.4, "courses_instructor": "westwood, marvin;wiens, sandra" }, { "courses_dept": "cnps", "courses_avg": 88.5, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 88.56, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 88.86, "courses_instructor": "nitkin, patricia;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 89.15, "courses_instructor": "nitkin, patricia;westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 89.31, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 89.44, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 89.62, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 89.71, "courses_instructor": "westwood, marvin" }, { "courses_dept": "cnps", "courses_avg": 91.18, "courses_instructor": "westwood, marvin" }], isresponse.body["result"]);
            }).catch(function (er) {
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Partial name 2", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "AND": [{ "IS": { "courses_dept": "asia" } }, { "IS": { "courses_instructor": "c*" } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_instructor"] } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "citizen, robyn" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chen, jinhua" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }, { "courses_dept": "asia", "courses_instructor": "chiu-duke, josephine" }], isresponse.body["result"]);
            }).catch(function (er) {
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Partial name 3", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "IS": { "courses_instructor": "*mid" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "math", "courses_avg": 56.96, "courses_instructor": "usefi, hamid" }, { "courses_dept": "math", "courses_avg": 69.03, "courses_instructor": "usefi, hamid" }, { "courses_dept": "math", "courses_avg": 69.37, "courses_instructor": "zangeneh, hamid" }, { "courses_dept": "elec", "courses_avg": 70.68, "courses_instructor": "atighechi, hamid" }, { "courses_dept": "mtrl", "courses_avg": 74.9, "courses_instructor": "azizi-alizamini, hamid" }, { "courses_dept": "mtrl", "courses_avg": 76, "courses_instructor": "azizi-alizamini, hamid" }, { "courses_dept": "mtrl", "courses_avg": 78.64, "courses_instructor": "azizi-alizamini, hamid" }, { "courses_dept": "mtrl", "courses_avg": 79.17, "courses_instructor": "azizi-alizamini, hamid" }, { "courses_dept": "mtrl", "courses_avg": 81.53, "courses_instructor": "azizi-alizamini, hamid" }, { "courses_dept": "mtrl", "courses_avg": 84.05, "courses_instructor": "azizi-alizamini, hamid" }], isresponse.body["result"]);
            }).catch(function (er) {
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("Partial name 4", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "OR": [{ "IS": { "courses_instructor": "eastwood*" } }, { "IS": { "courses_instructor": "*selena*" } }] }, "OPTIONS": { "COLUMNS": ["courses_instructor"], "ORDER": "courses_instructor" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_instructor": "couture, selena" }, { "courses_instructor": "couture, selena" }, { "courses_instructor": "couture, selena" }, { "courses_instructor": "eastwood, terence m" }], isresponse.body["result"]);
            }).catch(function (er) {
                chai_1.expect.fail();
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_avg": "d" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("complex query2", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "OR": [{ "AND": [{ "LT": { "courses_avg": 90 } }, { "IS": { "courses_dept": "adhe" } }] }, { "EQ": { "courses_avg": 95 } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_id", "courses_audit"], "ORDER": "courses_audit" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "328", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "329", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "327", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "330", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "psyc", "courses_id": "501", "courses_audit": 0 }, { "courses_dept": "psyc", "courses_id": "501", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 0 }, { "courses_dept": "bmeg", "courses_id": "597", "courses_audit": 0 }, { "courses_dept": "bmeg", "courses_id": "597", "courses_audit": 0 }, { "courses_dept": "obst", "courses_id": "549", "courses_audit": 0 }, { "courses_dept": "nurs", "courses_id": "424", "courses_audit": 0 }, { "courses_dept": "cpsc", "courses_id": "589", "courses_audit": 0 }, { "courses_dept": "cpsc", "courses_id": "589", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "crwr", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "nurs", "courses_id": "424", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "edcp", "courses_id": "473", "courses_audit": 0 }, { "courses_dept": "edcp", "courses_id": "473", "courses_audit": 0 }, { "courses_dept": "epse", "courses_id": "606", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "kin", "courses_id": "499", "courses_audit": 0 }, { "courses_dept": "kin", "courses_id": "500", "courses_audit": 0 }, { "courses_dept": "kin", "courses_id": "500", "courses_audit": 0 }, { "courses_dept": "math", "courses_id": "532", "courses_audit": 0 }, { "courses_dept": "math", "courses_id": "532", "courses_audit": 0 }, { "courses_dept": "mtrl", "courses_id": "564", "courses_audit": 0 }, { "courses_dept": "mtrl", "courses_id": "564", "courses_audit": 0 }, { "courses_dept": "mtrl", "courses_id": "599", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "musc", "courses_id": "553", "courses_audit": 0 }, { "courses_dept": "sowk", "courses_id": "570", "courses_audit": 0 }, { "courses_dept": "cnps", "courses_id": "535", "courses_audit": 1 }, { "courses_dept": "cnps", "courses_id": "535", "courses_audit": 1 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 1 }, { "courses_dept": "adhe", "courses_id": "412", "courses_audit": 1 }, { "courses_dept": "econ", "courses_id": "516", "courses_audit": 2 }, { "courses_dept": "econ", "courses_id": "516", "courses_audit": 2 }, { "courses_dept": "rhsc", "courses_id": "501", "courses_audit": 4 }, { "courses_dept": "epse", "courses_id": "682", "courses_audit": 9 }, { "courses_dept": "epse", "courses_id": "682", "courses_audit": 9 }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("complex query3", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "OR": [{ "AND": [{ "LT": { "courses_avg": 90 } }, { "IS": { "courses_dept": "adhe" } }, { "LT": { "courses_pass": 90 } }, { "LT": { "courses_fail": 90 } }, { "LT": { "courses_audit": 90 } }, { "IS": { "courses_uuid": "adhe" } }, { "IS": { "courses_title": "adhe" } }, { "IS": { "courses_id": "adhe" } }] }, { "EQ": { "courses_audit": 95 } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_id", "courses_audit"], "ORDER": "courses_audit" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("complex query4", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "OR": [{ "AND": [{ "LT": { "courses_avg": 90 } }, { "IS": { "courses_dept": "adhe" } }, { "LT": { "courses_pass": 90 } }, { "LT": { "courses_fail": 90 } }, { "LT": { "courses_audit": 90 } }, { "IS": { "courses_uuid": "adhe" } }, { "IS": { "courses_title": "adhe" } }, { "IS": { "courses_id": "adhe" } }] }, { "EQ": { "courses_audit": 95 } }] }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_id", "courses_audit", "courses_title", "courses_uuid", "courses_pass", "courses_fail"], "ORDER": "courses_audit" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("simple query0", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_fail": 280 } }, "OPTIONS": { "COLUMNS": ["courses_id", "courses_title", "courses_pass", "courses_fail", "courses_uuid", "courses_audit"], "ORDER": "courses_id" } };
            return insight.performQuery(query).then(function (isresponse) {
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid EBNF1", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "GT": { "courses_avg": "asdf" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDERo": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            console.log("==========2===========");
            chai_1.expect.fail();
        });
    });
    it("invalid EBNF2", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "EQ": { "courses_avg": "asdf" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDERo": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            console.log("==========2===========");
            chai_1.expect.fail();
        });
    });
    it("invalid EBNF3", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "IS": { "sdfafs": "sdfasdf" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDERo": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            console.log("==========2===========");
            chai_1.expect.fail();
        });
    });
    it("invalid EBNF3", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "ISsdsf": { "sdfafs": "sdfasdf" } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDERo": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            console.log("==========2===========");
            chai_1.expect.fail();
        });
    });
    it("not simple query", function () {
        var file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = { "WHERE": { "NOT": { "NOT": { "GT": { "courses_avg": 98.5 } } } }, "OPTIONS": { "COLUMNS": ["courses_dept", "courses_avg", "courses_instructor"], "ORDER": "courses_avg" } };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "courses_dept": "nurs", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.58, "courses_instructor": "grow, laura" }, { "courses_dept": "epse", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "nurs", "courses_avg": 98.58, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.7, "courses_instructor": "cole, kenneth" }, { "courses_dept": "nurs", "courses_avg": 98.71, "courses_instructor": "" }, { "courses_dept": "nurs", "courses_avg": 98.71, "courses_instructor": "brew, nancy" }, { "courses_dept": "eece", "courses_avg": 98.75, "courses_instructor": "" }, { "courses_dept": "eece", "courses_avg": 98.75, "courses_instructor": "coria, lino" }, { "courses_dept": "epse", "courses_avg": 98.76, "courses_instructor": "" }, { "courses_dept": "epse", "courses_avg": 98.76, "courses_instructor": "grow, laura" }, { "courses_dept": "epse", "courses_avg": 98.8, "courses_instructor": "grow, laura" }, { "courses_dept": "spph", "courses_avg": 98.98, "courses_instructor": "" }, { "courses_dept": "spph", "courses_avg": 98.98, "courses_instructor": "frank, erica" }, { "courses_dept": "cnps", "courses_avg": 99.19, "courses_instructor": "cox, daniel" }, { "courses_dept": "math", "courses_avg": 99.78, "courses_instructor": "" }, { "courses_dept": "math", "courses_avg": 99.78, "courses_instructor": "gomez, jose" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=testPeformQueryForCourses.js.map