    // create instance
    var drawing = false,
        dataAPI = "api/datapoints/",
        dataPoints = [],
        currUserId = 0,
        currStoreId = 0;

    // temp constant until multiple store functionality is added
    var k_storeId = '1234';

    // vars to be populated after dom ready
    var heatmapInstance, $mapBox, offTop, offLeft, mouseBox;

    $( function() { // document ready?
        // TODO: build store ID selector and load map on demand
        // hard code store id for now
        currStoreId = k_storeId;
        SetStoreMap( GetStoreMapImage( currStoreId ) );

        $( '.demo-wrapper' ).on( 'click', function( ev ) {
            if ( drawing ) {
                heatmapInstance.addData( {
                    x: ev.offsetX,
                    y: ev.offsetY,
                    value: 8,
                } );
            };
        } )

        $( '.demo-wrapper' ).on( 'mousemove', function( ev ) {
            if ( drawing && MouseInBox( ev, mouseBox ) ) {
                var x = ev.pageX - offLeft;
                var y = ev.pageY - offTop;
                //console.log( "Mouse in: ", x, ", ", y );
                dataPoints.push( {
                    x: x,
                    y: y,
                    value: 1
                } );
                // offset the divs (size 3x3) by -1 to center them on x,y
                var off = "margin-top: " + ( y - 1 ) + "px; margin-left: " + (
                    x - 1 ) + "px; ";
                $( this ).append( '<div class="pt" style="' + off + '" ></div>' );
            };
        } )

        $( '.demo-wrapper' ).on( 'mouseleave', function() {
            //console.log( "Mouse left" );
            if ( drawing ) {
                // clean up last mouse track
                $( '.pt' ).remove();
                // push collection of points to server
                PushPointsToServer( dataPoints );
                // clear this set of points
                dataPoints = [];
                currUserId++;
            }
        } )

        $( '#mode' ).on( 'click', function() {
            if ( drawing ) {
                // Was in drawing mode, toggle button and display heat map
                SetMode( "map" );
                FetchAndMap( k_storeId );
            } else {
                SetMode( "draw" );
            };
            console.log( "mb clicked. Drawing is now: " + drawing );
        } )

        $( '#fetch' ).on( 'click', function() {
            FetchAndMap( k_storeId );
        } )

        $( '#reset' ).on( 'click', function() {
            SetMode( "map" );
            // TODO: Call server clear
            ClearServer( k_storeId );
            ClearHeatMap();
            console.log( "Reset clicked. drawing: " + drawing );
        } )

        $( '#push' ).on( 'click', function() {
            PushPointsToServer( dataPoints );
        } )

    } )

    var ClearHeatMap = function() {
        dataPoints = [];
        heatmapInstance.setData( {
            min: 0,
            max: 0,
            data: dataPoints
        } );
    }

    var ClearServer = function( stId ) {
        // sent datapoints as body to server
        var url = dataAPI + stId;
        console.log( "Send clear to ", url );
        $.post( url, "Client clear request" );
        // reset user Id
        currUserId = 0;
    }

    var FetchAndMap = function( stId ) {
        var url = dataAPI + stId;
        console.log( "Get data from server: ", url );
        GetData( url, function( err, data ) {
            //console.log( "In GetData - err=", err, " data=", data );
            if ( !err ) {
                SetMapPoints( data.datapoints );
            } else {
                console.error( "Error connecting to server: ", err );
            }
        } );
    }

    //console.log( "Connect: " + url );
    var GetData = function( url, callback ) {
        $.getJSON( url, function( data ) {
                callback( null, data );
            } )
            .fail( function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + error );
                callback( error );

            } );
    }

    var GetStoreMapImage = function( storeId ) {
        // TODO: build a store ID lookup, probably server side
        return '../images/store_layout.png';
    }

    var MouseInBox = function( ev, box ) {
        return ev.pageX >= box.minX && ev.pageX <= box.maxX 
            && ev.pageY >= box.minY && ev.pageY <= box.maxY;
    }

    var PushPointsToServer = function( pts ) {
        // sent datapoints as body to server
        console.log( "Push ", pts.length, " points to ", dataAPI, "for userId:" +
            currUserId );
        var row = {
            'storeId': k_storeId,
            'customerId': currUserId,
            'timestamp': Math.floor( Date.now() / 1000 ),
            'datapoints': pts
        }

        var json_row = row;
        var json_row = JSON.stringify( row );
        console.log( "... row = ", json_row );
/*        $.post( dataAPI, {
            'row': json_row
        }, 
        function( data ) {
            console.log( "Server:", data );
        },
        error: function( jqxhr, error, textStatus ) {
            console.error( "PushPointsToServer -- Server error: " + error );
        } );*/
        $.ajax( {
            url: dataAPI,
            type: "POST",
            data: { 'row': json_row },
            success: function( data ) {
                console.log( "Server:", data );
            },
            error: function( jqxhr, textStatus, error ) {
                console.error( "PushPointsToServer -- Server error: " + error + " / Status: " + textStatus );
            }
        } );
    }
 
    // Assumes that points is an array of valid heatmap datapoints, not the full setData JSON
    var SetMapPoints = function( points ) {
        console.log( "SetMapPoints: adding , ", points.length, " points" );
        var data = {
            min: 1,
            max: 10,
            data: points
        }
        heatmapInstance.setData( data );
        var test = heatmapInstance.getData();
        console.log( " . . . After add, ", test.data.length, " points" );
    }

    // Set the current mode to either draw or map. The mode button will select the opposite in order to allow toggling.
    // 'draw' - clears map and existing data points, setting drawing = true
    // 'map'  - sets mode button to select draw mode, sets drawing = false
    var SetMode = function( mode ) {
        if ( mode == "draw" ) { // switch into drawing mode, with Map as the next function on click
            drawing = true;
            document.querySelector( '#mode' ).innerText = "Map";
            ClearHeatMap();
            // Entering draw clears any existing cached points and the heat map
        } else if ( mode == "map" ) { // switch out of drawing mode, with Draw as the next function on click
            drawing = false;
            document.querySelector( '#mode' ).innerText = "Draw";
        } else {
            console.error( "SetMode: Illegal mode arg - ", mode );
        }
    }

    var SetStoreMap = function( imgUrl ) {
        // First set the map image and apply to div as background
        var quotedUrl = 'url( "' + imgUrl + '" )';
        console.log( "Setting background image to:", quotedUrl );
        $( '.demo-wrapper' ).css( "background-image", quotedUrl );

        // Calculate the image dimensions and size the div accordingly
        var img = new Image;
        img.src = imgUrl;
        $(img).load( function () {
            $( '.demo-wrapper' ).css( "height", img.height );
            $( '.demo-wrapper' ).css( "width", img.width );
            // Add some one time calculations for heavily used drawing boundaries
            $mapBox = $( '.demo-wrapper' )[ 0 ];
            offTop = $mapBox.offsetTop;
            offLeft = $mapBox.offsetLeft;
            // create a one time box dimensions for mouse in div boundary check to avoid repetive math
            mouseBox = {
                minX: $mapBox.offsetLeft,
                maxX: $mapBox.offsetLeft + $mapBox.offsetWidth - $mapBox.clientLeft,
                minY: $mapBox.offsetTop,
                maxY: $mapBox.offsetTop + $mapBox.offsetHeight - $mapBox.clientTop
            }
            // And build the heatmap instance
            heatmapInstance = h337.create( {
                container: document.querySelector( '.demo-wrapper' ),
                radius: 12,
                min: 0,
                max: 2000
            } )
        } )
    }
