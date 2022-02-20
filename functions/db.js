const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const log = require('./logger');
const functions = require('.');
const bcrypt = require("bcrypt");
const { resolve } = require('path/posix');
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
        'users', 'sessions', 'departments', 'vehicles', 'characters', 'settings'
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
    getCharacters: async function (username) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            const filteredDocs = await collection.find({ owner: username }).toArray();
            resolve(filteredDocs)
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
    setOnduty: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $set: { status: "10-8", onduty: true } });
            resolve(true)
        })
    },
    setOffduty: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $set: { status: "10-42", onduty: false } });
            resolve(true)
        })
    },
    setPanic: async function (id) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("characters");
            await collection.updateOne({ id: id }, { $set: { status: "PANIC" } });
            resolve(true)
        })
    }
};