var frisby = require( 'frisby' );

// start server
var app = require( __dirname + '/../../app.js' );


describe( "Server API tests", function( done ) {
    beforeEach( function() {
        console.log( "starting server" );
        app.listen();
    } );
    afterEach( function() {
        console.log( "closing server" );
        app.close();
    } );

    frisby.create( 'Fetch heatmap html page' )
        .get( 'http://localhost:3000/heatmap' )
        .expectStatus( 200 )
        .expectHeaderContains( 'content-type', 'html' )
        .expectBodyContains( 'Store Flow' )
        .toss();

    frisby.create( 'Get on api/datapoints' )
        .get( 'http://localhost:3000/api/datapoints/1111' )
        .expectStatus( 200 )
        .expectHeaderContains( 'content-type', 'application/json' )
        .expectJSONTypes( {
            storeId: String,
            datapoints: Array
        } )
        .toss();
} )
