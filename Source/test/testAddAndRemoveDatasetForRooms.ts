import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import fs = require("fs");
import InsightFacade, {response201, response204, response400} from "../src/controller/InsightFacade";


describe("testAddAndRemoveDatasetForRooms", function () {
    var insight: InsightFacade;
    const id : string = "rooms"; // argument passed to id parameter in addDataset and removeDataset for all test cases in this file

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

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

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    // ===========  test start here ===================

    it("addDataset invalid id", function () {
        let file = fs.readFileSync("corrupt_zip.zip", "base64");
        return insight.addDataset("cat", file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });

    it("add rooms_no_valid_room_obj.zip", function () {
        let file = fs.readFileSync("rooms_no_valid_room_obj.zip", "base64");
        return insight.addDataset(id, file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
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
            Log.error(response.toString());
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });

    it("add zip only has index html", function () {
        let file = fs.readFileSync("rooms_only_has_index_html.zip", "base64");
        return insight.addDatasetForRooms(id, file).then(response => {
            expect.fail();
        }).catch(response => {
            expect(response).to.equal(response400);
        })
    });


    it("add rooms_few_files.zip", function () {
        let file = fs.readFileSync("rooms_few_files.zip", "base64");
        return insight.addDatasetForRooms(id, file).then(response => {
            expect(response).to.equal(response204);
        }).catch(response => {
            Log.error(JSON.stringify(response));
            expect.fail();
        })
    });

    it("add rooms zip", function () {
        let file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(response => {
            // Log.info(JSON.stringify(response));
            expect(response).to.equal(response204);
            expect(insight.myDataset[id].length).to.equal(364);
        }).catch(response => {
            Log.error(JSON.stringify(response));
            expect.fail();
        })
    });

    it("addDataset twice", function () {
        let file = fs.readFileSync("rooms_one_file.zip", "base64");
        return insight.addDataset(id, file)
            .then(response => {
                // Log.info(JSON.stringify(insight));
                expect(response).to.equal(response204);
                return insight.addDataset(id, file)
                    .then(response => {
                        Log.info(JSON.stringify(insight));
                        expect(response).to.equal(response201);
                    })
                    .catch(response => {
                        Log.error(JSON.stringify(response));
                        expect.fail();
                    });
            }).catch(response => {
                Log.error(JSON.stringify(response));
                expect.fail();
            })
    });

    it("add rooms_one_file.zip", function () {
        let file = fs.readFileSync("rooms_one_file.zip", "base64");
        return insight.addDataset(id, file)
            .then(response => {
                // Log.info(JSON.stringify(insight));
                expect(response).to.equal(response204);
            }).catch(response => {
                Log.error(JSON.stringify(response));
                expect.fail();
            })
    });

    it("add rooms_one_room_with_invalid_address_for_latlon.zip", function () {
        let file = fs.readFileSync("rooms_one_room_with_invalid_address_for_latlon.zip", "base64");
        return insight.addDataset(id, file)
            .then(response => {
                // Log.info(JSON.stringify(insight));
                expect(response).to.equal(response204);
            }).catch(response => {
                Log.error(JSON.stringify(response));
                expect.fail();
            })
    });


});



