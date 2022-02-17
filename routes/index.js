const db = require('../functions/db');

async function router(app, opts) {
    app.get('/', async (request, reply) => {
        const settings = await db.getSettings()
        if (!request.session.authenticated || request.session.authenticated != true) return reply.redirect('/login')
        reply.redirect("/dashboard")
    })

    app.get('/login', async (request, reply) => {
        const settings = await db.getSettings()
        reply.view("./views/login", { settings: settings, error: "" });
    })

    app.post('/login', async (request, reply) => {
        console.log(request.body)
        const user = await db.getUser(request.body.email)
        if (!user) {
            return reply.send({ "error": "invaliduserorpass"})
        }
    })
}

module.exports = router;