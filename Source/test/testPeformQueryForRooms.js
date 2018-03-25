"use strict";
var chai_1 = require("chai");
var Util_1 = require("../src/Util");
var fs = require("fs");
var InsightFacade_1 = require("../src/controller/InsightFacade");
describe("test performQuery for rooms", function () {
    var insight;
    var id = "rooms";
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
        return insight.removeDataset(id);
    });
    it(" simple query", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "IS": {
                        "rooms_name": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "DMP_101" }, { "rooms_name": "DMP_110" }, { "rooms_name": "DMP_201" }, { "rooms_name": "DMP_301" }, { "rooms_name": "DMP_310" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "IS": {
                        "rooms_name": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_namejj"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query2", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "ISd": {
                        "rooms_name": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query3", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "IS": {
                        "rooms_najme": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query5", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "GT": {
                        "rooms_ndame": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": "rooms_name",
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it("invalid query6", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "GT": {
                        "rooms_ndame": "DMP_*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_namje"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                chai_1.expect.fail();
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query OR AND should fail", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "OR": [""]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "DMP_101" }, { "rooms_name": "DMP_110" }, { "rooms_name": "DMP_201" }, { "rooms_name": "DMP_301" }, { "rooms_name": "DMP_310" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect(iserr).to.equal(InsightFacade_1.response400);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query with one in and and or", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "OR": [{ "IS": {
                                "rooms_name": "DMP_*"
                            } }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "DMP_101" }, { "rooms_name": "DMP_110" }, { "rooms_name": "DMP_201" }, { "rooms_name": "DMP_301" }, { "rooms_name": "DMP_310" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query-debuging", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": { "GT": { "rooms_seats": 0 } },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                var data = JSON.stringify(isresponse.body["result"]);
                fs.writeFileSync("TOTAL_ROOM.json", data, 'utf-8');
                checkResults([{ "rooms_name": "WOOD_G65" }, { "rooms_name": "WOOD_G57" }, { "rooms_name": "WOOD_G53" }, { "rooms_name": "WOOD_G41" }, { "rooms_name": "WOOD_B75" }, { "rooms_name": "WOOD_5" }, { "rooms_name": "WOOD_3" }, { "rooms_name": "WOOD_1" }, { "rooms_name": "WOOD_G66" }, { "rooms_name": "WOOD_G59" }, { "rooms_name": "WOOD_G55" }, { "rooms_name": "WOOD_G44" }, { "rooms_name": "WOOD_B79" }, { "rooms_name": "WOOD_6" }, { "rooms_name": "WOOD_4" }, { "rooms_name": "WOOD_2" }, { "rooms_name": "SWNG_409" }, { "rooms_name": "SWNG_407" }, { "rooms_name": "SWNG_405" }, { "rooms_name": "SWNG_309" }, { "rooms_name": "SWNG_307" }, { "rooms_name": "SWNG_305" }, { "rooms_name": "SWNG_221" }, { "rooms_name": "SWNG_121" }, { "rooms_name": "SWNG_109" }, { "rooms_name": "SWNG_107" }, { "rooms_name": "SWNG_105" }, { "rooms_name": "SWNG_410" }, { "rooms_name": "SWNG_408" }, { "rooms_name": "SWNG_406" }, { "rooms_name": "SWNG_310" }, { "rooms_name": "SWNG_308" }, { "rooms_name": "SWNG_306" }, { "rooms_name": "SWNG_222" }, { "rooms_name": "SWNG_122" }, { "rooms_name": "SWNG_110" }, { "rooms_name": "SWNG_108" }, { "rooms_name": "SWNG_106" }, { "rooms_name": "WESB_100" }, { "rooms_name": "WESB_201" }, { "rooms_name": "MGYM_206" }, { "rooms_name": "MGYM_208" }, { "rooms_name": "UCLL_107" }, { "rooms_name": "UCLL_101" }, { "rooms_name": "UCLL_109" }, { "rooms_name": "UCLL_103" }, { "rooms_name": "SRC_220C" }, { "rooms_name": "SRC_220A" }, { "rooms_name": "SRC_220B" }, { "rooms_name": "SPPH_B138" }, { "rooms_name": "SPPH_B112" }, { "rooms_name": "SPPH_143" }, { "rooms_name": "SPPH_B151" }, { "rooms_name": "SPPH_B136" }, { "rooms_name": "SPPH_B108" }, { "rooms_name": "OSBO_A" }, { "rooms_name": "OSBO_203A" }, { "rooms_name": "OSBO_203B" }, { "rooms_name": "PCOH_1215" }, { "rooms_name": "PCOH_1009" }, { "rooms_name": "PCOH_1003" }, { "rooms_name": "PCOH_1001" }, { "rooms_name": "PCOH_1302" }, { "rooms_name": "PCOH_1011" }, { "rooms_name": "PCOH_1008" }, { "rooms_name": "PCOH_1002" }, { "rooms_name": "PHRM_3208" }, { "rooms_name": "PHRM_3122" }, { "rooms_name": "PHRM_3118" }, { "rooms_name": "PHRM_3115" }, { "rooms_name": "PHRM_3112" }, { "rooms_name": "PHRM_1101" }, { "rooms_name": "PHRM_3124" }, { "rooms_name": "PHRM_3120" }, { "rooms_name": "PHRM_3116" }, { "rooms_name": "PHRM_3114" }, { "rooms_name": "PHRM_1201" }, { "rooms_name": "ORCH_4074" }, { "rooms_name": "ORCH_4068" }, { "rooms_name": "ORCH_4058" }, { "rooms_name": "ORCH_4018" }, { "rooms_name": "ORCH_4004" }, { "rooms_name": "ORCH_3074" }, { "rooms_name": "ORCH_3068" }, { "rooms_name": "ORCH_3058" }, { "rooms_name": "ORCH_3018" }, { "rooms_name": "ORCH_3004" }, { "rooms_name": "ORCH_1001" }, { "rooms_name": "ORCH_4072" }, { "rooms_name": "ORCH_4062" }, { "rooms_name": "ORCH_4052" }, { "rooms_name": "ORCH_4016" }, { "rooms_name": "ORCH_4002" }, { "rooms_name": "ORCH_3072" }, { "rooms_name": "ORCH_3062" }, { "rooms_name": "ORCH_3052" }, { "rooms_name": "ORCH_3016" }, { "rooms_name": "ORCH_3002" }, { "rooms_name": "SCRF_209" }, { "rooms_name": "SCRF_207" }, { "rooms_name": "SCRF_205" }, { "rooms_name": "SCRF_204" }, { "rooms_name": "SCRF_202" }, { "rooms_name": "SCRF_200" }, { "rooms_name": "SCRF_1024" }, { "rooms_name": "SCRF_1022" }, { "rooms_name": "SCRF_1020" }, { "rooms_name": "SCRF_1004" }, { "rooms_name": "SCRF_100" }, { "rooms_name": "SCRF_210" }, { "rooms_name": "SCRF_208" }, { "rooms_name": "SCRF_206" }, { "rooms_name": "SCRF_204A" }, { "rooms_name": "SCRF_203" }, { "rooms_name": "SCRF_201" }, { "rooms_name": "SCRF_1328" }, { "rooms_name": "SCRF_1023" }, { "rooms_name": "SCRF_1021" }, { "rooms_name": "SCRF_1005" }, { "rooms_name": "SCRF_1003" }, { "rooms_name": "MATX_1100" }, { "rooms_name": "MATH_204" }, { "rooms_name": "MATH_202" }, { "rooms_name": "MATH_104" }, { "rooms_name": "MATH_100" }, { "rooms_name": "MATH_225" }, { "rooms_name": "MATH_203" }, { "rooms_name": "MATH_105" }, { "rooms_name": "MATH_102" }, { "rooms_name": "MCML_360M" }, { "rooms_name": "MCML_360K" }, { "rooms_name": "MCML_360H" }, { "rooms_name": "MCML_360F" }, { "rooms_name": "MCML_360D" }, { "rooms_name": "MCML_360B" }, { "rooms_name": "MCML_358" }, { "rooms_name": "MCML_256" }, { "rooms_name": "MCML_160" }, { "rooms_name": "MCML_154" }, { "rooms_name": "MCML_360L" }, { "rooms_name": "MCML_360J" }, { "rooms_name": "MCML_360G" }, { "rooms_name": "MCML_360E" }, { "rooms_name": "MCML_360C" }, { "rooms_name": "MCML_360A" }, { "rooms_name": "MCML_260" }, { "rooms_name": "MCML_166" }, { "rooms_name": "MCML_158" }, { "rooms_name": "MCLD_242" }, { "rooms_name": "MCLD_220" }, { "rooms_name": "MCLD_202" }, { "rooms_name": "MCLD_254" }, { "rooms_name": "MCLD_228" }, { "rooms_name": "MCLD_214" }, { "rooms_name": "LSC_1003" }, { "rooms_name": "LSC_1001" }, { "rooms_name": "LSC_1002" }, { "rooms_name": "LSK_460" }, { "rooms_name": "LSK_200" }, { "rooms_name": "LSK_462" }, { "rooms_name": "LSK_201" }, { "rooms_name": "SOWK_326" }, { "rooms_name": "SOWK_224" }, { "rooms_name": "SOWK_222" }, { "rooms_name": "SOWK_122" }, { "rooms_name": "SOWK_324" }, { "rooms_name": "SOWK_223" }, { "rooms_name": "SOWK_124" }, { "rooms_name": "IBLC_460" }, { "rooms_name": "IBLC_265" }, { "rooms_name": "IBLC_263" }, { "rooms_name": "IBLC_195" }, { "rooms_name": "IBLC_193" }, { "rooms_name": "IBLC_191" }, { "rooms_name": "IBLC_182" }, { "rooms_name": "IBLC_157" }, { "rooms_name": "IBLC_155" }, { "rooms_name": "IBLC_461" }, { "rooms_name": "IBLC_266" }, { "rooms_name": "IBLC_264" }, { "rooms_name": "IBLC_261" }, { "rooms_name": "IBLC_194" }, { "rooms_name": "IBLC_192" }, { "rooms_name": "IBLC_185" }, { "rooms_name": "IBLC_158" }, { "rooms_name": "IBLC_156" }, { "rooms_name": "IONA_301" }, { "rooms_name": "IONA_633" }, { "rooms_name": "DMP_310" }, { "rooms_name": "DMP_201" }, { "rooms_name": "DMP_101" }, { "rooms_name": "DMP_301" }, { "rooms_name": "DMP_110" }, { "rooms_name": "ANGU_435" }, { "rooms_name": "ANGU_432" }, { "rooms_name": "ANGU_350" }, { "rooms_name": "ANGU_345" }, { "rooms_name": "ANGU_339" }, { "rooms_name": "ANGU_334" }, { "rooms_name": "ANGU_296" }, { "rooms_name": "ANGU_293" }, { "rooms_name": "ANGU_291" }, { "rooms_name": "ANGU_243" }, { "rooms_name": "ANGU_237" }, { "rooms_name": "ANGU_234" }, { "rooms_name": "ANGU_098" }, { "rooms_name": "ANGU_037" }, { "rooms_name": "ANGU_437" }, { "rooms_name": "ANGU_434" }, { "rooms_name": "ANGU_354" }, { "rooms_name": "ANGU_347" }, { "rooms_name": "ANGU_343" }, { "rooms_name": "ANGU_335" }, { "rooms_name": "ANGU_332" }, { "rooms_name": "ANGU_295" }, { "rooms_name": "ANGU_292" }, { "rooms_name": "ANGU_254" }, { "rooms_name": "ANGU_241" }, { "rooms_name": "ANGU_235" }, { "rooms_name": "ANGU_232" }, { "rooms_name": "ANGU_039" }, { "rooms_name": "HENN_302" }, { "rooms_name": "HENN_202" }, { "rooms_name": "HENN_200" }, { "rooms_name": "HENN_304" }, { "rooms_name": "HENN_301" }, { "rooms_name": "HENN_201" }, { "rooms_name": "HEBB_12" }, { "rooms_name": "HEBB_10" }, { "rooms_name": "HEBB_13" }, { "rooms_name": "HEBB_100" }, { "rooms_name": "GEOG_214" }, { "rooms_name": "GEOG_201" }, { "rooms_name": "GEOG_147" }, { "rooms_name": "GEOG_100" }, { "rooms_name": "GEOG_242" }, { "rooms_name": "GEOG_212" }, { "rooms_name": "GEOG_200" }, { "rooms_name": "GEOG_101" }, { "rooms_name": "FRDM_153" }, { "rooms_name": "LASR_211" }, { "rooms_name": "LASR_105" }, { "rooms_name": "LASR_102" }, { "rooms_name": "LASR_5C" }, { "rooms_name": "LASR_107" }, { "rooms_name": "LASR_104" }, { "rooms_name": "FORW_519" }, { "rooms_name": "FORW_303" }, { "rooms_name": "FORW_317" }, { "rooms_name": "FSC_1615" }, { "rooms_name": "FSC_1611" }, { "rooms_name": "FSC_1221" }, { "rooms_name": "FSC_1003" }, { "rooms_name": "FSC_1001" }, { "rooms_name": "FSC_1617" }, { "rooms_name": "FSC_1613" }, { "rooms_name": "FSC_1402" }, { "rooms_name": "FSC_1005" }, { "rooms_name": "FSC_1002" }, { "rooms_name": "FNH_50" }, { "rooms_name": "FNH_320" }, { "rooms_name": "FNH_20" }, { "rooms_name": "FNH_60" }, { "rooms_name": "FNH_40" }, { "rooms_name": "FNH_30" }, { "rooms_name": "ESB_2012" }, { "rooms_name": "ESB_1012" }, { "rooms_name": "ESB_1013" }, { "rooms_name": "EOSM_135" }, { "rooms_name": "CEME_1212" }, { "rooms_name": "CEME_1206" }, { "rooms_name": "CEME_1202" }, { "rooms_name": "CEME_1215" }, { "rooms_name": "CEME_1210" }, { "rooms_name": "CEME_1204" }, { "rooms_name": "CHEM_D200" }, { "rooms_name": "CHEM_C124" }, { "rooms_name": "CHEM_B150" }, { "rooms_name": "CHEM_D300" }, { "rooms_name": "CHEM_C126" }, { "rooms_name": "CHEM_B250" }, { "rooms_name": "CHBE_103" }, { "rooms_name": "CHBE_101" }, { "rooms_name": "CHBE_102" }, { "rooms_name": "CIRS_1250" }, { "rooms_name": "BUCH_D325" }, { "rooms_name": "BUCH_D322" }, { "rooms_name": "BUCH_D317" }, { "rooms_name": "BUCH_D315" }, { "rooms_name": "BUCH_D313" }, { "rooms_name": "BUCH_D307" }, { "rooms_name": "BUCH_D304" }, { "rooms_name": "BUCH_D229" }, { "rooms_name": "BUCH_D222" }, { "rooms_name": "BUCH_D219" }, { "rooms_name": "BUCH_D217" }, { "rooms_name": "BUCH_D214" }, { "rooms_name": "BUCH_D209" }, { "rooms_name": "BUCH_D205" }, { "rooms_name": "BUCH_D201" }, { "rooms_name": "BUCH_B318" }, { "rooms_name": "BUCH_B315" }, { "rooms_name": "BUCH_B312" }, { "rooms_name": "BUCH_B309" }, { "rooms_name": "BUCH_B307" }, { "rooms_name": "BUCH_B304" }, { "rooms_name": "BUCH_B302" }, { "rooms_name": "BUCH_B218" }, { "rooms_name": "BUCH_B215" }, { "rooms_name": "BUCH_B211" }, { "rooms_name": "BUCH_B209" }, { "rooms_name": "BUCH_B142" }, { "rooms_name": "BUCH_A203" }, { "rooms_name": "BUCH_A201" }, { "rooms_name": "BUCH_A103" }, { "rooms_name": "BUCH_A101" }, { "rooms_name": "BUCH_D323" }, { "rooms_name": "BUCH_D319" }, { "rooms_name": "BUCH_D316" }, { "rooms_name": "BUCH_D314" }, { "rooms_name": "BUCH_D312" }, { "rooms_name": "BUCH_D306" }, { "rooms_name": "BUCH_D301" }, { "rooms_name": "BUCH_D228" }, { "rooms_name": "BUCH_D221" }, { "rooms_name": "BUCH_D218" }, { "rooms_name": "BUCH_D216" }, { "rooms_name": "BUCH_D213" }, { "rooms_name": "BUCH_D207" }, { "rooms_name": "BUCH_D204" }, { "rooms_name": "BUCH_B319" }, { "rooms_name": "BUCH_B316" }, { "rooms_name": "BUCH_B313" }, { "rooms_name": "BUCH_B310" }, { "rooms_name": "BUCH_B308" }, { "rooms_name": "BUCH_B306" }, { "rooms_name": "BUCH_B303" }, { "rooms_name": "BUCH_B219" }, { "rooms_name": "BUCH_B216" }, { "rooms_name": "BUCH_B213" }, { "rooms_name": "BUCH_B210" }, { "rooms_name": "BUCH_B208" }, { "rooms_name": "BUCH_B141" }, { "rooms_name": "BUCH_A202" }, { "rooms_name": "BUCH_A104" }, { "rooms_name": "BUCH_A102" }, { "rooms_name": "BRKX_2365" }, { "rooms_name": "BRKX_2367" }, { "rooms_name": "BIOL_2200" }, { "rooms_name": "BIOL_1503" }, { "rooms_name": "BIOL_2519" }, { "rooms_name": "BIOL_2000" }, { "rooms_name": "AUDX_142" }, { "rooms_name": "AUDX_157" }, { "rooms_name": "AERL_120" }, { "rooms_name": "ANSO_205" }, { "rooms_name": "ANSO_202" }, { "rooms_name": "ANSO_207" }, { "rooms_name": "ANSO_203" }, { "rooms_name": "ALRD_B101" }, { "rooms_name": "ALRD_113" }, { "rooms_name": "ALRD_105" }, { "rooms_name": "ALRD_121" }, { "rooms_name": "ALRD_112" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query-debuging3", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "AND": [{
                            "OR": [{ "GT": { "rooms_seats": 100 } }]
                        }]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ]
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                var data = JSON.stringify(isresponse.body["result"]);
                fs.writeFileSync("TOTAL_ROOM.json", data, 'utf-8');
                checkResults([{ "rooms_name": "WOOD_5" }, { "rooms_name": "WOOD_1" }, { "rooms_name": "WOOD_6" }, { "rooms_name": "WOOD_4" }, { "rooms_name": "WOOD_2" }, { "rooms_name": "SWNG_221" }, { "rooms_name": "SWNG_121" }, { "rooms_name": "SWNG_222" }, { "rooms_name": "SWNG_122" }, { "rooms_name": "WESB_100" }, { "rooms_name": "WESB_201" }, { "rooms_name": "SRC_220C" }, { "rooms_name": "SRC_220A" }, { "rooms_name": "SRC_220B" }, { "rooms_name": "OSBO_A" }, { "rooms_name": "PHRM_1101" }, { "rooms_name": "PHRM_1201" }, { "rooms_name": "SCRF_100" }, { "rooms_name": "MATX_1100" }, { "rooms_name": "MATH_100" }, { "rooms_name": "MCML_166" }, { "rooms_name": "MCLD_202" }, { "rooms_name": "MCLD_228" }, { "rooms_name": "LSC_1003" }, { "rooms_name": "LSC_1001" }, { "rooms_name": "LSC_1002" }, { "rooms_name": "LSK_200" }, { "rooms_name": "LSK_201" }, { "rooms_name": "IBLC_182" }, { "rooms_name": "IBLC_261" }, { "rooms_name": "DMP_310" }, { "rooms_name": "DMP_110" }, { "rooms_name": "ANGU_098" }, { "rooms_name": "HENN_202" }, { "rooms_name": "HENN_200" }, { "rooms_name": "HENN_201" }, { "rooms_name": "HEBB_100" }, { "rooms_name": "GEOG_100" }, { "rooms_name": "FRDM_153" }, { "rooms_name": "FSC_1005" }, { "rooms_name": "ESB_1012" }, { "rooms_name": "ESB_1013" }, { "rooms_name": "CHEM_D200" }, { "rooms_name": "CHEM_B150" }, { "rooms_name": "CHEM_D300" }, { "rooms_name": "CHEM_B250" }, { "rooms_name": "CHBE_101" }, { "rooms_name": "CIRS_1250" }, { "rooms_name": "BUCH_A203" }, { "rooms_name": "BUCH_A201" }, { "rooms_name": "BUCH_A103" }, { "rooms_name": "BUCH_A101" }, { "rooms_name": "BUCH_A202" }, { "rooms_name": "BUCH_A104" }, { "rooms_name": "BUCH_A102" }, { "rooms_name": "BIOL_2000" }, { "rooms_name": "AERL_120" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query-debugging2", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": { "IS": { "rooms_name": "*WESB*" } },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name"
                    ]
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "WESB_100" }, { "rooms_name": "WESB_201" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple queryx", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "IS": {
                        "rooms_address": "6245 Agronomy Road V6T 1Z4"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_lat",
                        "rooms_lon"
                    ]
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_lat": 49.26125, "rooms_lon": -123.24807 }, { "rooms_lat": 49.26125, "rooms_lon": -123.24807 }, { "rooms_lat": 49.26125, "rooms_lon": -123.24807 }, { "rooms_lat": 49.26125, "rooms_lon": -123.24807 }, { "rooms_lat": 49.26125, "rooms_lon": -123.24807 }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query 3", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "OR": [{ "IS": { "rooms_name": "DMP_*" } },
                        { "IS": { "rooms_name": "*SOW*" } }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_seats"
                    ],
                    "ORDER": "rooms_seats"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "SOWK_122", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-122", "rooms_seats": 12 }, { "rooms_name": "SOWK_326", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-326", "rooms_seats": 16 }, { "rooms_name": "SOWK_324", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-324", "rooms_seats": 16 }, { "rooms_name": "SOWK_222", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-222", "rooms_seats": 29 }, { "rooms_name": "SOWK_223", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-223", "rooms_seats": 29 }, { "rooms_name": "SOWK_224", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-224", "rooms_seats": 31 }, { "rooms_name": "DMP_101", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-101", "rooms_seats": 40 }, { "rooms_name": "DMP_201", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201", "rooms_seats": 40 }, { "rooms_name": "SOWK_124", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-124", "rooms_seats": 68 }, { "rooms_name": "DMP_301", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-301", "rooms_seats": 80 }, { "rooms_name": "DMP_110", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-110", "rooms_seats": 120 }, { "rooms_name": "DMP_310", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-310", "rooms_seats": 160 }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" simple query 3x", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "OR": [{ "IS": { "rooms_name": "DMP_*" } },
                        { "IS": { "rooms_name": "*SOW*" } }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_href",
                        "rooms_seats"
                    ],
                    "ORDER": "rooms_href"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "DMP_101", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-101", "rooms_seats": 40 }, { "rooms_name": "DMP_110", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-110", "rooms_seats": 120 }, { "rooms_name": "DMP_201", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-201", "rooms_seats": 40 }, { "rooms_name": "DMP_301", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-301", "rooms_seats": 80 }, { "rooms_name": "DMP_310", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/DMP-310", "rooms_seats": 160 }, { "rooms_name": "SOWK_122", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-122", "rooms_seats": 12 }, { "rooms_name": "SOWK_124", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-124", "rooms_seats": 68 }, { "rooms_name": "SOWK_222", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-222", "rooms_seats": 29 }, { "rooms_name": "SOWK_223", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-223", "rooms_seats": 29 }, { "rooms_name": "SOWK_224", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-224", "rooms_seats": 31 }, { "rooms_name": "SOWK_324", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-324", "rooms_seats": 16 }, { "rooms_name": "SOWK_326", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SOWK-326", "rooms_seats": 16 }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" all_in_one query", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "OR": [
                        { "AND": [
                                { "GT": {
                                        "rooms_seats": 200
                                    }
                                },
                                { "EQ": {
                                        "rooms_seats": 299
                                    }
                                },
                                { "LT": {
                                        "rooms_lat": 10000
                                    }
                                },
                                { "LT": {
                                        "rooms_lon": 10000
                                    }
                                },
                                { "IS": {
                                        "rooms_fullname": "*S*"
                                    }
                                },
                                { "IS": {
                                        "rooms_shortname": "*S*"
                                    }
                                },
                                { "IS": {
                                        "rooms_number": "*2*"
                                    }
                                },
                                { "IS": {
                                        "rooms_name": "*C*"
                                    }
                                },
                                { "IS": {
                                        "rooms_address": "*U*"
                                    }
                                },
                                { "IS": {
                                        "rooms_type": "*B*"
                                    }
                                },
                                { "IS": {
                                        "rooms_furniture": "*Tables*"
                                    }
                                },
                                { "NOT": { "IS": { "rooms_href": "*C" } } },
                                { "NOT": { "IS": { "rooms_href": "C" } } }
                            ] },
                        { "IS": { "rooms_fullname": "Student Recreatio*" } }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_seats",
                        "rooms_fullname",
                        "rooms_shortname",
                        "rooms_number",
                        "rooms_address",
                        "rooms_type",
                        "rooms_furniture",
                        "rooms_href",
                        "rooms_lat",
                        "rooms_lon"
                    ],
                    "ORDER": "rooms_name"
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_name": "SRC_220A", "rooms_seats": 299, "rooms_fullname": "Student Recreation Centre", "rooms_shortname": "SRC", "rooms_number": "220A", "rooms_address": "6000 Student Union Blvd", "rooms_type": "TBD", "rooms_furniture": "Classroom-Movable Tables & Chairs", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220A", "rooms_lat": 49.2683, "rooms_lon": -123.24894 }, { "rooms_name": "SRC_220B", "rooms_seats": 299, "rooms_fullname": "Student Recreation Centre", "rooms_shortname": "SRC", "rooms_number": "220B", "rooms_address": "6000 Student Union Blvd", "rooms_type": "TBD", "rooms_furniture": "Classroom-Movable Tables & Chairs", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220B", "rooms_lat": 49.2683, "rooms_lon": -123.24894 }, { "rooms_name": "SRC_220C", "rooms_seats": 299, "rooms_fullname": "Student Recreation Centre", "rooms_shortname": "SRC", "rooms_number": "220C", "rooms_address": "6000 Student Union Blvd", "rooms_type": "TBD", "rooms_furniture": "Classroom-Movable Tables & Chairs", "rooms_href": "http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/SRC-220C", "rooms_lat": 49.2683, "rooms_lon": -123.24894 }], isresponse.body["result"]);
            }).catch(function (iserr) {
                console.log(1, iserr);
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
    it(" complex query", function () {
        var file = fs.readFileSync("rooms.zip", "base64");
        return insight.addDataset(id, file).then(function (response) {
            var query = {
                "WHERE": {
                    "IS": {
                        "rooms_address": "*Agrono*"
                    }
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_address", "rooms_name"
                    ]
                }
            };
            return insight.performQuery(query).then(function (isresponse) {
                checkResults([{ "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4074" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4068" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4058" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4018" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4004" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3074" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3068" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3058" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3018" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3004" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_1001" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4072" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4062" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4052" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4016" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_4002" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3072" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3062" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3052" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3016" }, { "rooms_address": "6363 Agronomy Road", "rooms_name": "ORCH_3002" }, { "rooms_address": "6245 Agronomy Road V6T 1Z4", "rooms_name": "DMP_310" }, { "rooms_address": "6245 Agronomy Road V6T 1Z4", "rooms_name": "DMP_201" }, { "rooms_address": "6245 Agronomy Road V6T 1Z4", "rooms_name": "DMP_101" }, { "rooms_address": "6245 Agronomy Road V6T 1Z4", "rooms_name": "DMP_301" }, { "rooms_address": "6245 Agronomy Road V6T 1Z4", "rooms_name": "DMP_110" }], isresponse.body["result"]);
            }).catch(function (iserr) {
                chai_1.expect.fail(iserr);
            });
        }).catch(function (err) {
            chai_1.expect.fail();
        });
    });
});
//# sourceMappingURL=testPeformQueryForRooms.js.map