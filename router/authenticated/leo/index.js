const db = require('../../../functions/db');
const WebSocket = require('ws');

async function router(app, opts) {
    const wss = new WebSocket.Server({ server: app.server, path: "/dashboard/leo" });

    app.addHook('preHandler', async (request, reply) => {
        const currentCharacter = request.session.get('currentCharacter');
        if (currentCharacter.leo != true) return reply.redirect("/dashboard")
    })

    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/leo/leo_dashboard", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters });
    });

    app.get('/ajax', async (request, reply) => {
        const officers = await db.getAllLEOs()
        reply.send({ data: officers })
    });

    app.get('/search/person', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/leo/leo_character_search", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters });
    });

    app.get('/search/person/ajax', async (request, reply) => {
        const characters = await db.getAllCharacters()
        reply.send({ data: characters })
    });

    app.get('/search/vehicle', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        reply.view("./views/leo/leo_vehicle_search", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters });
    });

    app.get('/search/vehicle/ajax', async (request, reply) => {
        const vehicles = await db.getAllVehicles()
        reply.send({ data: vehicles })
    });

    app.get('/vehicle/:id', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const vehicle = await db.getVehicle(request.params.id)
        reply.view("./views/leo/leo_vehicle_overview", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, vehicle: vehicle });
    });

    app.post('/setStatus/:status', async (request, reply) => {
        const body = JSON.parse(request.body);
        const account = request.session.get('account');
        const character = await db.getCharacter(body.id)
        if (!character) return reply.send({ error: "notfound" })
        if (character.owner != account.username) return reply.send({ error: "notowner" })
        const status = await db.setStatus(body.id, request.params.status)
        if (status === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    })

    app.get('/person/:id', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const character = await db.getCharacter(request.params.id)
        const arrests = await db.getArrests(request.params.id)
        const warrants = await db.getWarrants(request.params.id)
        const citations = await db.getCitations(request.params.id)
        const vehicles = await db.getCharactersVehicles(request.params.id)
        reply.view("./views/leo/leo_person_overview", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, character: character, citations: citations, arrests: arrests, warrants: warrants, vehicles: vehicles });
    });

    app.get('/person/:id/arrest', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const character = await db.getCharacter(request.params.id)
        const penal_codes = await db.getAllPenalCodes()
        reply.view("./views/leo/leo_character_arrest", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, character: character, penal_codes: penal_codes });
    });

    app.post('/person/:id/arrest', async (request, reply) => {
        const body = JSON.parse(request.body);
        const currentCharacter = request.session.get('currentCharacter');
        if (currentCharacter.leo != true) return reply.send({ error: "notleo" })
        const character = await db.getCharacter(request.params.id)
        if (!character) return reply.send({ error: "notfound" })
        const addArrest = await db.addArrest(request.params.id, body.penal_code, body.penalty, currentCharacter.name)
        if (addArrest === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    });

    app.get('/person/:id/warrant', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const character = await db.getCharacter(request.params.id)
        const penal_codes = await db.getAllPenalCodes()
        reply.view("./views/leo/leo_character_warrant", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, character: character, penal_codes: penal_codes });
    });

    app.post('/person/:id/warrant', async (request, reply) => {
        const body = JSON.parse(request.body);
        const currentCharacter = request.session.get('currentCharacter');
        if (currentCharacter.leo != true) return reply.send({ error: "notleo" })
        const character = await db.getCharacter(request.params.id)
        if (!character) return reply.send({ error: "notfound" })
        const addWarrant = await db.addWarrant(request.params.id, body.penal_code, body.penalty, currentCharacter.name, body.status)
        if (addWarrant === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    });

    app.get('/person/:id/warrant/:warrant_id', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const character = await db.getCharacter(request.params.id)
        const penal_codes = await db.getAllPenalCodes()
        const warrant = await db.getWarrant(request.params.warrant_id)
        reply.view("./views/leo/leo_edit_warrant", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, character: character, penal_codes: penal_codes, warrant: warrant });
    });

    app.post('/person/:id/warrant/:warrant_id', async (request, reply) => {
        const body = JSON.parse(request.body);
        const currentCharacter = request.session.get('currentCharacter');
        if (currentCharacter.leo != true) return reply.send({ error: "notleo" })
        const character = await db.getCharacter(request.params.id)
        if (!character) return reply.send({ error: "notfound" })
        const addWarrant = await db.editWarrantStatus(request.params.warrant_id, body.status)
        if (addWarrant === true) {
            reply.send({ success: true })
        } else {
            reply.send({ success: false })
        }
    });

    app.get('/person/:id/citation', async (request, reply) => {
        const settings = await db.getSettings()
        const account = request.session.get('account');
        if (!request.params.id) reply.send("Unkown person.")
        const currentCharacter = request.session.get('currentCharacter');
        const characters = await db.getCharacters(account.username);
        const user = await db.getUser(account.email)
        const character = await db.getCharacter(request.params.id)
        const penal_codes = await db.getAllPenalCodes()
        reply.view("./views/leo/leo_character_citation", { settings: settings, user: user, currentCharacter: currentCharacter, characters: characters, character: character, penal_codes: penal_codes });
    });

    app.post('/person/:id/citation', async (request, reply) => {
        const body = JSON.parse(request.body);
        const currentCharacter = request.session.get('currentCharacter');
        if (currentCharacter.leo != true) return reply.send({ error: "notleo" })
        const character = await db.getCharacter(request.params.id)
        if (!character) return reply.send({ error: "notfound" })
        const addCitation = await db.addCitation(request.params.id, body.penal_code, body.penalty, currentCharacter.name)
        reply.send({ success: addCitation })
    });

    app.post('/staff/setaop', async (request, reply) => {
        let account = request.session.get('account');
        const user = await db.getUser(account.email)
        if (user.staff != true) return reply.send({ "error": 403 })
        const body = JSON.parse(request.body);
        db.setAOP(body.aop)
        reply.send({ "success": true })
    });

    wss.on('connection', (ws) => {
        ws.on('message', async function message(data) {
            if (data.toString("utf8") === "UPDATE") {
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ "action": "UPDATE" }));
                });
            } else if (data.toString("utf8") === "AOP") {
                const settings = await db.getSettings()
                ws.send(JSON.stringify({ "action": "AOP", "aop": settings.aop.toString('utf8') }))
            } else if (data.toString("utf8") === "UPDATEAOP") {
                const settings = await db.getSettings()
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ "action": "AOP", "aop": settings.aop.toString('utf8') }));
                });
            } else if (JSON.parse(data.toString("utf8")).action === "PANIC") {
                const json = JSON.parse(data.toString("utf8"))
                const officer = await db.getCharacter(json.id)
                if (!officer) ws.close()
                await db.setPanic(json.id)
                wss.clients.forEach(function each(client) {
                    client.send(JSON.stringify({ "action": "PANIC", "officer": officer.name, "location": json.location }));
                });
            }
        });
    })
}

module.exports = router;