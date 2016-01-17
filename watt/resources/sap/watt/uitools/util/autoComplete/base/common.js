(function (exports) {
	function readFileSync(uri) {
		var fs = require("fs");
		var options = {encoding: "utf8"};
		
		return fs.readFileSync(uri, options);
	}
	
	function writeFileSync(data, uri) {
		ensureDir(uri);
		
		var fs = require("fs");
		var options = {encoding: "utf8"};
		fs.writeFileSync(uri, data, options);
	}
	
	function getJsDocFilename(baseDir, moduleName) {
		var pos = moduleName.indexOf(".js");
		if (pos > 0) {
			var name = moduleName.substring(0, pos);
			return baseDir + name + "-dbg.js";
		}
	}
	
	function getJsonFilename(jsonBaseDir, version, name) {
		var pos = name.indexOf(".js");
		if (pos > 0) {
			name = name.substring(0, pos);
		}
		return jsonBaseDir + version + "/" + name + ".json";
	}
		
	function httpGetAsync(url, okCallback, failCallback) {
		var http = require("http");
		http.get(url, function(res) {
			var body = '';
			res.on('data', function(chunk) {
				body += chunk;
			});
			res.on('end', function() {
				okCallback(url, body);
			});
		}).on('error', function(e) {
			console.log(e);
			if (failCallback) {
				failCallback(e.message);
			}
		});
	}
	
	function ensureDir(uri) {
		var fs = require("fs");
		
		var pos = uri.lastIndexOf('/');
		if (pos >= 0) {
			var dir = uri.substring(0, pos);
			if (!fs.existsSync(dir)) {
				var upPos = dir.lastIndexOf('/');
				if (upPos >= 0) {
					var upDir = dir.substring(0, upPos);
					if (!fs.existsSync(upDir)) {
						ensureDir(dir);
					}
					fs.mkdirSync(dir);
				}
			}
		}
	}
	
	function sortIndex(root) {
		if (typeof(root) == "object") {
			var keys = [];
			for (var node in root) {
				root[node] = sortIndex(root[node]);
				keys.push(node);
			}
			keys.sort(sortBy);
			
			var sortedRoot = {};
			for (var i in keys) {
				var key = keys[i];
				sortedRoot[key] = root[key];
			}
			return sortedRoot;
		} else {
			return root;
		}
		
		function sortBy(s1, s2) {
			if (isObjName(s1)) {
				s1 = getName(s1);
			}
			if (isObjName(s2)) {
				s2 = getName(s2);
			}
			if (s1 < s2) {
				return -1;
			} else if (s1 > s2) {
				return 1;
			} else {
				return 0;
			}
			
			function isObjName(name) {
				if (name.length <= '_obj'.length) {
					return false;
				}
				
				var shortName = name.substring(0, name.length - '_obj'.length);
				return (shortName + '_obj' === name);
			}
			
			function getName(objName) {
				return objName.substring(0, objName.length - '_obj'.length) + '-obj';
			}
		}
	}
	
	exports.doctrine = require("../../../../lib/doctrine/doctrine");

	exports.readFileSync = readFileSync;
	exports.writeFileSync = writeFileSync;	
	exports.httpGetAsync = httpGetAsync;
	exports.getJsDocFilename = getJsDocFilename;
	exports.getJsonFilename = getJsonFilename;
	exports.sortIndex = sortIndex;
}(typeof exports === 'undefined' ? (common = {}) : exports));