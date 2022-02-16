const db = require('./functions/db');
const { loadWebconfig } = require('./functions');
const log = require('./functions/logger')
const fastify = require('fastify');
const session = require('@fastify/session');
const MongoStore = require('connect-mongodb-session')(session);
const path = require('path')

const webconfig = loadWebconfig();

const router = require('./routes')

const app = fastify();

app.register(require('fastify-cookie'), {
    secret: webconfig.secret, // for cookies signature
    parseOptions: {}     // options for parsing cookies
});

const store = new MongoStore({
    uri: webconfig.connection_uri,
    collection: 'sessions'
});

app.register(session, {
    secret: webconfig.secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: webconfig.ssl
    },
    store
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

app.register(router, {
    prefix: '/'
})

app.listen(webconfig.port).then(() => {
    log.web(`Votion Cad started on port ${webconfig.port}.`)
})
