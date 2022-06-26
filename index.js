const path = require('path');
const express = require('express');
const app = express();
require('express-ws')(app);
const cors = require('cors');
const session = require('express-session');
const { loadWebconfig } = require('./lib/functions');
const webconfig = loadWebconfig();
const MongoDBStore = require('connect-mongodb-session')(session);
const log = require('./lib/logger');
require('./lib/database');
const db = require('./lib/database');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	cors({
		origin: webconfig.dashboard_url,
		credentials: true,
		optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
	})
);

const store = new MongoDBStore({
	uri: webconfig.connection_uri,
	databaseName: webconfig.database,
	collection: 'sessions'
});

store.on('error', function (error) {
	log.error(error);
});

app.use(
	session({
		secret: webconfig.secret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			secure: webconfig.ssl
		},
		store: store
	})
);

app.get('/', async (req, res) => {
	if (!req.session.account || !req.session.account.email) return res.redirect('/auth/login');
	res.redirect('/dashboard')
});

app.use(express.static(path.resolve(__dirname, './frontend/dist')));
app.use(express.static(path.resolve(__dirname, './public')));

app.use('/api', require('./router/index.js'));

app.use('/dashboard/*', async (req, res, next) => {
	if (!req.session.account) return res.redirect('/auth/login');
	const user = await db.getUser(req.session.account.email);
	if (!user) return res.redirect('/auth/login');
	if (user.approved === false) return res.redirect('/auth/login');
	const characters = await db.getCharacters(user.username);

	if (!characters) {
		req.session.currentCharacter = null
	} else {
		if (req.session.currentCharacter) {
			let currentCharacterUpdated = await db.getCharacter(req.session.currentCharacter.id);
			currentCharacterUpdated._id = currentCharacterUpdated._id.toString()
			if (JSON.stringify(req.session.currentCharacter) != JSON.stringify(currentCharacterUpdated)) {
				log.debug("The currentCharacter session is different from the one in the db (They probably switched their LEO status). Setting the new session.")
				req.session.currentCharacter = currentCharacterUpdated
			}
		}
	}

	next();
});

app.get('*', async (req, res) => {
	const pathname = req._parsedUrl.pathname;
	if (!pathname.includes('/auth')) {
		if (!pathname.includes('/api')) {
			if (!req.session.account || !req.session.account.email) return res.redirect('/auth/login');
			const user = await db.getUser(req.session.account.email);
			if (!user) return res.redirect('/auth/login');
		}
	}
	res.sendFile(path.resolve(__dirname, './frontend/dist', 'index.html'));
});

app.listen(webconfig.port, () => {
	log.web(`Server started on port ${webconfig.port}`);
});
