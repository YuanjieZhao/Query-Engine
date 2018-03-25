/**
 * This is the main programmatic entry point for the project.
 */
import {IInsightFacade, InsightResponse} from "./IInsightFacade";
import fs = require('fs');
import Log from "../Util";
import {fullResponse} from "restify";
import {strictEqual} from "assert";
import {start} from "repl";
import {error} from "util";

interface GeoResponse {
    lat?: number;
    lon?: number;
    error?: string;
}

export const response200: InsightResponse = {
    code: 200,
    body: {}
};

export const response201: InsightResponse = {
    code: 201,
    body: {"msg": "Dataset was added and id already exist"}
};

export const response204: InsightResponse = {
    code: 204,
    body: {"msg": "Dataset was added and id was new"}
};

export const response400: InsightResponse = {
    code: 400,
    body: {error: "Operation fails"}
};

export const response424: InsightResponse = {
    code: 424,
    body: {error: "the query failed because of a missing dataset"}
};

export const response404: InsightResponse = {
    code: 404,
    body: {error: "Operation fails because the delete was for a resource that was not previously added"}
};


// define constant for external modules
const JSZip = require("jszip");
const http = require('http');

export default class InsightFacade implements IInsightFacade {

    myDataset: any;

    constructor() {
        this.myDataset = {};
    }


    addDataset(id: string, content: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            if (id === "courses") {
                this.addDatasetForCourses(id, content).then(result0 => {
                    fulfill(result0);
                }).catch(err0 => {
                    reject(err0);
                })
            } else if (id === "rooms") {
                this.addDatasetForRooms(id, content).then(result1 => {
                    fulfill(result1);
                }).catch(err1 => {
                    reject(err1);
                })
            } else {
                reject(response400);
            }
        });
    }

     addDatasetForRooms(id: string, content: string): Promise<InsightResponse> {
        let that = this;
        return new Promise((fulfill0, reject0) => {
            let pArr: any = [];
            let roomsArray: Array<Room> = [];
            let searchNameArray: Array<string> = [];     // building names in index.htm, used to search file in rooms.zip

            JSZip.loadAsync(content, {base64: true})
                .then((zip: any) => {
                    if (Object.keys(zip.files).length === 0) {
                        return reject0(response400); // Error: zip file is empty
                    }

                    let promiseIndexPage = zip.files["index.htm"].async('string');

                    promiseIndexPage.then((indexPageData: any) => {
                        that.parseIndexPage(indexPageData, searchNameArray);
                        for (let filename of Object.keys(zip.files)) {
                            for (let i = 0; i < searchNameArray.length; i++) {
                                if (filename.indexOf("/" + searchNameArray[i]) > -1) {  // Check whether the building name (represented by filename) is mentioned in index.htm
                                    pArr.push(zip.files[filename].async('string'));
                                }
                            }
                        }

                        Promise.all(pArr)
                            .then((fileDataArray: any) => {
                                if (fileDataArray.length === 0) {
                                    return reject0(response400);
                                } // no room data found

                                let pArrForRooms = [];
                                for (let fileData of fileDataArray) {
                                    pArrForRooms.push(that.parseRooms(fileData, roomsArray));
                                }

                                Promise.all(pArrForRooms)
                                    .then(() => {
                                        if (roomsArray.length != 0) {
                                            if (this.myDataset.hasOwnProperty(id) || fs.existsSync(id + ".json")) {
                                                fulfill0(response201);
                                            }
                                            else {
                                                fulfill0(response204);
                                            }
                                            that.myDataset[id] = roomsArray;
                                            that.saveToDisk(id);
                                        }
                                        else {
                                            reject0(response400); // Error: no valid room object
                                        }

                                    })
                                    .catch((err) => {
                                        // Log.error(err);
                                    })

                            })
                            .catch((err: string) => {
                                reject0(response400);
                            });
                    })
                        .catch((err: string) => {
                            reject0(response400); // this reject never get executed, can I comment it out???
                        });
                })
                .catch((err: string) => {
                    reject0(response400);
                });
        });
    }

    // parse a given room html string, if this html string contains relevant room info, then create
    // a Room object and save it to myDataset
    parseRooms(content: string, roomsArray: Array<any>) {
        return new Promise((fulfill, reject) => {
            // if content has the word "Furniture", then it must have all relevant room info
            if (content.indexOf("Furniture") > -1) {
                let labLonObj : any = {};
                let fullname: string = this.parseFullName(content);
                let shortname: string = this.parseShortName(content);
                let address: string = this.parseAddress(content);

                let roomTableContent: string = this.getRoomTableContent(content);
                let roomNumberArray: Array<string> = this.parseRoomNumber(content);
                let seatsNumberArray: Array<number> = this.parseSeatsNumber(roomTableContent);
                let furnitureArray: Array<string> = this.parseFurniture(roomTableContent);
                let roomTypeArray: Array<string> = this.parseRoomType(roomTableContent);
                let hrefArray: Array<string> = this.parsehref(roomTableContent);

                // define an inner function called after the promise of getLatLon(address) settles
                // generateNewRoomIterator() create and add room object into myDataset
                let generateNewRoomIterator = () => {
                    for (let i = 0; i < roomNumberArray.length; i++) {
                        let newRoom: Room = new Room();
                        newRoom.fullname = fullname;
                        newRoom.shortname = shortname;
                        newRoom.address = address;
                        newRoom.number = roomNumberArray[i];
                        newRoom.seats = seatsNumberArray[i];
                        newRoom.furniture = furnitureArray[i];
                        newRoom.type = roomTypeArray[i];
                        newRoom.href = hrefArray[i];
                        newRoom.name = newRoom.shortname + "_" + newRoom.number;
                        newRoom.lat = labLonObj["lat"];
                        newRoom.lon = labLonObj["lon"];
                        roomsArray.push(newRoom);
                    }
                };

                this.getLatLon(address)
                    .then((result: any) => {
                        labLonObj = result;
                        generateNewRoomIterator();
                        fulfill();
                    })
                    .catch(function () {
                        generateNewRoomIterator();
                        fulfill();
                    });

            } else {
                // should I fulfill or reject???
                fulfill();
            }
        });
    }

    // return latlon of the given address
    getLatLon(address: string) {
        return new Promise((fulfill, reject) => {
            let urlgetString = "http://skaha.cs.ubc.ca:11316/api/v1/team155/" + encodeURIComponent(address.trim());
            let latLonObj: GeoResponse;
            http.get(urlgetString, (res: any) => {
                let rawData = "";
                res.on("data", (dataChunk: any) => {
                    rawData += dataChunk;
                });
                res.on("end", () => {
                    latLonObj = JSON.parse(rawData);
                    fulfill(latLonObj);
                });

            }).on("error", (err: any) => {
                // reject(err.message);
            })
        });
    }

    getRoomTableContent(content: string) {
        var startTag = "<tbody>";
        var endTag = "</tbody>";

        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var roomTableContent = content.substring(startPos + startTag.length, endPos);
        return roomTableContent;
    }


    parseFullName(content: string) {
        var startTag = "<h2><span class=\"field-content\">";
        var endTag = "</span></h2>";

        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var fullname = content.substring(startPos + startTag.length, endPos);
        return fullname;
    }

    parseShortName(content: string) {
        var startTag = "link rel=\"canonical\" href=\"";
        var endTag = "\" />\n" +
            "<link rel=\"shortlink\"";

        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        var shortname = content.substring(startPos + startTag.length, endPos);
        return shortname;
    }

    parseAddress(content: string) {
        var startTag = "</h2>\n" +
            "\t\t<div class=\"building-field\"><div class=\"field-content\">";
        var endTag = "</div></div>";

        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos); // make sure the occurance of enTag is after startTag
        var address = content.substring(startPos + startTag.length, endPos);
        return address;
    }

    parseRoomNumber(content: string) {
        var roomNumArray: Array<string> = [];
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
    }

    parseSeatsNumber(content: string): Array<number> {
        var seatsNumArray: Array<number> = [];
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
    }

    parseFurniture(content: string) {
        var furnitureArray: Array<string> = [];
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

    }

    parseRoomType(content: string) {
        var roomTypeArray: Array<string> = [];
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
    }

    parsehref(content: string) {
        var hrefArray: Array<string> = [];
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
    }


    // parse and store all buildings' short names in the content (html string) into the field searchNameArray
    parseIndexPage(content: string, searchNameArray: Array<string>) {
        var startTag = "<td class=\"views-field views-field-field-building-code\" >\n" +
            "            ";
        var endTag = "          </td>\n" +
            "                  <td class=\"views-field views-field-title\" >";

        var startPos = content.indexOf(startTag);
        var endPos = content.indexOf(endTag, startPos);
        while (startPos > -1 && endPos > -1) {
            var buildingShortName: string = content.substring(startPos + startTag.length, endPos);
            searchNameArray.push(buildingShortName);
            startPos = content.indexOf(startTag, endPos);
            endPos = content.indexOf(endTag, startPos);
        }
    }


    addDatasetForCourses(id: string, content: string): Promise<InsightResponse> {
        var that = this;
        return new Promise((fulfill0, reject0) => {
            var pArr: any = [];
            var sectionsArray: Array<Section> = [];
            var JSZip = require("jszip");

            JSZip.loadAsync(content, {base64: true})
                .then((zip: any) => {
                    if (Object.keys(zip.files).length === 0) {
                        return reject0(response400); // Error: zip file is empty
                    }

                    // parse each file in zip (this part of code can be refactored into a helper function
                    for (let filename of Object.keys(zip.files)) {
                        pArr.push(zip.files[filename].async('string'));
                    }
                    Promise.all(pArr)
                        .then((fileDataArray: any) => {
                            for (let fileData of fileDataArray) {
                                try {
                                    let jsonData = JSON.parse(fileData);
                                    let resultJsonArray = jsonData['result'];
                                    if (resultJsonArray.length != 0) {
                                        that.parseSections(resultJsonArray, sectionsArray);
                                    }
                                } catch (err) {
                                    // Log.error("Error: JSON could not be parsed.");
                                }
                            }

                            if (sectionsArray.length != 0) {
                                if (this.myDataset.hasOwnProperty(id) || fs.existsSync(id + ".json")) {
                                    fulfill0(response201);
                                }
                                else {
                                    fulfill0(response204);
                                }
                                that.myDataset[id] = sectionsArray;
                                that.saveToDisk(id);
                            }
                            else {
                                reject0(response400); // Error: no valid course section
                            }
                        })
                        .catch((err: string) => {
                            // Log.error("Error: " + err);   // comment out before run Autobot
                        });
                })
                .catch((err: string) => {
                    reject0(response400);
                });
        });
    }

    // save myDataset to disk in .json file with filename id
    saveToDisk(id: string) {
        let data = JSON.stringify(this.myDataset, null, 4);
        fs.writeFileSync(id + ".json", data, 'utf-8');  // How to specify a folder path to store the generated json files???
        // console.log('Data written to file successfully');
    }


    // loop through JSON objects in jsonArray and add each valid Section object to sectionsArray
    // pre-condition: arr is not empty
    parseSections(jsonArray: Array<any>, sectionsArray: Array<Section>) {
        for (let sectionObj of jsonArray) {
            let newSection: Section = new Section();

            for (let key in sectionObj) {
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
                        // if Section key exists in sectionObj, newSection.year = 1900; otherwise, newSection.year = (number) sectionObj["Year"]
                        if (sectionObj.hasOwnProperty("Section") && sectionObj["Section"] === "overall"){
                            newSection.year = 1900;
                        } else {
                            newSection.year = Number(sectionObj["Year"]);
                        }
                    default:
                        break;
                }
            }

            sectionsArray.push(newSection);
        }
    }

    removeDataset(id: string): Promise<InsightResponse> {
        return new Promise((fulfill, reject) => {
            try {
                fs.statSync(id + ".json"); // check whether the file exists or not before delete; if not, throw error
                fs.unlinkSync(id + ".json"); // delete file
                delete this.myDataset[id];   // m["1"] === m.1   since id is already a string, so can't use the dot notation
                fulfill(response204);
            } catch (err) {
                reject(response404);
            }
        });
    }


    performQuery(query: any): Promise <InsightResponse> {
        return new Promise((fulfill, reject) => {
            let that = this;
            let queryst = query;
            let ordercheck = 0;
            let haveorder = 0;
            let querycourse = 0;
            let queryroom = 0;

            if ((!(fs.existsSync("courses.json"))) && (! (fs.existsSync("rooms.json")))) {
                return reject(response424);
            }
            // query syntax check
            try {
                // if (queryst["OPTIONS"].hasOwnProperty("ORDER")) {
                if ("ORDER"in queryst["OPTIONS"]) {
                    if (typeof queryst["OPTIONS"]["ORDER"] !== "string") {throw "er"}
                    haveorder = 1
                } else {haveorder = 0}
                if (queryst["WHERE"] == null) {throw "er"}

                for (let y in queryst["OPTIONS"]) {
                    if (y !== "COLUMNS" && y !== "ORDER") {throw "err"}
                }

                if (!Array.isArray(queryst["OPTIONS"]["COLUMNS"])) {
                    //console.log("========REJECT1==========")
                    return reject(response400)
                } ///Semantic Checking

                //key checking
                if (that.Course_Keycheck(queryst["OPTIONS"]["COLUMNS"][0])) {
                    querycourse = 1;
                }

                if (that.Room_Keycheck(queryst["OPTIONS"]["COLUMNS"][0])) {
                    queryroom = 1;
                }

                if (queryroom === 0 && querycourse === 0) {throw "err"}
                for (let x of queryst["OPTIONS"]["COLUMNS"]) {
                    if (querycourse === 1) {
                        if (!that.Course_Keycheck(x)) {
                            throw "err"
                        }
                    }
                    if (queryroom === 1) {
                        if (!that.Room_Keycheck(x)) {
                            throw "err"
                        }
                    }
                }
                if (queryst["OPTIONS"]["COLUMNS"].length == 0) {throw "er"}

                if (haveorder === 1) {
                    for (let x of queryst["OPTIONS"]["COLUMNS"]) {
                        if (x === queryst["OPTIONS"]["ORDER"]) {
                            ordercheck = 1
                        }
                    }
                    if (ordercheck === 0) {
                        //console.log("========REJECT2==========")
                        return reject(response400)}
                }




                var filter = queryst["WHERE"];
            } catch (e) {
                //console.log("========REJECT3==========")
                return reject(response400)}
            //console.log("=================")

            var result : any = {};
            var arr = [];

            if (querycourse === 1) {
                //if (this.myDataset["courses"] === null) {
                    try {
                        var datafile = JSON.parse(fs.readFileSync("courses.json", "utf-8"));
                     //   console.log("===========adding datafile suc=============")
                    } catch (e) {

                        return reject(response424)
                    }
                //} else {
                //   var datafile = this.myDataset
                //}
            }

            if (queryroom === 1) {
                //if (this.myDataset["rooms"] === null) {
                    try {
                        var datafile = JSON.parse(fs.readFileSync("rooms.json", "utf-8"));
                        //console.log("===========adding datafile suc=============")

                    } catch (e) {

                        return reject(response424)
                    }
               // } else {
               //     var datafile = this.myDataset
                //}
            }
            //console.log("TOTAL NUMBER OF ROOMS" +datafile["rooms"].length)
            // Evaluation for Course
            if (querycourse === 1) {
     //           for (var id in datafile) {
                    for (var section of datafile["courses"]) {
                        try {
                            //console.log("==============")
                            if (that.EvaluateCourse(filter, section)) {
                                let sectionSelected : any = {};
                                let Arrcolumns = queryst["OPTIONS"]["COLUMNS"];
                                // Checking what we are using for columns
                                for (let x in Arrcolumns) {
                                    //console.log("==============" +x)
                                    switch (Arrcolumns[x]){
                                        case "courses_dept":
                                            sectionSelected["courses_dept"] = section.dept;
                                            ///console.log("CHANGED DEPT")
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
                                            ///console.log("CHANGED AVG")
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
                                            throw "err"
                                    }

                                }

                                arr.push(sectionSelected)
                                //console.log("added section")
                            }
                        } catch(e){
                            //console.log("================rejected================")
                            return reject(response400)}
                    }
     //           }
            }

            // Evaluation for Room

            if (queryroom === 1) {
     //           for (var id in datafile) {
                    for (var room of datafile["rooms"]) {
                        try {
                            if (that.EvaluateRoom(filter, room)) {
                                let RoomSelected: any = {};
                                let Arrcolumns = queryst["OPTIONS"]["COLUMNS"];

                                // Checking and Getting what we are using for columns
                                for (let x in Arrcolumns) {
                                    //console.log("==============" +x)
                                    switch (Arrcolumns[x]) {
                                        case "rooms_fullname":
                                            RoomSelected["rooms_fullname"] = room.fullname;
                                            ///console.log("CHANGED DEPT")
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
                                            ///console.log("CHANGED AVG")
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
                                            throw "err"
                                    }

                                }


                                        arr.push(RoomSelected)


                               //console.log("added section "+ JSON.stringify(RoomSelected))
                            }
                        } catch (e) {
                            //console.log("================rejected================")
                            return reject(response400)
                        }
                    }
     //           }
            }



            ///console.log("==============" + queryst["OPTIONS"]["ORDER"])
            if (haveorder === 1) {
                //console.log("have order")
                arr.sort(function(a, b){
                    return a[query.OPTIONS.ORDER] - b[query.OPTIONS.ORDER];
                })
            }
            result["result"] = arr;
            response200.body = result;

/*
            console.log("====================SHOWING RESULT===================")
            console.log(result["result"])
            console.log("====================DONE SHOWING===================")
*/

            //console.log("[{\"courses_dept\":\"math\",\"courses_id\":\"527\",\"courses_audit\":0,\"courses_title\":\"algb topology i\",\"courses_uuid\":\"5373\",\"courses_pass\":9,\"courses_fail\":0,\"courses_avg\":99.78},{\"courses_dept\":\"math\",\"courses_id\":\"527\",\"courses_audit\":0,\"courses_title\":\"algb topology i\",\"courses_uuid\":\"5374\",\"courses_pass\":9,\"courses_fail\":0,\"courses_avg\":99.78}]")
            fulfill(response200)
        })
    }

    EvaluateCourse(filter: any, section: Section): boolean {
        let that = this;
        let input = 0;
        let expect = 0;
        for (let filterst in filter) {
            //console.log("====================DOING FILTER=======================")
            switch (filterst) {
                case "AND":
                    //console.log("====================DOING AND=======================")
                    if (!Array.isArray(filter[filterst])|| filter[filterst].length === 0) {throw "er"}
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {throw "err"}
                    }
                    return that.CourseANDcp(filter[filterst], section);
                case "OR":
                    //console.log("====================DOING or=======================")
                    if (!Array.isArray(filter[filterst])|| filter[filterst].length === 0) {throw "er"}
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {throw "err"}
                    }
                    return that.CourseORcp(filter[filterst], section);
                case "NOT":
                    return that.NOTcp(that.EvaluateCourse(filter[filterst], section));

                case "LT":
                    //try {
                    let LArray = that.CourseMChelper(filter, section, filterst)
                    input = LArray[0];
                    expect = LArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.LTcp(input, expect);
                //} catch (e) {
                //   throw "err"
                //}
                case "GT":
                    //try {
                    let GArray = that.CourseMChelper(filter, section, filterst)
                    input = GArray[0];
                    expect = GArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.GTcp(input, expect);
                //} catch (e) {
                //console.log("============GT INVALID=========")
                //   throw "err"
                //}
                case "EQ":
                    //try {
                    let EArray = that.CourseMChelper(filter, section, filterst)
                    input = EArray[0];
                    expect = EArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.EQcp(input, expect);
                //} catch (e) {
                //    throw "err"
                //}
                case "IS":
                    var sectionString = "";
                    var inputstring = "";
                    for (let skey in filter[filterst]) {
                        switch (skey) {
                            case "courses_dept":
                                sectionString = section.dept;
                                inputstring = filter[filterst][skey];
                                break;
                            case "courses_id":
                                sectionString = section.id
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
                                //console.log("====================SKEY invalid=======================")
                                throw "err"
                        }
                    }

                    if (inputstring.startsWith("*")) {
                        if (inputstring.endsWith("*")) {
                            return sectionString.includes(inputstring.substring(1, inputstring.length - 1))    ///include
                        } else {
                            return sectionString.endsWith(inputstring.substring(1, inputstring.length))/// endwith
                        }
                    } else {
                        if (inputstring.endsWith("*")) {
                            return sectionString.startsWith(inputstring.substring(0, inputstring.length - 1))/// starwith
                        } else {
                            return (sectionString === inputstring)
                        }
                    }

                default:
                    //console.log("====================FILTER invalid=======================")
                    throw "err";

            }
        }
    }

    EvaluateRoom(filter: any, room: Room): boolean {
        let that = this;
        let input = 0;
        let expect = 0;
        for (let filterst in filter) {
            //console.log("====================DOING FILTER=======================")
            switch (filterst) {
                case "AND":
                    //console.log("====================DOING AND=======================")
                    if (!Array.isArray(filter[filterst])|| filter[filterst].length === 0) {throw "er"}
                    //console.log("====================DOne AND=======================")
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {throw "err"}
                    }
                    return that.RoomANDcp(filter[filterst], room);
                case "OR":
                    //console.log("====================DOING or=======================")
                    if (!Array.isArray(filter[filterst])|| filter[filterst].length === 0) {throw "er"}
                    if (filter[filterst].length === 1) {
                        if (filter[filterst][0] === "") {throw "err"}
                    }
                    return that.RoomORcp(filter[filterst], room);
                case "NOT":
                    return that.NOTcp(that.EvaluateRoom(filter[filterst], room));
                case "LT":
                    //try {
                    let LArray = that.RoomMChelper(filter, room, filterst)
                    input = LArray[0];
                    expect = LArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.LTcp(input, expect);
                //} catch (e) {
                //   throw "err"
                //}
                case "GT":
                    //try {
                    let GArray = that.RoomMChelper(filter, room, filterst)
                    input = GArray[0];
                    expect = GArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.GTcp(input, expect);
                //} catch (e) {
                //console.log("============GT INVALID=========")
                //   throw "err"
                //}
                case "EQ":
                    //try {
                    let EArray = that.RoomMChelper(filter, room, filterst)
                    input = EArray[0];
                    expect = EArray[1];
                    if (typeof expect !== "number") {throw "er"}
                    return that.EQcp(input, expect);
                //} catch (e) {
                //    throw "err"
                //}
                case "IS":
                    var roomString = "";
                    var inputstring = "";
                    for (let skey in filter[filterst]) {
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
                                //console.log("====================SKEY invalid=======================")
                                throw "err"
                        }
                    }

                    if (inputstring.startsWith("*")) {
                        if (inputstring.endsWith("*")) {
                            return roomString.includes(inputstring.substring(1, inputstring.length - 1))    ///include
                        } else {
                            return roomString.endsWith(inputstring.substring(1, inputstring.length))/// endwith
                        }
                    } else {
                        if (inputstring.endsWith("*")) {
                            return roomString.startsWith(inputstring.substring(0, inputstring.length - 1))/// starwith
                        } else {
                            return (roomString === inputstring)
                        }
                    }

                default:
                    //console.log("====================FILTER invalid=======================")
                    throw "err";
            }
        }
    }

    CourseMChelper(filter:any, section:Section, filterst: string): Array<number> {
        let input = 0;
        let expect = 0;
        for (let mkey in filter[filterst]) {
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
                    //console.log("====================MKEY invalid=======================")
                    throw "err";
            }
        }
        let NumArray: Array<number> = [];
        NumArray[0] = input;
        NumArray[1] = expect;
        return NumArray
    }

    RoomMChelper(filter:any, room:Room, filterst: string): Array<number> {
        let input = 0;
        let expect = 0;
        for (let mkey in filter[filterst]) {
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
                    //console.log("====================MKEY invalid=======================")
                    throw "err";
            }
        }
        let NumArray: Array<number> = [];
        NumArray[0] = input;
        NumArray[1] = expect;
        return NumArray
    }

    CourseANDcp(array: Array<any>, section: Section): boolean {
        let that = this;
        let b = true;
        for (let x of array) {
            if (that.EvaluateCourse(x, section) === false) {b = false}
        }
        return b
    }

    RoomANDcp(array: Array<any>, room: Room): boolean {
        let that = this;
        let b = true;
        for (let x of array) {
            if (that.EvaluateRoom(x, room) === false) {b = false}
        }
        return b
    }

    CourseORcp(array: Array<any>, section: Section): boolean {
        let that = this;
        let b = false;
        //console.log("====================start of or=======================")
        //try {
        for (let x of array) {
            //console.log("====================Evaluate stuff in or=======================")
            if (that.EvaluateCourse(x, section) === true) {b = true}
        }
        //} catch (e) {//console.log(e)
        //     }

        //console.log("====================OR DONE=======================")
        return b
    }

    RoomORcp(array: Array<any>, room: Room): boolean {
        let that = this;
        let b = false;
        //console.log("====================start of or=======================")
        //try {
        for (let x of array) {
            //console.log("====================Evaluate stuff in or=======================")
            if (that.EvaluateRoom(x, room) === true) {b = true}
        }
        //} catch (e) {//console.log(e)
        //     }

        //console.log("====================OR DONE=======================")
        return b
    }

    LTcp(item1: number, item2: number): boolean {
        if (item1 < item2) {return true} else {return false}
    }

    GTcp(item1: number, item2: number): boolean {
        if (item1 > item2) {return true} else {return false}
    }

    EQcp(item1: number, item2: number): boolean {
        return (item1 === item2)
    }

    NOTcp(item1: boolean): boolean {
        return !item1
    }

    Course_Keycheck(st: string): boolean {
        return (st === "courses_avg" ||
            st === "courses_pass" ||
            st === "courses_fail" ||
            st === "courses_audit" ||
            st === "courses_dept" ||
            st === "courses_id" ||
            st === "courses_instructor" ||
            st === "courses_title" ||
            st === "courses_uuid" ||
            st === "courses_year"
        )
    }

    Room_Keycheck(st: string): boolean {
        return (st === "rooms_fullname" ||
            st === "rooms_shortname" ||
            st === "rooms_number" ||
            st === "rooms_name" ||
            st === "rooms_address" ||
            st === "rooms_type" ||
            st === "rooms_furniture" ||
            st === "rooms_href" ||
            // numbers
            st === "rooms_lat" ||
            st === "rooms_lon" ||
            st === "rooms_seats" )
    }
    Number_Keycheck(st: string): boolean {
        return (st === "courses_avg" ||
            st === "courses_pass" ||
            st === "courses_fail" ||
            st === "courses_audit" ||
            st === "courses_year" ||
            st === "rooms_lat" ||
            st === "rooms_lon" ||
            st === "rooms_seats"
        )
    }




}

// Course Section Class
export class Section {
    dept: string;
    id: string;
    avg: number;
    instructor: string;
    title: string;
    pass: number;
    fail: number;
    audit: number;
    uuid: string;
    year: number
}

// Room Class
export class Room {
    fullname: string;    //Full building name (e.g., "Hugh Dempster Pavilion").
    shortname: string;    //Short building name (e.g., "DMP").
    number: string;    //The room number. Not always a number, so represented as a string.
    name: string;    //The room id;    //should be shortname+"_"+number.
    address: string;    //The building address. (e.g., "6245 Agronomy Road V6T 1Z4").
    lat: number;    //The latitude of the building. Instructions for getting this field are below.
    lon: number;    //The longitude of the building. Instructions for getting this field are below.
    seats: number;    //The number of seats in the room.
    type: string;    //The room type (e.g., "Small Group").
    furniture: string;    //The room type (e.g., "Classroom-Movable Tables & Chairs").
    href: string; // link to full details
}
