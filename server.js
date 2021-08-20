const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const {connectionString, DB, collection} = require('./config/config');

const app = express();

//Use process port or 5000
const port = process.env.PORT || 5000;

//DB Connection
MongoClient.connect(connectionString, {
    useUnifiedTopology: true })
    .then (client => {
        console.log('Connected to Database');
        //Create DB
        const db = client.db(DB);
        //Create Collection
        const quotesCollection = db.collection(collection);

        app.set('view engine', 'ejs')
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(express.static('public'))
        app.use(bodyParser.json())

        //Index Get Route
        app.get('/', (req, res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', {quotes: results});
                })
                .catch(error => console.error(error))
        });

        //Create New Quote Post Request
        app.post('/quotes', (req, res) => {
            quotesCollection.insertOne(req.body)
                .then(result => {
                    res.redirect('/');
                })
                .catch(error => console.error(error))
        })

        //Update quote 
        app.put('/quotes', (req, res) => {
            quotesCollection.findOneAndUpdate(
                { name: 'Dom' },
                {
                  $set: {
                    name: req.body.name,
                    quote: req.body.quote
                  }
                },
                {
                  upsert: true
                }
              )
                .then(result => {
                    res.json('Success')
                })
                .catch(error => console.error(error))
    
        })

        //Delete Quote 
        app.delete('/quotes', (req, res) => {
          quotesCollection.deleteOne(
            { name: req.body.name }
          )
            .then(result => {
              if (result.deletedCount === 0) {
                return res.json('No quote to delete')
              }
              res.json('Deleted Brian\'s quote')
            })
            .catch(error => console.error(error))
        })
    

        //Set up app listener on port
        app.listen(port, () => {
            console.log(`Listening on port ${port}`);
        });

    })
    .catch(error => console.error(error))

