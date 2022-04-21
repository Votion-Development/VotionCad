const { loadWebconfig } = require('./functions');
const log = require('./functions/logger')
const path = require('path')
const fs = require('fs');

const webconfig = loadWebconfig();

const fastify = require('fastify');

let app;

if (webconfig.ssl === true) {
    app = fastify({
        https: {
            key: fs.readFileSync(path.join(__dirname, '/ssl/fastify.key')),
            cert: fs.readFileSync(path.join(__dirname, '/ssl/fastify.cert'))
        }
    });
} else {
    app = fastify({
    });
}
const session = require('@fastify/session');
const Sqlite = require('better-sqlite3')
const SqliteStore = require('better-sqlite3-session-store')(session)
const session_db = new Sqlite('sessions.db')

app.register(require('fastify-cookie'), {
    secret: webconfig.secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
});

app.register(session, {
    secret: webconfig.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: webconfig.ssl
    },
    store: new SqliteStore({
        client: session_db,
        expired: {
            clear: true,
            intervalMs: 900000
        }
    })
});

app.register(require("point-of-view"), {
    engine: {
        ejs: require("ejs"),
    },
});

app.register(require('fastify-static'), {
    root: path.join(__dirname, 'static'),
    prefix: '/static/', // optional: default '/'
});

app.register(require('fastify-formbody'))

app.register(require('./router/index'), {
    prefix: '/'
});

app.register(require('./router/authenticated'), {
    prefix: '/dashboard'
});

app.addHook('preHandler', async (request, reply) => {
    log.debug(`${request.method} ${request.url}`)
})

app.setNotFoundHandler((request, reply) => {
	reply.view("./views/404")
});

if (webconfig.environment === 'production') {
    app.listen(webconfig.port, "0.0.0.0").then(() => {
        log.web(`Votion Cad listening on port ${webconfig.port} on 0.0.0.0.`)
    });
} else {
    app.listen(webconfig.port).then(() => {
        log.web(`Votion Cad listening on port ${webconfig.port}.`)
    });
}


app.ready().then(async () => {
    log.web("The dashboard has fully started!")
    console.log(app.printRoutes())
}, err => {
    log.error(err)
});
