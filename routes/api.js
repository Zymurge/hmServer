var express = require('express');
var api = express.Router();
var jsonParser = require('body-parser').json();
var handlers = require( '../bin/handlers' ).handlers;

// et up the API handlers
api.get   ( '/api/datapoints/:storeid', handlers.GetPoints );
api.delete( '/api/datapoints/:params',  handlers.DelPoints );
api.post  ( '/api/datapoints/', jsonParser, handlers.AddPoints );

module.exports = api;