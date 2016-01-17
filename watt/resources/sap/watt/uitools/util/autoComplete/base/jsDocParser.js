(function (exports) {
	var common = require("./common");
	var config = require("./config");
	var debug_assert = require("assert");
	
	var parserConfig = config.jsdoc_parser;
	debug_assert.ok(parserConfig);
	var _jsDocStart = "/**", _jsDocEnd = "*/";
	
	function initParsingTags(extendTags) {
		if (extendTags.mandatory_tags) {
			parserConfig.mandatory_tags = parserConfig.mandatory_tags.concat(extendTags.mandatory_tags);
		}
		if (extendTags.option_tags) {
			parserConfig.option_tags = parserConfig.option_tags.concat(extendTags.option_tags);
		}
		if (extendTags.ignore_tags) {
			parserConfig.ignore_tags = parserConfig.ignore_tags.concat(extendTags.ignore_tags);
		}
		if (extendTags.container_tags) {
			parserConfig.container_tags = parserConfig.container_tags.concat(extendTags.container_tags);
		}
	}
	
	function parseLocalJSDoc(sourceName, sourceContent, metadataFile, callback) {
		console.log("\nBegin to parse: " + sourceName);
		
		try {
			var source = sourceContent;
			var start = source.indexOf(_jsDocStart);
			var end = source.indexOf(_jsDocEnd, start);
			
			var jsons = [];
			var options = {unwrap: true, sloppy: true, recoverable: true};
			var doctrine = common.doctrine;
			
			while (start >= 0 && end >= 0) {
				end += _jsDocEnd.length;
				
				var comment = source.substring(start, end);
				var json = doctrine.parse(comment, options);
				source = source.substring(end);
				
				if (json && json.tags && hasUsefulTag(json.tags)) {
					if (!logForErrorResult(comment, json)) {
						//if (!getTagByName(json.tags, "name")) {
							callback(source, json, jsons);
						//}
						jsons.push(json);
					}
				}
				
				start = source.indexOf(_jsDocStart);
				end = source.indexOf(_jsDocEnd, start);
			}
			
			common.writeFileSync(JSON.stringify(jsons, null, '\t'), metadataFile);
			console.log("Succeed to output metadata to: " + metadataFile);
		} catch (error) {
			console.log(error);
		}
		
		console.log("End to parse: " + sourceName);
	}
	
	function parseRemoteJSDoc(sourceName, jsDocFile, metadataFile, callback) {
		common.httpGetAsync(jsDocFile, outputMetadata);
		
		function outputMetadata(url, content) {
			parseLocalJSDoc(sourceName, content, metadataFile, callback);
		}
	}
	
	function logForErrorResult(comment, json) {
		if (!hasRequiredTag(json.tags)) {
			return false;
		}
		
		var hasError = false;
		var tags = json.tags;
		for (var i in tags) {
			var tag = tags[i];
			if (tag.errors) {
				hasError = true;
				break;
			}
		}
		
		if (hasError) {
			console.log(">Fail to parse jsDoc:\n" + comment);
			console.log(">>Parser output is:\n" + JSON.stringify(json, null, '\t'));
		}
		return hasError;
	}

	function hasUsefulTag(tags) {
		var ignoreTags = parserConfig.ignore_tags;
		for (var i in ignoreTags) {
			if (getTagByName(tags, ignoreTags[i])) {
				return false;
			}
		}
		
		var mandatoryTags = parserConfig.mandatory_tags;
		for (var i in mandatoryTags) {
			if (!getTagByName(tags, mandatoryTags[i])) {
				return false;
			}
		}
		
		return true;
	}
	
	function hasRequiredTag(tags) {
		var hasOptionTag = false;
		var optionTags = parserConfig.option_tags;
		for (var i in optionTags) {
			if (getTagByName(tags, optionTags[i])) {
				hasOptionTag = true;
				break;
			}
		}
		return hasOptionTag;
	}
	
	function fetchTagByKeys(snippet, title, keys) {
		if (keys.length == 1) {
			var pos = snippet.indexOf(keys[0]);
			if (pos >= 0) {
				var parts = snippet.split(keys[0]);
				if (parts.length > 0) {
					var nameParts = parts[0].trim().split(' ');
					if (nameParts.length == 1) {
						return {title: title, description: nameParts[0]};
					}
				}
			}
		} else if (keys.length == 2) {
			var pos1 = snippet.indexOf(keys[0]);
			var pos2 = snippet.indexOf(keys[1]);
			if (pos2 > pos1 & pos1 > 0) {
				var parts = snippet.split(keys[0]);
				if (parts.length > 0) {
					var nameParts = parts[0].trim().split(' ');
					var bodyPart = parts[1].trim();
					var pos = bodyPart.indexOf(';');
					if (pos > 0) {
						bodyPart = bodyPart.substring(0, pos);
					}
					if (nameParts.length == 1 && bodyPart.indexOf(keys[1]) >= 0) {
						return {title: title, description: nameParts[0]};
					}
				}
			}
		}
	}
	
	function getTagByName(tags, tagName) {
		for (var i in tags) {
			var tag = tags[i];
			if (tag.title == tagName) {
				return tag;
			}
		}
	}
	
	function getNearestSnippet(source) {
		var snippet = source;
		var pos = source.indexOf(_jsDocStart);
		if (pos >= 0) {
			snippet = source.substring(0, pos);
		}
		return snippet.trim();
	}
	
	function getParsedParent(jsons) {
		var length = jsons.length;
		for (var i=length-1; i>=0; i--) {
			var json = jsons[i];
			for (var j in json.tags) {
				var tag = json.tags[j];
				if (isContainerTag(tag)) {
					var nameTag = getTagByName(json.tags, "name");
					if (nameTag) {
						return nameTag.description;
					}
				}
			}
		}
	}
	
	function isContainerTag(tag) {
		var containerTags = parserConfig.container_tags;
		for (var i in containerTags) {
			if (containerTags[i] == tag.title) {
				return true;
			}
		}
		return false;
	}
	
	exports.initParsingTags = initParsingTags;
	exports.parseLocalJSDoc = parseLocalJSDoc;
	exports.parseRemoteJSDoc = parseRemoteJSDoc;
	exports.logForErrorResult = logForErrorResult;
	exports.hasUsefulTag = hasUsefulTag;
	exports.hasRequiredTag = hasRequiredTag;
	exports.fetchTagByKeys = fetchTagByKeys;
	exports.getTagByName = getTagByName;
	exports.getNearestSnippet = getNearestSnippet;
	exports.getParsedParent = getParsedParent;
}(typeof exports === 'undefined' ? (jsDocParser = {}) : exports));