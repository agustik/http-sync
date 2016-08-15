


var nginxWalker = require('./lib/nginx-walker.js');

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

if (argv.help || argv.h){
  return console.log(
    argv['$0'], 'server directory [-og]'.join('')
  );
}
if (!server){
  return console.log('No server specified');
}


var walker = new nginxWalker(server, directory, {
  force : force,
  headers : headers,
  owner : owner,
  group : group,
  auth : auth,
  dry : dry
});

walker.walk();
