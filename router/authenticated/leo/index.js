const db = require('../../../functions/db');
const fs = require('fs');
const { loadWebconfig } = require('../../../functions');
const webconfig = loadWebconfig();
const WebSocket = require('ws');
const Tokens = require('csrf');
const { request } = require('http');
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    const wss = new WebSocket.Server({ server: app.server, path: "/dashboard/leo" });

    app.addHook('preHandler', async (request, reply) => {
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const currentCharacter = request.session.get('currentCharacter');
        if (!currentCharacter) return reply.redirect('/dashboard');
        const user = await db.getUser(account.email)
        if (!user) return request.destroySession(() => reply.redirect('/login'));
        request.session.set('account', user); // Refresh the session constantly so no updates get missed
        if (currentCharacter.leo != true) return reply.redirect("/dashboard")
        const pass = await db.verifyPassword(account.email, account.password).catch(e => { return request.destroySession(() => reply.redirect('/login')); })
        if (pass === false) return request.destroySession(() => reply.redirect('/login'));
    })

    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/leo/leo_dashboard", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, csrftoken: token });
    });

    app.get('/ajax', async (request, reply) => {
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const officers = await db.getAllLEOs()
        console.log(officers)
        reply.send({ data: officers})
    });

    app.post('/onduty', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send({ error: invalidsession }));
        const character = await db.getCharacter(body.id)
        if (!character) return reply.send({ error: notfound })
        if (character.owner != account.username) return reply.send({ error: notowner })
        const onduty = await db.setOnduty(body.id)
        if (onduty === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    });

    app.post('/offduty', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send({ error: invalidsession }));
        const character = await db.getCharacter(body.id)
        if (!character) return reply.send({ error: notfound })
        if (character.owner != account.username) return reply.send({ error: notowner })
        const offduty = await db.setOffduty(body.id)
        if (offduty === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    });

    wss.on('connection', (ws) => {
        ws.on('message', async function message(data) {
            if (data.toString("utf8") === "UPDATE") {
                wss.clients.forEach(function each(client) {
                    client.send("UPDATE");
                });
            } else if (JSON.parse(data.toString("utf8")).type === "PANIC") {
                const json = JSON.parse(data.toString("utf8"))
                const officer = await db.getCharacter(json.id)
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ "type": "PANIC", "officer": officer.name, "location": json.location }));
                });
            }
        });
    })
}

module.exports = router;