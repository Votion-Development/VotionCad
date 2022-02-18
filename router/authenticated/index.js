const db = require('../../functions/db');
const fs = require('fs');
const path = require("path");
const Tokens = require('csrf')
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        let account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email)
        const characters = await db.getCharacters(account.username)
        const token = csrf.create(secret)
        reply.view("./views/dashboard", { settings: settings, user: user, characters: characters, csrftoken: token });
    })

    app.get('/characters/new', async (request, reply) => {
        const settings = await db.getSettings()
        let account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email)
        const token = csrf.create(secret)
        reply.view("./views/new_character", { settings: settings, user: user, csrftoken: token });
    })

    app.post('/characters/new', async (request, reply) => {
        const body = JSON.parse(request.body)
        let account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send('invalidsession'));
        if (!csrf.verify(secret, body.csrftoken)) return reply.send({ "error": "csrftokenmissmatch" })
        const character = await db.createCharacter(body, account.username).catch(e => {
            reply.send({ "error": "unknown" })
        })
        if (character === true) {
            reply.send({ "success": true })
        } else {
            reply.send({ "error": "unknown" })
        }
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