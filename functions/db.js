const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const log = require('./logger');
const functions = require('.');
const bcrypt = require("bcrypt");
const saltRounds = 10;

const webconfig = functions.loadWebconfig();

let client;
let db;

if (!webconfig.connection_uri) {
    log.error("There is no connection URI set in webconfig.yml. Please set this.").then(() => {
        process.exit(1);
    });
} else {
    client = new MongoClient(webconfig.connection_uri);
    db = client.db(webconfig.database);
}

(async () => {
    await client.connect();
    log.database('Connected to the database.');

    /*
    const collection = db.collection("users");
    const password = "123456";
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            await collection.insertOne({
                username: "jamie",
                email: "volcanomonster07@gmail.com",
                password: hash
            });
        });
    });
    */

    const COLLECTIONS = [
        'users', 'sessions', 'departments', 'vehicles', 'characters', 'settings', 'penal_code', 'arrests', 'citations', 'warrants'
    ];

    for (const coll of COLLECTIONS) {
        db.listCollections({ name: coll }).next((_, data) => {
            if (!data) {
                db.createCollection(coll, async (err, doc) => {
                    if (err) {
                        log.error(
                            `There was an error while creating the '${coll}' collection in the database. ` +
                            "Please make sure that the connection URI is correct and that the user " +
                            "has the correct permissions to create collections."
                        );
                    } else {
                        log.database(`Created the '${coll}' collection.`);
                    }
                    if (coll === 'settings') {
                        await doc.insertOne({
                            name: 'Votion Cad',
                            discord: '',
                            manualApproval: false
                        });
                    }
                });
            }
        });
    }
})();

module.exports = {
    getSettings: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("settings");
            const res = await collection.find({}).toArray();
            const settings = res[0]
            resolve(settings);
        });
    },
    getUser: async function (email) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                email: email,
            });
            resolve(filteredDocs);
        });
    },
    verifyPassword: async function (email, password) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) reject(false)
            bcrypt.compare(password, user.password, function(err, result) {
                if (result === true) {
                    resolve(true)
                } else {
                    reject(false)
                }
            });
        });
    },
    matchPasswords: async function (email, password) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const user = await collection.findOne({
                email: email,
            });
            if (!user) reject(false)
            if (user.password === password) {
                resolve(true)
            } else {
                reject(false)
            }
        });
    },
    createUser: async function (username, email, password) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.getSettings()
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                email: email,
            });
            if (filteredDocs) {
                reject("emailexists")
            } else {
                const filteredDocs2 = await collection.findOne({
                    username: username,
                });
                if (filteredDocs2) {
                    reject("usernameexists")
                } else {
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(password, salt, async function (err, hash) {
                            if (err) reject(err)
                            if (settings.manualApproval === true) {
                                await collection.insertOne({
                                    username: username,
                                    email: email,
                                    password: hash,
                                    staff: false,
                                    approved: false,
                                    dateadded: Date(),
                                });
                                resolve("approval")
                            } else {
                                await collection.insertOne({
                                    username: username,
                                    email: email,
                                    password: hash,
                                    staff: false,
                                    approved: true,
                                    dateadded: Date(),
                                });
                                resolve(true)
                            }
                        });
                    });
                }
            }
        });
    },
    generateID: async function () {
        return new Promise(async (resolve, reject) => {
            let id
            let isUnique = false
            const collection = db.collection("characters");
            while (isUnique === false) {
                id = await uuidv4()
                const filteredDocs = await collection.findOne({
                    id: id,
                });
                if (!filteredDocs) {
                    isUnique = true
                } else {
                    isUnique = false
                }
            }
            resolve(id)
        })
    },
    createCharacter: async function (data, owner) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const generatedID = await this.generateID()
            await collection.insertOne({
                name: data.name,
                dob: data.dob,
                height: data.height,
                weight: data.weight,
                gender: data.gender,
                ethnicity: data.ethnicity,
                hair: data.hair,
                address: data.address,
                job: data.job,
                driver: data.driver,
                gun: data.gun,
                pilot: data.pilot,
                leo: false,
                department: null,
                callsign: null,
                status: null,
                owner: owner,
                id: generatedID,
                dateadded: Date(),
            });
            resolve(true)
        });
    },
    createPenalCode: async function (data, creator) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("penal_code");
            const generatedID = await this.generateID()
            await collection.insertOne({
                name: data.name,
                penalty: data.penalty,
                id: generatedID,
                createdby: creator,
                dateadded: Date(),
            });
            resolve(true)
        });
    },
    deletePenalCode: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("penal_code");
            await collection.deleteOne({
                id: id,
            });
            resolve(true)
        });
    },
    getCharacters: async function (username) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.find({ owner: username }).toArray();
            resolve(filteredDocs)
        })
    },
    getAllCharacters: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.find({}).toArray();
            const characters = []
            for (var i = 0; i < filteredDocs.length; i++) {
                characters.push({ "Name": filteredDocs[i].name, "Date Of Birth": filteredDocs[i].dob, "Job": filteredDocs[i].job, "Address": filteredDocs[i].address, "uuid": filteredDocs[i].id })
            }
            resolve(characters)
        })
    },
    getCharacter: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.findOne({
                id: id,
            });
            resolve(filteredDocs)
        })
    },
    getAllLEOs: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.find({ leo: true }).toArray();
            const officers = []
            for (var i = 0; i < filteredDocs.length; i++) {
                if (filteredDocs[i].status === "10-42") {
                    
                } else {
                    officers.push({ "Name": filteredDocs[i].name, "Callsign": filteredDocs[i].callsign, "Department": filteredDocs[i].department, "Status": filteredDocs[i].status })
                }
            }
            resolve(officers)
        })
    },
    setPanic: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $set: { status: "PANIC" } });
            resolve(true)
        })
    },
    setStatus: async function (id, status) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $set: { status: status } });
            resolve(true)
        })
    },
    addArrest: async function (id, offense, penalty, officer) {
        return new Promise(async (resolve, reject) => {
            const generatedID = await this.generateID()
            const collection = db.collection("arrests");
            await collection.insertOne({
                character_id: id,
                offense: offense,
                penalty: penalty,
                id: generatedID,
                issued_by: officer,
                dateadded: Date(),
            });
            resolve(true)
        })
    },
    getArrests: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("arrests");
            const filteredDocs = await collection.find({ character_id: id }).toArray();
            resolve(filteredDocs)
        })
    },
    getWarrants: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("warrants");
            const filteredDocs = await collection.find({ character_id: id }).toArray();
            resolve(filteredDocs)
        })
    },
    addWarrant: async function (id, offense, penalty, officer, status) {
        return new Promise(async (resolve, reject) => {
            const generatedID = await this.generateID()
            const collection = db.collection("warrants");
            await collection.insertOne({
                character_id: id,
                offense: offense,
                penalty: penalty,
                id: generatedID,
                issued_by: officer,
                status: status,
                dateadded: Date(),
            });
            resolve(true)
        })
    },
    editWarrantStatus: async function (id, status) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("warrants");
            await collection.updateOne({ id: id }, { $set: { status: status } });
            resolve(true)
        })
    },
    getWarrant: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("warrants");
            const filteredDocs = await collection.findOne({
                id: id,
            });
            resolve(filteredDocs)
        })
    },
    getCitations: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("citations");
            const filteredDocs = await collection.find({ character_id: id }).toArray();
            resolve(filteredDocs)
        })
    },
    addCitation: async function (id, offense, penalty, officer) {
        return new Promise(async (resolve, reject) => {
            const generatedID = await this.generateID()
            const collection = db.collection("citations");
            await collection.insertOne({
                character_id: id,
                offense: offense,
                penalty: penalty,
                id: generatedID,
                issued_by: officer,
                dateadded: Date(),
            });
            resolve(true)
        })
    },
    getAllUsersRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllCharactersRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllVehiclesRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllArrestsRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("arrests");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllWarrantsRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("warrants");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllCitationsRaw: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("citations");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllPenalCodes: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("penal_code");
            const filteredDocs = await collection.find({}).toArray();
            const penal_codes = []
            for (var i = 0; i < filteredDocs.length; i++) {
                penal_codes.push({ "Name": filteredDocs[i].name, "Penalty": filteredDocs[i].penalty, "Created by": filteredDocs[i].createdby, "ID": filteredDocs[i].id })
            }
            resolve(penal_codes)
        })
    },
    getPenalCodes: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("penal_code");
            const filteredDocs = await collection.find({}).toArray();
            resolve(filteredDocs)
        })
    },
    getAllVehicles: async function () {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            const filteredDocs = await collection.find({}).toArray();
            const vehicles = []
            for (var i = 0; i < filteredDocs.length; i++) {
                vehicles.push({ "Make": filteredDocs[i].make, "Model": filteredDocs[i].model, "Plate": filteredDocs[i].plate, "Colour": filteredDocs[i].colour, "uuid": filteredDocs[i].id })
            }
            resolve(vehicles)
        })
    },
    getCharactersVehicles: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            const filteredDocs = await collection.find({ owner: id }).toArray();
            resolve(filteredDocs)
        })
    },
    getVehicle: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            const filteredDocs = await collection.findOne({ id: id })
            resolve(filteredDocs)
        })
    },
    editVehicle: async function (data, id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            await collection.updateOne({ id: id }, { $set: { plate: data.plate, make: data.make, model: data.model, colour: data.colour } });
            resolve(true)
        })
    },
    deleteVehicle: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            await collection.deleteOne({
                id: id,
            });
            resolve(true)
        })
    },
    createVehicle: async function (data, owner) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("vehicles");
            const generatedID = await this.generateID()
            await collection.insertOne({
                plate: data.plate,
                make: data.make,
                model: data.model,
                colour: data.colour,
                owner: owner,
                id: generatedID,
                dateadded: Date(),
            });
            resolve(true)
        });
    },
    /*
    addArrest: async function (id, offense, time) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $push: { record: {"offense": offense, "time": time} } });
            resolve(true)
        })
    }
    */ //For my future refference
};