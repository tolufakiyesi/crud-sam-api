var elasticsearch=require('elasticsearch');
var _config = require('../config/config');

var client = new elasticsearch.Client( {
  // host: '127.0.0.1:9200',
  // log: 'trace'
  host: 'http://'+_config.elasticsearch.username+':'+_config.elasticsearch.password+'@'+_config.elasticsearch.host+':'+_config.elasticsearch.port+'/',
});
module.exports = client;