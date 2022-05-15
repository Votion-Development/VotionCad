const express = require("express")
const path = require('path');

const app = express();

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(3000, () => {
    console.log(`Server listening on port 3000`);
});