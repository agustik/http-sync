

var http = require('http');

var https = require('https');


function agent(proto){
  return new proto.Agent({ keepAlive: true });
  // options.agent = keepAliveAgent;
  // http.request(options, onResponseCallback);
  //

}




var httpClient = function (url){
  var proto = (/https/.test(url)) ? https : http;

  var port = url.replace('://', '').match(/:([0-9]*)/g);
  if (port) {
    port = port[0].replace(':', '');
  }else{
    port = 80;
  }


  var hostname = url.match(/(\/[a-zA-Z0-9\.]*)/g)
  if (hostname) {
    hostname = hostname[1].replace('/','')
  }
  console.log(hostname, url);


  var client = agent(proto);
  // client.get({
  //     hostname: 'localhost',
  //     port: 80,
  //     path: '/',
  //     agent: false  // create a new agent just for this one request
  //   }, (res) => {
  //     // Do stuff with response
  //   })

};



module.exports = httpClient;
