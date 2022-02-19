const db = require('../../functions/db');
const fs = require('fs');
const path = require("path");
const Tokens = require('csrf')
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings();
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        console.log(currentCharacter)
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email);
        const characters = await db.getCharacters(account.username);
        const token = csrf.create(secret);
        reply.view("./views/dashboard", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, csrftoken: token });
    });

    app.get('/characters/new', async (request, reply) => {
        const settings = await db.getSettings();
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email);
        const token = csrf.create(secret);
        const currentCharacter = await db.getCharacter(account.currentCharacter);
        reply.view("./views/new_character", { settings: settings, user: user, currentCharacter: currentCharacter, csrftoken: token });
    });

    app.post('/characters/new', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send('invalidsession'));
        if (!csrf.verify(secret, body.csrftoken)) return reply.send({ "error": "csrftokenmissmatch" })
        const character = await db.createCharacter(body, account.username).catch(e => {
            reply.send({ "error": "unknown" });
        })
        if (character === true) {
            reply.send({ "success": true });
        } else {
            reply.send({ "error": "unknown" });
        };
    });

    app.get('/characters/:id', async (request, reply) => {
        const settings = await db.getSettings()
        const character = db.getCharacter(request.params.id);
        if (!character) return reply.redirect("/dashboard");
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        if (character.owner != account.username) return reply.redirect("/dashboard");
        const currentCharacterCheck = await db.getCharacter(currentCharacter)
        if (!currentCharacterCheck) return reply.redirect("/dashboard")
        const token = csrf.create(secret)
        reply.view("./views/character_overview", { settings: settings, character: character, currentCharacter: currentCharacter, csrftoken: token });
    })

    app.post('/characters/switch', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send({ error: invalidsession }));
        const character = await db.getCharacter(body.id)
        if (!character) return reply.send({ error: notfound })
        if (character.owner != account.username) return reply.send({ error: notowner })
        request.session.set('currentCharacter', character);
        reply.send({ success: true })
    })

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