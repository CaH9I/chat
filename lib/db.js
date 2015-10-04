var pg = require('pg');
pg.defaults.poolSize = 1;

var conString = 'pg://postgres:123456@localhost/chat';

module.exports = {
  saveMessage: function(text) {
    pg.connect(conString, function(err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err);
      }
      var result = client.query(insertMessageQuery(text));
      result.on('end', done);
      result.on('error', function(err) {
        return console.error('error running query', err);
      });
    });
   }
}

function insertMessageQuery(text) {
  return {
    text: 'INSERT INTO messages(message) VALUES ($1)',
    values: [text],
    name: 'insert message'
  };
}
