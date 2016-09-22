var express = require('express');
var app = express();

// MongoDB variable
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var dbUrl = 'mongodb://localhost:27017/urls';

// regex to validate url
var myUrlRegex = /^(http|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?$/

// function to hash string
function hash(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

//function to find
var findUrls = function(db, callback) {
   var cursor =db.collection('urls').find();
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         callback();
      }
   });
};

app.get('/', function (req, res) {
    // res.writeHead(200, {"Content-Type": "text/html"});
    // res.write("Welcome to my web app");
    // res.end();

    MongoClient.connect(dbUrl, function(err, db) {
        assert.equal(null, err);
        findUrls(db, function() {
            db.close();
        });

    });

});

app.get('/new/*', function (req, res) {

    // link to store in database
    var link = req.url.slice(5);

    // validate url
    if (myUrlRegex.test(link)){

        //store url in database
        MongoClient.connect(dbUrl, function(err, db) {
            assert.equal(null, err);

            //insertion
            db.collection('urls').insertOne({
                'url': link,
                'hash': hash(link)
            }, function (err, result) {
                assert.equal(err, null);
                console.log("Inserted a document into the urls collection.");
            });

            db.close();
        });

    }
    else {
        console.log("Error in url validation");
    }

});

app.listen(3000);
