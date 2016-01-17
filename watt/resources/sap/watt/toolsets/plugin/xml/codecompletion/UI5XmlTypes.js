define(function() {

	var UI5XmlTypes = function() {

	};
	UI5XmlTypes.prototype = {
		ui5Types : {
			"sap.m.ButtonType" : "enum",
			"sap.ui.core.TextDirection" : "enum",
			"sap.ui.core.TextAlign" : "enum",
			"sap.m.DialogType" : "enum",
			"sap.m.FlexAlignItems" : "enum",
			"sap.m.FlexAlignSelf" : "enum",
			"sap.m.FlexDirection" : "enum",
			"sap.m.FlexJustifyContent" : "enum",
			"sap.m.FlexRendertype" : "enum",
			"sap.m.InputType" : "enum",
			"sap.m.LabelDesign" : "enum",
			"sap.m.PageBackgroundDesign" : "enum",
			"sap.m.SwitchType" : "enum",
			"sap.m.DateTimeInputType" : "enum",
			"sap.ui.core.ValueState" : "enum",
			"sap.ui.core.Wrapping" : "enum",
			"sap.apb.TransitionType" : "enum",
			"sap.apb.makit.ChartType" : "enum",
			"sap.apb.makit.LegendPosition" : "enum",
			"sap.apb.makit.SortOrder" : "enum"
		},

		candidateElements : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextParent = env.parent;

			var library = this.getLibrary(contextNamespace);
			if (!library) {
				return [];
			}

			if (!contextParent || this.IsRootElement(contextParent)) {
				// return all controls if the parent is root element
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
				var aggregations = this.getAttributes(hintText, metadata, "getAllAggregations");
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
			return this.getAttributes(hintText, metadata, "getAllProperties");
		},

		candidateAttributeEvents : function(hintText, contextNamespace, contextControl) {
			var metadata = this.getMetadata(contextNamespace, contextControl);
			return this.getAttributes(hintText, metadata, "getAllEvents");
		},

		candidateAttributeValues : function(env) {
			var hintText = env.prefix;
			var contextNamespace = env.ns;
			var contextControl = env.element;
			var contextAttribute = env.attr;
			var result = [];

			var metadata = this.getMetadata(contextNamespace, contextControl);
			var prop = metadata.getAllProperties()[contextAttribute];
			var len = hintText.length;
			if (prop) {
				var type = prop.type;
				if (type == "boolean") {
					if (len > 0) {
						if (this.compareStringIgnoreCase("false".substr(0, len), hintText)) {
							result.push({
								name : "false",
								type : "boolean"
							});
						}

						if (this.compareStringIgnoreCase("true".substr(0, len), hintText)) {
							result.push({
								name : "true",
								type : "boolean"
							});
						}
					} else {
						result.push({
							name : "false",
							type : "boolean"
						});
						result.push({
							name : "true",
							type : "boolean"
						});
					}
				} else if (this.ui5Types[type] == "enum") {
					var enumObject = this.getObject(contextNamespace, type);
					if (enumObject) {
						var val = null;
						if (len > 0) {
							for ( val in enumObject) {
								if (Object.prototype.hasOwnProperty.call(enumObject, val)) {
									if (this.compareStringIgnoreCase(val.substr(0, len), hintText)) {
										result.push({
											name : val.toString(),
											type : "enum"
										});
									}
								}
							}
						} else {
							for ( val in enumObject) {
								if (Object.prototype.hasOwnProperty.call(enumObject, val)) {
									result.push({
										name : val.toString(),
										type : "enum"
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
				var ms = metadata[funcName]();

				var m = null;
				if (len > 0) {
					for ( m in ms) {
						if (Object.prototype.hasOwnProperty.call(ms, m)) {
							var name = ms[m].name;
							if (this.compareStringIgnoreCase(name.substr(0, len), hintText)) {
								result.push(ms[m]);
							}
						}
					}
				} else {
					for ( m in ms) {
						if (Object.prototype.hasOwnProperty.call(ms, m)) {
							result.push(ms[m]);
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
			if (len > 0) {
				for (var i = 0; i < objects.length; i++) {
					control = objects[i];
					if (this.compareStringIgnoreCase(control.substr(0, contextNamespace.length), contextNamespace)) {
						name = control.substr(pos);
						if (this.compareStringIgnoreCase(name.substr(0, len), hintText)) {
							result.push({
								"name" : name,
								"type" : type
							});
						}
					}
				}
			} else {
				for (var i = 0; i < objects.length; i++) {
					control = objects[i];
					if (this.compareStringIgnoreCase(control.substr(0, contextNamespace.length), contextNamespace)) {
						name = control.substr(pos);
						if (name.length > 0) {
							result.push({
								"name" : name,
								"type" : type
							});
						}
					}
				}
			}

			return result;
		},

		IsRootElement : function(objectName) {
			if (objectName == "core:View") {
				return true;
			}

			var pos = objectName.indexOf(':');
			if (pos > 0 && objectName.substr(pos + 1) == "View") {
				return true;
			}

			return false;
		},

		getLibrary : function(namespace) {
			var library = null;
			var ns = namespace;
			while (ns.indexOf(".") > 0) {
				library = sap.ui.getCore().getLoadedLibraries()[ns];
				if (library) {
					break;
				}
				ns = ns.slice(0, ns.lastIndexOf("."));
			}
			if (!library) {
				try {
					library = sap.ui.getCore().loadLibrary(namespace);
					console.log("load library [" + namespace + "] here...");
				} catch (e) {
					console.log("load library [" + namespace + "] error:" + e.message);
				}
			}
			return library;
		},

		getObject : function(namespace, objectName) {
			this.getLibrary(namespace);

			if (objectName.indexOf('.') < 0) {
				objectName = namespace + "." + objectName;
			}
			return jQuery.sap.getObject(objectName);
		},

		getMetadata : function(namespace, objectName) {
			var metadata = null;
			var fnClass = this.getObject(namespace, objectName);
			if (fnClass) {
				metadata = fnClass.getMetadata();
			} else {
				if (namespace == "sap.ui.core" && objectName == "View") {
					fnClass = this.getObject(namespace + ".mvc", objectName);
					metadata = fnClass.getMetadata();
				}
			}

			return metadata;
		},

		compareStringIgnoreCase : function(str1, str2) {
			return str1.toLowerCase() === str2.toLowerCase();
		}
	};

	return UI5XmlTypes;
});
