var config = require("./config.json");
var parser = require("./parser.js");

var http = require("http"),
  https = require("https"),
  url = require("url"),
  path = require("path"),
  fs = require("fs");

console.log("Start:");

var roots = config.ui5_roots;
var ui5libs = config.ui5_libs;
var xmlfile = config.xmlfile;
var xmlBaseFile = path.resolve(__dirname, config.xmltemplates_basefile);
var jsBaseFile = path.resolve(__dirname, config.jstemplates_basefile);
var outputRoot = path.resolve(__dirname, config.outputdir);
var outputXmlFile = config.xmltemplates_outputfile;
var outputJsFile = config.jstemplates_outputfile;

var result = {};
fs.exists(outputRoot, function(exists) {
	if (exists) {
		console.log("the forlder " + outputRoot + " exists");
		loadAllUI5Templates();
	} else {
		fs.mkdir(outputRoot, 493/*0755*/, function(err) {
			if (err) {
				throw err;
			}
			console.log("the forlder " + outputRoot + " was created");
			loadAllUI5Templates();
		});
	}
});

function loadAllUI5Templates() {
	var item = null;
	for (item in roots) {
		if (Object.prototype.hasOwnProperty.call(roots, item)) {
			loadOneUI5Templates(item);
		}
	}
}

function loadOneUI5Templates(item) {
	var dirPath = outputRoot + "/" + item;
	fs.exists(dirPath, function(exists) {
		if (exists) {
			console.log("the forlder " + dirPath + " exists");
			loadUI5Templates(item);
		}
		else {
			fs.mkdir(dirPath, 493/*0755*/, function(err) {
				if (err) {
					throw err;
				} 
				console.log("the forlder " + dirPath + " was created");
				loadUI5Templates(item);
			});
		}
	});
}

function loadUI5Templates(item) {
	result[item] = {};
	if (roots[item].host) {
		loadTemplatesFromServer(item, roots[item]);
	} else if (roots[item].baseDir) {
		loadTemplatesFromFileSystem(item, roots[item]);
	} else {
		console.log("Error in config for root " + item);
	}
}

function checkStatus (rootname) {
	var isCompleted = true;
	var lib = null;
	for (lib in result[rootname]) {
		if (Object.prototype.hasOwnProperty.call(result[rootname], lib)) {
			if (result[rootname][lib].status != "completed") {
				isCompleted = false;
				break;
			}
		}
	}
	return isCompleted;
}

function parseData(rootname) {
	var pData = {xmlkeywords: [], xmltemplates: [], jskeywords: [], jstemplates: []};
	pData.xmlkeywords.push("root");
	pData.xmltemplates.push({
 			name: "root",
			prefix: "root", 
			description: "root",
			template: "<core:View \n\txmlns:core=\"sap.ui.core\" \n\txmlns=\"sap.m\" \n\txmlns:commons=\"sap.ui.commons\" \n\txmlns:layout=\"sap.ui.layout\" \n\tcontrollerName=\"\" \n\tviewName=\"\">\n\t\n</core:View>\n" 
		});
	var lib = null;
	for (lib in result[rootname]) {
		if (Object.prototype.hasOwnProperty.call(result[rootname], lib)) {
			//parse ui5 xml files to get keywords and templates
			var retObj = parser.parseData(result[rootname][lib].data);
			pData.xmlkeywords = pData.xmlkeywords.concat(retObj.xmlkeywords);
			pData.xmltemplates = pData.xmltemplates.concat(retObj.xmltemplates);
			pData.jskeywords = pData.jskeywords.concat(retObj.jskeywords);
			pData.jstemplates = pData.jstemplates.concat(retObj.jstemplates);
		}
	}
	return pData;
}

function doComplete (rootname) {
	if (checkStatus(rootname)) {
		console.log("  => processing templates from root: " + rootname);
		var pData = parseData(rootname);
		//load the template
		var xmlPath = path.resolve(__dirname, xmlBaseFile);
		fs.readFile(xmlPath, function(err, data) {
			if (err) {
				throw err;
			}
			var xmlcodes = data.toString();
			//save to file
			var xmlkeywords = JSON.stringify(pData.xmlkeywords, null, "\t");
			var xmltemplates = JSON.stringify(pData.xmltemplates, null, "\t");
			//console.log("  => {$XMLKEYWORDS}: " + JSON.stringify(pData.xmlkeywords));
			//console.log("  => {$XMLTEMPLATES}: " + JSON.stringify(pData.xmltemplates));
		
			var fsPath = outputRoot + "/" + rootname + "/" + outputXmlFile;
			fs.exists(fsPath, function(exists) {
				if (exists) {
					console.log("the file " + fsPath + " exists");
				} else {
					var xmlReg1 = new RegExp("{\\$XMLKEYWORDS}", "g");
					var xmlReg2 = new RegExp("{\\$XMLTEMPLATES}", "g");
					fs.writeFile(fsPath, xmlcodes.replace(xmlReg1, xmlkeywords).replace(xmlReg2, xmltemplates), 'utf8', function(err) {
						if (err) {
							throw err;
						}
						console.log("the file " + fsPath + " was created");
					});
				}
				console.log("  => finished templates(xml) from root: " + rootname);
			});
		});
		
		var jsPath = path.resolve(__dirname, jsBaseFile);
		fs.readFile(jsPath, function(err, data) {
			if (err) {
				throw err;
			}
			var jscodes = data.toString();
			var jskeywords = JSON.stringify(pData.jskeywords, null, "\t");
			var jstemplates = JSON.stringify(pData.jstemplates, null, "\t");
			//console.log("  => {$JSKEYWORDS}: " + JSON.stringify(pData.jskeywords));
			//console.log("  => {$JSTEMPLATES}: " + JSON.stringify(pData.jstemplates));
			
			var fsPath = outputRoot + "/" + rootname + "/" + outputJsFile;
			fs.exists(fsPath, function(exists) {
				if (exists) {
					console.log("the file " + fsPath + " exists");
				}
				else {
					var jsReg1 = new RegExp("{\\$JSKEYWORDS}", "g");
					var jsReg2 = new RegExp("{\\$JSTEMPLATES}", "g");
					fs.writeFile(fsPath, jscodes.replace(jsReg1, jskeywords).replace(jsReg2, jstemplates), 'utf8', function(err) {
						if (err) {
							throw err;
						}
						console.log("the file " + fsPath + " was created");
					});
				}
				console.log("  => finished templates(js) from root: " + rootname);
			});
		});	
	}
}

function loadTemplatesFromFileSystem(rootname, ui5root) {
	var i = 0;
	var lib = null;
	for (i=0; i<ui5libs.length; i++) {
		var lib = ui5libs[i];
		result[rootname][lib]={};
		result[rootname][lib].status = "started";
		result[rootname][lib].data = "";
		loadTemplateFromFileSystem(rootname, lib, ui5root);
	}
}

function loadTemplateFromFileSystem(rootname, libname, ui5root) {
	console.log("  => loading template of library: " + libname + " from root: " + rootname);
	var ui5BaseDir = ui5root.baseDir;
	var fsPath = ui5BaseDir + "resources/" + libname.replace(/\./g, "/") + "/" + xmlfile;
	fs.exists(fsPath, function(exists) {
		if (exists) {
			fs.readFile(fsPath, function(err, data) {
				if (err) {
					throw err;
				}
				result[rootname][libname].data = data.toString();
				result[rootname][libname].status = "completed";
				console.log("  => loaded template of library: " + libname + " from root: " + rootname);
				doComplete(rootname);
			});
		} else {
			result[rootname][libname].status = "completed";
			console.log("the file " + fsPath + " is not found");
			doComplete(rootname);
		}
	});
}


function loadTemplatesFromServer(rootname, ui5root) {
	var i = 0;
	var lib = null;
	for (i=0; i<ui5libs.length; i++) {
		lib = ui5libs[i];
		result[rootname][lib]={};
		result[rootname][lib].status = "started";
		result[rootname][lib].data = "";
		loadTemplateFromServer(rootname, lib, ui5root);
	}
}

function loadTemplateFromServer(rootname, libname, ui5root) {
	console.log("  => loading template of library: " + libname + " from root: " + rootname);
	var requestUI5 = null;
	var ui5Host = ui5root.host;
	var ui5Port = ui5root.port;
	var proxyHost = ui5root.proxyHost;
	var proxyPort = ui5root.proxyPort;
	var useHttps = ui5root.useHttps;
	var headersRequest = {};//request.headers;
	headersRequest.host = ui5Host + ":" + ui5Port;
	var options;
	if (proxyHost) {
		options = {
		  hostname: proxyHost,
		  port: proxyPort,
		  path: ui5Host + ":" + ui5Port + ui5root.uri + "resources/" + libname.replace(/\./g, "/") + "/" + xmlfile,
		  method: "GET",
		  headers: headersRequest
		};
		if (useHttps) {
		  options.path = "https://" + options.path;
		  headersRequest.origin = "https://" + ui5Host + ":" + ui5Port;
		  requestUI5 = https.request(options);
		  //console.log('HTTPS request via PROXY');
		} else {
		  options.path = "http://" + options.path;
		  headersRequest.origin = "http://" + ui5Host + ":" + ui5Port;
		  requestUI5 = http.request(options);
		  //console.log('HTTP request via PROXY');
		  //console.log(options);
		}

	} else {
		options = {
		  host: ui5Host,
		  port: ui5Port,
		  path: ui5root.uri + "resources/" + libname.replace(/\./g, "/") + "/" + xmlfile,
		  method: "GET",
		  headers: headersRequest
		};
		if (useHttps) {
		  headersRequest.origin = "https://" + ui5Host + ":" + ui5Port;
		  requestUI5 = https.request(options);
		} else {
		  headersRequest.origin = "http://" + ui5Host + ":" + ui5Port;
		  requestUI5 = http.request(options);
		  //console.log('HTTP request');
		  //console.log(options);
		}
	}

	requestUI5.end();
	handleDataResponse(rootname, libname, requestUI5);

	requestUI5.on('error', function(error) {
		console.log("Error: " + error);
	});
}

function handleDataResponse(rootname, libname, requestUI5) {
  	requestUI5.on('response', function(responseUI5) {
		responseUI5.on('data', function(chunk) {
			result[rootname][libname].data += chunk;
		});
		responseUI5.on('end', function() {
			result[rootname][libname].status = "completed";
		  	console.log("  => loaded template of library: " + libname + " from root: " + rootname);
		  	doComplete(rootname);
		});
		responseUI5.on('close', function() {
		  	result[rootname][libname].status = "completed";
		  	console.log("  => loaded template of library: " + libname + " from root: " + rootname);
		  	doComplete(rootname);
		});
	});
}