import Server from "../src/rest/Server";
import {expect} from 'chai';
import Log from "../src/Util";
import {InsightResponse} from "../src/controller/IInsightFacade";
import chai = require('chai');
import chaiHttp = require('chai-http');
import Response = ChaiHttp.Response;
import restify = require('restify');
import fs = require("fs");

const local_url = "http://localhost:4321";

describe.only("test Server", function () {

    let server : any = new Server(4321);

    function sanityCheck(response: InsightResponse) {
        expect(response).to.have.property('code');
        expect(response).to.have.property('body');
        expect(response.code).to.be.a('number');
    }

    before(function () {
        Log.test('Before: ' + (<any>this).test.parent.title);
        // Init
        chai.use(chaiHttp);
        return server.start();
    });

    beforeEach(function () {
        Log.test('BeforeTest: ' + (<any>this).currentTest.title);

        let file1 = "rooms.json";
        let file2 = "courses.json";
        try {
            if (fs.existsSync(file1)) {fs.unlinkSync(file1);}
            if (fs.existsSync(file2)) {fs.unlinkSync(file2);}
        } catch (err) {
            // do nothing
        }
    });

    after(function () {
        Log.test('After: ' + (<any>this).test.parent.title);
        return server.stop();
    });

    afterEach(function () {
        Log.test('AfterTest: ' + (<any>this).currentTest.title);
    });


    // ==============  tests start here ===============

    it("DELETE request for non-existing dataset", function () {
        return chai.request(local_url)
            .del('/dataset/rooms')
            .then(function (res: Response) {
                Log.trace('then:' + JSON.stringify(res));
                expect.fail();
            }).catch(function (err) {
                Log.trace('catch:');
                expect(err.status).to.equal(404);
            });
    });

    it("DELETE request for existing dataset", function () {
        let filename = "rooms_one_file.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.equal(204);
                // console.log(JSON.stringify(res));

                return chai.request(local_url)
                    .del('/dataset/rooms')
                    .then(function (res: Response) {
                        //Log.trace('then:' + JSON.stringify(res));
                        expect(res.status).to.equal(204);
                    }).catch(function (err) {
                        Log.trace('catch:');
                        expect.fail();
                    });
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });


    it("PUT request", function () {
        // Point to your local test dataset
        let filename = "rooms_one_file.zip";
        // Make the request to your local machine (you are running the server locally)
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.equal(204);
                // console.log(JSON.stringify(res));
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("PUT request with invalid resource id", function () {
        // Point to your local test dataset
        let filename = "rooms_one_file.zip";
        // Make the request to your local machine (you are running the server locally)
        return chai.request(local_url)
            .put('/dataset/dog')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('then:');
                expect.fail();
                // console.log(JSON.stringify(res));
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect(err.status).to.equal(400);
            });
    });



    it("PUT request twice for same dataset id", function () {
        // Point to your local test dataset
        let filename = "rooms_one_file.zip";
        // Make the request to your local machine (you are running the server locally)
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('outer then:');
                // console.log(JSON.stringify(res));
                expect(res.status).to.equal(204);

                return chai.request(local_url)
                    .put('/dataset/rooms')
                    .attach("body", fs.readFileSync(filename), filename)
                    .then(function (res: Response) {
                        Log.trace('inner then:');
                        // console.log(JSON.stringify(res));
                        expect(res.status).to.equal(201);
                    })
                    .catch(function (err) {
                        Log.trace('catch:');
                        expect.fail();
                    });
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });


    it("PUT request twice for different dataset id", function () {
        let filename1 = "rooms_one_file.zip";
        let filename2 = "courses.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename1), filename1)
            .then(function (res: Response) {
                Log.trace('then:');
                // console.log(JSON.stringify(res));
                expect(res.status).to.equal(204);

                return chai.request(local_url)
                    .put('/dataset/courses')
                    .attach("body", fs.readFileSync(filename2), filename2)
                    .then(function (res: Response) {
                        Log.trace('then:');
                        // console.log(JSON.stringify(res));
                        expect(res.status).to.equal(204);
                    })
                    .catch(function (err) {
                        Log.trace('catch:');
                        expect.fail();
                    });
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });


    it("POST request with invalid query for existing dataset", function () {
        let filename = "rooms.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.equal(204);
                // console.log(JSON.stringify(res));
                let invalidQueryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": [ "rooms_namejj" ], "ORDER": "rooms_name" } };
                return chai.request(local_url)
                    .post('/query')
                    .send(invalidQueryJSONObject)
                    .then(function (res: Response) {
                        Log.trace('then:');
                        expect.fail();
                    })
                    .catch(function (err) {
                        Log.trace('catch:');
                        expect(err.status).to.equal(400);
                    });
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });

    it("POST request with valid query for non-existing dataset", function () {
        let queryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": [ "rooms_name" ], "ORDER": "rooms_name" } };
        return chai.request(local_url)
            .post('/query')
            .send(queryJSONObject)
            .then(function (res: Response) {
                Log.trace('then:');
                expect.fail();
            })
            .catch(function (err) {
                Log.trace('catch:');
                expect(err.status).to.equal(424);
            });
    });

    it("POST request with valid query for existing dataset", function () {
        let filename = "rooms.zip";
        return chai.request(local_url)
            .put('/dataset/rooms')
            .attach("body", fs.readFileSync(filename), filename)
            .then(function (res: Response) {
                Log.trace('then:');
                expect(res.status).to.equal(204);
                let queryJSONObject = { "WHERE": { "IS": { "rooms_name": "DMP_*" } }, "OPTIONS": { "COLUMNS": [ "rooms_name" ], "ORDER": "rooms_name" } };
                return chai.request(local_url)
                    .post('/query')
                    .send(queryJSONObject)
                    .then(function (res: Response) {
                        Log.trace('then:');
                        expect(res.status).to.equal(200);
                    })
                    .catch(function (err) {
                        Log.trace('catch:');
                        expect.fail();
                    });

            })
            .catch(function (err) {
                Log.trace('catch:');
                expect.fail();
            });
    });


});