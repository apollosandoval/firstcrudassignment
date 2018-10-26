// import required modules to handle CRUD operations to a local json file
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// create instance of an express server
const app = express();

// set port variable for our application
const port = process.env.PORT || 8000;

let filepath = path.join(__dirname, 'storage.json');

app.use(bodyParser.json());

// return all users in our local storage
app.get('/users', function(req, res) {
    fs.readFile(filepath, 'utf8', (err, data) => {
        if(err) throw err;
        res.send(JSON.parse(data));
    });
});

// return a user by specified id
app.get('/users/:id', function(req, res) {
    let id = parseInt(req.params.id);
    
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data);

        for (let user of data["users"]) {
            if (user.id === id) {
                return res.send(user);
            }
        }
        res.status(404).send('user not found');
    });
});

// create a new user by name
app.post('/create/:name', function(req, res) {
    let name = req.params.name;
    let email = req.body.email || `${name}@${name}.com`;
    let state = req.body.state || 'CA';

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data);
        // find id value of last element in storage.json and increments 1 for new id value
        id = data["users"][data["users"].length-1].id+1;

        data["users"].push({
            "id": id,
            "name": name,
            "email": email,
            "state": state
        });
        fs.writeFile(filepath, JSON.stringify(data), 'utf8', (err, data) => {
            if (err) throw err;
            res.status(200).send(data);
        });
    });
});

// update a user by id
app.put('/update/:id', function(req, res) {
    let id = parseInt(req.params.id);
    let name = req.body.name || 'updated';
    let email = req.body.email || 'update@update.com';
    let state = req.body.state || 'Wild Wild West';

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data);

        // uses IIFE to confirm existance of a user with given id
        // if user exists IIFE evaluates to true, if doesn't exist IIFE evaluates to false
        // if user exists skip 'if' statement, if doesn't exist return status 404
        if( ((id, arr) => {
            for (let user of arr) {
                if (user.id === id) {
                    user.name = name;
                    user.email = email;
                    user.state = state;
                    return true;
                }
            }
        })(id, data["users"])) {
            fs.writeFile(filepath, JSON.stringify(data), 'utf8', (err) => {
                if (err) throw err;
                res.send('updated successfully');
            })
        } else {
            return res.status(404).send('user not found');
        }
    })
});

// delete a user by id
app.delete('/remove/:id', function(req, res) {
    let id = req.params.id;

    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) throw err;
        data = JSON.parse(data);

        // verify user under given id exists
        if (!data["users"][`${id}`]) {
            return res.status(404).send('user not found');
        }
        console.log(data["users"][`${id}`]);
        let index = data["users"].indexOf(data["users"][`${id}`]);
        // data["users"].splice(index, 1);
        // fs.writeFile(filepath, JSON.stringify(data), 'utf8', (err) => {
        //     if (err) throw err;
        //     res.send('removed successfully');
        // })
        // console.log(index);
        res.send('done');
    })
})

// handle requests to a non-existant route
app.use('/', function(req, res) {
    res.status(404).send('Route does not exist');
})

// start application listening on the specified port
app.listen(port, (err) => {
    if (err) {
        return console.log('Server did not start successfully', err);
    }
    console.log(`Listening on port ${port}`);
});
