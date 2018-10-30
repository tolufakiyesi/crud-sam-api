console.log('Loading function');
var util = require('./libraries/utility')
var querystring = require('querystring');

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    var id =  (event.pathParameters || {}).productid || false;
    console.log('ID ', event.httpMethod)
    var elastic = require('./libraries/Elasticclient')
    switch(event.httpMethod){
        case "GET":
            if(id) {
                elastic._get({condition:{"_id": id}}, function(resp){
                    if(resp){
                        callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: false, message:"Product with ID found successfully", data: resp}))});
                    }else{
                        callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: true, message: "Product with ID not found", data: null}))});
                    }
                    return;
                });
            }else{
                elastic._get_all(function(products){
                    return callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: false, message:"Products found successfully", data: products}))});
                });
            }
            break;

        case "POST":
            var errors = util.checkRequestBody(JSON.parse(event.body), ['name', 'price']);
            if(errors){
                callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: true, message: "Invalid Parameters", data: errors}))})
            }else{
                var data = JSON.parse(event.body);
                var date = new Date
                data.date_added = date.toISOString()
                elastic._save(data, function(state){
                    if(state){
                        callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: false, message:"Product has been saved successfully", data: state}))}); 
                    }
                })
            }            
            break;

        case "PUT":
            elastic._update(JSON.parse(event.body), id, function(state){
                if(state){
                    callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: false, message:"Product has been updated successfully", data: state}))}); 
                }
            })         
            break;

        case "DELETE": 
            elastic._delete({"id": id}, function(state){
                if(state){
                    callback(null, {headers: {"content-type": "application/json"}, body: JSON.stringify(util.handleResponse({err: false, message:"Product has been deleted successfully", data: null}))}); 
                }
            })

            break; 

        default:
            // Send HTTP 501: Not Implemented
            console.log("Error: unsupported HTTP method (" + event.httpMethod + ")");
            callback(null, { statusCode: 501 })

    }
};