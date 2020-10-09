const Response = require('../response.js');
const queryString = require('query-string');
/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports = 
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.response = new Response(res);
    }
    getQueryStringParams(){
        let url = this.req.url;
        if (url.indexOf('?') > -1) {
            url = url.substring(url.indexOf('?'),url.length);
            const parsed = queryString.parse(url);
            return parsed;
        }
        return null;
    }
    get(id){
        this.response.notImplemented();
    }  
    post(obj){  
        this.response.notImplemented();
    }
    put(obj){
        this.response.notImplemented();
    }
    patch(obj){
        this.response.notImplemented();
    }
    remove(id){
        this.response.notImplemented();
    }
}