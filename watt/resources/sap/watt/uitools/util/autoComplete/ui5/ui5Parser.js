	
	var common = require("./ui5common");
	var util = require("./../base/jsDocParser");
	var debug_assert = require("assert");
	
	var ui5Config = require("./ui5Config");
	debug_assert.ok(ui5Config);
	
	util.initParsingTags(ui5Config.extend_tags);
	
	var isRemote = (ui5Config.root.indexOf("http") >= 0);
	if (isRemote) {
		generateMetadataAsync();
	} else {
		generateMetadataSync();
	}
	
	function generateMetadataAsync() {
		var libs = ui5Config.libraries;
		for (var i in libs) {
			var libraryName = libs[i].name;
			
			var libraryPath = common.getPathFromNamespace(libraryName);
			var dependencyUrl = ui5Config.root + libraryPath + ui5Config.dependencies_file;
			
			common.httpGetAsync(dependencyUrl, responseLibraryDependencies);
		}
	}
	
	function responseLibraryDependencies(url, body) {
		try {
			var libraryName = getLibraryNameFromUrl(url);
			common.writeFileSync(body, common.getLocalDepFile(ui5Config, libraryName));
			var modules = common.getLibraryModules(ui5Config, libraryName, JSON.parse(body));
			
			for (var i in modules) {
				if (modules[i].patch) {
					var content = common.readFileSync(modules[i].jsdoc);
					util.parseLocalJSDoc(modules[i].name, content, modules[i].metadata, appendMissingTag);
				} else {
					util.parseRemoteJSDoc(modules[i].name, modules[i].jsdoc, modules[i].metadata, appendMissingTag);
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
	
	function generateMetadataSync() {
		var libs = ui5Config.libraries;
		for (var i in libs) {
			var libraryName = libs[i].name;
			console.log("Begin to parse ui5 library: " + libraryName);
			
			var libDepFile = ui5Config.root + common.getPathFromNamespace(libraryName) + ui5Config.dependencies_file;
			var dependencies = require(libDepFile);
			common.writeFileSync(JSON.stringify(dependencies, null, '\t'), 
				common.getLocalDepFile(ui5Config, libraryName));
			var modules = common.getLibraryModules(ui5Config, libraryName, dependencies);
			for (var i in modules) {
				try {
					var content = common.readFileSync(modules[i].jsdoc);
					util.parseLocalJSDoc(modules[i].jsdoc, content, modules[i].metadata, appendMissingTag);
				} catch(error) {
					console.log(error);
				}
			}
			
			console.log("\nEnd to parse ui5 library: " + libraryName + "\n");
		}
	}
	
	function getLibraryNameFromUrl(url) {
		var libraryName;
		var libs = ui5Config.libraries;
		for (var i in libs) {
			var libraryPath = common.getPathFromNamespace(libs[i].name);
			if (url.lastIndexOf(libraryPath) > 0)
			{
				libraryName = libs[i].name;
				break;
			}
		}
		debug_assert.ok(libraryName && libraryName.length > 0);
		return libraryName;
	}
	
	function appendMissingTag(source, json, jsons) {
		if (util.getTagByName(json.tags, "name") && (
				util.getTagByName(json.tags, "namespace") || 
				util.getTagByName(json.tags, "class") || 
				util.getTagByName(json.tags, "function") || 
				util.getTagByName(json.tags, "enum") || 
				util.getTagByName(json.tags, "type")
			)) {
			return;
		}
		
		var snippet = util.getNearestSnippet(source);
		if (snippet.length == 0) {
			console.log("Warning: fail to fetch @name tag in the empty source snippet.");
			console.log(JSON.stringify(json, null, '\t'));
			return;
		}
		
		var tag = tryFetchNameTag(snippet, json.tags);
		if (!tag) {
			tag = tryFetchEnumTag(snippet, json);
		}
		if (!tag) {
			console.log("Error: fail to fetch @name or @enum in the source snippet:");
			console.log("\t"+ snippet);
			return;
		}
		
		if (tag.description.indexOf('.') < 0) {
			var parentName = util.getParsedParent(jsons);
			if (parentName) {
				tag.description = parentName + "." + tag.description;
				console.log("Warning: assume to append " + tag.title + ": " + tag.description);
			} else {
				console.log("Error: no parent object for the fetched name: " + tag.description);
				return;
			}
		}
		
		json.tags.push(tag);
	}
	
	function tryFetchNameTag(snippet, tags) {
		// [fuction] sap.m.Panel.prototype.setWidth = function (sWidth) {
		var sepKeys = ['=', 'function'];
		var tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			if (!util.getTagByName(tags, "function") && !util.getTagByName(tags, "constructor")) {
				tags.push({title: "function"});
			}
			return tag;
		}
		
		// [function] getLogger : function(
		sepKeys = [':', 'function'];
		tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			if (!util.getTagByName(tags, "function") && !util.getTagByName(tags, "constructor")) {
				tags.push({title: "function"});
			}
			return tag;
		}
		
		// [function] sap.ui.getCore = jQuery.sap.getter(this.getInterface());
		var sepKeys = ['=', '('];
		var tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			return tag;
		}
		
		// [namespace] jQuery.sap = {}
		var sepKeys = ['=', '{'];
		var tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			return tag;
		}
		
		// [object] (jQuery.sap.log)Level : {
		sepKeys = [':', '{'];
		tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			return tag;
		}
		
		// [class] sap.ui.base.ManagedObject.extend("sap.ui.core.UIArea", {
		sepKeys = [',', '{'];
		tag = util.fetchTagByKeys(snippet, "name", sepKeys);
		if (tag) {
			var name = tag.description;
			
			var pos1 = name.indexOf('"');
			var pos2 = name.indexOf('"', pos1 + 1);
			if (pos2 > pos1 && pos1 >= 0) {
				tag.description = name.substring(pos1+1, pos2);
			}
			
			return tag;
		}
	}
	
	function tryFetchEnumTag(snippet, json) {
		var enumTag = util.getTagByName(json.tags, "enum");
		if (enumTag) {
			return enumTag;
		}
		
		// scenario 1:
		// @type number
		// [type] BACKSPACE : 8,
		
		// scenario 2:
		// [even no type] Solid : "Solid",
		var sepKeys = [':'];
		enumTag = util.fetchTagByKeys(snippet, "enum", sepKeys);
		if (enumTag) {
			var typeName;
			
			var typeTag = util.getTagByName(json.tags, "type");
			if (typeTag) {
				typeName = typeTag.type.name;
			} else {
				if (!util.hasRequiredTag(json.tags)) {
					typeName = "string";
					console.log("Warning: fail to fetch enum type, assume to string.");
				}
			}
			
			if (typeName) {
				enumTag.type = {};
				enumTag.type.type = "NameExpression";
				enumTag.type.name = typeName;
				return enumTag;
			}
		}
	}