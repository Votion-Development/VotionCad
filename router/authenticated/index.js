const db = require('../../functions/db');
const fs = require('fs');
const path = require("path");

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings();
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const user = await db.getUser(account.email);
        const characters = await db.getCharacters(account.username);
        reply.view("./views/dashboard", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters });
    });

    app.get('/penal_code', async (request, reply) => {
        const settings = await db.getSettings();
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const user = await db.getUser(account.email);
        const characters = await db.getCharacters(account.username);
        const penal_codes = await db.getPenalCodes()
        reply.view("./views/penal_codes", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, penal_codes: penal_codes });
    });

    app.get('/characters/new', async (request, reply) => {
        const settings = await db.getSettings();
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const user = await db.getUser(account.email);
        const characters = await db.getCharacters(account.username);
        reply.view("./views/new_character", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters });
    });

    app.post('/characters/new', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        const character = await db.createCharacter(body, account.username).catch(e => {
            reply.send({ "error": "unknown" });
        })
        if (character === true) {
            reply.send({ "success": true });
        } else {
            reply.send({ "error": "unknown" });
        }
    });

    app.get('/characters/:id', async (request, reply) => {
        const settings = await db.getSettings()
        const character = await db.getCharacter(request.params.id);
        if (!character) return reply.redirect("/dashboard");
        const account = request.session.get('account');
        if (character.owner != account.username) return reply.redirect("/dashboard");
        const user = await db.getUser(account.email);
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const warrants = await db.getWarrants(request.params.id)
        const arrests = await db.getArrests(request.params.id)
        const citations = await db.getCitations(request.params.id)
        reply.view("./views/character_overview", { settings: settings, user: user, character: character, characters: characters, currentCharacter: currentCharacter, warrants: warrants, arrests: arrests, citations: citations });
    })

    app.post('/characters/switch', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        const character = await db.getCharacter(body.id)
        if (!character) return reply.send({ error: "notfound" })
        if (character.owner != account.username) return reply.send({ error: "notowner" })
        request.session.set('currentCharacter', character);
        reply.send({ success: true })
    })

    app.get('/penal_code/ajax', async (request, reply) => {
        const penal_codes = await db.getAllPenalCodes()
        reply.send({ data: penal_codes})
    });

    fs.readdirSync(path.join(`${__dirname}/leo`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/leo/${file}`), {
                prefix: '/leo'
            });
        });

    fs.readdirSync(path.join(`${__dirname}/staff`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/staff/${file}`), {
                prefix: '/staff'
            });
        });
}

module.exports = router;