const express = require('express');
const request = require("request");
const MongoClient = require('mongodb').MongoClient;
var app = express();
var db;

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

MongoClient.connect('mongodb://localhost:27017/scrappy', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.get('/', (req, res) => {
    var collection = db.collection('sites')
    var results = collection.find().toArray(function(err, docs) {
        res.send(docs)
        db.close()
    })
})

app.post('/add', (req, res) => {
    var requestURL = "http://google.com/"
    request({
        uri: requestURL,
    }, (error, response, body) => {
    console.log(Date.now());
    var collection = db.collection('sites')
    collection.insert({
            url: requestURL,
            timestamp: Date.now(),
            content: body
        }, function(err, result) {
            if (err) return console.log(err)
            res.send(result)
            db.close()
        })
    })
})