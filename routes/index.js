var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    var options = {
        root: './views/'
    }

    res.sendFile('HeatServer_Doc.html', options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', 'HeatServer_Doc.html');
        }
    });
});

router.get('/heatmap', function(req, res, next) {

    var options = {
        root: './views/'
    }

    res.sendFile('StoreHeat2.html', options, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', 'StoreHeat2.html');
        }
    });
});

module.exports = router;
