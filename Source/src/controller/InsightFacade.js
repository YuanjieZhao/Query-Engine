"use strict";
var fs = require("fs");
exports.response200 = {
    code: 200,
    body: {}
};
exports.response201 = {
    code: 201,
    body: { "msg": "Dataset was added and id already exist" }
};
exports.response204 = {
    code: 204,
    body: { "msg": "Dataset was added and id was new" }
};
exports.response400 = {
    code: 400,
    body: { error: "Operation fails" }
};
exports.response424 = {
    code: 424,
    body: { error: "the query failed because of a missing dataset" }
};
exports.response404 = {
    code: 404,
    body: { error: "Operation fails because the delete was for a resource that was not previously added" }
};
var JSZip = require("jszip");
var http = require('http');
var InsightFacade = (function () {
    function InsightFacade() {
        this.myDataset = {};
    }
    InsightFacade.prototype.addDataset = function (id, content) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            if (id === "courses") {
                _this.addDatasetForCourses(id, content).then(function (result0) {
                    fulfill(result0);
                }).catch(function (err0) {
                    reject(err0);
                });
            }
            else if (id === "rooms") {
                _this.addDatasetForRooms(id, content).then(function (result1) {
                    fulfill(result1);
                }).catch(function (err1) {
                    reject(err1);
                });
            }
            else {
                reject(exports.response400);
            }
        });
    };
    InsightFacade.prototype.addDatasetForRooms = function (id, content) {
        var _this = this;
        var that = this;
        return new Promise(function (fulfill0, reject0) {
            var pArr = [];
            var roomsArray = [];
            var searchNameArray = [];
            JSZip.loadAsync(content, { base64: true })
                .then(function (zip) {
                if (Object.keys(zip.files).length === 0) {
                    return reject0(exports.response400);
                }
                var promiseIndexPage = zip.files["index.htm"].async('string');
                promiseIndexPage.then(function (indexPageData) {
                    that.parseIndexPage(indexPageData, searchNameArray);
                    for (var _i = 0, _a = Object.keys(zip.files); _i < _a.length; _i++) {
                        var filename = _a[_i];
                        for (var i = 0; i < searchNameArray.length; i++) {
                            if (filename.indexOf("/" + searchNameArray[i]) > -1) {
                                pArr.push(zip.files[filename].async('string'));
                            }
                        }
                    }
                    Promise.all(pArr)
                        .then(function (fileDataArray) {
                        if (fileDataArray.length === 0) {
                            return reject0(exports.response400);
                        }
                        var pArrForRooms = [];
                        for (var _i = 0, fileDataArray_1 = fileDataArray; _i < fileDataArray_1.length; _i++) {
                            var fileData = fileDataArray_1[_i];
                            pArrForRooms.push(that.parseRooms(fileData, roomsArray));
                        }
                        Promise.all(pArrForRooms)
                            .then(function () {
                            if (roomsArray.length != 0) {
                                if (_this.myDataset.hasOwnProperty(id) || fs.existsSync(id + ".json")) {
                                    fulfill0(exports.response201);
                                }
                                else {
                                    fulfill0(exports.response204);
                                }
                                that.myDataset[id] = roomsArray;
                                that.saveToDisk(id);
                            }
                            else {
                                reject0(exports.response400);
                            }
                        })
                            .catch(function (err) {
                        });
                    })
                        .catch(function (err) {
                        reject0(exports.response400);
                    });
                })
                    .catch(function (err) {
                    reject0(exports.response400);
                });
            })
                .catch(function (err) {
                reject0(exports.response400);
            });
        });
    };
    InsightFacade.prototype.parseRooms = function (content, roomsArray) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            if (content.indexOf("Furniture") > -1) {
                var labLonObj_1 = {};
                var fullname_1 = _this.parseFullName(content);
                var shortname_1 = _this.parseShortName(content);
                var address_1 = _this.parseAddress(content);
                var roomTableContent = _this.getRoomTableContent(content);
                var roomNumberArray_1 = _this.parseRoomNumber(content);
                var seatsNumberArray_1 = _this.parseSeatsNumber(roomTableContent);
                var furnitureArray_1 = _this.parseFurniture(roomTableContent);
                var roomTypeArray_1 = _this.parseRoomType(roomTableContent);
                var hrefArray_1 = _this.parsehref(roomTableContent);
                var generateNewRoomIterator_1 = function () {
                    for (var i = 0; i < roomNumberArray_1.length; i++) {
                        var newRoom = new Room();
                        newRoom.fullname = fullname_1;
                        newRoom.shortname = shortname_1;
                        newRoom.address = address_1;
                        newRoom.number = roomNumberArray_1[i];
                        newRoom.seats = seatsNumberArray_1[i];
                        newRoom.furniture = furnitureArray_1[i];
                        newRoom.type = roomTypeArray_1[i];
                        newRoom.href = hrefArray_1[i];
                        newRoom.name = newRoom.shortname + "_" + newRoom.number;
                        newRoom.lat = labLonObj_1["lat"];
                        newRoom.lon = labLonObj_1["lon"];
                        roomsArray.push(newRoom);
                    }
                };
                _this.getLatLon(address_1)
                    .then(function (result) {
                    labLonObj_1 = result;
                    generateNewRoomIterator_1();
                    fulfill();
                })
                    .catch(function () {
                    generateNewRoomIterator_1();
                    fulfill();
                });
            }
            else {
                fulfill();
            }
        });
    };
    InsightFacade.prototype.getLatLon = function (address) {
        return new Promise(function (fulfill, reject) {
            var urlgetString = "http://skaha.cs.ubc.ca:11316/api/v1/team155/" + encodeURIComponent(address.trim());
            var latLonObj;
            http.get(urlgetString, function (res) {
                var rawData = "";
                res.on("data", function (dataChunk) {
                    rawData += dataChunk;
                });
                res.on("end", function () {
                    latLonObj = JSON.parse(rawData);
                    fulfill(latLonObj);
                });
            }).on("error", function (err) {
            });
        });
    };
    InsightFacade.prototype.getRoomTableContent = function (content) {
        var startTag = "<tbody>";
        var endTag = "</tbody>";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var roomTableContent = content.substring(startPos + startTag.length, endPos);
        return roomTableContent;
    };
    InsightFacade.prototype.parseFullName = function (content) {
        var startTag = "<h2><span class=\"field-content\">";
        var endTag = "</span></h2>";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var fullname = content.substring(startPos + startTag.length, endPos);
        return fullname;
    };
    InsightFacade.prototype.parseShortName = function (content) {
        var startTag = "link rel=\"canonical\" href=\"";
        var endTag = "\" />\n" +
            "<link rel=\"shortlink\"";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var shortname = content.substring(startPos + startTag.length, endPos);
        return shortname;
    };
    InsightFacade.prototype.parseAddress = function (content) {
        var startTag = "</h2>\n" +
            "\t\t<div class=\"building-field\"><div class=\"field-content\">";
        var endTag = "</div></div>";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var address = content.substring(startPos + startTag.length, endPos);
        return address;
    };
    InsightFacade.prototype.parseRoomNumber = function (content) {
        var roomNumArray = [];
        var startTag = "Room Details\">";
        var endTag = "</a>          </td>\n" +
            "                  <td class=\"views-field views-field-field-room-capacity\" >";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var number = content.substring(startPos + startTag.length, endPos);
            roomNumArray.push(number);
            startPos = content.indexOf(startTag, startPos + 1);
            endPos = content.indexOf(endTag, endPos + 1);
        }
        return roomNumArray;
    };
    InsightFacade.prototype.parseSeatsNumber = function (content) {
        var seatsNumArray = [];
        var startTag = "<td class=\"views-field views-field-field-room-capacity\" >\n" +
            "            ";
        var endTag = "          </td>\n" +
            "                  <td class=\"views-field views-field-field-room-furniture\" >";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var number = content.substring(startPos + startTag.length, endPos);
            seatsNumArray.push(Number(number));
            startPos = content.indexOf(startTag, startPos + 1);
            endPos = content.indexOf(endTag, endPos + 1);
        }
        return seatsNumArray;
    };
    InsightFacade.prototype.parseFurniture = function (content) {
        var furnitureArray = [];
        var startTag = "<td class=\"views-field views-field-field-room-furniture\" >\n" +
            "            ";
        var endTag = "          </td>\n" +
            "                  <td class=\"views-field views-field-field-room-type\" >";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var furnitureType = content.substring(startPos + startTag.length, endPos);
            furnitureArray.push(furnitureType.replace(/&amp;/g, '&'));
            startPos = content.indexOf(startTag, startPos + 1);
            endPos = content.indexOf(endTag, endPos + 1);
        }
        return furnitureArray;
    };
    InsightFacade.prototype.parseRoomType = function (content) {
        var roomTypeArray = [];
        var startTag = "<td class=\"views-field views-field-field-room-type\" >\n" +
            "            ";
        var endTag = "          </td>\n" +
            "                  <td class=\"views-field views-field-nothing\" >";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var number = content.substring(startPos + startTag.length, endPos);
            roomTypeArray.push(number);
            startPos = content.indexOf(startTag, startPos + 1);
            endPos = content.indexOf(endTag, endPos + 1);
        }
        return roomTypeArray;
    };
    InsightFacade.prototype.parsehref = function (content) {
        var hrefArray = [];
        var startTag = "views-field-nothing\" >\n" +
            "            <a href=\"";
        var endTag = "\">More info";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var number = content.substring(startPos + startTag.length, endPos);
            hrefArray.push(number);
            startPos = content.indexOf(startTag, endPos);
            endPos = content.indexOf(endTag, startPos);
        }
        return hrefArray;
    };
    InsightFacade.prototype.parseIndexPage = function (content, searchNameArray) {
        var startTag = "<td class=\"views-field views-field-field-building-code\" >\n" +
            "            ";
        var endTag = "          </td>\n" +
            "                  <td class=\"views-field views-field-title\" >";
        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var buildingShortName = content.substring(startPos + startTag.length, endPos);
            searchNameArray.push(buildingShortName);
            startPos = content.indexOf(startTag, endPos);
            endPos = content.indexOf(endTag, startPos);
        }
    };
    InsightFacade.prototype.addDatasetForCourses = function (id, content) {
        var _this = this;
        var that = this;
        return new Promise(function (fulfill0, reject0) {
            var pArr = [];
            var sectionsArray = [];
            var JSZip = require("jszip");
            JSZip.loadAsync(content, { base64: true })
                .then(function (zip) {
                if (Object.keys(zip.files).length === 0) {
                    return reject0(exports.response400);
                }
                for (var _i = 0, _a = Object.keys(zip.files); _i < _a.length; _i++) {
                    var filename = _a[_i];
                    pArr.push(zip.files[filename].async('string'));
                }
                Promise.all(pArr)
                    .then(function (fileDataArray) {
                    for (var _i = 0, fileDataArray_2 = fileDataArray; _i < fileDataArray_2.length; _i++) {
                        var fileData = fileDataArray_2[_i];
                        try {
                            var jsonData = JSON.parse(fileData);
                            var resultJsonArray = jsonData['result'];
                            if (resultJsonArray.length != 0) {
                                that.parseSections(resultJsonArray, sectionsArray);
                            }
                        }
                        catch (err) {
                        }
                    }
                    if (sectionsArray.length != 0) {
                        if (_this.myDataset.hasOwnProperty(id) || fs.existsSync(id + ".json")) {
                            fulfill0(exports.response201);
                        }
                        else {
                            fulfill0(exports.response204);
                        }
                        that.myDataset[id] = sectionsArray;
                        that.saveToDisk(id);
                    }
                    else {
                        reject0(exports.response400);
                    }
                })
                    .catch(function (err) {
                });
            })
                .catch(function (err) {
                reject0(exports.response400);
            });
        });
    };
    InsightFacade.prototype.saveToDisk = function (id) {
        var data = JSON.stringify(this.myDataset, null, 4);
        fs.writeFileSync(id + ".json", data, 'utf-8');
    };
    InsightFacade.prototype.parseSections = function (jsonArray, sectionsArray) {
        for (var _i = 0, jsonArray_1 = jsonArray; _i < jsonArray_1.length; _i++) {
            var sectionObj = jsonArray_1[_i];
            var newSection = new Section();
            for (var key in sectionObj) {
                switch (key) {
                    case "Subject":
                        newSection.dept = sectionObj["Subject"];
                        break;
                    case "Course":
                        newSection.id = sectionObj["Course"];
                        break;
                    case "Avg":
                        newSection.avg = sectionObj["Avg"];
                        break;
                    case "Professor":
                        newSection.instructor = sectionObj["Professor"];
                        break;
                    case "Title":
                        newSection.title = sectionObj["Title"];
                        break;
                    case "Pass":
                        newSection.pass = sectionObj["Pass"];
                        break;
                    case "Fail":
                        newSection.fail = sectionObj["Fail"];
                        break;
                    case "Audit":
                        newSection.audit = sectionObj["Audit"];
                        break;
                    case "id":
                        newSection.uuid = sectionObj["id"];
                        break;
                    case "Year":
                        if (sectionObj.hasOwnProperty("Section") && sectionObj["Section"] === "overall") {
                            newSection.year = 1900;
                        }
                        else {
                            newSection.year = Number(sectionObj["Year"]);
                        }
                    default:
                        break;
                }
            }
            sectionsArray.push(newSection);
        }
    };
    InsightFacade.prototype.removeDataset = function (id) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            try {
                fs.statSync(id + ".json");
                fs.unlinkSync(id + ".json");
                delete _this.myDataset[id];
                fulfill(exports.response204);
            }
            catch (err) {
                reject(exports.response404);
            }
        });
    };
    InsightFacade.prototype.performQuery = function (query) {
        var _this = this;
        return new Promise(function (fulfill, reject) {
            var that = _this;
            var queryst = query;
            var ordercheck = 0;
            var haveorder = 0;
            var querycourse = 0;
            var queryroom = 0;
            if ((!(fs.existsSync("courses.json"))) && (!(fs.existsSync("rooms.json")))) {
                return reject(exports.response424);
            }
            try {
                if ("ORDER" in queryst["OPTIONS"]) {
                    if (typeof queryst["OPTIONS"]["ORDER"] !== "string") {
                        throw "er";
                    }
                    haveorder = 1;
                }
                else {
                    haveorder = 0;
                }
                if (queryst["WHERE"] == null) {
                    throw "er";
                }
                for (var y in queryst["OPTIONS"]) {
                    if (y !== "COLUMNS" && y !== "ORDER") {
                        throw "err";
                    }
                }
                if (!Array.isArray(queryst["OPTIONS"]["COLUMNS"])) {
                    return reject(exports.response400);
                }
                if (that.Course_Keycheck(queryst["OPTIONS"]["COLUMNS"][0])) {
                    querycourse = 1;
                }
                if (that.Room_Keycheck(queryst["OPTIONS"]["COLUMNS"][0])) {
                    queryroom = 1;
                }
                if (queryroom === 0 && querycourse === 0) {
                    throw "err";
                }
                for (var _i = 0, _a = queryst["OPTIONS"]["COLUMNS"]; _i < _a.length; _i++) {
                    var x = _a[_i];
                    if (querycourse === 1) {
                        if (!that.Course_Keycheck(x)) {
                            throw "err";
                        }
                    }
                    if (queryroom === 1) {
                        if (!that.Room_Keycheck(x)) {
                            throw "err";
                        }
                    }
                }
                if (queryst["OPTIONS"]["COLUMNS"].length == 0) {
                    throw "er";
                }
                if (haveorder === 1) {
                    for (var _b = 0, _c = queryst["OPTIONS"]["COLUMNS"]; _b < _c.length; _b++) {
                        var x = _c[_b];
                        if (x === queryst["OPTIONS"]["ORDER"]) {
                            ordercheck = 1;
                        }
                    }
                    if (ordercheck === 0) {
                        return reject(exports.response400);
                    }
                }
                var filter = queryst["WHERE"];
            }
            catch (e) {
                return reject(exports.response400);
            }
            var result = {};
            var arr = [];
            if (querycourse === 1) {
                try {
                    var datafile = JSON.parse(fs.readFileSync("courses.json", "utf-8"));
                }
                catch (e) {
                    return reject(exports.response424);
                }
            }
            if (queryroom === 1) {
                try {
                    var datafile = JSON.parse(fs.readFileSync("rooms.json", "utf-8"));
                }
                catch (e) {
                    return reject(exports.response424);
                }
            }
            if (querycourse === 1) {
                for (var _d = 0, _e = datafile["courses"]; _d < _e.length; _d++) {
                    var section = _e[_d];
                    try {
                        if (that.EvaluateCourse(filter, section)) {
                            var sectionSelected = {};
                            var Arrcolumns = queryst["OPTIONS"]["COLUMNS"];
                            for (var x in Arrcolumns) {
                                switch (Arrcolumns[x]) {
                                    case "courses_dept":
                                        sectionSelected["courses_dept"] = section.dept;
                                        break;
                                    case "courses_id":
                                        sectionSelected["courses_id"] = section.id;
                                        break;
                                    case "courses_instructor":
                                        sectionSelected["courses_instructor"] = section.instructor;
                                        break;
                                    case "courses_title":
                                        sectionSelected["courses_title"] = section.title;
                                        break;
                                    case "courses_uuid":
                                        sectionSelected["courses_uuid"] = section.uuid;
                                        break;
                                    case "courses_avg":
                                        sectionSelected["courses_avg"] = section.avg;
                                        break;
                                    case "courses_pass":
                                        sectionSelected["courses_pass"] = section.pass;
                                        break;
                                    case "courses_fail":
                                        sectionSelected["courses_fail"] = section.fail;
                                        break;
                                    case "courses_audit":
                                        sectionSelected["courses_audit"] = section.audit;
                                        break;
                                    case "courses_year":
                                        sectionSelected["courses_year"] = section.year;
                                        break;
                                    default:
                                        throw "err";
                                }
                            }
                            arr.push(sectionSelected);
                        }
                    }
                    catch (e) {
                        return reject(exports.response400);
                    }
                }
            }
            if (queryroom === 1) {
                for (var _f = 0, _g = datafile["rooms"]; _f < _g.length; _f++) {
                    var room = _g[_f];
                    try {
                        if (that.EvaluateRoom(filter, room)) {
                            var RoomSelected = {};
                            var Arrcolumns = queryst["OPTIONS"]["COLUMNS"];
                            for (var x in Arrcolumns) {
                                switch (Arrcolumns[x]) {
                                    case "rooms_fullname":
                                        RoomSelected["rooms_fullname"] = room.fullname;
                                        break;
                                    case "rooms_shortname":
                                        RoomSelected["rooms_shortname"] = room.shortname;
                                        break;
                                    case "rooms_number":
                                        RoomSelected["rooms_number"] = room.number;
                                        break;
                                    case "rooms_name":
                                        RoomSelected["rooms_name"] = room.name;
                                        break;
                                    case "rooms_address":
                                        RoomSelected["rooms_address"] = room.address;
                                        break;
                                    case "rooms_lat":
                                        RoomSelected["rooms_lat"] = room.lat;
                                        break;
                                    case "rooms_lon":
                                        RoomSelected["rooms_lon"] = room.lon;
                                        break;
                                    case "rooms_seats":
                                        RoomSelected["rooms_seats"] = room.seats;
                                        break;
                                    case "rooms_type":
                                        RoomSelected["rooms_type"] = room.type;
                                        break;
                                    case "rooms_furniture":
                                        RoomSelected["rooms_furniture"] = room.furniture;
                                        break;
                                    case "rooms_href":
                                        RoomSelected["rooms_href"] = room.href;
                                        break;
                                    default:
                                        throw "err";
                                }
                            }
                            arr.push(RoomSelected);
                        }
                    }
                    catch (e) {
                        return reject(exports.response400);
                    }
                }
            }
            if (haveorder === 1) {
                arr.sort(function (a, b) {
                    return a[query.OPTIONS.ORDER] - b[query.OPTIONS.ORDER];
                });
            }
            result["result"] = arr;
            exports.response200.body = result;
            fulfill(exports.response200);
        });
    };
    InsightFacade.prototype.EvaluateCourse = function (filter, section) {
        var that = this;
        var input = 0;
        var expect = 0;
        for (var filterst in filter) {
            switch (filterst) {
                case "AND":
                    if (!Array.isArray(filter[filterst]) || filter[filterst].length === 0) {
                        throw "er";
                    }
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {
                            throw "err";
                        }
                    }
                    return that.CourseANDcp(filter[filterst], section);
                case "OR":
                    if (!Array.isArray(filter[filterst]) || filter[filterst].length === 0) {
                        throw "er";
                    }
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {
                            throw "err";
                        }
                    }
                    return that.CourseORcp(filter[filterst], section);
                case "NOT":
                    return that.NOTcp(that.EvaluateCourse(filter[filterst], section));
                case "LT":
                    var LArray = that.CourseMChelper(filter, section, filterst);
                    input = LArray[0];
                    expect = LArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.LTcp(input, expect);
                case "GT":
                    var GArray = that.CourseMChelper(filter, section, filterst);
                    input = GArray[0];
                    expect = GArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.GTcp(input, expect);
                case "EQ":
                    var EArray = that.CourseMChelper(filter, section, filterst);
                    input = EArray[0];
                    expect = EArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.EQcp(input, expect);
                case "IS":
                    var sectionString = "";
                    var inputstring = "";
                    for (var skey in filter[filterst]) {
                        switch (skey) {
                            case "courses_dept":
                                sectionString = section.dept;
                                inputstring = filter[filterst][skey];
                                break;
                            case "courses_id":
                                sectionString = section.id;
                                inputstring = filter[filterst][skey];
                                break;
                            case "courses_instructor":
                                sectionString = section.instructor;
                                inputstring = filter[filterst][skey];
                                break;
                            case "courses_title":
                                sectionString = section.title;
                                inputstring = filter[filterst][skey];
                                break;
                            case "courses_uuid":
                                sectionString = section.uuid;
                                inputstring = filter[filterst][skey];
                                break;
                            default:
                                throw "err";
                        }
                    }
                    if (inputstring.startsWith("*")) {
                        if (inputstring.endsWith("*")) {
                            return sectionString.includes(inputstring.substring(1, inputstring.length - 1));
                        }
                        else {
                            return sectionString.endsWith(inputstring.substring(1, inputstring.length));
                        }
                    }
                    else {
                        if (inputstring.endsWith("*")) {
                            return sectionString.startsWith(inputstring.substring(0, inputstring.length - 1));
                        }
                        else {
                            return (sectionString === inputstring);
                        }
                    }
                default:
                    throw "err";
            }
        }
    };
    InsightFacade.prototype.EvaluateRoom = function (filter, room) {
        var that = this;
        var input = 0;
        var expect = 0;
        for (var filterst in filter) {
            switch (filterst) {
                case "AND":
                    if (!Array.isArray(filter[filterst]) || filter[filterst].length === 0) {
                        throw "er";
                    }
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {
                            throw "err";
                        }
                    }
                    return that.RoomANDcp(filter[filterst], room);
                case "OR":
                    if (!Array.isArray(filter[filterst]) || filter[filterst].length === 0) {
                        throw "er";
                    }
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {
                            throw "err";
                        }
                    }
                    return that.RoomORcp(filter[filterst], room);
                case "NOT":
                    return that.NOTcp(that.EvaluateRoom(filter[filterst], room));
                case "LT":
                    var LArray = that.RoomMChelper(filter, room, filterst);
                    input = LArray[0];
                    expect = LArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.LTcp(input, expect);
                case "GT":
                    var GArray = that.RoomMChelper(filter, room, filterst);
                    input = GArray[0];
                    expect = GArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.GTcp(input, expect);
                case "EQ":
                    var EArray = that.RoomMChelper(filter, room, filterst);
                    input = EArray[0];
                    expect = EArray[1];
                    if (typeof expect !== "number") {
                        throw "er";
                    }
                    return that.EQcp(input, expect);
                case "IS":
                    var roomString = "";
                    var inputstring = "";
                    for (var skey in filter[filterst]) {
                        switch (skey) {
                            case "rooms_fullname":
                                roomString = room.fullname;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_shortname":
                                roomString = room.shortname;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_number":
                                roomString = room.number;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_name":
                                roomString = room.name;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_address":
                                roomString = room.address;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_type":
                                roomString = room.type;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_furniture":
                                roomString = room.furniture;
                                inputstring = filter[filterst][skey];
                                break;
                            case "rooms_href":
                                roomString = room.href;
                                inputstring = filter[filterst][skey];
                                break;
                            default:
                                throw "err";
                        }
                    }
                    if (inputstring.startsWith("*")) {
                        if (inputstring.endsWith("*")) {
                            return roomString.includes(inputstring.substring(1, inputstring.length - 1));
                        }
                        else {
                            return roomString.endsWith(inputstring.substring(1, inputstring.length));
                        }
                    }
                    else {
                        if (inputstring.endsWith("*")) {
                            return roomString.startsWith(inputstring.substring(0, inputstring.length - 1));
                        }
                        else {
                            return (roomString === inputstring);
                        }
                    }
                default:
                    throw "err";
            }
        }
    };
    InsightFacade.prototype.CourseMChelper = function (filter, section, filterst) {
        var input = 0;
        var expect = 0;
        for (var mkey in filter[filterst]) {
            switch (mkey) {
                case "courses_avg":
                    input = section.avg;
                    expect = filter[filterst][mkey];
                    break;
                case "courses_pass":
                    input = section.pass;
                    expect = filter[filterst][mkey];
                    break;
                case "courses_fail":
                    input = section.fail;
                    expect = filter[filterst][mkey];
                    break;
                case "courses_audit":
                    input = section.audit;
                    expect = filter[filterst][mkey];
                    break;
                case "courses_year":
                    input = section.year;
                    expect = filter[filterst][mkey];
                    break;
                default:
                    throw "err";
            }
        }
        var NumArray = [];
        NumArray[0] = input;
        NumArray[1] = expect;
        return NumArray;
    };
    InsightFacade.prototype.RoomMChelper = function (filter, room, filterst) {
        var input = 0;
        var expect = 0;
        for (var mkey in filter[filterst]) {
            switch (mkey) {
                case "rooms_lat":
                    input = room.lat;
                    expect = filter[filterst][mkey];
                    break;
                case "rooms_lon":
                    input = room.lon;
                    expect = filter[filterst][mkey];
                    break;
                case "rooms_seats":
                    input = room.seats;
                    expect = filter[filterst][mkey];
                    break;
                default:
                    throw "err";
            }
        }
        var NumArray = [];
        NumArray[0] = input;
        NumArray[1] = expect;
        return NumArray;
    };
    InsightFacade.prototype.CourseANDcp = function (array, section) {
        var that = this;
        var b = true;
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var x = array_1[_i];
            if (that.EvaluateCourse(x, section) === false) {
                b = false;
            }
        }
        return b;
    };
    InsightFacade.prototype.RoomANDcp = function (array, room) {
        var that = this;
        var b = true;
        for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
            var x = array_2[_i];
            if (that.EvaluateRoom(x, room) === false) {
                b = false;
            }
        }
        return b;
    };
    InsightFacade.prototype.CourseORcp = function (array, section) {
        var that = this;
        var b = false;
        for (var _i = 0, array_3 = array; _i < array_3.length; _i++) {
            var x = array_3[_i];
            if (that.EvaluateCourse(x, section) === true) {
                b = true;
            }
        }
        return b;
    };
    InsightFacade.prototype.RoomORcp = function (array, room) {
        var that = this;
        var b = false;
        for (var _i = 0, array_4 = array; _i < array_4.length; _i++) {
            var x = array_4[_i];
            if (that.EvaluateRoom(x, room) === true) {
                b = true;
            }
        }
        return b;
    };
    InsightFacade.prototype.LTcp = function (item1, item2) {
        if (item1 < item2) {
            return true;
        }
        else {
            return false;
        }
    };
    InsightFacade.prototype.GTcp = function (item1, item2) {
        if (item1 > item2) {
            return true;
        }
        else {
            return false;
        }
    };
    InsightFacade.prototype.EQcp = function (item1, item2) {
        return (item1 === item2);
    };
    InsightFacade.prototype.NOTcp = function (item1) {
        return !item1;
    };
    InsightFacade.prototype.Course_Keycheck = function (st) {
        return (st === "courses_avg" ||
            st === "courses_pass" ||
            st === "courses_fail" ||
            st === "courses_audit" ||
            st === "courses_dept" ||
            st === "courses_id" ||
            st === "courses_instructor" ||
            st === "courses_title" ||
            st === "courses_uuid" ||
            st === "courses_year");
    };
    InsightFacade.prototype.Room_Keycheck = function (st) {
        return (st === "rooms_fullname" ||
            st === "rooms_shortname" ||
            st === "rooms_number" ||
            st === "rooms_name" ||
            st === "rooms_address" ||
            st === "rooms_type" ||
            st === "rooms_furniture" ||
            st === "rooms_href" ||
            st === "rooms_lat" ||
            st === "rooms_lon" ||
            st === "rooms_seats");
    };
    InsightFacade.prototype.Number_Keycheck = function (st) {
        return (st === "courses_avg" ||
            st === "courses_pass" ||
            st === "courses_fail" ||
            st === "courses_audit" ||
            st === "courses_year" ||
            st === "rooms_lat" ||
            st === "rooms_lon" ||
            st === "rooms_seats");
    };
    return InsightFacade;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = InsightFacade;
var Section = (function () {
    function Section() {
    }
    return Section;
}());
exports.Section = Section;
var Room = (function () {
    function Room() {
    }
    return Room;
}());
exports.Room = Room;
//# sourceMappingURL=InsightFacade.js.map