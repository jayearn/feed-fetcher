var PropertiesReader = require('properties-reader');
var properties = PropertiesReader('./local.properties');

var FeedParser = require('feedparser')
  , request = require('request');

var iconv = require('iconv-lite');

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
  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  var charset = getParams(res.headers['content-type'] || '').charset;
  res = maybeTranslate(res, charset);

  res.pipe(feedparser);
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
    var sql = "REPLACE INTO feed_item (`guid`, title, summary, link, image_url, `date`, pubdate) VALUES " +
        "(?, ?, ?, ?, ?, ?, ?);";
    var inserts = [
        item.guid == null ? sha1(item.link) : sha1(item.guid),
        item.title,
        item.summary,
        item.link,
        item.image_url,
        item.date,
        item.pubdate
    ];
    sql = mysql.format(sql, inserts);

console.log('writing item ' + item.link);
    connection.query(sql, function(err, results) {
      if (err) throw err;

//      console.log("wrote " + results.toString());
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


function maybeTranslate (res, charset) {
  console.log('maybeTranslate with charset: ' + charset);

  // Use iconv-lite if its not utf8 already.
  if (charset && !/utf-*8/i.test(charset)) {
    try {
      console.log('Converting from charset %s to utf-8', charset);
      res =
        res
          .pipe(iconv.decodeStream(charset))
          .pipe(iconv.encodeStream('utf-8'));

//      iconv = new Iconv(charset, 'utf-8');
//      iconv.on('error', done);
//      // If we're using iconv, stream will be the output of iconv
//      // otherwise it will remain the output of request
//      res = res.pipe(iconv);
    } catch(err) {
      console.log(err);
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}
