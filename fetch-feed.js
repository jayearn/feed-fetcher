var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('local.properties');

var FeedParser = require('feedparser')
  , request = require('request');

var req = request(process.argv[2])
  , feedparser = new FeedParser();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : properties.get('db.host'),
  user     : properties.get('db.user'),
  password : properties.get('db.password'),
  database : 'feeds'
});

var sha1 = require('sha1');

connection.connect();

// ------------------ Perform HTTP request -------------------
req.on('error', function (error) {
  // handle any request errors
  connection.end();
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedparser);
});


// ------------------ Parse Newsfeed -------------------
feedparser.on('error', function(error) {
  // always handle errors
  connection.end();
});
feedparser.on('readable', function() {
  // This is where the action is!
  var stream = this
    , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
    , item;

  while (item = stream.read()) {
    var sql = "REPLACE INTO feed_item (`guid`, title, summary, image_url, `date`, pubdate) VALUES " +
        "(?, ?, ?, ?, ?, ?);";
    var inserts = [
        item.guid == null ? item.link : item.guid,
        item.title,
        item.summary,
        item.image_url,
        item.date,
        item.pubdate
    ];
    sql = mysql.format(sql, inserts);

    connection.query(sql, function(err, results) {
      if (err) throw err;

      console.log("results: " + results);
    });

//    console.log('Title: ' + item.title);
//    console.log('Link: ' + item.link);
//    console.log('Summary: ' + item.summary);
//    console.log('GUID: ' + item.guid);
//    console.log('image: ' + item.image.title);
//    console.log('image: ' + item.image.url);
//    console.log('date: ' + item.date);
//    console.log('pubdate: ' + item.pubdate);
//    console.log();
  }
});
feedparser.on('end', function() {
    connection.end();
    console.log('cleaning up MySQL connection');
});

