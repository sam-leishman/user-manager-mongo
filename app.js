const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.listen(port, (err) => {
    if (err) throw (err);
    console.log(`Listening on port ${port}`);
});