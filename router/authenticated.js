const path = require("path");
const fs = require('fs')
const db = require('../functions/db');

async function router(app, opts) {
    app.addHook('preHandler', (request, reply, done) => {
        let account = request.session.get('account');
        console.log(account)
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const pass = db.verifyPassword(account.email, account.password)
        if (pass === false) return request.destroySession(() => reply.redirect('/login'));
        done()
    })

    fs.readdirSync(path.join(`${__dirname}/authenticated`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/authenticated/${file}`));
        });
}

module.exports = router;