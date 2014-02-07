#!/usr/bin/env node
/* server.js (C) 2014 SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/* setup: npm install j connect cors browserver-router 
   start: node server.js [port [base_directory]]
   will serve xls{,x,b,m} files from the base_directory using standard connect
   
   use with tabletop:
   Tabletop.init( {
     endpoint:"http://localhost:7263", // <-- adjust accordingly
     key: "myfile.xls", // <-- the actual filename
     ...
   });
*/

var http = require('http'),
	J = require('j'),
	connect = require('connect'),
	cors = require('cors'),
	Router = require('browserver-router'),
	path = require('path');

var port = Number(process.argv[2]||0) || process.env.PORT || 7263;
var cwd = process.argv[3] || process.env.BASE_DIR || process.cwd();

var diropts = {
	icons: true,
	filter: function(name) {
		return name.match(/\.xls[xbm]?$/);
	}
}

var tt_entries = function(req, res) {
	var args = req.params[0].split("~"); 
	var w = J.readFile(path.join(cwd,args[0]));
	var out = JSON.stringify({
		feed: {
			entry: w[1].SheetNames.map(function(ss,i) { return {
				title:{"$t":ss},
				content:{"$t":""},
				link:[
					{},
					{},
					{},
					{href:"000"+String(i)}
				]
			};})
		}
	})
	if(req.query && req.query.alt == 'json-in-script') {
		out = req.query.callback + '(JSON.parse(' + JSON.stringify(out) + '));'
	}
	res.end(out);
};

var tt_data = function(req, res) {
	var name = req.params[0], sidx = req.params[1];
	var w = J.readFile(path.join(cwd,name));
	var s = w[1].SheetNames[Number(sidx)];
	var o = J.utils.to_json(w, name, s);
	if(s) o = o[s];
	o.forEach(function(r) {
		Object.keys(r).forEach(function(k) {
			r["gsx$"+k] = {"$t":r[k]}; delete r[k];
		});
	});
	var out = JSON.stringify({feed:{entry:o, title:{"$t":s}}});
	if(req.query && req.query.alt == 'json-in-script') {
		out = req.query.callback + '(JSON.parse(' + JSON.stringify(out) + '));'
	}
	res.writeHead(200, {'Content-Type':'application/javascript'});
	res.end(out);
};

var router = Router({
	'/feeds/worksheets/:file/public/basic': tt_entries,
	'/feeds/list/:file/:idx/public/values': tt_data,
});

var app = connect()
	.use(cors())
	.use(connect.logger())
	.use(connect.bodyParser())
	.use(connect.query())
	.use(router)
	.use(connect.directory(cwd, diropts));

http.createServer(app).listen(port);
