define([ "./mockupConverter/MockupConverter",
		 "sap/watt/lib/handlebars/handlebars" ],
		function(oMockupConverter) {
			var CONSTANTS = {
				prefix : "model.elements",
				viewsPath : "view",
				modelPath : "model",
				mockJsonfile : "mockJsonModel.json",
				controller : "sap.ui.controller",
				mvcController : "sap.ui.core.mvc.Controller.extend",
				coreNS : "core",
				mvcNS : "mvc",
				elementTemplate : "<{{type}}{{#./Attributes}} {{name}}=\"{{{value}}}\"{{/./Attributes}}>{{#./elements}}{{> element}}{{/./elements}}</{{type}}>\n\t",
				viewTmpl : "view.xml.tmpl",
				controllerTmpl : "controller.js.tmpl",
				NSprefix : "xmlns:",
				ListHeaderCode : "	<Page id=\"page\" title=\"{i18n>MASTER_TITLE}\">\n<subHeader>\n<Bar id=\"searchBar\">\n<contentMiddle>\n<SearchField id=\"searchField\" showRefreshButton=\"{device>/isNoTouch}\"\nplaceholder=\"{i18n>MASTER_SEARCH_PLACEHOLDER}\" search=\"handleSearch\"\ntooltip=\"{i18n>MASTER_SEARCH_TOOLTIP}\" width=\"100%\">\n</SearchField>\n</contentMiddle>\n</Bar>\n</subHeader>\n<content>",
				ListFooterCode : "</content>\n		<footer>\n<Bar>\n<contentLeft>\n<shellfooter:SettingsButton></shellfooter:SettingsButton>\n</contentLeft>\n</Bar>\n</footer>\n</Page>\n",
				masterControllerCode : "handleSelect: function(oEvent) { \n"
						+ "	var oListItem = oEvent.getParameter(\"listItem\") || oEvent.getSource(); \n"
						+ "	// trigger routing to BindingPath of this ListItem - this will update the data on the detail page\n"
						+ "	sap.ui.core.UIComponent.getRouterFor(this).navTo(\"Detail\",{from: \"master\", contextPath: oListItem.getBindingContext().getPath().substr(1)});\n"
						+ "}\n",
				detailControllerCode : "onBeforeRendering: function() { \n"
						+ "	var view = this.getView();\n"
						+ "	sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(function(oEvent) {\n"
						+ "		// when detail navigation occurs, update the binding context\n"
						+ "		if (oEvent.getParameter(\"name\") === \"Detail\") {\n"
						+ "		var context = new sap.ui.model.Context(view.getModel(), '/' + oEvent.getParameter(\"arguments\").contextPath);\n"
						+ "		view.setBindingContext(context);\n" + "		// Make sure the master is here\n" + "		}\n" + "	}, this);\n" + "}\n"
			};

			var PLACEHOLDERS = {
				componentName : "%COMPONENT_NAME%",
				isAppContainer : "%IS_CONTAINER%",
				beforeTemplate : "%BEFORE_TEMPLATE%",
				afterTemplate : "%AFTER_TEMPLATE%",
				methods : "%METHODS%"
			};

			var NAMESPACES = {
				View : {
					name : "core",
					value : "sap.ui.core"
				},
				TextField : {
					name : "common",
					value : "sap.ui.commons"
				}
			};

			var ELEMENTS = {
				View : function(element) {
					return {
						type : "View",
						name : element.name,
						Attributes : element.Attributes,
						elements : []
					};
				},
				List : function(element) {
					return {
						type : "List",
						Attributes : [ {
							name : "items",
							value : "{/TravelRequests}"
						}, {
							name : "mode",
							value : "{device>/listMode}"
						}, {
							name : "select",
							value : "handleSelect"

						}, {
							name : "growing",
							value : "true"
						}, {
							name : "growingScrollToLoad",
							value : "true"
						} ],
						elements : []
					};
				},
				ListItem : function(element) {
					var listElement = {
						type : "ObjectListItem",
						Attributes : [ {
							name : "type",
							value : "{device>/listItemType}"
						}, {
							name : "id",
							value : "MAIN_LIST_ITEM"
						} ],
						elements : []
					};
					listElement.Attributes = listElement.Attributes.concat(element.Attributes);
					return listElement;
				},
				Members : function(element) {
					return {
						type : "attributes",
						elements : []
					};
				},
				Member : function(element) {
					return {
						type : "ObjectAttribute",
						Attributes : element.Attributes,
						elements : []
					};
				},
				Default : function(element) {
					return {
						type : element.type,
						Attributes : element.Attributes,
						elements : []
					};
				}
			};

			var _onBeforeTemplateGenerate = function(templateZip, model) {
				// get the project name, DO NOT DELETE!
				model.projectName = model.mockupProjectName;

				//update the service information in the generation model
				model.metadata = {};
				model.metadata.datasource = {};
				model.metadata.datasource.url = "/sap/opu/odata/sap/SRA018_TR_TRACKING_DEMO";
				model.metadata.service = {};
				model.metadata.service.name = "SRA018_TR_TRACKING_DEMO";
				model.metadata.entities = [ {
					name : "TravelRequest",
					setName : "TravelRequests",
					properties : []
				} ];

				// parse it to JSON object
				var modelObj = JSON.parse(model.mockupModel);

				var mockupModelObj = {};

				// for dev use only, allowing us to skip parsing the original file
				if (model.fileType == "txt") {
					mockupModelObj = oMockupConverter.getModeljson(modelObj);
				} else {
					mockupModelObj = modelObj;
				}

				buildViewFiles(templateZip, model, mockupModelObj.fioriApp.elements);
			};

			var buildViewFiles = function(templateZip, model, viewsArray) {
				// create views root in model
				model.elements = [];

				// clone view.xml and controller.js templates for each view
				for ( var i = 0; i < viewsArray.length; i++) {

					// initialize each view in the model
					var viewName = viewsArray[i].name;

					model.elements[viewName] = parseViewModel(viewsArray[i], model.metadata.entities[0].properties);
					model.elements[viewName].Attributes = [ {
						"name" : "xmlns",
						"value" : "sap.m"
					}, {
						"name" : CONSTANTS.NSprefix + "shellfooter",
						"value" : "sap.ushell.ui.footerbar"
					}, {
						"name" : CONSTANTS.NSprefix + "l",
						"value" : "sap.ui.layout"
					} ];

					var reqAttributes = {};
					// append namespaces to all the elements in the model recursively, and aggregate them
					setNamespaces(model.elements[viewName], reqAttributes);
					// add the namespace definitions to the view
					for ( var key in reqAttributes) {
						if (reqAttributes.hasOwnProperty(key)) {
							model.elements[viewName].Attributes.push(reqAttributes[key]);
						}
					}

					// create the template files (.xml and .js) for each view, and check if it's an App view ("isContainer")
					//get view tmpl
					var viewTmpl = templateZip.file(CONSTANTS.viewsPath + "/" + CONSTANTS.viewTmpl);
					var newTemplate = viewTmpl.asText().replace(new RegExp(PLACEHOLDERS.componentName, "g"), viewName);
					newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.isAppContainer, "g"),
							viewsArray[i].isContainer == "true" ? CONSTANTS.mvcNS : CONSTANTS.coreNS);
					newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.beforeTemplate, "g"),
							viewName == "Master" ? CONSTANTS.ListHeaderCode : "");
					newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.afterTemplate, "g"),
							viewName == "Master" ? CONSTANTS.ListFooterCode : "");
					templateZip.file(CONSTANTS.viewsPath + "/" + viewName + "." + CONSTANTS.viewTmpl, newTemplate);

					//get controller tmpl
					var controllerTmpl = templateZip.file(CONSTANTS.viewsPath + "/" + CONSTANTS.controllerTmpl);
					newTemplate = controllerTmpl.asText().replace(new RegExp(PLACEHOLDERS.componentName, "g"), viewName);
					newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.isAppContainer, "g"),
							viewsArray[i].isContainer == "true" ? CONSTANTS.controller : CONSTANTS.mvcController);

					//append controller logic
					if (viewName === "Master") {
						//append master controller code
						newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.methods, "g"), CONSTANTS.masterControllerCode);
					} else {
						//append detail controller code
						newTemplate = newTemplate.replace(new RegExp(PLACEHOLDERS.methods, "g"), CONSTANTS.detailControllerCode);
					}

					templateZip.file(CONSTANTS.viewsPath + "/" + viewName + "." + CONSTANTS.controllerTmpl, newTemplate);
				}

				// dispose of the empty templates
				templateZip.remove(CONSTANTS.viewsPath + "/" + CONSTANTS.viewTmpl);
				templateZip.remove(CONSTANTS.viewsPath + "/" + CONSTANTS.controllerTmpl);

				// Add recursive tag to Handlebars
				Handlebars.registerPartial("element", CONSTANTS.elementTemplate);
				//add Mockup json file to project
				templateZip.file(CONSTANTS.modelPath + "/" + CONSTANTS.mockJsonfile, model.mockupModel);
			};

			var setNamespaces = function(element, attributes) {
				// if special namespace applies, define it if needed and adjust the element tag itself
				if (typeof NAMESPACES[element.type] !== "undefined" && NAMESPACES[element.type].name != "") {
					if (typeof attributes[NAMESPACES[element.type].name] === "undefined") {
						attributes[NAMESPACES[element.type].name] = {
							name : CONSTANTS.NSprefix + NAMESPACES[element.type].name,
							value : NAMESPACES[element.type].value
						};
					}

					element.type = NAMESPACES[element.type].name + ":" + element.type;
				}
				// recursive call to the elements children, if any exist
				if (typeof element.elements !== "undefined") {
					for ( var i = 0; i < element.elements.length; ++i) {
						setNamespaces(element.elements[i], attributes);
					}
				}
			};

			var parseViewModel = function(modelElement, metadata) {
				// get the corresponding parse function
				var parser = {};
				if (typeof ELEMENTS[modelElement.type] !== "undefined") {
					parser = ELEMENTS[modelElement.type];
				} else {
					// if no specific information is passed, copy the element as is
					parser = ELEMENTS["Default"];
				}

				// Gather properties for the metadata.xml file
				if (typeof modelElement.Attributes !== "undefined") {
					for ( var i = 0; i < modelElement.Attributes.length; ++i) {
						// apply SAPUI5 binding syntax if needed
						if (modelElement.Attributes[i].toBind === "both") {
							metadata.push({
								name : modelElement.Attributes[i].value
							});
							modelElement.Attributes[i].value = "{" + modelElement.Attributes[i].value + "}";
						} else {
							if (modelElement.Attributes[i].toBind === "ui") {
								modelElement.Attributes[i].value = "{" + modelElement.Attributes[i].value + "}";
							} else {
								if (modelElement.Attributes[i].toBind === "metadata") {
									metadata.push({
										name : modelElement.Attributes[i].value
									});
								}
							}
						}
					}
				}

				// generate the SAPUI5 element model
				var ui5Element = parser(modelElement);
				ui5Element.elements = [];
				if (typeof modelElement.elements !== "undefined") {
					for ( var i = 0; i < modelElement.elements.length; ++i) {
						// recursive call over all the child elements
						ui5Element.elements.push(parseViewModel(modelElement.elements[i], metadata));
					}
				}
				return ui5Element;
			};

			var _onAfterGenerate = function(projectZip, model) {
			};

			var _configWizardSteps = function() {

				return [];
			};

			var _validateOnSelection = function(model) {
				return true;
			};

			return {
				onBeforeTemplateGenerate : _onBeforeTemplateGenerate,
				onAfterGenerate : _onAfterGenerate,
				configWizardSteps : _configWizardSteps,
				validateOnSelection : _validateOnSelection
			};
		});
