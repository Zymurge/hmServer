// handlers
var DAO = require( './DBAccess' ).DAO;
var extract = require( './DBAccess' ).Extract;
var debug = require('debug')('hmServer:handlers');

var Handlers = {
    GetPoints: function( req, res ) {
        var stId = req.params.storeid;
        debug( ":::: Handlers.GetPoints for storeId:", stId );
        var rows = DAO.GetRowsByStoreId( stId );
        // Concat all the datapoints into a single object
        var result = extract( JSON.parse( rows)  );
        result.storeId = stId;
        res.writeHead( 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        } );
        res.end( JSON.stringify( result ) );
    },

    AddPoints: function( req, res ) {
        debug( ":::: Handlers.AddPoints" )

        var points = JSON.parse( req.body.row );
        debug( "--> received addpoints request:" );
        debug( "  --> storeId: " + points.storeId + "\n  --> datapoints: " +
            points.datapoints.length );

        var result = DAO.InsertRows( points );
        debug( "  --> InsertRows =", result );
        res.writeHead( 200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        } );
        res.end( points.datapoints.length + " points registered for customerId: " + points.customerId +
            " at storeId: " + points.storeId );
    },

    DelPoints: function( req, res ) {
        debug( ":::: Handlers.DelPoints" )

        res.writeHead( 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        } );
    }
}

exports.handlers = Handlers;

