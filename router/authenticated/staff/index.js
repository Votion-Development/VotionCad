const db = require('../../../functions/db');
const Tokens = require('csrf')
const csrf = new Tokens()

const secret = csrf.secretSync()

async function router(app, opts) {
    app.addHook('preHandler', async (request, reply) => {
        let account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const user = await db.getUser(account.email)
        if (!user) return request.destroySession(() => reply.redirect('/login'));
        request.session.set('account', user); // Refresh the session constantly so no updates get missed
        if (user.staff != true) return reply.redirect("/dashboard")
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
        const users_raw = await db.getAllUsersRaw()
        const characters_raw = await db.getAllCharactersRaw()
        const vehicles_raw = await db.getAllVehiclesRaw()
        const arrests_raw = await db.getAllArrestsRaw()
        const warrants_raw = await db.getAllWarrantsRaw()
        const citations_raw = await db.getAllCitationsRaw()
        reply.view("./views/staff/staff_dashboard", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, csrftoken: token, users: users_raw.length, characters: characters_raw.length, vehicles: vehicles_raw.length, arrests: arrests_raw.length, warrants: warrants_raw.length, citations: citations_raw.length });
    })

    app.get('/penal_code', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/staff/staff_penal_code", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, csrftoken: token });
    })

    app.post('/penal_code/new', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send('invalidsession'));
        if (!csrf.verify(secret, body.csrftoken)) return reply.send({ "error": "csrftokenmissmatch" })
        const character = await db.createPenalCode(body, account.username).catch(e => {
            reply.send({ "error": "unknown" });
        })
        if (character === true) {
            reply.send({ "success": true });
        } else {
            reply.send({ "error": "unknown" });
        };
    })

    app.post('/penal_code/delete', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.send('invalidsession'));
        const character = await db.deletePenalCode(body.id).catch(e => {
            reply.send({ "error": "unknown" });
        })
        if (character === true) {
            reply.send({ "success": true });
        } else {
            reply.send({ "error": "unknown" });
        };
    })

    app.get('/penal_code/ajax', async (request, reply) => {
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const penal_codes = await db.getAllPenalCodes()
        reply.send({ data: penal_codes})
    });

    app.get('/users', async (request, reply) => {
        const settings = await db.getSettings()
        const token = csrf.create(secret)
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/staff/staff_users", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, csrftoken: token });
    })

    app.get('/users/ajax', async (request, reply) => {
        const account = request.session.get('account');
        if (!account) return request.destroySession(() => reply.redirect('/login'));
        const penal_codes = await db.getAllPenalCodes()
        reply.send({ data: penal_codes})
    });
}

module.exports = router;