// bin/getRows.js
var loki = require( 'lokijs' );
var debug = require('debug')('hmServer:server');

var DBAccess = {
    //modules.export = {
    db: null,
    dp_collection: null,

    CreateDB: function( dbName, collName ) {
        // Create the database:
        this.db = new loki( dbName != null ? dbName : 'loki.json' );

        // Create a collection:
        this.dp_collection = this.db.addCollection(
            collName != null ? collName : 'datapoints' );
    },

    DelRowsByStoreId: function( stId ) {
        this.dp_collection.removeWhere( {
            storeId: {
                $eq: stId
            }
        } );

        debug( "--> DelRowsByStoreId( " + stId + " )" );
    },

    GetRowsByCustId: function( cuId ) {
        var rows = this.dp_collection.find( {
            customerId: {
                $eq: cuId
            }
        } );
        rows = CleanMeta( rows );

        debug( "--> GetPointsByCustId: sent " + rows.length + " records" );
        return JSON.stringify( rows );
    },

    GetRowsByStoreId: function( stId ) {
        var rows = this.dp_collection.find( {
            storeId: {
                $eq: stId
            }
        } );
        rows = CleanMeta( rows );

        debug( "--> GetRowsByStoreId: sent " + rows.length + " records" );
        return JSON.stringify( rows );
    },

    InsertRows: function( row ) {
        debug( "InsertRows:\n" + rows );
        var num = 0;
        // validate that required elements are in dataset, else fall through to no-op and -1 returned
        if ( row && row.hasOwnProperty( "storeId" ) && row.hasOwnProperty( "customerId" ) &&
            row.hasOwnProperty( "timestamp" ) && row.hasOwnProperty( "datapoints" ) ) {
            this.dp_collection.insert( row );
            num = row.datapoints.length;
            debug( "--> insert: " + num + " points into DB. Total records: " 
                + this.dp_collection.data.length );
        } else {
            console.error( "--> InsertRows: Invalid format. Has keys:" );
            for ( var k in row ) {
                debug( "  ---> key:", k );
            };

            return -1;
        }
        return num;
    },

    // deprecated
    AllRows: function() {
        var rows = this.dp_collection.find( {
            value: {
                $gt: 0
            }
        } );
        rows = CleanMeta( rows );
        return {
            "datapoints": rows
        };
    }

}

function CleanMeta( rows ) {
    for ( p in rows ) {
        delete rows[ p ].meta;
    };
    return rows;
}

// Accepts an array of rows. Extracts datapoints set from each and combines into a single object
// returns objects as { 'datapoints': [dataset] }
function ExtractAllDatapoints( rows ) {
    debug( "::::ExtractAllDatapoints called with " + rows.length + " rows" );
    var data = [];
    for ( r in rows ) {
        //debug( "Concat row #" + r + ": " + rows[r] );
        data = data.concat( rows[ r ].datapoints );
    }

    return {
        'datapoints': data
    };
}

exports.DAO = DBAccess;
exports.Extract = ExtractAllDatapoints;
