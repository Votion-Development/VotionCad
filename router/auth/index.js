const express = require('express');
const router = express.Router();
const db = require('../../lib/database')

router.post('/login', async (req, res) => {
	const body = req.body;
	console.log(body)
	const user = await db.getUser(body.email);
	if (!user) {
		return res.send({ error: 'Email or password not correct.' });
	}
	const pass = await db.verifyPassword(body.email, body.password);
	if (pass != true) {
		return res.send({ error: 'Email or password not correct.' });
	}
	user._id = user._id.toString();
	req.session.account = user;
	req.session.save();
	res.send({ success: true });
})

module.exports = router;