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
        getValidDate(item.date),
        getValidDate(item.pubdate)
    ];
    sql = mysql.format(sql, inserts);

console.log('writing item ' + item.link);
    connection.query(sql, function(err, results) {
      if (err) throw err;
    });
  }
});
feedparser.on('end', function() {
    connection.end();
    console.log('cleaning up MySQL connection');
});

function getValidDate(input) {
    var dateInput = new Date(input);
    if (dateInput.getTime() === dateInput.getTime()) {
        return dateInput;
    } else {
        return new Date();
    }
}

function maybeTranslate (res, charset) {
  // Use iconv-lite if its not utf8 already.
  if (charset && !/utf-*8/i.test(charset)) {
    try {
      console.log('Converting from charset %s to utf-8', charset);
      res =
        res
          .pipe(iconv.decodeStream(charset))
          .pipe(iconv.encodeStream('utf-8'));

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
