const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/me', async (req, res) => {
	res.json({ account: req.session.account, currentCharacter: req.session.currentCharacter})
});

router.get('/getBackground', async (req, res) => {
	const files = fs.readdirSync("./public/backgrounds");
	let chosenFile = files[Math.floor(Math.random() * files.length)];
	res.json({ background: chosenFile });
});

router.use('/auth', require('./auth/index.js'));

module.exports = router;