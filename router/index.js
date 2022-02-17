const db = require('../functions/db');
const Tokens = require('csrf')
const fs = require('fs');
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {

    app.get('/', async (request, reply) => {
        let account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login?err=INVALIDSESSION'));
        reply.redirect("/dashboard")
    })

    app.get('/login', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        const files = fs.readdirSync("./static/images/backrounds");
        let chosenFile = files[Math.floor(Math.random() * files.length)];
        reply.view("./views/login", { settings: settings, csrftoken: token, error: "", image: chosenFile });
    })

    app.post('/login', async (request, reply) => {
        const body = JSON.parse(request.body)
        if (!csrf.verify(secret, body.csrftoken)) return reply.send({ "error": "csrftokenmissmatch" })
        const user = await db.getUser(body.email)
        if (!user) {
            return reply.send({ "error": "invaliduserorpass" })
        }
        request.session.set('account', user);
        reply.send({ success: true })
    })

    app.get('/signup', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        const files = fs.readdirSync("./static/images/backrounds");
        let chosenFile = files[Math.floor(Math.random() * files.length)];
        reply.view("./views/signup", { settings: settings, csrftoken: token, error: "", image: chosenFile });
    })

    app.post('/signup', async (request, reply) => {
        const body = JSON.parse(request.body)
        if (!csrf.verify(secret, body.csrftoken)) return reply.send({ "error": "csrftokenmissmatch" })
        const user = await db.createUser(body.username, body.email, body.password).catch(e => {
            if (e === "emailexists") {
                return reply.send({ error: "emailexists" })
            } else if (e === "usernameexists") {
                return reply.send({ error: "usernameexists" })
            } else {
                return reply.send({ error: "unknown" })
            }
        })
        if (user === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    })

    app.get('/logout', async (request, reply) => {
        return request.destroySession(() => reply.redirect('/login'));
    })
}

module.exports = router;