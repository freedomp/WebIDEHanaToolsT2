define([ /*'./UI5XMLMetadata'*/ ], function(/*mUI5XMLMetadata*/) {

	var XMLMetadataContentAssist = function(metadata) {
		this.mUI5XMLMetadata = metadata;
	};
	XMLMetadataContentAssist.prototype = {
        
        addMetadata : function(metadata) {
            var that = this;
            if (metadata.enums) {
                jQuery.each(metadata.enums, function(key, value) {
                    that.mUI5XMLMetadata.enums[key] = value; 
               });  
            }
           
           if (metadata.metadatas) {
               jQuery.each(metadata.metadatas, function(key, value) {
                    that.mUI5XMLMetadata.metadatas[key] = value; 
               });
           }
        },
        
        resetMetadata : function() {
            this.mUI5XMLMetadata.enums = {};
            this.mUI5XMLMetadata.metadatas = {};
        },
        
		candidateElements : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextParent = env.parent;

			var library = this.getLibrary(contextNamespace);
			if (!library) {
				return [];
			}

			if (!contextParent ) {  //|| this.IsRootElement(contextParent)
				return this.getElements(hintText, contextNamespace, library.controls, "Control");
			}

			var metadata = this.getMetadata(contextNamespace, contextParent);
			var ret = null;
			var controls = null;
			var elements = null;
			if (!metadata) {
				// return controls & elements, the parent maybe a wrong element or a aggregation
				controls = this.getElements(hintText, contextNamespace, library.controls, "Control");
				elements = this.getElements(hintText, contextNamespace, library.elements, "Element");
				ret = controls.concat(elements);
			} else {
				// return aggregation names, controls, and elements for a control object parent
				var aggregations = this.getAttributes(hintText, metadata, "aggregations");
				controls = this.getElements(hintText, contextNamespace, library.controls, "Control");
				elements = this.getElements(hintText, contextNamespace, library.elements, "Element");
				ret = aggregations.concat(controls).concat(elements);
			}
			return ret;
		},

		candidateAttributes : function(env) {
			var properties = this.candidateAttributeProperties(env.prefix, env.ns, env.element);
			var events = this.candidateAttributeEvents(env.prefix, env.ns, env.element);
			return properties.concat(events);
		},

		candidateProperties : function(env) {
			var properties = this.candidateAttributeProperties(env.prefix, env.ns, env.element);
			return properties;
		},
		candidateEvents : function(env) {
			var events = this.candidateAttributeEvents(env.prefix, env.ns, env.element);
			return events;
		},

		candidateAttributeProperties : function(hintText, contextNamespace, contextControl) {
			var metadata = this.getMetadata(contextNamespace, contextControl);
			return this.getAttributes(hintText, metadata, "properties");
		},

		candidateAttributeEvents : function(hintText, contextNamespace, contextControl) {
			var metadata = this.getMetadata(contextNamespace, contextControl);
			return this.getAttributes(hintText, metadata, "events");
		},

		candidateAttributeValues : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextControl = env.element;
			var contextAttribute = env.attr;
			var result = [];

			var metadata = this.getMetadata(contextNamespace, contextControl);
			var prop = null;
			var p = this.getAttributes(contextAttribute, metadata, "properties");
			for (var i = 0; i < p.length; i++) {
				var item = p[i];
				if (this.compareStringIgnoreCase(item.name, contextAttribute)) {
					prop = item;
					break;
				}
			}
			var len = hintText.length;
			if (prop) {
				var type = prop.dataType;//metadata.properties[prop.name].type;
				if (type === "boolean") {
					if (len > 0) {
						if (this.compareStringIgnoreCase("false".substr(0, len), hintText)) {
							result.push({
								name : "false",
								type : "boolean",
								"fullName" : prop.fullName
							});
						}

						if (this.compareStringIgnoreCase("true".substr(0, len), hintText)) {
							result.push({
								name : "true",
								type : "boolean",
								"fullName" : prop.fullName
							});
						}
					} else {
						result.push({
							name : "false",
							type : "boolean",
							"fullName" : prop.fullName
						});
						result.push({
							name : "true",
							type : "boolean",
							"fullName" : prop.fullName
						});
					}
				} else if (this.mUI5XMLMetadata.enums[type]) {
					var enumObject = this.mUI5XMLMetadata.enums[type];
					if (enumObject) {
						var val = null;
						if (len > 0) {
							for ( val in enumObject) {
								if (Object.prototype.hasOwnProperty.call(enumObject, val)) {
									if (this.compareStringIgnoreCase(val.substr(0, len), hintText)) {
										result.push({
											name : val.toString(),
											type : "enum",
											"description" : enumObject[val].description,
											"helpDescription" : enumObject[val].helpDescription,
											"fullName" : type + "#" + val
										});
									}
								}
							}
						} else {
							for ( val in enumObject) {
								if (Object.prototype.hasOwnProperty.call(enumObject, val)) {
									result.push({
										name : val.toString(),
										type : "enum",
										"description" : enumObject[val].description,
										"helpDescription" : enumObject[val].helpDescription,
										"fullName" : type + "#" + val
									});
								}
							}
						}
					}
				}
			}

			return result;
		},

		/*
			private functions
		*/
		getAttributes : function(hintText, metadata, funcName) {
			var result = [];

			if (metadata) {
				var len = hintText.length;
				var ms = metadata[funcName];
				var type = null;
				switch (funcName) {
				case "properties":
					type = "Property";
					break;
				case "aggregations":
					type = "Aggregation";
					break;
				case "associations":
					type = "Association";
					break;
				case "events":
					type = "Event";
					break;
				}
				var name = "";
				var m = null;
				if (len > 0) {
					for ( m in ms) {
						if (Object.prototype.hasOwnProperty.call(ms, m)) {
							name = m;
							if (this.compareStringIgnoreCase(name.substr(0, len), hintText)) {
								result.push({
									"name" : name,
									"type" : type,
									"dataType" : ms[m].type,
									"description" : ms[m].description,
									"helpDescription" : ms[m].helpDescription,
									"fullName" : ms[m].fullName
								});
							}
						}
					}
				} else {
					for ( m in ms) {
						if (Object.prototype.hasOwnProperty.call(ms, m)) {
							name = m;
							result.push({
								"name" : name,
								"type" : type,
								"dataType" : ms[m].type,
								"description" : ms[m].description,
								"helpDescription" : ms[m].helpDescription,
								"fullName" : ms[m].fullName
							});
						}
					}
				}

				if (metadata.extend) {
					var baseMetadata = this.getMetadata("", metadata.extend);
					var baseResult = this.getAttributes(hintText, baseMetadata, funcName);
					for (var i = 0; i < baseResult.length; i++) {
						var isExisted = false;
						for (var j = 0; j < result.length; j++) {
							if (baseResult[i].name === result[j].name) {
								isExisted = true;
								break;
							}
						}
						if (!isExisted) {
							result.push(baseResult[i]);
						}
					}
				}
			}

			return result;
		},

		getElements : function(hintText, contextNamespace, objects, type) {
			var result = [];

			var pos = contextNamespace.length + 1;
			var len = hintText.length;
			var control = null;
			var name = "";
			var desc = "";
			var helpDescription = "";
			if (len > 0 && objects) {
				for (var i = 0; i < objects.length; i++) {
					control = objects[i];
					if (this.compareStringIgnoreCase(control.substr(0, contextNamespace.length), contextNamespace)) {
						name = control.substr(pos);
						if (this.compareStringIgnoreCase(name.substr(0, len), hintText)) {
							desc = "";
							helpDescription = "";
							if (this.mUI5XMLMetadata.metadatas[control]) {
								desc = this.mUI5XMLMetadata.metadatas[control].description;
								helpDescription = this.mUI5XMLMetadata.metadatas[control].helpDescription;
							}
							result.push({
								"name" : name,
								"type" : type,
								"description" : desc,
								"helpDescription" : helpDescription,
								"fullName" : control
							});
						}
					}
				}
			} else {
			    if(objects){
    				for (var i = 0; i < objects.length; i++) {
    					control = objects[i];
    					if (this.compareStringIgnoreCase(control.substr(0, contextNamespace.length), contextNamespace) &&
    					    control[contextNamespace.length] === ".") {
    						name = control.substr(pos);
    						if (name.length > 0) {
    							desc = "";
    							helpDescription = "";
    							if (this.mUI5XMLMetadata.metadatas[control]) {
    								desc = this.mUI5XMLMetadata.metadatas[control].description;
    								helpDescription = this.mUI5XMLMetadata.metadatas[control].helpDescription;
    							}
    							result.push({
    								"name" : name,
    								"type" : type,
    								"description" : desc,
    								"helpDescription" : helpDescription,
    								"fullName" : control
    							});
    						}
    					}
    				}
			    }
			}

			return result;
		},

		IsRootElement : function(objectName) {
			if (objectName === "core:View") {
				return true;
			}

			var pos = objectName.indexOf(':');
			if (pos > 0 && objectName.substr(pos + 1) === "View") {
				return true;
			}

			return false;
		},

		getLibrary : function(namespace) {
			var library = null;
			var ns = namespace;
			var metadata = this.mUI5XMLMetadata.metadatas;
			while (ns.indexOf(".") > 0) {
				if (metadata[ns] && metadata[ns].filetype === "library") {
					library = metadata[ns];
					break;
				}
				ns = ns.slice(0, ns.lastIndexOf("."));
			}
			if (!library) {
				console.log("fail to get library [" + namespace + "]");
			}
			return library;
		},

		getObject : function(namespace, objectName) {

			if (objectName.indexOf('.') < 0) {
				objectName = namespace + "." + objectName;
			}
			return this.mUI5XMLMetadata.metadatas[objectName];
		},

		getMetadata : function(namespace, objectName) {
			var metadata = null;
			var fnClass = this.getObject(namespace, objectName);
			if (fnClass) {
				metadata = fnClass;
			} else {
				if (namespace === "sap.ui.core" && objectName === "View") {
					fnClass = this.getObject(namespace + ".mvc", objectName);
					metadata = fnClass;
				}
			}

			return metadata;
		},

		isEnumType : function(type) {
			var ret = false;
			if (this.mUI5XMLMetadata.enums[type]) {
				ret = true;
			} else {
				ret = false;
			}
			return ret;
		},

		compareStringIgnoreCase : function(str1, str2) {
			return str1.toLowerCase() === str2.toLowerCase();
		}
	};

	return XMLMetadataContentAssist;
});