const express = require('express');
const request = require("request");
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

var app = express();
var db, siteCollection;

app.set('view engine', 'pug')
app.use(bodyParser.urlencoded({extended: true}))

Date.now = function() {
    var currentTime = new Date()
    var datevalues = currentTime.getFullYear() + '/' + (currentTime.getMonth()+1) + '/' + currentTime.getDate() + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes() + ':' +
        currentTime.getSeconds()
    return datevalues
}

MongoClient.connect('mongodb://localhost:27017/scrappy', (err, database) => {
    if (err) return console.log(err)
    db = database
    siteCollection = db.collection('sites')
    db.ensureIndex("sites", {
        content: "text"
    }, function(err, indexname) {
        // assert.equal(null, err);
    })
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.get('/', (req, res) => {
    siteCollection.find().toArray(function(err, docs) {
        if (err) return console.log(err)
        res.render('index.pug', {documents: docs})
    })
})

app.get('/document/:docId', (req, res) => {
    siteCollection.findOne({_id: ObjectId(req.params.docId)}, function(err, docs) {
        if (err) return console.log(err)
        res.render('document.pug', {document: docs})
    })
})

app.post('/add', (req, res) => {
    var requestURL = req.body.url
    request({
        uri: requestURL,
    }, (error, response, body) => {
    siteCollection.insert({
            url: requestURL,
            created: Date.now(),
            category: req.body.category,
            content: body
        }, function(err, result) {
            if (err) return console.log(err)
            console.log('Content Saved to DB. ' + Date.now())
            res.redirect('/')
        })
    })
})

app.post("/search", (req, res) => {
    siteCollection.find({
        "$text": {
            "$search": req.body.query
        }
    }).toArray(function(err, docs) {
        if (err) return console.log(err)
        res.render('index.pug', {documents: docs})
    })
})