const path = require("path");
const fs = require('fs')
const db = require('../functions/db');

async function router(app, opts) {
    app.addHook('preHandler', async (request, reply) => {
        let account = request.session.get('account');
        console.log(account, 1)
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email)
        console.log(user, 2)
        if (!user) return request.destroySession(() => reply.redirect('/login'));
        request.session.set('account', user); // Refresh the session constantly so no updates get missed
        const pass = await db.verifyPassword(account.email, account.password)
        console.log(pass, 3)
        if (pass === false) return request.destroySession(() => reply.redirect('/login'));
    })

    fs.readdirSync(path.join(`${__dirname}/authenticated`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/authenticated/${file}`));
        });
}

module.exports = router;