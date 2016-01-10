/**
 * Created by varunendra on 10/1/16.
 */
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/static'));
app.get('/', function(req, res){
    res.redirect('/index.html');
});
app.listen(8000);
console.log('Server running at 8000, use http://localhost:8000');