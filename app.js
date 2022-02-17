const db = require('./functions/db');
const { loadWebconfig } = require('./functions');
const log = require('./functions/logger')
const path = require('path')

const webconfig = loadWebconfig();

const fastify = require('fastify');
const session = require('@fastify/session');
const MongoStore = require('connect-mongodb-session')(session);

const app = fastify();

app.register(require('fastify-cookie'), {
    secret: webconfig.secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
});

app.register(session, {
    secret: webconfig.secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: webconfig.ssl
    },
    store: new MongoStore({
        uri: webconfig.connection_uri,
        collection: 'sessions'
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
})

app.register(require('fastify-formbody'))

app.register(require('./router/index'), {
    prefix: '/'
})

app.register(require('./router/authenticated'), {
    prefix: '/dashboard'
})

app.listen(webconfig.port).then(() => {
    log.web(`Votion Cad listening on port ${webconfig.port}.`)
})

app.ready().then(() => {
    log.web("The dashboard has fully started!")
    console.log(app.printRoutes())
}, (err) => {
    log.error(err)
})