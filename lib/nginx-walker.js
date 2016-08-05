
var request = require('request');
var fs = require('fs');
var path = require('path');

var os = require('os');

var userid = require('userid');

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

  console.log(options);

  this.force = options.force || false;
  this.headers = options.headers;



  this.uid = process.getuid();
  this.gid = process.getgid();

  if (options.owner){
    this.uid = userid.uid(options.owner);
  }

  if (options.group){
    this.gid = userid.gid(options.group);
  }

  console.log(this.uid, this.gid);

  return this;
};

NginxWalker.prototype.walk = function (){
  var fileList = [];

  if (!localExists(this.dir)) mkdir(this.dir, this.uid, this.gid);

  this._request(this.server);


  return this;

};


NginxWalker.prototype._request = function (path){
  var self = this;


  request.get({
    url : path,
    headers : parseHeaders(self.headers)
  }, function (err, response){
    if (response.statusCode > 400 ) return console.log('Error', response.statusCode)
    var json = JSON.parse(response.body);
    self._sync(path, json);

  });
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
          console.log( new Date(remoteEpoch) ,localPath, (localEpoch > remoteEpoch) ? 'ok': 'sync needed..');
          if (localEpoch >= remoteEpoch ) return console.log('No change', localPath);

        }
      }
      self._request(remotePath);

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

  request.get({
    url : path,
    encoding: 'binary',
    headers : parseHeaders(self.headers)
  }, function (err, response, body){

    if (err) return callback(err);
    if (response.statusCode > 400) return callback('Server returned error: ' + response.statusCode);

    fs.writeFile(local, body, 'binary', function (err){

      if (err) return callback(err);
      fs.chown(local, self.uid, self.gid, callback);


    });
  })
}

module.exports = NginxWalker;
