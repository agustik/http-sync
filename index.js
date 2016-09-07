


var nginxWalker = require('./lib/nginx-walker.js');

var fs = require('fs');

var argv = require('yargs').argv;

var server = argv._[0] || false;
var directory = argv._[1] || '.';

var owner = argv.o;

var force = argv.f || argv.force || false;

var dry = argv.dry || false;

var group = argv.g;
var headers = argv.H || [];

var auth = false;


var username = argv.u || argv.username || false;

var password = argv.p || argv.password || false;


if (username || password) {
  auth = {
    username : username,
    password : password
  };
}

function exists(pathToConfig){
  try {
    fs.readFileSync(pathToConfig);
    return true;
  } catch (e) {
    return false;
  }
}

var command = argv['$0'];

if (argv.config){
  var pathToConfig = argv.config;
  if (!exists(pathToConfig)) return console.log('Could not read config file');

  var config = require(pathToConfig);


  if (config){
    force     =  config.force;
    owner     =  config.owner;
    group     =  config.group;
    auth      =  config.auth;
    dry       =  config.dry;
    server    =  config.server;
    directory  =  config.directory;
  }



}


if (argv.help || argv.h){
  return console.log(
    command, '<server> <local directory> [-u username -p password -f|--force -o owner -g group --dry --config /configfile.js ]'
  );
}
if (!server){
  return console.log('No server specified');
}


return console.log(server, directory,{
  force : force,
  headers : headers,
  owner : owner,
  group : group,
  auth : auth,
  dry : dry
});

var walker = new nginxWalker(server, directory, {
  force : force,
  headers : headers,
  owner : owner,
  group : group,
  auth : auth,
  dry : dry
});

walker.walk();
