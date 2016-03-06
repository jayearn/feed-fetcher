var FeedParser = require('feedparser')
  , request = require('request');

var req = request(process.argv[2])
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

  while (item = stream.read()) {
    console.log('Title: ' + item.title);
    console.log('Link: ' + item.link);
//    console.log('Summary: ' + item.summary);
    console.log('GUID: ' + item.guid);
    console.log('image: ' + item.image.title);
    console.log('image: ' + item.image.url);
    console.log('date: ' + item.date);
    console.log('pubdate: ' + item.pubdate);
    console.log();
  }
});
