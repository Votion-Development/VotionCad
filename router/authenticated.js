const path = require("path");
const fs = require('fs')
const db = require('../functions/db');
const log = require('../functions/logger')

async function router(app, opts) {
    app.addHook('preHandler', async (request, reply) => {
        if (request.method == "GET") {
            const account = request.session.get('account');
            if (!account) return request.destroySession(() => reply.redirect('/login'));

            const user = await db.getUser(account.email)
            if (!user) return request.destroySession(() => reply.redirect('/login'));
            if (user.approved === false) return request.destroySession(() => reply.redirect('/login'));

            const characters = await db.getCharacters(user.username);

            const currentCharacter = request.session.get('currentCharacter');

            if (!characters) {
                request.session.set('currentCharacter', null);
            } else {
                if (!currentCharacter) {
                    request.session.set('currentCharacter', characters[0]);
                } else {
                    const currentCharacterUpdated = await db.getCharacter(currentCharacter.id);
                    currentCharacterUpdated._id = currentCharacterUpdated._id.toString()
                    if (JSON.stringify(currentCharacter) != JSON.stringify(currentCharacterUpdated)) {
                        log.debug("The currentCharacter session is different from the one in the db. Setting the new session.")
                        request.session.set('currentCharacter', currentCharacterUpdated);
                    }
                }
            }

            user._id = user._id.toString()
            if (JSON.stringify(account) != JSON.stringify(user)) {
                log.debug("The account session is different from the one in the db. Setting the new session.")
                request.session.set('account', user);
            }
        } else {
            const account = request.session.get('account');
            if (!account) return request.destroySession(() => reply.send('unauthorised'));

            const user = await db.getUser(account.email);
            if (!user) return request.destroySession(() => reply.send('unauthorised'));
        }
    })

    fs.readdirSync(path.join(`${__dirname}/authenticated`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.register(require(`${__dirname}/authenticated/${file}`));
        });
}

module.exports = router;