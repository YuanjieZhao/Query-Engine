import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import fs = require("fs");
import InsightFacade, {
    response201, response204, response400, response404,
    Section
} from "../src/controller/InsightFacade";


describe("test performQuery for courses", function () {
    var insight : InsightFacade;
    const id : string = "courses"; // argument passed to id parameter in addDataset and removeDataset for all test cases in this file

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    function checkResults(first: Array<any>, second: Array<any>): void {
        if(first.length !== second.length) {
            expect.fail("length different");
        }
        expect(first).to.deep.include.members(second);
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

    afterEach(function  () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });

    // ==============  tests start here =====================
    it("simple query for d1??", function() {
            let file = fs.readFileSync("courses.zip", "base64");
            return insight.addDataset(id, file).then((response) => {

                let query = { "WHERE":{ "GT":{ "courses_avg":98.5 } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDER":"courses_avg" } }
                return insight.performQuery(query).then((isresponse:any) => {
                    checkResults([{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.7,"courses_instructor":"cole, kenneth"},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":"brew, nancy"},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":""},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":"coria, lino"},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.8,"courses_instructor":"grow, laura"},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":""},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":"frank, erica"},{"courses_dept":"cnps","courses_avg":99.19,"courses_instructor":"cox, daniel"},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":""},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":"gomez, jose"}],
                        isresponse.body["result"])

                }).catch((iserr) => {
                    console.log(iserr)
                    expect.fail(iserr);
                })

            }).catch((err) => {
                expect.fail();
            })
        });
    /*
    it.only("simple query for d1?? just another one", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = {
                "WHERE":
                    {
                        "AND": [
                            {
                                "IS": {"courses_id": "342"}
                            },
                            {
                                "IS": {"courses_dept": "biol"}
                            }
                        ]

                    }

                ,
                "OPTIONS": {
                    "COLUMNS": [
                        "courses_title"

                    ]

                }
            }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.7,"courses_instructor":"cole, kenneth"},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":"brew, nancy"},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":""},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":"coria, lino"},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.8,"courses_instructor":"grow, laura"},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":""},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":"frank, erica"},{"courses_dept":"cnps","courses_avg":99.19,"courses_instructor":"cox, daniel"},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":""},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":"gomez, jose"}],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });
    */
    it("simple query for course_year=========", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "GT":{ "courses_year":2017 } }, "OPTIONS":{ "COLUMNS":[ "courses_year"], "ORDER":"courses_year" } }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });

    it("invalid EBNF", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "GT":{ "courses_avg":98.5 } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDERo":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            console.log("==========2===========");
            expect.fail();
        })
    })

    it("Complext query", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let query = { "WHERE":{ "OR":[ { "AND":[ { "GT":{ "courses_avg":90 } }, { "IS":{ "courses_dept":"adhe" } } ] }, { "EQ":{ "courses_avg":95 } } ] }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_id", "courses_avg"], "ORDER":"courses_avg" } }

            return insight.performQuery(query).then((isresponse: any) => {
                //console.log("===============2222211111111112222222===============")
                checkResults([{"courses_dept":"adhe","courses_id":"329","courses_avg":90.02},{"courses_dept":"adhe","courses_id":"412","courses_avg":90.16},{"courses_dept":"adhe","courses_id":"330","courses_avg":90.17},{"courses_dept":"adhe","courses_id":"412","courses_avg":90.18},{"courses_dept":"adhe","courses_id":"330","courses_avg":90.5},{"courses_dept":"adhe","courses_id":"330","courses_avg":90.72},{"courses_dept":"adhe","courses_id":"329","courses_avg":90.82},{"courses_dept":"adhe","courses_id":"330","courses_avg":90.85},{"courses_dept":"adhe","courses_id":"330","courses_avg":91.29},{"courses_dept":"adhe","courses_id":"330","courses_avg":91.33},{"courses_dept":"adhe","courses_id":"330","courses_avg":91.33},{"courses_dept":"adhe","courses_id":"330","courses_avg":91.48},{"courses_dept":"adhe","courses_id":"329","courses_avg":92.54},{"courses_dept":"adhe","courses_id":"329","courses_avg":93.33},{"courses_dept":"rhsc","courses_id":"501","courses_avg":95},{"courses_dept":"bmeg","courses_id":"597","courses_avg":95},{"courses_dept":"bmeg","courses_id":"597","courses_avg":95},{"courses_dept":"cnps","courses_id":"535","courses_avg":95},{"courses_dept":"cnps","courses_id":"535","courses_avg":95},{"courses_dept":"cpsc","courses_id":"589","courses_avg":95},{"courses_dept":"cpsc","courses_id":"589","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"crwr","courses_id":"599","courses_avg":95},{"courses_dept":"sowk","courses_id":"570","courses_avg":95},{"courses_dept":"econ","courses_id":"516","courses_avg":95},{"courses_dept":"edcp","courses_id":"473","courses_avg":95},{"courses_dept":"edcp","courses_id":"473","courses_avg":95},{"courses_dept":"epse","courses_id":"606","courses_avg":95},{"courses_dept":"epse","courses_id":"682","courses_avg":95},{"courses_dept":"epse","courses_id":"682","courses_avg":95},{"courses_dept":"kin","courses_id":"499","courses_avg":95},{"courses_dept":"kin","courses_id":"500","courses_avg":95},{"courses_dept":"kin","courses_id":"500","courses_avg":95},{"courses_dept":"math","courses_id":"532","courses_avg":95},{"courses_dept":"math","courses_id":"532","courses_avg":95},{"courses_dept":"mtrl","courses_id":"564","courses_avg":95},{"courses_dept":"mtrl","courses_id":"564","courses_avg":95},{"courses_dept":"mtrl","courses_id":"599","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"musc","courses_id":"553","courses_avg":95},{"courses_dept":"nurs","courses_id":"424","courses_avg":95},{"courses_dept":"nurs","courses_id":"424","courses_avg":95},{"courses_dept":"obst","courses_id":"549","courses_avg":95},{"courses_dept":"psyc","courses_id":"501","courses_avg":95},{"courses_dept":"psyc","courses_id":"501","courses_avg":95},{"courses_dept":"econ","courses_id":"516","courses_avg":95},{"courses_dept":"adhe","courses_id":"329","courses_avg":96.11}],
                    isresponse.body["result"])
            }).catch((er) => {
                console.log("===============222222222222===============")
                expect.fail();
            })


        }).catch((err) => {
            expect.fail();
        })
    })

    it("Partial name", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let query = { "WHERE":{ "IS":{ "courses_instructor": "*estwood*" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDER":"courses_avg" } }

            return insight.performQuery(query).then((isresponse: any) => {
                //console.log("===================1111111111111============")
                checkResults([{"courses_dept":"cnps","courses_avg":80.93,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":81.77,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":84.21,"courses_instructor":"olson, trevor;westwood, marvin"},{"courses_dept":"cnps","courses_avg":84.55,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":84.82,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":85,"courses_instructor":"tavormina, ezula ;westwood, marvin"},{"courses_dept":"cnps","courses_avg":85.08,"courses_instructor":"koert, emily;westwood, marvin"},{"courses_dept":"cnps","courses_avg":85.92,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":86,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":86,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":86.33,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":86.5,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":86.67,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.09,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.2,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.4,"courses_instructor":"nitkin, patricia;westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.53,"courses_instructor":"klubben, laura;westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.73,"courses_instructor":"mccullough, lucy;westwood, marvin"},{"courses_dept":"cnps","courses_avg":87.93,"courses_instructor":"klubben, laura;westwood, marvin"},{"courses_dept":"cnps","courses_avg":88.29,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":88.4,"courses_instructor":"westwood, marvin;wiens, sandra"},{"courses_dept":"cnps","courses_avg":88.5,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":88.56,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":88.86,"courses_instructor":"nitkin, patricia;westwood, marvin"},{"courses_dept":"cnps","courses_avg":89.15,"courses_instructor":"nitkin, patricia;westwood, marvin"},{"courses_dept":"cnps","courses_avg":89.31,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":89.44,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":89.62,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":89.71,"courses_instructor":"westwood, marvin"},{"courses_dept":"cnps","courses_avg":91.18,"courses_instructor":"westwood, marvin"}],
                    isresponse.body["result"])
            }).catch((er) => {
                //console.log("=============2=========")
                expect.fail();
            })


        }).catch((err) => {
            expect.fail();
        })
    })

    it("Partial name 2", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let query = { "WHERE":{"AND":[ {"IS":{ "courses_dept": "asia" }}, {"IS":{ "courses_instructor": "c*" }} ]                     }, "OPTIONS":{ "COLUMNS":["courses_dept" , "courses_instructor"] } }

            return insight.performQuery(query).then((isresponse: any) => {
                //console.log("===================1111111111111============")
                checkResults([{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"citizen, robyn"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chen, jinhua"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"},{"courses_dept":"asia","courses_instructor":"chiu-duke, josephine"}],
                    isresponse.body["result"])
            }).catch((er) => {
                //console.log("=============2=========")
                //console.log(er)
                expect.fail();
            })
        }).catch((err) => {
            expect.fail();
        })
    })

    it("Partial name 3", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let query = { "WHERE":{ "IS":{ "courses_instructor": "*mid" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDER":"courses_avg" } }

            return insight.performQuery(query).then((isresponse: any) => {
                //console.log("===================1111111111111============")
                checkResults([{"courses_dept":"math","courses_avg":56.96,"courses_instructor":"usefi, hamid"},{"courses_dept":"math","courses_avg":69.03,"courses_instructor":"usefi, hamid"},{"courses_dept":"math","courses_avg":69.37,"courses_instructor":"zangeneh, hamid"},{"courses_dept":"elec","courses_avg":70.68,"courses_instructor":"atighechi, hamid"},{"courses_dept":"mtrl","courses_avg":74.9,"courses_instructor":"azizi-alizamini, hamid"},{"courses_dept":"mtrl","courses_avg":76,"courses_instructor":"azizi-alizamini, hamid"},{"courses_dept":"mtrl","courses_avg":78.64,"courses_instructor":"azizi-alizamini, hamid"},{"courses_dept":"mtrl","courses_avg":79.17,"courses_instructor":"azizi-alizamini, hamid"},{"courses_dept":"mtrl","courses_avg":81.53,"courses_instructor":"azizi-alizamini, hamid"},{"courses_dept":"mtrl","courses_avg":84.05,"courses_instructor":"azizi-alizamini, hamid"}],
                    isresponse.body["result"])
            }).catch((er) => {
                //console.log("=============2=========")
                expect.fail();
            })


        }).catch((err) => {
            expect.fail();
        })
    })

    it("Partial name 4", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {
            let query = { "WHERE":{"OR":[ {"IS":{ "courses_instructor": "eastwood*" }}, {"IS":{ "courses_instructor": "*selena*" }} ] }, "OPTIONS":{ "COLUMNS":[ "courses_instructor" ], "ORDER":"courses_instructor" } }

            return insight.performQuery(query).then((isresponse: any) => {
                //console.log("===================1111111111111============")
                checkResults([{"courses_instructor":"couture, selena"},{"courses_instructor":"couture, selena"},{"courses_instructor":"couture, selena"},{"courses_instructor":"eastwood, terence m"}],
                    isresponse.body["result"])
            }).catch((er) => {
                //console.log("=============2=========")
                expect.fail();
            })


        }).catch((err) => {
            expect.fail();
        })
    })

    it("invalid query", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "GT":{ "courses_avg":"d" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDER":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                //console.log("==========3===========");
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            //console.log("==========2===========");
            expect.fail();
        })
    })

    it("complex query2", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "OR":[ { "AND":[ { "LT":{ "courses_avg":90 } }, { "IS":{ "courses_dept":"adhe" } } ] }, { "EQ":{ "courses_avg":95 } } ] }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_id", "courses_audit" ], "ORDER":"courses_audit" } }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"328","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"329","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"327","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"330","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"psyc","courses_id":"501","courses_audit":0},{"courses_dept":"psyc","courses_id":"501","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"adhe","courses_id":"412","courses_audit":0},{"courses_dept":"bmeg","courses_id":"597","courses_audit":0},{"courses_dept":"bmeg","courses_id":"597","courses_audit":0},{"courses_dept":"obst","courses_id":"549","courses_audit":0},{"courses_dept":"nurs","courses_id":"424","courses_audit":0},{"courses_dept":"cpsc","courses_id":"589","courses_audit":0},{"courses_dept":"cpsc","courses_id":"589","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"crwr","courses_id":"599","courses_audit":0},{"courses_dept":"nurs","courses_id":"424","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"edcp","courses_id":"473","courses_audit":0},{"courses_dept":"edcp","courses_id":"473","courses_audit":0},{"courses_dept":"epse","courses_id":"606","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"kin","courses_id":"499","courses_audit":0},{"courses_dept":"kin","courses_id":"500","courses_audit":0},{"courses_dept":"kin","courses_id":"500","courses_audit":0},{"courses_dept":"math","courses_id":"532","courses_audit":0},{"courses_dept":"math","courses_id":"532","courses_audit":0},{"courses_dept":"mtrl","courses_id":"564","courses_audit":0},{"courses_dept":"mtrl","courses_id":"564","courses_audit":0},{"courses_dept":"mtrl","courses_id":"599","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"musc","courses_id":"553","courses_audit":0},{"courses_dept":"sowk","courses_id":"570","courses_audit":0},{"courses_dept":"cnps","courses_id":"535","courses_audit":1},{"courses_dept":"cnps","courses_id":"535","courses_audit":1},{"courses_dept":"adhe","courses_id":"412","courses_audit":1},{"courses_dept":"adhe","courses_id":"412","courses_audit":1},{"courses_dept":"econ","courses_id":"516","courses_audit":2},{"courses_dept":"econ","courses_id":"516","courses_audit":2},{"courses_dept":"rhsc","courses_id":"501","courses_audit":4},{"courses_dept":"epse","courses_id":"682","courses_audit":9},{"courses_dept":"epse","courses_id":"682","courses_audit":9}],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });

    it("complex query3", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "OR":[ { "AND":[ { "LT":{ "courses_avg":90 } }, { "IS":{ "courses_dept":"adhe" } }, { "LT":{ "courses_pass":90 } }, { "LT":{ "courses_fail":90 } }, { "LT":{ "courses_audit":90 } }, { "IS":{ "courses_uuid":"adhe" } },{ "IS":{ "courses_title":"adhe" } },{ "IS":{ "courses_id":"adhe" } } ] }, { "EQ":{ "courses_audit":95 } } ] }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_id", "courses_audit" ], "ORDER":"courses_audit" } }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });

    it("complex query4", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "OR":[ { "AND":[ { "LT":{ "courses_avg":90 } }, { "IS":{ "courses_dept":"adhe" } }, { "LT":{ "courses_pass":90 } }, { "LT":{ "courses_fail":90 } }, { "LT":{ "courses_audit":90 } }, { "IS":{ "courses_uuid":"adhe" } },{ "IS":{ "courses_title":"adhe" } },{ "IS":{ "courses_id":"adhe" } } ] }, { "EQ":{ "courses_audit":95 } } ] }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_id", "courses_audit","courses_title", "courses_uuid","courses_pass", "courses_fail" ], "ORDER":"courses_audit" } }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });
    it("simple query0", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "GT":{ "courses_fail": 280 } }, "OPTIONS":{ "COLUMNS":[ "courses_id","courses_title","courses_pass","courses_fail","courses_uuid","courses_audit" ], "ORDER":"courses_id" } }
            return insight.performQuery(query).then((isresponse:any) => {
                /*
                checkResults([{
                        "courses_id":"121",
                        "courses_title":"structural chem",
                        "courses_pass":1674,
                        "courses_fail":287,
                        "courses_uuid":"70069",
                        "courses_audit":0}],
                    isresponse.body["result"])
                    */

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });

    it("invalid EBNF1", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "GT":{ "courses_avg":"asdf" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDERo":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            console.log("==========2===========");
            expect.fail();
        })
    })

    it("invalid EBNF2", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "EQ":{ "courses_avg":"asdf" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDERo":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            console.log("==========2===========");
            expect.fail();
        })
    })
    it("invalid EBNF3", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "IS":{ "sdfafs" : "sdfasdf" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDERo":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            console.log("==========2===========");
            expect.fail();
        })
    })

    it("invalid EBNF3", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{ "ISsdsf":{ "sdfafs" : "sdfasdf" } }, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDERo":"courses_avg" } }
            return insight.performQuery(query).then((isresponse) => {
                expect.fail();
            }).catch((iserr) => {
                //console.log("==========1===========");
                expect(iserr).to.equal(response400);
            })
        }).catch((err) => {
            console.log("==========2===========");
            expect.fail();
        })
    })

    it("not simple query", function() {
        let file = fs.readFileSync("courses.zip", "base64");
        return insight.addDataset(id, file).then((response) => {

            let query = { "WHERE":{"NOT":{"NOT" :{ "GT":{ "courses_avg":98.5 } }}}, "OPTIONS":{ "COLUMNS":[ "courses_dept", "courses_avg", "courses_instructor" ], "ORDER":"courses_avg" } }
            return insight.performQuery(query).then((isresponse:any) => {
                checkResults([{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.58,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.7,"courses_instructor":"cole, kenneth"},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":""},{"courses_dept":"nurs","courses_avg":98.71,"courses_instructor":"brew, nancy"},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":""},{"courses_dept":"eece","courses_avg":98.75,"courses_instructor":"coria, lino"},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":""},{"courses_dept":"epse","courses_avg":98.76,"courses_instructor":"grow, laura"},{"courses_dept":"epse","courses_avg":98.8,"courses_instructor":"grow, laura"},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":""},{"courses_dept":"spph","courses_avg":98.98,"courses_instructor":"frank, erica"},{"courses_dept":"cnps","courses_avg":99.19,"courses_instructor":"cox, daniel"},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":""},{"courses_dept":"math","courses_avg":99.78,"courses_instructor":"gomez, jose"}],
                    isresponse.body["result"])

            }).catch((iserr) => {
                expect.fail(iserr);
            })

        }).catch((err) => {
            expect.fail();
        })
    });

});
