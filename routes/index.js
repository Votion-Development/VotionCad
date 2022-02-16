const db = require('../functions/db');

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        reply.view("./views/login", { settings: settings, error: "" });
    })

    app.get('/test', async (request, reply) => {
        reply.view("./views/loader");
    })
}

module.exports = router;