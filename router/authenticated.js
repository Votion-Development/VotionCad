const path = require("path");
const fs = require('fs')
const db = require('../functions/db');

async function router(app, opts) {
    app.addHook('preHandler', async (request, reply) => {
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email)
        if (!user) return request.destroySession(() => reply.redirect('/login'));
        const characters = await db.getCharacters(user.username)
        if (!characters) {
            const character = null
            request.session.set('currentCharacter', character);
        } else {
            if (!currentCharacter) {
                const character = characters[0]
                request.session.set('currentCharacter', character);
            } else {
                const currentCharacterUpdated = await db.getCharacter(currentCharacter.id)
                request.session.set('currentCharacter', currentCharacterUpdated);
            }
        }
        request.session.set('account', user); // Refresh the session constantly so no updates get missed
        const pass = await db.verifyPassword(account.email, account.password).catch(e => { return request.destroySession(() => reply.redirect('/login')); })
        if (pass === false) return request.destroySession(() => reply.redirect('/login'));
    })

    fs.readdirSync(path.join(`${__dirname}/authenticated`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/authenticated/${file}`));
        });
}

module.exports = router;