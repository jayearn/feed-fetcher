// Lets require/import the HTTP module
var http = require('http');

// Lets define a port we want to listen to
const PORT=3000;

var assert = require('assert');

// We need a function which handles requests and send response
//function handleRequest(request, response) {

var FeedParser = require('feedparser');
var Request = require('request');

var request = Request('http://www.heise.de/newsticker/heise.rdf');
var feedparser = new FeedParser();

request.on('error', function (error) {
  // handle any request errors
  console.log('error');
});

request.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) {
     return this.emit('error', new Error('Bad status code'));
  }

  stream.pipe(feedparser);
});


feedparser.on('error', function(error) {
    console.log('error in feedparser: ' + error);
  // always handle errors
});
feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

  var items = new Array();

  while (item = stream.read()) {
    item["_id"] = item.guid;
   // items.push(item);

    assert.equal(null, err);
    console.log("Item: " + item);

   // console.log(item);
  }
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
