

var nginxWalker = require('./lib/nginx-walker.js');

var config = require('./config.js');

var walker = new nginxWalker(config.server, config.directory, {
  force : config.force || false,
  headers : config.headers || [],
  owner : config.owner || false,
  group : config.group || false,
  auth : config.auth
});



var service = (function startService(){

  fetch();

  return  setInterval(fetch, config.interval);

})();


function fetch (){
  console.log('[', new Date(),  '] Fetching from remote' );
  walker.walk();

}
