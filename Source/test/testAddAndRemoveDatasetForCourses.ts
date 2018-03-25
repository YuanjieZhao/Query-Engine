import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import fs = require("fs");
import InsightFacade, {
    response201, response204, response400, response404,
    Section
} from "../src/controller/InsightFacade";


describe("test add and remove dataset for courses", function () {
    var insight : InsightFacade;
    const id : string = "courses"; // argument passed to id parameter in addDataset and removeDataset for all test cases in this file

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

/* Archive: buggy code  1. insight.hasOwnProperty(id) is wrong 2. insight.myDataset.hasOwnProperty(id) doesn't cover all possible condition
    function resetDataset(){
        if (insight.hasOwnProperty(id)){
            try {
                fs.statSync(id + ".json");
                fs.unlinkSync(id + ".json");
                delete insight.myDataset[id];
            } catch (err){
                Log.error(err);
            }
        }
    }
*/

    function resetDataset(){
        if (insight.myDataset.hasOwnProperty(id)){
            delete insight.myDataset[id];
        }

        if (fs.existsSync(id + ".json")){
            fs.unlinkSync(id + ".json");
        }

        if (!(insight.myDataset.hasOwnProperty(id)) && !(fs.existsSync(id + ".json"))){
            Log.info("BeforeTest: dataset is reset");
        } else {
            Log.info("BeforeTest: dataset is NOT reset !!!");
        }
    }

    before(function () {
        insight = new InsightFacade();
        Log.test('Before: ' + (<any>this).test.parent.title);
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);
        resetDataset();
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
    });

    afterEach(function  () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    it("add courses.zip", function () {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            expect(response).to.equal(response204);
        }).catch((err) => {
            expect.fail();
        })
    });

    it("add zip with one course", function () {
        let file = fs.readFileSync("MATH100.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let sectionObj = insight.myDataset[id][0];
            console.log(JSON.stringify(sectionObj, null, 4))
            console.log(JSON.stringify(response));
            expect(response).to.equal(response204);
            expect(sectionObj.uuid).to.equal(3737);
        }).catch((err) => {
            Log.error(err);
            expect.fail();
        })
    });

    it("add same zip twice", function () {
        let file = fs.readFileSync("MATH100.zip", "base64");
        return insight.addDataset(id, file).then(function() {
            return insight.addDataset(id, file).then((response) => {
                expect(response).to.equal(response201);
            }).catch((err) => {
                Log.error(err);
                expect.fail();
            })
        }).catch((err) => {
            Log.error(err);
            expect.fail();
        });

    });



    it("add only one file with valid section", function () {
        console.log(JSON.stringify(insight));
        let file = fs.readFileSync("only_one_file_with_valid_section.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            console.log(JSON.stringify(response));
            expect(response.code).to.equal(204);
        }).catch((err) => {
            Log.error(err);
            expect.fail();
        })
    });


    it("add corrupted zip", function () {
        let file = fs.readFileSync("corrupt_zip.zip", "base64");
        return insight.addDataset(id, file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });

    it("add empty zip", function () {
        let file = fs.readFileSync("invalid_empty_zip.zip", "base64");
        return insight.addDataset(id, file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });

    it("add zip with no valid course section", function () {
        let file = fs.readFileSync("invalid_no_valid_section.zip", "base64");
        return insight.addDataset(id, file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });

    it("test course_year feature of addDataset", function () {
        console.log(JSON.stringify(insight));
        let file = fs.readFileSync("only_one_file_with_valid_section.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let sectionObj0 = insight.myDataset[id][0];
            let sectionObj1 = insight.myDataset[id][1];
            // console.log(JSON.stringify(response));
            expect(sectionObj0.year).to.equal(2015);
            expect(sectionObj1.year).to.equal(1900);
        }).catch((err) => {
            Log.error(err);
            expect.fail();
        })
    });

    // ================ test removeDataset =======================
    it("remove id not existing in myDataSet", function () {
        // let file = fs.readFileSync("courses.zip", "base64");
        return insight.removeDataset("cat").then((response) => {
            Log.trace(response.toString());
            expect.fail();
        }).catch((response) => {
            expect(response).to.equal(response404);
        })
    });

    it("add courses.zip and then remove it twice", function () {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            return insight.removeDataset(id)
                .then((response) => {
                    expect(insight.myDataset.hasOwnProperty(id)).to.equal(false);
                    expect(response).to.equal(response204);

                    return insight.removeDataset(id).then((response) => {
                        expect.fail();
                    }).catch((response) => {expect(response).to.equal(response404);})
            })
                .catch((err) => {
                    expect.fail();
                })
        })
            .catch((err) => {
                // Log.error(err);
            })
    });
});
