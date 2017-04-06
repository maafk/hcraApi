var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

// Fill in your MySQL credentials.
var con = mysql.createConnection({
  host     : '',
  user     : '',
  password : '',
  database : ''   // user should have full read access to the database
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);

var validateState = function(state){
  var re = /^[a-zA-Z]{2}$/;
  return re.test(state);
}

var validateCity = function(city){
  var re = /^[a-zA-Z \.\']{3,}$/;
  return re.test(city);
}

var validateSearch = function(searchTerm){
  var re = /^[0-9a-zA-Z \.@,]{3,}$/;
  return re.test(searchTerm);
}

var sqlBegin = 'SELECT name,city,state,effectiveDate,endDate,type,fs15,fs16,contact,phone,message \
    FROM hcra.electorList ';
var sqlLimit = ' LIMIT 50';

app.use('/api/:search/:state/:city', function(req, res, next){

  var escapedSearch = con.escape(req.params.search);
  
  escapedSearch = escapedSearch.replace(/'/g,'');

  console.log('searching for ' + escapedSearch + ' in ' + req.params.city + ', ' + req.params.state);
  var sql =  sqlBegin +
    'WHERE match(name) against (\'"'+  escapedSearch + '"\') \
    AND state = ?\
    AND city = ?';

  sql += sqlLimit;
  con.query(sql,[req.params.state,req.params.city],function(err,results){
    var apiResults = results;
    res.json({numResults: apiResults.length, result: apiResults});  
  });
});

app.use('/api/:search/:state', function(req, res, next){

  var escapedSearch = con.escape(req.params.search);
  
  escapedSearch = escapedSearch.replace(/'/g,'');

  console.log('searching for ' + escapedSearch + ' in ' + req.params.state);
  var sql = sqlBegin +
    'WHERE match(name) against (\'"'+  escapedSearch + '"\') \
    AND state = ?';
  sql += sqlLimit;

  con.query(sql,req.params.state,function(err,results){
    var apiResults = results;
    res.json({numResults: apiResults.length, result: apiResults});  
  });
});

app.use('/api/:search', function(req, res, next){

  if( !validateSearch(req.params.search)){
    res.json({error:'Must have at least 3 alpha numeric characters'});
  }else{
    var escapedSearch = con.escape(req.params.search);
  
    escapedSearch = escapedSearch.replace(/'/g,'');

    console.log('searching for ' + escapedSearch);
    var sql = sqlBegin +
      'where match(name) against (\'"'+  escapedSearch + '"\')';
    sql += sqlLimit;
    con.query(sql,function(err,results){
      var apiResults = results;
      res.json({numResults: apiResults.length, result: apiResults});  
    });    
  }

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
