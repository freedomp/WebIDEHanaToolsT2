	
	var common = require("./ui5Common");
	var util = require("./../base/indexFileGenerator");
	var config = require("./../base/config");
	var ui5Config = require("./ui5Config");
	var debug_assert = require("assert");
	
	var generatorConfig = config.index_generator;
	debug_assert.ok(config && ui5Config && generatorConfig);
	
	// mapping of the primitive type in ui5 jsdoc to the types in Orion's esprima types
	var primitive_mapping = {
		"any": "Object",
		"array": "Array",
		"boolean": "Boolean",
		"float": "Number",
		"int": "Number",
		"number": "Number",
		"date": "Date",
		"object": "Object",
		"string": "String",
		"void": "undefined"
	};
	
	var indexRoot = {};
	var libs = ui5Config.libraries;
	for (var i in libs) {
		buildLibraryIndex(libs[i].name, indexRoot);
	}
	var indexTrees = util.splitIndex(indexRoot, libs);
	
	var ui5Output = generatorConfig.output;
	var ui5IndexFile = ui5Output.indexFile + ui5Config.name + '/';
	var indexPackage;
	if (generatorConfig.compressed) {
		indexPackage = util.generateIndexPackage(indexTrees, ui5IndexFile, ui5Config.version);
	}
	var indexFiles = util.generateIndexFiles(indexTrees, ui5IndexFile, ui5Config.version);
	util.generateConfigFile(indexPackage, indexFiles, ui5Output.indexFile, ui5Output.indexUri, ui5Config.name, ui5Config.version);
	
	function buildLibraryIndex(name, root) {
		var libDepFile = common.getLocalDepFile(ui5Config, name);
		var dependencies = require(libDepFile);
		var modules = common.getLibraryModules(ui5Config, name, dependencies);
		for (var i in modules) {
			try {
				var json = require(modules[i].metadata);
				for (var j in json) {
					var desc = json[j].description;
					var tags = json[j].tags;
					
					try {
						if (hasPublicTag(tags, "namespace")) {
							emitNamespace(desc, tags, root);
						} else if (hasPublicTag(tags, "class")) {
							emitClass(desc, tags, root);
						} else if (hasPublicTag(tags, "function")) {
							emitFunction(desc, tags, root);
						} else if (hasPublicTag(tags, "enum")) {
							emitEnum(desc, tags, root);
						} else {
							emitUnknown(desc, tags, root);
						}
					} catch(error) {
						console.log("Error: caught unexpected error");
						console.log(error);
						console.log(JSON.stringify(tags, null, '\t'));
					}
				}
			} catch(error) {
				console.log(error);
			}
		}
		
		validateIndex(root);
		return root;
	}
	
	function emitNamespace(desc, tags, root) {
		var name = getTagValue(tags, "name");
		if (isEmptyName(name, "namespace", tags)) {
			return;
		}
		
		if (!emitNameNode(name, root)) {
			return;
		}
		
		debug_assert.ok(root[name]);
		checkNodeReenter(name, "namespace", root);
		// e.g. namespace 'jQuery.sap.log' extends class 'jQuery.sap.log.Logger'
		if (hasPublicTag(tags, "extends")) {
			emitClassExtends(name, tags, root);
		}
		setNodeCategory(root[name], "namespace");
		setNodeDescription(root[name], desc, tags, "namespace");
	}
		
	function emitClass(desc, tags, root) {
		var name = getTagValue(tags, "name");
		if (isEmptyName(name, "class", tags) && isEmptyName(name, "interface", tags)) {
			return;
		}
		
		if (!emitNameNode(name, root)) {
			return;
		}
		
		debug_assert.ok(root[name]);
		if (hasPublicTag(tags, "static") || hasPublicTag(tags, "interface")) {
			checkNodeReenter(name, "static class", root);
			setNodeCategory(root[name], "static class");
		} else {
			checkNodeReenter(name, "class", root);
			setNodeCategory(root[name], "class");
			
			emitClassConstructor(name, tags, root);
			emitClassExtends(name, tags, root);
		}
		setNodeDescription(root[name], desc, tags, "class");
	}
	
	function emitClassConstructor(name, tags, root) {
		if (!hasPublicTag(tags, "constructor")) {
			console.log("Warning: missing @constructor tag from non-static class: " + name);
		}
		
		var objName = getObjName(name);
		//debug_assert.ok(!root[objName]); may re-entered here
		root[objName] = {
			"prototype": name,
			"!type": parseFunctionSignature(tags)
		};
		
		var title = getTitleName(name);
		var parent = getParentName(name);
		debug_assert.ok(root[parent]);
		root[parent][title] = objName;
	}
	
	function emitClassExtends(name, tags, root) {
		var baseClass;
		if (hasPublicTag(tags, "extends")) {
			baseClass = getTagValue(tags, "extends");
		} else {
			console.log("Warning: missing @extends tag from non-static class: " + name);

			if (name.indexOf('sap.') == 0 && name.indexOf('sap.ui.base.Object') < 0) {
				baseClass = "sap.ui.base.Object";
			} else {
				baseClass = "Object";
			}
		}
		debug_assert.ok(root[name]);
		root[name]["!proto"] = baseClass;
	}

	function emitFunction(desc, tags, root) {
		var name = getTagValue(tags, "name");
		if (isEmptyName(name, "function", tags)) {
			return;
		}
		
		var parent = getParentName(name);
		if (!parent) {
			var methodOf = getTagValue(tags, "methodOf");
			if (methodOf) {
				parent = methodOf.replace(/.prototype|#/g, '');
			} else {
				console.log("Error: no parent is parsed from function name: " + name);
				console.log(JSON.stringify(tags, null, '\t'));
				return true;
			}
		}
		
		if (!emitNameNode(parent, root)) {
			return;
		}
		
		var parentNode;
		if (hasPublicTag(tags, "static")) {
			if (root[getObjName(parent)]) {
				parentNode = root[getObjName(parent)];
			} else {
				parentNode = root[parent];
			}
		} else {
			parentNode = root[parent];
		}
		debug_assert.ok(parentNode);
		
		var funcName = getTitleName(name);
		var funcType = parseFunctionSignature(tags);
		if (parentNode[funcName]) {
			// if the previous emit has more rich info, then do not replace
			if (!desc) {
				desc = parentNode[funcName]["!description"];
			}
			var getReturnMarker = '->';
			if (funcName.indexOf('get') === 0 && 
				funcType.indexOf(getReturnMarker) < 0 && 
				parentNode[funcName]["!type"].indexOf(getReturnMarker) > 0) {
				funcType = parentNode[funcName]["!type"];
			}
			var setParamMarker = '()';
			if (funcName.indexOf('set') === 0 && 
				funcType.indexOf(setParamMarker) > 0 && 
				parentNode[funcName]["!type"].indexOf(setParamMarker) < 0) {
				funcType = parentNode[funcName]["!type"];	
			}
		}
		
		parentNode[funcName] = {
			"!category": "function",
			"!description": desc,
			"!type": funcType
		};
	}
	
	function emitEnum(desc, tags, root) {
		var name = getTagValue(tags, "name");
		if (!name) {
			name = getTagValue(tags, "enum");
			if (isEmptyName(name, "enum", tags)) {
				return;
			}
		}
		
		var parent = getParentName(name);
		if (!parent) {
			console.log("Error: no parent parsed from enum name: " + name);
			console.log(JSON.stringify(tags, null, '\t'));
			return;
		}
		
		if (!emitNameNode(parent, root)) {
			return;
		}
		
		var parentNode = root[parent];
		debug_assert.ok(parentNode);
		
		var enumName = getTitleName(name);
		parentNode[enumName] = {
			"!category": "enum",
			"!description": desc,
			"!type": parseEnumType(tags)
		};
	}
	
	function emitUnknown(desc, tags, root) {
		if (hasPublicTag(tags, "constructor")) {
			emitClass(desc, tags, root);
		} else if (hasPublicTag(tags, "interface")) {
			emitClass(desc, tags, root);
		} else if (hasPublicTag(tags, "param") || hasPublicTag(tags, "return") || 
			hasPublicTag(tags, "returns")) {
			emitFunction(desc, tags, root);
		} else if (hasPublicTag(tags, "type") && !hasPublicTag(tags, "static")) {
			// include both tag '@type' & '@static', e.g. 'jQuery.sap.globalEval'
			emitEnum(desc, tags, root);
		}
	}

	function emitNameNode(name, root) {
		if (root[name]) {
			return true;
		}
		
		if (isIgnoredName(name)) {
			return false;
		}
		
		var nodeName = "";
		var names = name.split('.');
		for (var i in names) {
			if (i > 0) {
				nodeName += '.';
			}
			nodeName += names[i];
			
			if (!root.hasOwnProperty(nodeName)) {
				root[nodeName] = {};
			}
			
			var parent = getParentName(nodeName);
			if (parent) {
				var parentNode = root[parent];
				var title = getTitleName(nodeName);
				if (!parentNode.hasOwnProperty(title)) {
					parentNode[title] = nodeName;
				}
			}
		}
		return true;
	}
	
	function isIgnoredName(name) {
		for (var i in ui5Config.ignore_names) {
			if (name.indexOf(ui5Config.ignore_names[i]) === 0) {
				console.log("Debug: ignore name: " + name);
				return true;
			}
		}
		if (name == "this") {
			return true;
		}
		return false;
	}
	
	function isEmptyName(name, category, tags) {
		if (!name) {
			if (!hasPublicTag(tags, "deprecated")) {
				console.log("Error: the " + category + " name is empty");
				console.log(JSON.stringify(tags, null, '\t'));
			}
			return true;
		} else {
			// ignore the invalid tags, and workaround them in patch file
			for (var i in ui5Config.invalid_names) {
				var invalidName = ui5Config.invalid_names[i];
				if (invalidName.name == name && invalidName.category == category) {
					console.log("Debug: ignore invalid " + invalidName.category + ": " + tag.description);
					return true;
				}
			}
			return false;
		}
	}
	
	function checkNodeReenter(name, category, root) {
		if (root[name] && root[name]["!category"] == category) {
			console.log("Warning: the name '" + name + "' is defined in more then one place");
		}
	}
	
	function validateNamespace(name, root) {
		return validateClass(name, root);
	}
	
	function validateClass(name, root) {
		var parent = getParentName(name);
		if (parent) {
			var parentNode = root[parent];
			debug_assert.ok(parentNode);
			var category = getNodeCategory(parentNode);
			if (category !== "static class" && category !== "namespace") {
				console.log("Error: unexpected parent category '" + 
					category + "' of " + name + 
					", expecting category 'namespace' or 'static class'");
				return false;
			}
		} // else is allowed
		return true;
	}
	
	function validateFunction(name, root) {
		var parent = getParentName(name);
		if (parent) {
			var parentNode = root[parent];
			if (parentNode) {
				var category = getNodeCategory(parentNode);
				if (category !== "namespace" && 
					category !== "class" && category !== "static class") {
					console.log("Error: unexpected function parent category '" + 
						category + "' of " + name);
					return false;
				}
				return true;
			} else {
				debug_assert.ok(false);
				return false;
			}
		} else {
			debug_assert.ok(false);
			return false;
		}
	}
	
	function validateEnum(name, root) {
		var parent = getParentName(name);
		if (parent) {
			var parentNode = root[paent];
			if (parentNode) {
				var category = getNodeCategory(parentNode);
				if (category !== "static class") {
					if (!category || category === "namespace") {
						setNodeCategory(parentNode, "static class");
						console.log("Warning: recover enum parent category from '" + 
							category + "' to 'static class' for " + name);
					} else {
						console.log("Error: unexpected enum parent category '" + 
							category + "' of " + name);
						return false;
					}
				}
				return true;
			} else {
				debug_assert.ok(false);
				return false;
			}
		} else {
			debug_assert.ok(false);
			return false;
		}
	}
	
	function parseFunctionSignature(tags) {
		var funcType = "fn(";
		var params = parseParamTag(tags);
		for (var k in params) {
			var param = params[k];
			if (param.name.indexOf('.') >= 0) {
				continue;
			}
			if (k > 0) {
				funcType += ", ";
			}
			funcType += param.name;
			funcType += ": ";
			funcType += param.type;
		}
		funcType += ")";
		var ret = parseReturnTag(tags);
		if (ret) {
			funcType += " -> ";
			funcType += ret;
		}
		
		return funcType;
	}
	
	function parseParamTag(tags) {
		var params = [];
		
		var optionalAppeared = false;
		for (var i in tags) {
			var tag = tags[i];
			if (tag.title == "param") {
				var paramName = tag.name? tag.name:tag.type.name;
				var tagType = tag.name? tag.type:{"type": "NameExpression","name": "object"};
				
				if (optionalAppeared || tagType.type == "OptionalType") {
					paramName += "?";
					if (tagType.expression) {
						tagType = tagType.expression;
					}
					optionalAppeared = true;
				}
				
				var paramType = "";
				if (tagType) {
					if (tagType.type == "NameExpression") {
						paramType = transformTypeName(tagType.name);
					} else if (tagType.type == "UnionType") {
						for (var j in tagType.elements) {
							if (j > 0) {
								paramType += " | ";
							}
							paramType += transformTypeName(tagType.elements[j].name);
						}
					} else if (tagType.type == "FunctionType") {
						paramType = "fn(";
						for (var j in tagType.params) {
							if (j > 0) {
								paramType += ", ";
							}
							var param = tagType.params[j];
							paramType += param.name;
							paramType += ": ";
							if (param.expression) {
								paramType += transformTypeName(param.expression.name);
							} else {
								paramType += "undefined";
							}
						}
						paramType += ")";
						
						if (tagType.result) {
							paramType += " -> ";
							paramType += transformTypeName(tagType.result.name);
						}
					} else {
						paramType = "unknown";
					}
				}
				
				var param = {name: paramName, type: paramType};
				params.push(param);
			}
		}
		return params;
	}
	
	function parseReturnTag(tags) {
		for (var i in tags) {
			var tag = tags[i];
			if ((tag.title == "return" || tag.title == "returns") && tag.type) {
				if (tag.type.type == "NameExpression") {
					return transformTypeName(tag.type.name);
				} else if (tag.type.type == "FunctionType") {
					return transformTypeName(tag.type.result);
				} else if (tag.type.type == "UnionType") {
					var tagType = tag.type;
					var retType = "";
					for (var j in tagType.elements) {
						if (j > 0) {
							retType += " | ";
						}
						retType += transformTypeName(tagType.elements[j].name);
					}
					return retType;
				} else {
					break;
				}
			}
		}
	}
	
	function parseEnumType(tags) {
		for (var i in tags) {
			var tag = tags[i];
			if (tag.title == "enum" || tag.title == "type") {
				var enumType;
				if (tag.type && tag.type.name) {
					return transformTypeName(tag.type.name);
				} else {
					console.log("Warning: failed to get enum type from below tags, assume to 'string'");
					console.log(JSON.stringify(tags, null, '\t'));

					return transformTypeName('string');
				}
			}
		}
	}
	
	function transformTypeName(name) {
		if (name) {
			var isArray = false;
			var pos = name.lastIndexOf("[]");
			if (pos > 0) {
				isArray = true;
				name = name.substring(0, pos);
			}
			
			// compatible with Orion esprima engine: transform primitive type
			if (primitive_mapping[name]) {
				name = primitive_mapping[name];
			}
			// compatible with Orion esprima engine: transform array type from: type[] to: [type]
			if (isArray) {
				name = "[" + name + "]";
			}
		}
		return name;
	}
	
	function hasPublicTag(tags, tagName) {
		var isPublic = false;
		var hasTag = false;
		
		for (var i in tags) {
			var tag = tags[i];
			if (tag.title == "public") {
				isPublic = true;
			} else if (tag.title == tagName) {
				hasTag = true;
			}
		}
		return isPublic && hasTag;
	}
	
	function getTagValue(tags, tagName) {
		for (var i in tags) {
			var tag = tags[i];
			if (tag.title == tagName) {
				if (tag.description) {
					return tag.description;
				} else if (tag.type && tag.type.name) {
					return tag.type.name;// e.g. @extends
				}
			}
		}
	}
	
	function getObjName(name) {
		return name+'_obj';
	}
	
	function isObjName(name) {
		if (name && name.length > '_obj'.length) {
			return (name.lastIndexOf('_obj') == name.length - '_obj'.length);
		}
	}
	
	function getProtoName(name) {
		if (isObjName(name)) {
			var pos = name.length - '_obj'.length;
			return name.substring(0, pos);
		}
	}
		
	// '.' e.g. sap.m.Page.extend, sap.m.touch.find or sap.ui.getCore
	// '.prototype.' e.g. sap.m.Page.prototype.scrollTo
	// '#' e.g. sap.m.Page#setNavButtonText
	// '.prototype#' e.g. sap.ui.base.Object.prototype#getMetadata
	function getParentName(name) {
		var seperators = ['#', '.'];
		for (var i in seperators) {
			var seperator = seperators[i];
			var pos = name.lastIndexOf(seperator);
			if (pos > 0) {
				return name.substring(0, pos).replace(/.prototype/g, '');
			}
		}
	}
	function getTitleName(name) {
		var seperators = ['#', '.'];
		for (var i in seperators) {
			var seperator = seperators[i];
			var pos = name.lastIndexOf(seperator);
			if (pos > 0) {
				return name.substring(pos + 1);
			}
		}
		return name;
	}
	
	function getNodeCategory(node) {
		return node["!category"];
	}
	
	function setNodeCategory(node, value) {
		node["!category"] = value;
	}
	
	function setNodeDescription(node, value, tags, category) {
		var tagDesc = getTagValue(tags, category);
		if (tagDesc) {
			value = tagDesc;
		}
		node["!description"] = value;
	}
	
	function validateIndex(root) {
		for (var name in root) {
			if (isObjName(name)) {
				var protoName = getProtoName(name);
				if (root[name]["prototype"] != protoName) {
					console.log("Error: mismatched prototype '" + 
						root[name]["prototype"] + "' to '" + protoName + "'");
				} else {
					if (!root[protoName]) {
						console.log("Error: missing prototype '" + 
							protoName + "' from '" + name + "'");
					} else {
						if (root[protoName]["!category"] != "class") {
							console.log("Error: expecting category 'class' for " + 
								protoName + ", not '" + root[protoName]["!category"] + "'");
						}
					}
				}
			} else {
				if (root[name]["!category"] == "namespace") {
					validateNamespace(name, root);
				} else if (root[name]["!category"] == "class") {
					var objName = getObjName(name);
					if (!root[objName]) {
						console.log("Error: missing matched name '" + 
							objName + "' for class '" + name + "'");
					}
					validateClass(name, root);
				} else if (root[name]["!category"] == "static class") {
					validateClass(name, root);
				} else if (root[name]["!category"] == "function") {
					validateFunction(name, root);
				} else if (root[name]["!category"] == "enum") {
					validateEnum(name, root);
				} else {
					console.log("Warning: missing category from '" + name + "', assume to namespace");
					root[name]["!category"] = "namespace";
				}
			}
		}
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
	