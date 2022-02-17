const { MongoClient } = require('mongodb');
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
                            name: 'Votion Cad'
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
            const user = this.getUser(email);
            bcrypt.compare(password, user.password, async function (err, result) {
                if (result) {
                    resolve(true);
                } else {
                    resolve(false)
                }
            });
        });
    },

    createUser: async function (username, email, password) {
        return new Promise(async (resolve, reject) => {
            const collection = db.collection("users");
            const filteredDocs = await collection.findOne({
                email: email,
            });
            if (filteredDocs) reject("emailexists")
            const filteredDocs2 = await collection.findOne({
                username: username,
            });
            if (filteredDocs2) reject("usernameexists")
            bcrypt.genSalt(saltRounds, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    if (err) reject(err)
                    await collection.insertOne({
                        username: username,
                        email: email,
                        password: hash,
                        dateadded: Date(),
                    });
                    resolve(true)
                });
            });
            
            resolve(true);
        });
    },
};