(function (exports) {
	var common = require("./../base/common");
	var config = require("./../base/config");
	
	function getPathFromNamespace(namespace) {
		var path = namespace.replace(/\./g,"/");
		if (path.charAt(path.length -1) != '/') {
			path += "/";
		}
		return path;
	}
	
	function getLocalDepFile(ui5Config, libraryName) {
		return config.jsdoc_parser.output + ui5Config.name + "/" + ui5Config.version + "/" + 
			getPathFromNamespace(libraryName) + 
			ui5Config.dependencies_file;
	}
	
	function getLibraryModules(ui5Config, libraryName, dependencies) {
		if (!dependencies) {
			return [];
		}
		
		var ui5Output = config.jsdoc_parser.output + ui5Config.name + '/';
		
		var modules = dependencies.modules;
		var filteredModules = [];
		for (var i in modules) {
			var module = modules[i];
			var moduleName = module.name;
			var pos = moduleName.indexOf(".js");
			if (pos > 0) {
				var name = moduleName.substring(0, pos);
				if (name.lastIndexOf("Render") > 0) {
					continue;
				}
				
				var jsdoc = common.getJsDocFilename(ui5Config.root, moduleName);
				var metadata = common.getJsonFilename(ui5Output, ui5Config.version, moduleName);
				filteredModules.push({name: moduleName, jsdoc: jsdoc, metadata: metadata});
			}
		}

		// patch support
		var libs = ui5Config.libraries;
		for (var i in libs) {
			if (libs[i].name == libraryName && libs[i].patch) {
				var metadata = common.getJsonFilename(ui5Output, ui5Config.version, libs[i].patch);
				filteredModules.push({patch: true, name:libs[i].patch, jsdoc: libs[i].patch, metadata: metadata});
				break;
			}
		}
		
		return filteredModules;
	}
	
	// inherited functions
	exports.readFileSync = common.readFileSync;
	exports.writeFileSync = common.writeFileSync;	
	exports.httpGetAsync = common.httpGetAsync;
	
	// ui5 utility functions
	exports.getPathFromNamespace = getPathFromNamespace;
	exports.getLocalDepFile = getLocalDepFile;
	exports.getLibraryModules = getLibraryModules;
}(typeof exports === 'undefined' ? (ui5Common = {}) : exports));