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
    fs.readFile('./tempUsers.json', (err, data) => {
        if (err) throw err;
        const usersObj = JSON.parse(data);

        res.render('users', { users: usersObj.users })
    })
})

app.get('/editUsers', (req, res) => {
    fs.readFile('./tempUsers.json', (err, data) => {
        if (err) throw err;
        const usersObj = JSON.parse(data);

        res.render('editUsers', { users: usersObj.users })
    })
})

app.post('/users', (req, res) => {
    let user = {};
    user.user_id = uuid.v4();
    user.first_name = req.body.first_name;
    user.last_name = req.body.last_name;
    user.email_address = req.body.email_address;
    user.age = req.body.age;

    usersFile.users.push(user)
    const userData = JSON.stringify(usersFile, null, 2)
    fs.writeFile('./tempUsers.json', userData, (err) => {
        if (err) throw err;
    })

    fs.readFile('./tempUsers.json', (err, data) => {
        if (err) throw err;
        const usersObj = JSON.parse(data);

        res.render('users', { users: usersObj.users })
    })
})

app.post('/updateUsers', (req, res) => {
    let postUser = {};
    postUser.user_id = req.body.user_id;
    postUser.first_name = req.body.first_name;
    postUser.last_name = req.body.last_name;
    postUser.email_address = req.body.email_address;
    postUser.age = req.body.age;

    if (req.body.update == 'Update') {
        fs.readFile('./tempUsers.json', 'utf8', (err, data) => {
            if (err) throw err;

            const usersObj = JSON.parse(data);
            const usersArr = usersObj.users;

            var hasId = usersArr.some((obj) => { // Checks if the POST request has the same id as JSON file
                return obj.user_id == postUser.user_id;
            })

            if (hasId) {
                const updatedData = {
                    user_id: postUser.user_id,
                    first_name: postUser.first_name,
                    last_name: postUser.last_name,
                    email_address: postUser.email_address,
                    age: postUser.age,
                }

                for (let arr of usersArr) {
                    if (arr.user_id == postUser.user_id) {
                        let currentIndex = usersArr.indexOf(arr);

                        // checks to see if fields were empty
                        if (updatedData.first_name == '') {
                            const firstNameReplacement = arr.first_name;
                            updatedData.first_name = firstNameReplacement;
                        }
                        if (updatedData.last_name == '') {
                            const lastNameReplacement = arr.last_name;
                            updatedData.last_name = lastNameReplacement;
                        }
                        if (updatedData.email_address == '') {
                            const emailReplacement = arr.email_address;
                            updatedData.email_address = emailReplacement;
                        }
                        if (updatedData.age == '') {
                            const ageReplacement = arr.age;
                            updatedData.age = ageReplacement;
                        }

                        usersArr.splice(currentIndex, 1, updatedData);
                    }
                }

                const newUsers = JSON.stringify(usersArr, null, 2);
                fs.writeFile('./tempUsers.json', `{"users": ${newUsers}}`, (err) => {
                    if (err) throw err;
                })
            }
            res.render('users', { users: usersArr })
        })
    } else {
        fs.readFile('./tempUsers.json', 'utf8', (err, data) => {
            if (err) throw err;

            const usersObj = JSON.parse(data);
            const usersArr = usersObj.users;

            var hasId = usersArr.some((obj) => { // Checks if the POST request has the same id as JSON file
                return obj.user_id == postUser.user_id;
            })

            if (hasId) {
                for (let arr of usersArr) {
                    if (arr.user_id == postUser.user_id) {
                        let currentIndex = usersArr.indexOf(arr);

                        usersArr.splice(currentIndex, 1);
                    }
                }

                const newUsers = JSON.stringify(usersArr, null, 2);
                fs.writeFile('./tempUsers.json', `{"users": ${newUsers}}`, (err) => {
                    if (err) throw err;
                })
            }

            res.render('users', { users: usersArr })
        })
    }
})

app.listen(3000, () => {
    console.log('Listening on port 3000')
})