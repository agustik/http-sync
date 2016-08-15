
var request = require('request');
var fs = require('fs');
var path = require('path');

var os = require('os');

var userid = require('userid');

var parser = require('./parser.js');

function localExists(path){
  try {
    return fs.statSync(path);
  } catch (e) {
    return false;
  }
}

function mkdir(path, uid, gid){
  fs.mkdirSync(path);
  fs.chownSync(path, uid, gid);
}

function jsonParse (json, callback){
  try {
    var json = JSON.parse(json);
    callback(null, json);
    return json;
  } catch (e) {
    callback('not an object');
    return false;
  }
}


function parseHeaders (headers){

  var arr = [];
  headers.forEach(function (header){
    var parts = header.split(': ');

    var key = parts[0];
    var value = parts[1];
    var object = {};
    object[key] = value;


    arr.push(object);

  });

  return arr;


}

var NginxWalker = function (server, dir, options){
  this.server = server;
  this.dir = dir;

  options = options || {}

  this.force = options.force || false;
  this.headers = options.headers;



  this.uid = process.getuid();
  this.gid = process.getgid();

  this.dry = options.dry || false;

  this.auth = options.auth;

  this.done = [];

  if (options.owner){
    this.uid = userid.uid(options.owner);
  }

  if (options.group){
    this.gid = userid.gid(options.group);
  }


  return this;
};

NginxWalker.prototype.walk = function (path){
  var self = this;
  var fileList = [];

  path = path || self.server;

  if (self.done.indexOf(path) > -1) console.log(path, 'alread done.... ?');

  if (!localExists(this.dir)) mkdir(this.dir, this.uid, this.gid);


  self.done.push(path);

  this._request(path, function (err, response, body){

    if (err) return console.log(err);
    self._sync(path, response.jsonBody);


  });


  return this;

};


NginxWalker.prototype._sync = function (path, list){
  // console.log(JSON.stringify(list, null, 2));

  var self = this;

  list.forEach(function (object){

    var p = path;
    p = p.split(self.server);
    p = p.pop();

    var localPath = [self.dir, p, object.name].join('/');

    localPath = localPath.replace('//', '/');

    var stat = localExists(localPath);

    var remoteEpoch = new Date(object.mtime).getTime();

    var localEpoch = new Date(stat.mtime).getTime();


    var remotePath = [ path, object.name].join('/');

    if (object.type === 'directory'){
      // Make new request to this path.

      if (!stat){
        console.log('Create', localPath);

        mkdir(localPath, self.uid, self.gid);
      }else{
        if (!self.force){
          // console.log( new Date(remoteEpoch) ,localPath, (localEpoch > remoteEpoch) ? 'ok': 'sync needed..');
          if (localEpoch >= remoteEpoch ) return console.log('No change', localPath);

        }
      }
      self.walk(remotePath);

      return;
    }
    if (!stat || (remoteEpoch >= localEpoch) || self.force){
      self._fetch(remotePath, localPath, function (err){
        if (err) return console.log(err);
        console.log('Download', localPath);
      });
    }


  })

};




NginxWalker.prototype._fetch = function (path, local, callback){
  var self = this;

  if (self.dry) return console.log('Dry run will not download', path);

  self._request(path, function httpResponse(err, response, body){
    if (err) return callback(err);
    fs.writeFile(local, body, 'binary', function (err){

      if (err) return callback(err);
      fs.chown(local, self.uid, self.gid, callback);

    });
  })
}



NginxWalker.prototype._request =  function (path, callback){
  var self = this;
  var httpRequest = {
    url : path,
    encoding: 'binary',
    headers : parseHeaders(self.headers)
  };

  if (self.auth){
    httpRequest.auth = self.auth;
  }

  var statusCodes = {
    '400' : 'Bad request',
    '401' : 'Authorization Required',
    '403' : 'Forbidden',
    '404' : 'Not Found',
    '405' : 'Method Not Allowed',
  };


  request.get(httpRequest, function (err, response, body){

    if (err) return callback(err, response, body);
    if (response.statusCode > 400) {

      var code = statusCodes[response.statusCode.toString()];

      var message = 'Server returned error: ' + response.statusCode;

      if (code) {
        message +=' ' + code;
      }
      if (response.statusCode === 429){
        return setTimeout(function (){
          callback(message);
        }, 5000);
      }

      return callback(message);
    }



    jsonParse(body, function (err, json){

      if (err) {

        return parser(body, function (err, json){
          response.jsonBody = json;
          callback(null, response, body);
        });
      }




      response.jsonBody = json;

      callback(null, response, body);
    });



  })
}


module.exports = NginxWalker;
