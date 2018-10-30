var Config = {
	query_limit: 200,
	api_query_limit: 200,

	mongodb: {
		"mongo_uri":"mongodb://serverless:funmilayo33@ds127851.mlab.com:27851/products_serverless",
		"collections":{
			"products": "products"
		}
	},
	elasticsearch: {
		"host": "127.0.0.1",
		"username": "",
		"password": "",
		"port": "9200",
		"indices": {
			products: "products"
		},
		"types": {
			products: "product"
		},
		"mapping": {
			"name": {
				"type": "text",
			},
			"price": {
				"type": "text",
			},
			"date_added": {
				"type": "date",
			}
		}
	}
};

module.exports = Config;
