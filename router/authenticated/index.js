const db = require('../../functions/db');
const fs = require('fs');
const path = require("path");
const Tokens = require('csrf')
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        reply.view("./views/dashboard", { settings: settings, csrftoken: token });
    })

    fs.readdirSync(path.join(`${__dirname}/leo`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/leo/${file}`), {
                prefix: '/leo'
            });
        });
}

module.exports = router;