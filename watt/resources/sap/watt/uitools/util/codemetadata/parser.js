var fileTypes = { 
	LIBRARY:"library", 
	CLASS:"class"
};

doctrine = require("../../../lib/doctrine/doctrine");
//doctrine = require("./lib/doctrine/doctrine");
sap = {};
function defineNameSpace(objName) {
	var oObject = this;
	var aNames = (objName || "").split(".");
	var l = aNames.length;
	for (var i=0; oObject && i<l; i++) {
		if (!oObject[aNames[i]]) {
			oObject[aNames[i]] = {};
		}
		oObject = oObject[aNames[i]];
	}
}
function getObjFromStr(str) {
    /*eslint-disable no-eval*/
	return eval(str);  
    /*eslint-enable no-eval*/
}

exports.fileTypes = fileTypes;

exports.parseRequired = function(fileObj) {
	var retRequired = [];
	if (fileObj.errors.length == 0) {
		var data = fileObj.data;
		switch (fileObj.type) {
			case fileTypes.LIBRARY:
				var startstr = "sap.ui.getCore().initLibrary(";
				var endstr = ");";
				var pos = data.indexOf(startstr);
				var pos1 = data.indexOf(endstr, pos);
				var lib = getObjFromStr("(" + data.slice(pos+startstr.length, pos1) + ")");
				console.log("  => lib content: " + lib);
				retRequired = lib.controls.concat(lib.elements);//,lib.interfaces);
				break;
			case fileTypes.CLASS:
				var regTags = new RegExp("(@extends\\s+)([^\\s+]*)", "g");
				while ((extend=regTags.exec(data))!=null) {
					retRequired.push(extend[2]);
				}	
				break;
			default:
		}
	}
	return retRequired;
};
function parseLibMeta(fileObj) {
	var lib = {};
	var data = fileObj.data;
	var startstr = "sap.ui.getCore().initLibrary(";
	var endstr = ");";
	var pos = data.indexOf(startstr);
	var pos1 = data.indexOf(endstr, pos);
	lib = getObjFromStr("(" + data.slice(pos+startstr.length, pos1) + ")");
	lib.filetype = fileTypes.LIBRARY;
	return lib;
}
function parseLibEnum(fileObj) {
	var enums = {};
	defineNameSpace(fileObj.name);
	var libtypes = fileObj.metadatas.types;
	var data = fileObj.data;
	var regTags=/\/\*\*([\u0001-\uFFFF]*?)\*\//g;
	var i = 0;
	for (i=0; i<libtypes.length; i++) {
		var item = libtypes[i];
		if (data.indexOf("// Provides enumeration "+item)>0) {		
			var startstr = item + " = {";
			var endstr = "};";
			var pos = data.indexOf(startstr);
			var pos1 = data.indexOf(endstr, pos);
			var enumsrc = data.slice(pos+startstr.length-1, pos1+1);
			var enumobj = getObjFromStr("(" + enumsrc + ")");
			var descriptions = [];
			//get desc
			while ((comments=regTags.exec(enumsrc))!=null) {
				var options = {unwrap: true, sloppy: true, recoverable: true};
				var json = doctrine.parse(comments[0], options);
				descriptions.push(json.description);
			}	
			var num = 0;
			var option = null;
			for (option in enumobj) {
				if (Object.prototype.hasOwnProperty.call(enumobj, option)) {
					if (!descriptions[num]) {
						fileObj.warnings.push("WARNING: The option " + option + " of " + item + " has no description");
					}
					var v = enumobj[option];			
					enumobj[option] = {"description": descriptions[num], "value": v};
					num++;
				}
			}
			enums[item] = enumobj;
			defineNameSpace(item);
		} else {
			if (item.indexOf(".")>0 && item.indexOf(fileObj.name) != 0) {
				fileObj.infos.push("INFO: The type " + item + " is not defined in library " + fileObj.name);
			} else {
				fileObj.infos.push("INFO: The type " + item + " is not enumeration");
			}
		}
	}
	return enums;
}
function parseClassProperties(commentJson, defineObj, isJSDOCMeta) {
	var porpertyList = {};
	var isMerge = true;
	if (isJSDOCMeta) {
		var metacomments = commentJson.description;

		//parse properties from JSDOC		
		var regMetas=/(<li>Properties\s+)([\u0001-\uFFFF]*?)(<\/ul>)/g;
		if ((props=regMetas.exec(metacomments))!=null) {
			var propsmeta = props[2];
			regMetas=/(<li>\{\@link\s+)([\u0001-\uFFFF]*?)\s+([\u0001-\uFFFF]*?)\}\s+:\s+([\u0001-\uFFFF]*?)(<\/li>)/g;
			while ((prop=regMetas.exec(propsmeta))!=null) {
				var propname = prop[3];
				var propmethod = prop[2];
				var proptype = prop[4];
				var propdefaultvalue = null;
				var propgroup = null;
				if (prop[4].indexOf("default:") >0) {
					var regPropType = /([\u0001-\uFFFF]*?)\s+\(default:\s+([\u0001-\uFFFF]*?)\)/g;
					if ((ptype=regPropType.exec(prop[4]))!=null) {
						proptype=ptype[1];
						propdefaultvalue=ptype[2];
					}
				}
				if (isMerge && defineObj && defineObj.metadata) {
					porpertyList[propname] = {
						method:propmethod,
						group:propgroup||defineObj.metadata.properties[propname].group,
						type:proptype, 
						defaultValue:propdefaultvalue||defineObj.metadata.properties[propname].defaultValue
					};
				} else {
					porpertyList[propname] = {method:propmethod, type:proptype, defaultValue:propdefaultvalue};
				}
			}
		}
	} else if (defineObj && defineObj.metadata){
		var prop = null;
		for (prop in defineObj.metadata.properties) {
			if (Object.prototype.hasOwnProperty.call(defineObj.metadata.properties, prop)) {
				porpertyList[prop] = {
					group: defineObj.metadata.properties[prop].group,
					type: defineObj.metadata.properties[prop].type,
					defaultValue: defineObj.metadata.properties[prop].defaultValue
				};
			}
		}
	}
	return porpertyList;
}
function parseClassAggregations(commentJson, defineObj, isJSDOCMeta) {
	var aggregationList = {};
	var isMerge = true;
	if (isJSDOCMeta) {
		var metacomments = commentJson.description;

		//parse aggregations from JSDOC		
		var regMetas=/(<li>Aggregations\s+)([\u0001-\uFFFF]*?)(<\/ul>)/g;
		if ((props=regMetas.exec(metacomments))!=null) {
			var propsmeta = props[2];
			regMetas=/(<li>\{\@link\s+)([\u0001-\uFFFF]*?)\s+([\u0001-\uFFFF]*?)\}([\u0001-\uFFFF]*?):\s+([\u0001-\uFFFF]*?)(<\/li>)/g;
			while ((prop=regMetas.exec(propsmeta))!=null) {
				var propname = prop[3];
				var propmethod = prop[2];
				var proptype = prop[5];
				var propmultiple = null;
				if (isMerge && defineObj && defineObj.metadata) {
					aggregationList[propname] = {
						method:propmethod,
						multiple:propmultiple||defineObj.metadata.aggregations[propname].multiple,
						type:proptype 
					};
				} else {
					aggregationList[propname] = {method:propmethod, type:proptype, multiple:propmultiple};
				}
			}
		}
	} else if (defineObj && defineObj.metadata){
		var prop = null;
		for (prop in defineObj.metadata.aggregations) {
			if (Object.prototype.hasOwnProperty.call(defineObj.metadata.aggregations, prop)) {
				aggregationList[prop] = {
					multiple: defineObj.metadata.aggregations[prop].multiple,
					type: defineObj.metadata.aggregations[prop].type
				};
			}
		}
	}
	return aggregationList;
}
function parseClassAssociations(commentJson, defineObj, isJSDOCMeta) {
	var associationList = {};
	var isMerge = true;
	if (isJSDOCMeta) {
		var metacomments = commentJson.description;

		//parse associations from JSDOC		
		var regMetas=/(<li>Associations\s+)([\u0001-\uFFFF]*?)(<\/ul>)/g;
		if ((props=regMetas.exec(metacomments))!=null) {
			var propsmeta = props[2];
			regMetas=/(<li>\{\@link\s+)([\u0001-\uFFFF]*?)\s+([\u0001-\uFFFF]*?)\}\s+:\s+([\u0001-\uFFFF]*?)(<\/li>)/g;
			while ((prop=regMetas.exec(propsmeta))!=null) {
				var propname = prop[3];
				var propmethod = prop[2];
				var proptype = prop[4];
				var propmultiple = null;
				if (isMerge && defineObj && defineObj.metadata) {
					associationList[propname] = {
						method:propmethod,
						multiple:propmultiple||defineObj.metadata.associations[propname].multiple,
						type:proptype
					};
				} else {
					associationList[propname] = {method:propmethod, type:proptype, multiple:propmultiple};
				}
			}
		}
	} else if (defineObj && defineObj.metadata){
		var prop = null;
		for (prop in defineObj.metadata.associations) {
			if (Object.prototype.hasOwnProperty.call(defineObj.metadata.associations, prop)) {
				associationList[prop] = {
					multiple: defineObj.metadata.associations[prop].multiple,
					type: defineObj.metadata.associations[prop].type
				};
			}
		}
	}
	return associationList;
}
function parseClassEvents(commentJson, defineObj, isJSDOCMeta) {
	var eventList = {};
	var isMerge = true;
	if (isJSDOCMeta) {
		var metacomments = commentJson.description;

		//parse events from JSDOC		
		var regMetas=/(<li>Events\s+)([\u0001-\uFFFF]*?)(<\/ul>)/g;
		if ((props=regMetas.exec(metacomments))!=null) {
			var propsmeta = props[2];
			regMetas=/(<li>\{\@link\s+)([\u0001-\uFFFF]*?)\s+([\u0001-\uFFFF]*?)\}\s+:\s+([\u0001-\uFFFF]*?)(<\/li>)/g;
			while ((prop=regMetas.exec(propsmeta))!=null) {
				var propname = prop[3];
				var propmethod = prop[2];
				var proptype = prop[4];
				if (isMerge && defineObj && defineObj.metadata) {
					eventList[propname] = {
						method:propmethod,
						type:proptype
					};
				} else {
					eventList[propname] = {method:propmethod, type:proptype};
				}
			}
		}
	} else if (defineObj && defineObj.metadata){
		var prop = null;
		for (prop in defineObj.metadata.events) {
			if (Object.prototype.hasOwnProperty.call(defineObj.metadata.events, prop)) {
				eventList[prop] = {
				};
			}
		}
	}
	return eventList;
}
function parseClassTooltip(classMeta, fileObj) {
	var ret = true;
	var data = fileObj.data;
	
	var item = null;
	var desc = null;
	var pos = -1, pos1 = -1, pos2 = -1;
	var metasrc = "";
	var options = null;
	var json = null;
	var name = null;
	for (name in classMeta.properties) {
		if (Object.prototype.hasOwnProperty.call(classMeta.properties, name)) {
			item = classMeta.properties[name];
			desc = null;
			pos = data.indexOf("* @name " + fileObj.name + item.method);
			if (item.method && pos>0) {
				pos1 = data.slice(0,pos).lastIndexOf("/**");
				pos2 = data.indexOf("*/", pos);
				metasrc = data.slice(pos1, pos2);
				options = {unwrap: true, sloppy: true, recoverable: true};
				json = doctrine.parse(metasrc, options);
				desc = json.description;
			}
			if (desc) {
				if (desc.indexOf("Getter") == 0) {
					desc = desc.slice(desc.indexOf("\n")+1);
				}
				classMeta.properties[name].description = desc;
			} else {
				fileObj.warnings.push("WARNING: The property " + name + " of " + fileObj.name + " has no description");
			}
			classMeta.properties[name].fullName = fileObj.name + "#" + name;
		}
	}
	for (name in classMeta.aggregations) {
		if (Object.prototype.hasOwnProperty.call(classMeta.aggregations, name)) {
			item = classMeta.aggregations[name];
			desc = null;
			pos = data.indexOf("* @name " + fileObj.name + item.method);
			if (item.method && pos>0) {
				pos1 = data.slice(0,pos).lastIndexOf("/**");
				pos2 = data.indexOf("*/", pos);
				metasrc = data.slice(pos1, pos2);
				options = {unwrap: true, sloppy: true, recoverable: true};
				json = doctrine.parse(metasrc, options);
				desc = json.description;
			}
			if (desc) {
				if (desc.indexOf("Getter") == 0) {
					desc = desc.slice(desc.indexOf("\n")+1);
				}
				classMeta.aggregations[name].description = desc;
			} else {
				fileObj.warnings.push("WARNING: The aggregations " + name + " of " + fileObj.name + " has no description");
			}
			classMeta.aggregations[name].fullName = fileObj.name + "#" + name;
		}
	}
	for (name in classMeta.associations) {
		if (Object.prototype.hasOwnProperty.call(classMeta.associations, name)) {
			item = classMeta.associations[name];
			desc = null;
			pos = data.indexOf("* @name " + fileObj.name + item.method);
			if (item.method && pos>0) {
				pos1 = data.slice(0,pos).lastIndexOf("/**");
				pos2 = data.indexOf("*/", pos);
				metasrc = data.slice(pos1, pos2);
				options = {unwrap: true, sloppy: true, recoverable: true};
				json = doctrine.parse(metasrc, options);
				desc = json.description;
			}
			if (desc) {
				if (desc.indexOf("Getter") == 0) {
					desc = desc.slice(desc.indexOf("\n")+1);
				}
				classMeta.associations[name].description = desc;
			} else {
				fileObj.warnings.push("WARNING: The association " + name + " of " + fileObj.name + " has no description");
			}
			classMeta.associations[name].fullName = fileObj.name + "#" + name;
		}
	}
	for (name in classMeta.events) {
		if (Object.prototype.hasOwnProperty.call(classMeta.events, name)) {
			item = classMeta.events[name];
			desc = null;
			pos = data.indexOf("* @name " + fileObj.name + "#" + name);
			if (pos>0) {
				pos1 = data.slice(0,pos).lastIndexOf("/**");
				pos2 = data.indexOf("*/", pos);
				metasrc = data.slice(pos1, pos2);
				options = {unwrap: true, sloppy: true, recoverable: true};
				json = doctrine.parse(metasrc, options);
				desc = json.description;
			}
			if (desc) {
				classMeta.events[name].description = desc;
			} else {
				fileObj.warnings.push("WARNING: The event " + name + " of " + fileObj.name + " has no description");
			}
			classMeta.events[name].fullName = fileObj.name + "#" + name;
		}
	}
	
	return ret;
}

function parseClass(fileObj) {
	var classMeta = {};
	var data = fileObj.data;
	var item = fileObj.name;
	var pos = data.indexOf("* @name " + fileObj.name);
	if (pos>0) {
		//get comments of the class
		var pos1 = data.slice(0,pos).lastIndexOf("/**");
		var pos2 = data.indexOf("*/", pos);
		var metalistsrc = data.slice(pos1, pos2);
		var options = {unwrap: true, sloppy: true, recoverable: true};
		var json = doctrine.parse(metalistsrc, options);
		var isJSDOCMeta = true;
		
		//*get extend and desc of the class
		var i = 0;
		for (i=0; i<json.tags.length; i++) {
			var tag = json.tags[i];
			switch (tag.title) {
				case "extends":
					classMeta.extend = tag.type.name;
					break;
				case "class":
					classMeta.description = tag.description;
					break;
				default:
			}
		}
		
		//get defined metadata list
		if (metalistsrc.indexOf("* The supported settings are:")<0) {
			isJSDOCMeta = false;
			fileObj.warnings.push("WARNING: The class " + item + " has no summary JSDOC Comments");
		}
		var definepos = data.indexOf("(\"" + item + "\",");
		if (classMeta.extend) {
			definepos = data.indexOf(classMeta.extend + ".extend(\"" + item + "\"");
			if (definepos < 0 && classMeta.extend.lastIndexOf(".") > 0) {
				definepos = data.indexOf(classMeta.extend.slice(classMeta.extend.lastIndexOf(".")+1) + ".extend(\"" + item + "\"");
			}
		}
		var dobj = null;
		if (definepos > 0) {
			var dpos = data.indexOf("{", definepos);
			var dpos1 = data.indexOf("});", definepos);			
			var	dpos2 = data.indexOf("}, /* Metadata constructor */", definepos);
			if (dpos1 < 0 || (dpos2 > 0 && dpos1 > dpos2)) {
				dpos1 = dpos2;
			}
			var dsrc = data.slice(dpos, dpos1+1);
			if (dsrc && dsrc != "") {
				dobj = getObjFromStr("(" + dsrc + ")");
			} 
			if (dobj == null || dobj.metadata == null) {
				fileObj.errors.push("ERROR: The class " + item + " has not define the metadata");
			}

		} else {
			fileObj.errors.push("ERROR: The class " + item + " has no defininition");
		}
		//
		var retProps = parseClassProperties(json, dobj, isJSDOCMeta);
		classMeta.properties = retProps;
		var retAggregations = parseClassAggregations(json, dobj, isJSDOCMeta);
		classMeta.aggregations = retAggregations;
		var retAssociations = parseClassAssociations(json, dobj, isJSDOCMeta);
		classMeta.associations = retAssociations;
		var retEvents = parseClassEvents(json, dobj, isJSDOCMeta);
		classMeta.events = retEvents;
		var ret = parseClassTooltip(classMeta, fileObj);
	} else {
		fileObj.errors.push("ERROR: The class " + item + " has no description");
	}
	classMeta.filetype = fileTypes.CLASS;
	return classMeta;
}
exports.parseData = function(fileObj) {
  	//console.log("start parse file content");
	var retdata = {};
	if (fileObj.errors.length == 0) {
		fileObj.enums = {};
		fileObj.metadatas = {};
		switch (fileObj.type) {
			case fileTypes.LIBRARY:
				var retlib = parseLibMeta(fileObj);
				fileObj.metadatas = retlib;
				var retenums = parseLibEnum(fileObj);
				fileObj.enums = retenums;
				break;
			case fileTypes.CLASS:
				var retclass = parseClass(fileObj);
				fileObj.metadatas = retclass;
				break;
			default:
		}
	}
	return retdata;
};