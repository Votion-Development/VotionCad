const db = require('../../functions/db');

async function router(app, opts) {
    app.use('/', async (request, reply) => {
        const settings = await db.getSettings()
        reply.view("./views/login", { settings: settings, error: "" });
    })
}

module.exports = router;