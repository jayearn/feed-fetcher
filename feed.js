// Lets require/import the HTTP module
var http = require('http');

// Lets define a port we want to listen to
const PORT=3000; 

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/test';
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});

// Function for inserting data
var insertSingleFeed = function(db, feed, callback) {
   db.collection('feeds').insert(feed, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the feeds collection.");
    callback(result);
  })
};



// We need a function which handles requests and send response
//function handleRequest(request, response) {

var FeedParser = require('feedparser')
  , request = require('request');

var req = request('http://www.heise.de/newsticker/heise.rdf')
  , feedparser = new FeedParser();

req.on('error', function (error) {
  // handle any request errors
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
  // always handle errors
});
feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

  var items = new Array();

  MongoClient.connect(url, function(err, db) {
  while (item = stream.read()) {
    item["_id"] = item.guid;
   // items.push(item);

    assert.equal(null, err);

      console.log("Item: " + item);
      insertSingleFeed(db, item, function() {

      });
    
   // console.log(item);
  }
  });




});








//    re = "hallo";
//    response.end(re);
//    console.log(re);
//}

// Create a server
//var server = http.createServer(handleRequest);

// Lets start our server
//server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
//    console.log("Server listening on: http://localhost:%s", PORT);
//});

