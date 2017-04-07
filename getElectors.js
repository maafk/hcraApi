var request = require('request');
var cheerio = require('cheerio');
var mysql = require('mysql');
var dbFuncs = require('./dbFuncs');

var con = mysql.createConnection({
  host     : '',
  user     : '',    // user should have create table and insert privileges to selected database
  password : '',
  database : ''
});
// drop and create hcra table
var dropTable = con.query(dbFuncs.dropHcraTableSQL, function(err, rows, fields){
  if(err) throw err;
});
var createTable = con.query(dbFuncs.createHcraTableSQL, function(err, rows, fields){
  if(err) throw err;
});

var urlBegin = 'http://www.health.ny.gov/regulations/hcra/elector/';
var urlElectBegin = urlBegin + 'elect_';
var alpha = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z','-'];
var nums = ['','1','2','3','4','5','6','7','8','9'];
var reqLoop = [];
for (var i = 0; i < alpha.length; i++) {
  for (var j = 0; j < nums.length; j++) {
    reqLoop.push(urlElectBegin + alpha[i] + nums[j] + '.htm');
  };
};

var jsToMysqlDate = function(dateText, minOrMax){
  if( dateText.trim() === '' ){
    if (minOrMax === 'min'){
      return '1000-01-01';
    } else {
      return '9999-12-12';
    }
  } else {
    var dateObj = new Date(dateText);
    return  dateObj.getUTCFullYear() + '-' +
      ('00' + (dateObj.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + dateObj.getUTCDate()).slice(-2); 
  }
}

var getUrlAndParseTable = function(url, callback){
  request(url, function (err, res, body) {

    if (!err && res.statusCode == 200) {
      var insertVals = [];
      $ = cheerio.load(body);
      $('#content table').each(function(){
        if($(this).find('caption').text() === 'KEY'){
        } else {
          $(this).find('tr').each(function(key,val){
            if( key == 0 ){
              
            }else{
              
              var rowData = [];
              $(this).find('td').each(function(k, v){
                var cellData = $(this).text().trim();
                if(k === 1) {
                  cellData = jsToMysqlDate(cellData, 'min');
                }
                if(k === 2){
                  cellData = jsToMysqlDate(cellData , 'max');
                }
                rowData.push(cellData);
              });
              insertVals.push(rowData);
            }
          });
        } 
      });
      if(insertVals.length === 0){
        callback('no table data', 'no table data');
      } else {
        var sql = 'INSERT INTO electorList ';
        sql += '(changeFlag,effectiveDate,endDate,name,type,fs15,fs16,city,state,contact,phone,message) values ? ;';
        var query = con.query(sql, [insertVals], function(err, result) {
          if(err){
            callback(err, result);
          }else{
            callback(null, result);
          }
        });
      }
    }else{
      callback('url does not exist', null);
    }
  });
}

var parseUrls = function(x){
  if(x < reqLoop.length){
    getUrlAndParseTable(reqLoop[x], function(err, res){
      if(err === null){
        console.log('Inserted ' + res.affectedRows + ' records from ' + reqLoop[x]);
      }else{
        // console.log('Errored out on ' + reqLoop[x]);
      }
      
      parseUrls(x + 1);
    });
  } else {
    con.end();
  }
}
parseUrls(0);
