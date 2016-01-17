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
var libraryFile = config.libraryfile;
var xmlBaseFile = path.resolve(__dirname, config.xmlmetadatas_basefile);
var outputRoot = path.resolve(__dirname, config.outputdir);
var outputXmlFile = config.xmlmetadatas_outputfile;

var result = {};
fs.exists(outputRoot, function(exists) {
	if (exists) {
		console.log("the forlder " + outputRoot + " exists");
		createAllUI5Metadata();
	} else {
		fs.mkdir(outputRoot, 493/*0755*/, function(err) {
			if (err) {
				throw err;
			}
			console.log("the forlder " + outputRoot + " was created");
			createAllUI5Metadata();
		});
	}
});

function createAllUI5Metadata() {
	var item = null;
	for (item in roots) {
		if (Object.prototype.hasOwnProperty.call(roots, item)) {
			createOneUI5Metadata(item);
		}
	}
}

function createOneUI5Metadata(item) {
	var dirPath = outputRoot + "/" + item;
	fs.exists(dirPath, function(exists) {
		if (exists) {
			console.log("the forlder " + dirPath + " exists");
			createUI5Metadata(item);
		} else {
			fs.mkdir(dirPath, 493/*0755*/, function(err) {
				if (err) {
					throw err;
				} 
				console.log("the forlder " + dirPath + " was created");
				createUI5Metadata(item);
			});
		}
	});
}

function createUI5Metadata(item) {
	result[item] = {};
	result[item].requiredfiles = {};
	result[item].parsingfiles = {};
	result[item].metadatas = {};
	if (roots[item].host) {
		initMetadatasFromServer(item, roots[item]);//init
	} else if (roots[item].baseDir) {
		initMetadatasFromFileSystem(item, roots[item]);//init
	} else {
		console.log("Error in config for root " + item);
	}
}

function checkStatus(rootname, ui5root) {
	var isCompleted = true;
	var file = null;
	for (file in result[rootname].parsingfiles) {
		if (Object.prototype.hasOwnProperty.call(result[rootname].parsingfiles, file)) {
			if (result[rootname].parsingfiles[file].status != "completed") {
				isCompleted = false;
				break;
			}
		}
	}
	
	if (isCompleted) {
		for (file in result[rootname].parsingfiles) {
			if (Object.prototype.hasOwnProperty.call(result[rootname].parsingfiles, file)) {
				result[rootname].metadatas[file] = result[rootname].parsingfiles[file];
			}
		}
		result[rootname].parsingfiles = {};
		var file1 = null;
		for (file1 in result[rootname].requiredfiles) {
			if (Object.prototype.hasOwnProperty.call(result[rootname].requiredfiles, file1)) {
				isCompleted = false;
				result[rootname].parsingfiles[file1] = result[rootname].requiredfiles[file1];
			}
		}
		result[rootname].requiredfiles = {};
		if (!isCompleted) {
			if (ui5root.host) {
				createMetadatasFromServer(rootname, ui5root);
			} else if (ui5root.baseDir) {
				createMetadatasFromFileSystem(rootname, ui5root);
			}
		}
	}
	
	return isCompleted;
}

function parseData(rootname) {
	var pData = {xmlmetadatas: {}};
	pData.xmlmetadatas.metadatas = {};
	pData.xmlmetadatas.enums = {};
	var file;
	var enumitem = null;
	for (file in result[rootname].metadatas) {
		if (Object.prototype.hasOwnProperty.call(result[rootname].metadatas, file)) {
			//parse ui5 file to get metadatas
			console.log("parsing data of " + file);
			var retObj = parser.parseData(result[rootname].metadatas[file]);
			pData.xmlmetadatas.metadatas[file] = result[rootname].metadatas[file].metadatas;//retObj
			if (result[rootname].metadatas[file].enums) {
				for (enumitem in result[rootname].metadatas[file].enums) {
					if (Object.prototype.hasOwnProperty.call(result[rootname].metadatas[file].enums, enumitem)) {
						pData.xmlmetadatas.enums[enumitem] = result[rootname].metadatas[file].enums[enumitem];
					}
				}			
			}
		}
	}
	
	return pData;
}

function doComplete (rootname, ui5root) {
	if (checkStatus(rootname, ui5root)) {
		console.log("  => processing metadatas from root: " + rootname);
		var pData = parseData(rootname);
		
		//for debug
		var debugdatas = JSON.stringify(result[rootname], null, "\t");
		var dfsPath = outputRoot + "/" + rootname + "/debugdatas.json";
		fs.writeFile(dfsPath, debugdatas, 'utf8', function(err) {
			if (err) {
				throw err;
			}
		});
		
		var debuginfos = {errors:[], warnings:[], infos:[]};
		var name = null;
		for (name in result[rootname].metadatas) {
			if (Object.prototype.hasOwnProperty.call(result[rootname].metadatas, name)) {
				debuginfos.errors = debuginfos.errors.concat(result[rootname].metadatas[name].errors);
				debuginfos.warnings = debuginfos.warnings.concat(result[rootname].metadatas[name].warnings);
				debuginfos.infos = debuginfos.infos.concat(result[rootname].metadatas[name].infos);
			}
		}
		var debuginfosStr = JSON.stringify(debuginfos, null, "\t");
		var ifsPath = outputRoot + "/" + rootname + "/debuginfos.json";
		fs.writeFile(ifsPath, debuginfosStr, 'utf8', function(err) {
			if (err) {
				throw err;
			}
		});
		//
		
		//load the template
		var xmlPath = path.resolve(__dirname, xmlBaseFile);
		fs.readFile(xmlPath, function(err, data) {
			if (err) {
				throw err;
			}
			var xmlcodes = data.toString();
			//save to file
			var xmlmetadatas = JSON.stringify(pData.xmlmetadatas, null, "\t");
			//console.log("  => {$XMLMETADATAS}: " + JSON.stringify(pData.xmlmetadatas));
			
			var fsPath = outputRoot + "/" + rootname + "/" + outputXmlFile;
			fs.exists(fsPath, function(exists) {
				if (exists) {
					console.log("the file " + fsPath + " exists");
				} else {
					var reg = new RegExp("{\\$XMLMETADATAS}", "g");
					fs.writeFile(fsPath, xmlcodes.replace(reg, xmlmetadatas), 'utf8', function(err) {
						if (err) {
							throw err;
						}
						console.log("the file " + fsPath + " was created");
					});
				}
			
				console.log("  => finished metadatas from root: " + rootname);
			});
		});
	}
}

function getPathFromName(name) {
	var path = name.replace(/\./g,"/");
	return path;
}

function getRequiredFiles(rootname, file, ui5root) {
	var retObj = parser.parseRequired(result[rootname].parsingfiles[file]);
	var i = 0;
	var rfile = null;
	for (i=0; i<retObj.length; i++) {
		rfile = retObj[i];
		if (!(result[rootname].metadatas[rfile] || result[rootname].parsingfiles[rfile] || result[rootname].requiredfiles[rfile])) {
			result[rootname].requiredfiles[rfile]={};
			result[rootname].requiredfiles[rfile].name = rfile;
			result[rootname].requiredfiles[rfile].type = parser.fileTypes.CLASS;
		}
	}	
}

function initMetadatasFromFileSystem(rootname, ui5root) {
	var i = 0;
	var file = null;
	for (i=0; i<ui5libs.length; i++) {
		file = ui5libs[i];
		result[rootname].parsingfiles[file]={};
		result[rootname].parsingfiles[file].name = file;
		result[rootname].parsingfiles[file].type = parser.fileTypes.LIBRARY;
	}
	createMetadatasFromFileSystem(rootname, ui5root);
}

function createMetadatasFromFileSystem(rootname, ui5root) {
	var file = null;
	for (file in result[rootname].parsingfiles) {
		if (Object.prototype.hasOwnProperty.call(result[rootname].parsingfiles, file)) {
			switch (result[rootname].parsingfiles[file].type) {
				case parser.fileTypes.LIBRARY:
					result[rootname].parsingfiles[file].filePath = getPathFromName(file) + "/" + libraryFile;
					break;
				case parser.fileTypes.CLASS:
					result[rootname].parsingfiles[file].filePath = getPathFromName(file) + "-dbg.js";
					break;
				default:
			}
			result[rootname].parsingfiles[file].status = "started";
			result[rootname].parsingfiles[file].data = "";
			result[rootname].parsingfiles[file].errors = [];
			result[rootname].parsingfiles[file].warnings = [];
			result[rootname].parsingfiles[file].infos = [];
			createMetadataFromFileSystem(rootname, file, ui5root);
		}
	}
}

function createMetadataFromFileSystem(rootname, file, ui5root) {
	console.log("  => loading file of " + file + " from root: " + rootname);
	var ui5BaseDir = ui5root.baseDir;
	var fsPath = ui5BaseDir + "resources/" + result[rootname].parsingfiles[file].filePath;
	fs.exists(fsPath, function(exists) {
		if (exists) {
			fs.readFile(fsPath, function(err, data) {
				if (err) {
					throw err;
				}
				result[rootname].parsingfiles[file].data = data.toString();		
				console.log("  => loaded file of " + file + " from root: " + rootname);
				getRequiredFiles(rootname, file, ui5root);
				result[rootname].parsingfiles[file].status = "completed";
				doComplete(rootname, ui5root);
			});
		} else {
			console.log("ERROR: the file " + fsPath + " is not found");
			result[rootname].parsingfiles[file].status = "completed";
			result[rootname].parsingfiles[file].errors.push("ERROR: the file " + fsPath + " is not found");
			doComplete(rootname, ui5root);
		}
	});
}

function initMetadatasFromServer(rootname, ui5root) {
	var i = 0;
	for (i=0; i<ui5libs.length; i++) {
		var file = ui5libs[i];
		result[rootname].parsingfiles[file]={};
		result[rootname].parsingfiles[file].name = file;
		result[rootname].parsingfiles[file].type = parser.fileTypes.LIBRARY;
	}
	createMetadatasFromServer(rootname, ui5root);
}

function createMetadatasFromServer(rootname, ui5root) {
	var file = null;
	for (file in result[rootname].parsingfiles) {
		if (Object.prototype.hasOwnProperty.call(result[rootname].parsingfiles, file)) {
			switch (result[rootname].parsingfiles[file].type) {
				case parser.fileTypes.LIBRARY:
					result[rootname].parsingfiles[file].filePath = getPathFromName(file) + "/" + libraryFile;
					break;
				case parser.fileTypes.CLASS:
					result[rootname].parsingfiles[file].filePath = getPathFromName(file) + "-dbg.js";
					break;
				default:
			}
			result[rootname].parsingfiles[file].status = "started";
			result[rootname].parsingfiles[file].data = "";
			result[rootname].parsingfiles[file].errors = [];
			result[rootname].parsingfiles[file].warnings = [];
			result[rootname].parsingfiles[file].infos = [];
			createMetadataFromServer(rootname, file, ui5root);
		}
	}
}

function createMetadataFromServer(rootname, file, ui5root) {
	console.log("  => loading file of " + file + " from root: " + rootname);
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
		  path: ui5Host + ":" + ui5Port + ui5root.uri + "resources/" + result[rootname].parsingfiles[file].filePath,
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
		  path: ui5root.uri + "resources/" + result[rootname].parsingfiles[file].filePath,
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
	handleDataResponse(rootname, file, requestUI5, ui5root);

	requestUI5.on('error', function(error) {
		console.log("Error: " + error);
		result[rootname].parsingfiles[file].errors.push("ERROR: fail to get the file " + options.path + ".");
	});
}

function handleDataResponse(rootname, file, requestUI5, ui5root) {
  	requestUI5.on('response', function(responseUI5) {
		responseUI5.on('data', function(chunk) {
			result[rootname].parsingfiles[file].data += chunk;
		});
		responseUI5.on('end', function() {
		  	console.log("  => loaded file of " + file + " from root: " + rootname);
			if (result[rootname].parsingfiles[file].data.indexOf("<html>") == 0) {
				result[rootname].parsingfiles[file].errors.push("ERROR: fail to get the file " + result[rootname].parsingfiles[file].filePath + ".");
			}
			getRequiredFiles(rootname, file, ui5root);
			result[rootname].parsingfiles[file].status = "completed";
		  	doComplete(rootname, ui5root);
		});
		responseUI5.on('close', function() {
		  	console.log("  => loaded file of " + file + " from root: " + rootname);
			if (result[rootname].parsingfiles[file].data.indexOf("<html>") == 0) {
				result[rootname].parsingfiles[file].errors.push("ERROR: fail to get the file " + result[rootname].parsingfiles[file].filePath + ".");
			}
			getRequiredFiles(rootname, file, ui5root);
		  	result[rootname].parsingfiles[file].status = "completed";
		  	doComplete(rootname, ui5root);
		});
	});
}