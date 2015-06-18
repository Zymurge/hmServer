// DBAccess_test.js

var assert = require( 'assert' );
var request = require( 'request' );
var DAO = require( '../bin/DBAccess' ).DAO;
var extract = require( '../bin/DBAccess' ).Extract;

describe( 'Can setup DB with default values', function() {
    before( function( done ) {
        DAO.CreateDB();
        done();
    } );
    after( function( done ) {
        // remove the db instance
        DAO.db = null;
        done();
    } );
    it( 'Sets the db pointer to loki.json', function( done ) {
        assert.equal( DAO.db.filename, 'loki.json' );
        assert.notEqual( null, DAO.db );
        done();
    } );

    it( 'Creates dp_collection pointer with default name: datapoints', function( done ) {
        assert.notEqual( null, DAO.dp_collection );
        assert.equal( DAO.dp_collection.name, 'datapoints' );
        done();
    } );
} )

describe( 'Can setup DB with specified values', function() {
    before( function( done ) {
        DAO.CreateDB( 'testdb.json', 'testcoll' );
        done();
    } );
    after( function( done ) {
        // remove the db instance
        DAO.db = null;
        done();
    } );
    it( 'Sets the db pointer to testdb.json', function( done ) {
        assert.equal( DAO.db.filename, 'testdb.json' );
        assert.notEqual( null, DAO.db );
        done();
    } );

    it( 'Creates dp_collection pointer to testcoll', function( done ) {
        assert.notEqual( null, DAO.dp_collection );
        assert.equal( DAO.dp_collection.name, 'testcoll' );
        done();
    } );
} )

describe( 'Can add points', function() {
    var result;
    before( function( done ) {
        DAO.CreateDB( 'add_db.json', 'add_coll' );
        result = DAO.InsertRows( CreatePointsRow( 5, 13, 7 ) );
        done();
    } );
    after( function( done ) {
        DAO.db = null;
        done();
    } );
    it( 'Adds points to empty DB and verifies total datapoint count returned',
        function( done ) {
            done( assert.equal( result, 7 ) );
        } );
    it( 'Validates that 1 record was inserted into db',
        function( done ) {
            done( assert.equal( 1, DAO.dp_collection.data.length ) );
        } );
    it( 'Handles empty dataset by returning 0', function( done ) {
        var emptyData = CreatePointsRow( 15, 20, 0 );
        var result = DAO.InsertRows( emptyData );
        done( assert.equal( result, 0 ) );
    } );
    it( 'Treats datasets missing storeId as empty', function( done ) {
        var badSet = sampleRecord;
        delete badSet.storeId;
        var result = DAO.InsertRows( badSet );
        done( assert.equal( result, -1 ) );
    } );
    it( 'Treats datasets missing customerId as empty', function( done ) {
        var badSet = sampleRecord;
        delete badSet.customerId;
        var result = DAO.InsertRows( badSet );
        done( assert.equal( result, -1 ) );
    } );
    it( 'Treats datasets missing timestamp as empty', function( done ) {
        var badSet = sampleRecord;
        delete badSet.timestamp;
        var result = DAO.InsertRows( badSet );
        done( assert.equal( result, -1 ) );
    } );
    it( 'Treats datasets missing datapoints as empty', function( done ) {
        var badSet = sampleRecord;
        delete badSet.datapoints;
        var result = DAO.InsertRows( badSet );
        done( assert.equal( result, -1 ) );
    } );
} );

describe( 'Can retrieve points by storeId', function() {
    before( function( done ) {
        DAO.CreateDB( 'store_db.json', 'retrieve_coll' );
        DAO.InsertRows( CreatePointsRow( 20, 115, 10 ) );
        DAO.InsertRows( CreatePointsRow( 20, 144, 7 ) );
        DAO.InsertRows( CreatePointsRow( 20, 98, 411 ) );
        DAO.InsertRows( CreatePointsRow( 23, 115, 2 ) );
        DAO.InsertRows( CreatePointsRow( 23, 222, 3 ) );
        DAO.InsertRows( CreatePointsRow( 55, 1001, 32 ) );
        done();
    } );
    after( function( done ) {
        DAO.db = null;
        done();
    } );
    it( 'Retrieves 2 records for storeId 23', function( done ) {
        var result = DAO.GetRowsByStoreId( 23 );
        assert.equal( JSON.parse( result ).length, 2 );
        done();
    } );
    it( 'Retrieves 3 records for storeId 20', function( done ) {
        var result = DAO.GetRowsByStoreId( 20 );
        assert.equal( JSON.parse( result ).length, 3 );
        done();
    } );
    it( 'Retrieves 0 records for non-existent storeId 13', function( done ) {
        var result = DAO.GetRowsByStoreId( 13 );
        assert.equal( JSON.parse( result ).length, 0 );
        done();
    } );
} );

describe( 'Can retrieve points by custId', function() {
    before( function( done ) {
        DAO.CreateDB( 'custid_db.json', 'retrieve_coll' );
        DAO.InsertRows( CreatePointsRow( 20, 115, 10 ) );
        DAO.InsertRows( CreatePointsRow( 20, 115, 7 ) );
        DAO.InsertRows( CreatePointsRow( 20, 98, 411 ) );
        DAO.InsertRows( CreatePointsRow( 23, 115, 2 ) );
        DAO.InsertRows( CreatePointsRow( 25, 222, 3 ) );
        DAO.InsertRows( CreatePointsRow( 18, "s1001", 32 ) );
        done();
    } );
    after( function( done ) {
        DAO.db = null;
        done();
    } );
    it( 'Retrieves 3 records for custId 115', function( done ) {
        var result = DAO.GetRowsByCustId( 115 );
        assert.equal( JSON.parse( result ).length, 3 );
        done();
    } );
    it( 'Retrieves 0 records for non-existent custId 20', function( done ) {
        var result = DAO.GetRowsByCustId( 20 );
        assert.equal( JSON.parse( result ).length, 0 );
        done();
    } );
    it( 'Retrieves 1 record for string based custId s1001', function( done ) {
        var result = DAO.GetRowsByCustId( 's1001' );
        assert.equal( JSON.parse( result ).length, 1 );
        done();
    } );
} );

describe( 'Can delete records by storeId', function() {
    before( function( done ) {
        DAO.CreateDB( 'delete.json', 'delete_coll' );
        DAO.InsertRows( CreatePointsRow( 20, 115, 10 ) );
        DAO.InsertRows( CreatePointsRow( 20, 115, 7 ) );
        DAO.InsertRows( CreatePointsRow( 20, 98, 17 ) );
        DAO.InsertRows( CreatePointsRow( 23, 115, 2 ) );
        DAO.InsertRows( CreatePointsRow( 25, 222, 3 ) );
        DAO.InsertRows( CreatePointsRow( 18, "s1001", 32 ) );
        done();
    } );
    after( function( done ) {
        DAO.db = null;
        done();
    } );
    it( 'Deletes 3 records for storeId 20', function( done ) {
        // delete records than validate they are gone with a subsequent get
        DAO.DelRowsByStoreId( 20 );
        var result = DAO.GetRowsByStoreId( 20 );
        assert.equal( JSON.parse( result ).length, 0 );
        done();
    } );
} );

describe( 'ExtractAllDatapoints works as expected', function() {
    var rows = [];
    var result;
    before( function( done ) {
        rows.push( CreatePointsRow( 1, 1, 5 ) );
        rows.push( CreatePointsRow( 2, 2, 8 ) );
        rows.push( CreatePointsRow( 2, 5, 0 ) ); // empty datapoints, just in case
        rows.push( CreatePointsRow( 1, 5, 15 ) );
        result = extract( rows );
        //console.log( result );
        done();
    } );
    it( 'Properly combines three unique rows', function( done ) {
        assert.equal( result.datapoints.length, 28 );
        done();
    } );
    it( 'The rows have all properties: x, y and value', function( done ) {
        assert( result.datapoints[ 0 ].hasOwnProperty( 'x' ) );
        assert( result.datapoints[ 0 ].hasOwnProperty( 'y' ) );
        assert( result.datapoints[ 0 ].hasOwnProperty( 'value' ) );
        done();
    } );
} );

/**** Helper functions and stuff ****/

// Generates test datapoints
function CreatePointsRow( stId, cuId, numPts ) {
    var rec = {
        "storeId": stId,
        "customerId": cuId,
        "timestamp": 2223334445,
    };

    var pts = [];
    for ( i = 0; i < numPts; i++ ) {
        var p = {
            "x": i,
            "y": i + 1,
            "value": 10
        };
        pts.push( p );
    };
    rec[ 'datapoints' ] = pts;
    //console.log( "Created: \n", rec );
    return rec;
}

// Expected format for datapoint records
var sampleRecord = {
    "storeId": "SR103",
    "customerId": 1442,
    "timestamp": 2223334445,
    "datapoints": [ {
        "x": 13,
        "y": 23,
        "value": 2
    }, {
        "x": 17,
        "y": 53,
        "value": 7
    }, {
        "x": 28,
        "y": 39,
        "value": 4
    }, {
        "x": 15,
        "y": 31,
        "value": 2
    }, {
        "x": 44,
        "y": 53,
        "value": 7
    }, {
        "x": 28,
        "y": 66,
        "value": 4
    }, {
        "x": 33,
        "y": 74,
        "value": 2
    } ]
}
