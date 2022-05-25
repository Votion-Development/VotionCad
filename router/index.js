const fs = require("fs")
const path = require("path")
const db = require("../lib/database")
const express = require('express');
const router = express.Router();

router.get('/me', async (req, res) => {
    if (!req.session.account) return res.json({ user: req.session.account, currentCharacter: req.session.currentCharacter })
    const user = await db.getUser(req.session.account.email)
    req.session.account = user
    let session = req.session.account
    session.password = ''
    res.json({ user: req.session.account, currentCharacter: req.session.currentCharacter })
})

router.get('/me/characters', async (req, res) => {
    if (!req.session.account) return res.json({ "error": 403 })
    const characters = await db.getCharacters(req.session.account.username);
    res.json({ characters: characters })
})

router.get('/getBackground', async (req, res) => {
    const files = fs.readdirSync(path.join(__dirname, '../frontend/public/backgrounds'));
    let chosenFile = files[Math.floor(Math.random() * files.length)];
    res.json({ background: chosenFile });
})

router.post('/auth/login', async (req, res) => {
    const body = req.body
    console.log(body)
    const user = await db.getUser(body.email)
    if (!user) {
        return res.send({ "error": "Email or password not correct." })
    }
    let pass
    try {
        pass = await db.verifyPassword(body.email, body.password)
    } catch {
        return res.send({ "error": "Email or password not correct." })
    }
    if (pass != true) {
        return res.send({ "error": "Email or password not correct." })
    }
    if (user.approved === false) {
        return res.send({ error: "You are still waiting for a Cad Admin to approve your account! Please try again later." })
    }
    const characters = await db.getCharacters(user.username)
    let character
    if (!characters) {
        character = null
    } else {
        character = characters[Math.floor(Math.random() * characters.length)]
    }
    user._id = user._id.toString()
    character._id = character._id.toString()
    req.session.account = user
    req.session.currentCharacter = character
    req.session.save()
    console.log(req.session.currentCharacter)
    res.send({ success: true })
});

router.post('/characters/switch/:id', async (req, res) => {
    if (!req.session.account) return res.json({ "error": 403 })
    if (!req.params.id) return res.send({ error: "noid" })
    const account = req.session.account;
    const character = await db.getCharacter(req.params.id);
    if (!character) return res.send({ error: "notfound" });
    if (character.owner != account.username) return res.send({ error: "notowner" });
    req.session.currentCharacter = character;
    res.send({ success: true });
})

router.get('/character/:id', async (req, res) => {
    if (!req.session.account) return res.json({ "error": 403 })
    const character = await db.getCharacter(req.params.id);
    if (character.owner != req.session.account.username) return res.send({ error: "notowner" });
    const vehicles = await db.getCharactersVehicles(req.params.id)
    res.json({ character: character, vehicles: vehicles })
})

router.get('/character/:id/record', async (req, res) => {
    if (!req.session.account) return res.json({ "error": 403 })
    const character = await db.getCharacter(req.params.id);
    if (character.owner != req.session.account.username) return res.send({ error: "notowner" });
    const warrants = await db.getWarrants(req.params.id)
    const arrests = await db.getArrests(req.params.id)
    const citations = await db.getCitations(req.params.id)
    const warnings = await db.getWarnings(req.params.id)
    res.json({ warrants: warrants, arrests: arrests, citations: citations, warnings: warnings })
})

router.get('/leo/statistics', async (req, res) => {
    if (!req.session.account) return res.json({ "error": 403 })
    if (!req.session.currentCharacter) return res.json({ "error": "nocurrentcharater" })
    if (req.session.currentCharacter.leo != true) return res.json({ "error": "noleo" })
    const warrants = await db.getAllWarrantsRaw()
    const bolos = await db.getAllBolosRaw()
    res.json({ warrants: warrants.length, bolos: bolos.length })
})

module.exports = router;