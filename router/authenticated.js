const path = require("path");
const fs = require('fs')
const db = require('../functions/db');

async function router(app, opts) {
    app.use('*', async (req, res, next) => {
        if (!request.session.authenticated || request.session.authenticated != true) return res.redirect('/')

        next()
    })

    fs.readdirSync(path.join(`${__dirname}/authenticated`))
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            app.require(require(`${__dirname}/authenticated/${file}`));
        });
}

module.exports = router;