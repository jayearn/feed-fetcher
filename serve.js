// Lets require/import the HTTP module
var http = require('http');

// Lets define a port we want to listen to
const PORT=3000; 

function createTaxi(_driver, _car, _lat, _lon) {
    return {
        driver: _driver,
        car: _car,
        lat: _lat,
        lon: _lon
    }
}

// We need a function which handles requests and send response
function handleRequest(request, response) {
    re = JSON.stringify([
                 createTaxi("John", "E-Klasse", 10.4, 50.2),
                 createTaxi("Klaus", "VW Fox", 10.3241, 55.0324)]);
    response.end(re);
    console.log(re);
}

// Create a server
var server = http.createServer(handleRequest);

// Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

