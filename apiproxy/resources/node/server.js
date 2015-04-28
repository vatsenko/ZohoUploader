var request = require('request');
var http = require('http');
var urlparse = require('url');
var FormData = require('./form-data');


var svr = http.createServer(function(req, resp) {
    var parsed = urlparse.parse(req.url, true);
    var pathname = parsed.pathname;
    if (pathname != "/favicon.ico") {
        console.log("Request for " + pathname + " received.");
    }
    switch (pathname) {
        case "/post_testing":
            post_testing(req, resp);
            break;
        case "/upload":
            if (!parsed.query.applinkname) {
                sendError(resp, 400, 'Missing query parameter "applinkname"');
            } else if (!parsed.query.formname) {
                sendError(resp, 400, 'Missing query parameter "formname"');
            } else if (!parsed.query.fieldname) {
                sendError(resp, 400, 'Missing query parameter "fieldname"');
            } else if (!parsed.query.recordId) {
                sendError(resp, 400, 'Missing query parameter "recordId"');
            } else if (!parsed.query.filename) {
                sendError(resp, 400, 'Missing query parameter "filename"');
            } else if (!parsed.query.url) {
                sendError(resp, 400, 'Missing query parameter "url"');
            } else if (!parsed.query.authtoken) {
                sendError(resp, 400, 'Missing query parameter "authtoken"');
            } else {
                zohoUpload(parsed.query, resp);
            }
            break;
        default:
            sendError(resp, 400, 'No such PATH');
    }

});

svr.listen(9000, function() {
    console.log('Node running on port 9000');
});

function zohoUpload(query, resp) {
    // zoho parameter
    var applinkname = query.applinkname;
    var formname = query.formname;
    var fieldname = query.fieldname;
    var recordId = query.recordId;
    var filename = query.filename;
    var contenttype = "text/xml";
    var url = query.url;
    var authtoken = query.authtoken;
    console.log(JSON.stringify(query));
    var posturl = "https://creator.zoho.com/api/xml/fileupload/scope=creatorapi&authtoken="+authtoken;
    //var posturl = "http://localhost:3000/post_testing";

    var form = new FormData();
    form.append('authtoken', authtoken);
    form.append('applinkname', applinkname);
    form.append('formname', formname);
    form.append('fieldname', fieldname);
    form.append('recordId', recordId);
    form.append('filename', filename);
  	form.append('file', request({'followAllRedirects': true,'url':url}));

    //
    form.submit(posturl, function(errs, ress) {
        if (errs) {
            resp.end("Error");
            throw errs;
        }
        console.log('Done');
        resp.end("Done");
        ress.resume();
    });

}


function post_testing(req, resp) {
    console.log("post request\n");
    console.log(JSON.stringify(req.headers))

    req.on('data', function(chunk) {
        console.log("Data[" + chunk.length + "]>>" + chunk.toString() + "<<!");
    });
    req.on('end', function() {
        console.log('<<END>>');
    });
    resp.end("OK");

}


function sendError(resp, code, msg) {
    var o = {
        'error': msg,
        'usage':'POST /upload\r\n ?authtoken=<apikey>\r\n &applinkname=<app>\r\n &formname=<form>\r\n &fieldname=<field>\r\n &recordId=<id>\r\n &filename=<filename>\r\n &url=url'
    };
    resp.writeHead(code, {
        'Content-Type': 'application/json'
    });
    resp.end(JSON.stringify(o));
}

function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}

