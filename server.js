//////////////////////////////////////////////////////////////////////////////
// Uncomment to create and fill with data ./contacts.json file
// let Contacts = require('./models/initContacts.js');
// Contacts.initContacts();
///////////////////////////////////////////////////////////////////////////////

function ShowRequestInfo(req){
    //const URL = require('url').URL;
    //let url = new URL(req.url);
    console.log(`User agent:${req.headers["user-agent"]}`);
    console.log(`Content-type:${req.headers["content-type"]}`);
    console.log(`Method:${req.method}`);
    console.log(`Path:${req.url}`);
}
function AccessControlConfig(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credential', false);
    res.setHeader('Access-Control-Allow-Max-Age', '86400'); // 24 hours
}
function CORS_Prefligth(req, res){
    if (req.method === 'OPTIONS'){
        console.log('preflight CORS verifications');
        res.end();
        // request handled
        return true;
    }
    // request not handled
    return false;
}
function notFound(res) {
    res.writeHead(404, {'content-type':'text/plain'});
    res.end();
}
function API_Endpoint(req, res) {
    return require('./router').dispatch_API_EndPoint(req, res);
}
const PORT = process.env.PORT || 5000;
require('http').createServer((req, res) => {
    // Middlewares pipeline
    ShowRequestInfo(req);
    AccessControlConfig(res);
    if (!CORS_Prefligth(req, res)) {
        if (!API_Endpoint(req, res)) {
            // do something else with request
            // J'ai mis la ligne suivante en commentaire car elle plantait le serveur lorsque l'id n'était pas un nombre.
            //notFound(res);
        }
    }
}).listen(PORT, () => console.log(`HTTP Server running on port ${PORT}...`));
