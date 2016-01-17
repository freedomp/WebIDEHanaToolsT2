(function (exports) {
	var common = require("./common");
	
	function generateIndexPackage(trees, indexBaseDir, version) {
		try {
			var fs = require("fs");
			var JSZip = require("jszip");
			var zip = new JSZip();
			
			for (var i in trees) {
				var fileName = trees[i]["!name"] + ".json";
				var fileContent = JSON.stringify(trees[i]);
				zip.file(fileName, fileContent);
			}
			
			var packageName = version + ".zip";
			var packagePath = indexBaseDir + packageName;
			var buffer = zip.generate({type: 'nodebuffer', compression: 'DEFLATE'});
			
			common.writeFileSync(buffer, packagePath);
			console.log("Info: succeed to output index package: " + packagePath);
			return packageName;
		} catch (error) {
			console.log(error);
		}
	}
	
	function generateIndexFiles(trees, indexBaseDir, version) {
		var indexFiles = [];
		
		version = version.replace(/\./g, '_'); // '.' is not allowed for folder in hana env
		var libBaseDir = indexBaseDir + version + "/";
		
		for (var i in trees) {
			var jsContent = generateJsFromJson(trees[i]);
			var indexFile = libBaseDir + trees[i]["!name"] + ".Index.js";
			if (outputIndexFile(jsContent, indexFile)) {
				indexFiles.push(indexFile);
			}
		}
		return indexFiles;
	}
	
	function generateConfigFile(indexPackage, indexFiles, indexBaseDir, indexUri, indexName, indexVersion) {
		var configIndex = {};
		configIndex["!name"] = indexName;
		configIndex["!target"] = indexUri + indexName + '/';
		configIndex["!define"] = [];
		
		var indexLibrary = {};
		indexLibrary["version"] = indexVersion;
		indexLibrary["indexFiles"] = [];
		for (var i in indexFiles) {
			var fileName = indexFiles[i];
			var pos = fileName.lastIndexOf('/');
			if (pos > 0) {
				fileName = fileName.substring(pos + 1);
				pos = fileName.lastIndexOf('.');
				if (pos > 0) {
					fileName = fileName.substring(0, pos);
				}
			}
			indexLibrary["indexFiles"].push(fileName);
		}
		indexLibrary["indexFiles"].sort();
		
		if (indexPackage) {
			indexLibrary["indexPackage"] = indexPackage;
		}
		
		configIndex["!define"].push(indexLibrary);
		var jsContent = generateJsFromJson(configIndex);
		outputIndexFile(jsContent, indexBaseDir + indexName + "Index.js");
	}
	
	function splitIndex(root, names) {
		var trees = [];
		var name;
		for (var i in names) {
			var indexTree = {
				"!name": names[i].name,
				"!define": {}
			};
			trees.push(indexTree);
		}
		for (name in root) {
			if (name.indexOf('.') < 0) {
				var indexTree = {
					"!name": name,
					"!define": {}
				};
				indexTree[name] = name;
				trees.push(indexTree);
			}
		}
		
		for (var i in trees) {
			var tree = trees[i];
			var treeName = tree["!name"];
			for (name in root) {
				if (name == treeName || 
					name.indexOf(treeName + '.') == 0 || 
					name.indexOf(treeName + '_') == 0) {
					tree["!define"][name] = root[name];
					delete root[name];
				}
			}
		}
		return trees;
	}
	
	function outputIndexFile(content, output) {
		try {
			common.writeFileSync(content, output);
			console.log("Info: succeed to output index file: " + output);
			return true;
		} catch (error) {
			console.log("Error: caught unexpected error");
			console.log(error);
			return false;
		}
	}
	
	function generateJsFromJson(json) {
		var content = "define([], function () {";
		content += "\n\treturn ";
		content += JSON.stringify(json, jsonSortReplacer, "\t");
		content += ";";
		content += "\n});";
		return content;
	}
	
	/**
	 * @private
	 */
	function jsonSortReplacer(key, val) {
		if (val instanceof Object) {
			var subKeys = Object.keys(val).sort(indexSortFunc);
			
			var sortedVal;
			if (val instanceof Array) {
				return val.sort();
			} else {
				sortedVal = {};
				for (var i in subKeys) {
					var subKey = subKeys[i];
					sortedVal[subKey] = val[subKey];
				}
			}
			return sortedVal;
		} else {
			return val;
		}
	}
	
	/**
	 * @private
	 */
	function indexSortFunc(s1, s2) {
		s1 = getNormalizeName(s1);
		s2 = getNormalizeName(s2);
		if (s1 < s2) {
			return -1;
		} else if (s1 > s2) {
			return 1;
		} else {
			return 0;
		}
		
		function getNormalizeName(name) {
			if (name.lastIndexOf('_obj') > 0) {
				// make sure the order: 
				// sap.m.Column > sap.m.Column_obj > sap.m.ColumnListItem > sap.m.ColumnListItem_obj
				return name.replace('_obj', '-obj');
			} else {
				// make sure "!name" always the first
				if (name === "!name") {
					name = "!_name";
				}
				return name;
			}
		}
	}
	
	exports.generateIndexPackage = generateIndexPackage;
	exports.generateIndexFiles = generateIndexFiles;
	exports.generateConfigFile = generateConfigFile;
	exports.splitIndex = splitIndex;
	exports.outputIndexFile = outputIndexFile;
	exports.generateJsFromJson = generateJsFromJson;
}(typeof exports === 'undefined' ? (indexFileGenerator = {}) : exports));