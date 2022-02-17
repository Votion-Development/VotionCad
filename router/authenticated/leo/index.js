const db = require('../../../functions/db');
const fs = require('fs')
const Tokens = require('csrf')
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        reply.view("./views/leo/leo_dashboard", { settings: settings, csrftoken: token });
    })
}

module.exports = router;