var conn = require('./Connector');
var _config = require('../config/config');

var Elastic = {
    
        _client: conn,

        _get: function(data, callback){
            
            var query = Object.assign({
                index: _config.elasticsearch.indices.products, 
                type: _config.elasticsearch.types.products, 
                body: {
                    query: {
                      match:  data.condition
                    }
                },
            });            
            this._client.search(query,function (error, response,status) {
                if (error){
                    Elastic.handleError(error, function(){ Elastic._get(data, callback)})
                }
                else {            
                    callback(response.hits.hits);
                }
            })
        },
        _get_all: function(callback){
            var query = Object.assign({
                index: _config.elasticsearch.indices.products, 
                type: _config.elasticsearch.types.products,                
            });
            this._client.search(query,function (error, response,status) {
                if (error){
                    Elastic.handleError(error, function(){ Elastic._get_all(callback)})
                }
                else {            
                    callback(response.hits.hits);
                }
            })
        },
        _get_mappings: function(data, callback){
            if (!data ) {
                var data = {index: _config.elasticsearch.indices.products, type: _config.elasticsearch.types.products}
            };
            this._client.indices.getMapping(data,
                function (error,response) {  
                    if (error){
                        Elastic.handleError(error.message, Elastic._get_mappings(data, callback));
                    }else {
                        callback("Mappings:\n",response);
                    }
                });
        },        
        _health: function(callback){
            this._client.cluster.health({},function(err,resp,status) {  
                if(err) {
                    console.log(err);
                }
                else {             
                    callback(resp);
                }
            })
        },
        _create_indices: function(index_, callback){
            this._client.indices.create({  
                index: index_
                },function(err,resp,status) {
                if(err) {
                    console.log(err);
                }
                else {
                    Elastic._put_mapping(callback);
                }
            })
        },
        _count: function(data, callback){
            this._client.count(data,function(err,resp,status) {
                if (err){
                    // console.log("Error",err.response);
                    Elastic.handleError(err);
                }
                else {                    
                    callback(resp);
                }
            });
        },
        _delete_indices: function(index_, callback){        
            this._client.indices.delete({index: index_},function(err,resp,status){
                callback(resp);
            });
        },
        _put_mapping: function(callback){
            this._client.indices.putMapping({
                index: _config.elasticsearch.indices.products,
                type: _config.elasticsearch.types.products,
                body: {
                  properties: _config.elasticsearch.mapping
                }
              },function(err,resp,status){
                  if (err) {
                    console.log(err);
                  }
                  else {
                    callback();
                  }
              })
        },
        _save: function(data,callback){
            var query = {
                index: _config.elasticsearch.indices.products, 
                type: _config.elasticsearch.types.products,
                body: data
            }
              
            this._client.index(query, function(err,response){
                if (err != null){
                    Elastic.handleError(err, function(){Elastic._save(data, callback)})                    
                }
                else{
                    return callback(response);
                }
            });
        },
        
        _update: function(data,id, callback){
            var query = {
                index: _config.elasticsearch.indices.products, 
                type: _config.elasticsearch.types.products,
                id: id,
                body: data
            }
            
            this._client.index(query, function(err,response){
                if (err != null){
                    Elastic.handleError(err, function(){Elastic._update(data,id, callback)})                    
                }
                else{
                    return callback(response);
                }
            });
        },
        
        _delete: function(condition, callback){
            var index_ = {index: _config.elasticsearch.indices.products, type: _config.elasticsearch.types.products}
            var query = Object.assign(index_, condition);
            this._client.delete(query, function(err, resp){
                if (!err)
                    Elastic.handleError(err)
                return callback(resp);
            })
        },
    
        close: function() {
            this._client.close();
        },
    
        handleError: function(report, callback){
            // if(report.error && report.error.type == "index_not_found_exception"){
            if(report.status == 404){
                console.log("Creating Index.....................")
                Elastic._create_indices(_config.elasticsearch.indices.products, callback);
            }else{
                // console.log({"error":true,"message":report});
                // return {"error":true,"message":report};
                console.log(Object.keys(report))
                console.log(report)
                
            }
        }
    };
    
    module.exports = Elastic;