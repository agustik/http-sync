
var cheerio = require('cheerio');

function parseLine(line){

  var $ = cheerio.load(line);
  var name = $('a').text();

  line = line.replace(/\s\s+/g, ';');

  var parts = line.split(';');
  var timestamp = parts[1];
  var size = parts[2];


  var mtime = new Date(timestamp);


  var object = {};

  object.name = name;
  object.mtime = mtime;

  object.t = timestamp;
  if(size === '-'){
    object.type = 'directory';
  }else{
    object.type = 'file';
    object.size = size;
  }

  return object;
}

var parser = function (body, callback){

  var lines = body.split('\r\n');

  var reg = new RegExp(/\<a\s/);

  var list = [];
  lines.forEach(function (line, key){
    if (reg.test(line)){
      if (/\.\.\/\<\/a\>/.test(line)) return;
      var object = parseLine(line);


      list.push(object);

    }
  });


  callback(null, list);
};



module.exports = parser;
