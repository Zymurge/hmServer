// handlers
var DAO = require( './DBAccess' ).DAO;
var extract = require( './DBAccess' ).Extract;

var Handlers = {
    GetPoints: function( req, res ) {
        var stId = req.params.storeid;
        console.log( ":::: Handlers.GetPoints for storeId:", stId );
        var rows = DAO.GetRowsByStoreId( stId );
        // Concat all the datapoints into a single object
        var result = extract( JSON.parse( rows)  );
        console.log( "... Before - result: \n", result );
        result.storeId = stId;
        console.log( "... After -  result: \n", result );
        res.writeHead( 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        } );
        res.end( JSON.stringify( result ) );
    },

    AddPoints: function( req, res ) {
        console.log( ":::: Handlers.AddPoints" )

        var points = JSON.parse( req.body.row );
        console.log( "--> received addpoints request:" );
        console.log( "  --> storeId: " + points.storeId + "\n  --> datapoints: " +
            points.datapoints.length );

        var result = DAO.InsertRows( points );
        console.log( "  --> InsertRows =", result );
        res.writeHead( 200, {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        } );
        res.end( points.datapoints.length + " points registered for customerId: " + points.customerId +
            " at storeId: " + points.storeId );
    },

    DelPoints: function( req, res ) {
        console.log( ":::: Handlers.DelPoints" )

        res.writeHead( 200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        } );
    }
}

exports.handlers = Handlers;

