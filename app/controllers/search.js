var fork   = require('child_process').fork;
var Search = require('../models/search');

// list of all performed searches
module.exports.get_searches = function(req, res) {
  Search.find({}, function(err, searches) {
    if (err) throw err;

    res.render('history', {
      path: req.path,
      searches: searches
    });
  });
};

// initialize a search
module.exports.create_search = function(req, res) {
  var data = [req.body.start, req.body.end, req.body.exact];
  var childProcess = fork(appRoot +'/app/child/scrape.js', data);

  // send response from child process
  childProcess.on('message', function(m){
    res.send({
      result: m.result,
      urls: m.urls
    });
  });

  // on closed connection, seize search
  req.connection.on('close', function(){
    childProcess.send({ connectionClosed: true });
  });
};
