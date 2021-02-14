const express = require('express');
const mongoose = require('mongoose');
const uuid = require('uuid');
const fs = require('fs');
const usersFile = require('./tempUsers.json');

const app = express();

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

// mongoose setup
const dbConnectionString = 'mongodb://localhost/mtech';

mongoose.connect(dbConnectionString, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.set('useFindAndModify', false)
const database = mongoose.connection;

database.once('open', () => {
    console.log('Database connected');
});

database.on('error', console.error.bind(console, 'connection error:'));

const userSchema = new mongoose.Schema({
    user_id: String,
    first_name: String,
    last_name: String,
    email_address: String,
    age: Number
})

const users = mongoose.model('Users', userSchema);



app.get('/', (req, res) => {
    res.render('index')
})

app.get('/form', (req, res) => {
    res.render('form')
})

app.get('/users', (req, res) => {
    users.find({}, (err, data) => { // This callback gets our data from the database
        if (err) throw err;
        res.render('users', { users: data })
    })
})

app.post('/users', (req, res) => {
    let newUser = new users();
    newUser.user_id = uuid.v4();
    newUser.first_name = req.body.first_name;
    newUser.last_name = req.body.last_name;
    newUser.email_address = req.body.email_address;
    newUser.age = req.body.age;

    newUser.save((err) => { // this line saves to the database, then returns you to the home screen in the callback.
        if (err) throw err
        res.redirect('/users')
    })
})

app.get('/edit/:user_id', (req, res) => {
    users.findOne({ user_id: req.params.user_id }, (err, data) => {
        res.render('editUser', { user: data })
    })
})

app.post('/edit/:user_id', (req, res) => {
    const userToEdit = req.params.user_id;

    users.findOneAndUpdate({ user_id: userToEdit }, {
        user_id: req.body.user_id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email_address: req.body.email_address,
        age: req.body.age
    }, (err) => {
        if (err) throw err;
        res.redirect('/users')
    })
})

app.post('/delete/:user_id', (req, res) => {
    const userToDelete = req.params.user_id;
    users.findOneAndDelete({ user_id: userToDelete }, (err, data) => { 
        if (err) throw err
        console.log(`User removed: ${data}`)
        res.redirect('/users')
    })
})

app.post('/filter', (req, res) => {
    const filter = req.body.filter;

    if (req.body.filterCheck == 'on') {
        if (filter == 'firstFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {first_name: -1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'lastFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {last_name: -1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'emailFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {email_address: -1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'ageFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {age: -1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
    } else {
        if (filter == 'firstFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {first_name: 1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'lastFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {last_name: 1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'emailFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {email_address: 1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
        if (filter == 'ageFilter') {
            users.find({}, ['user_id', 'first_name', 'last_name', 'email_address', 'age'], { sort: {age: 1} }, (err, data) => {
                if (err) throw err;
                res.render('users', { users: data })
            })
        }
    }
})

app.post('/search', (req, res) => {
    users.find({ first_name: req.body.search }, (err, data) => {
        res.render('users', { users: data })
    })
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})