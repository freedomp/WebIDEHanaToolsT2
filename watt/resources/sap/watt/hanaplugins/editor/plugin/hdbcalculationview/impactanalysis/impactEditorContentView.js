/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../control/DiagramContainer",

        "../diagram/galilei"
    ], function(ResourceLoader) {

	jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.impactEditorContentView");
	var oImpactAnalyzer,
		oIAService,
		oModel,
		oRootObject;
	var impactEditor = sap.ui.core.Control.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.impactEditorContentView", {

		_firstRow: null,
		metadata: {

			aggregations: {
				_sqlLayout: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				_classicalLayout: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				_validities: {
					type: "sap.ui.core.Control",
					multiple: false
				},
				"content": {

	                singularName: "content",

	                multiple: false

	            },
				 defaultAggregation: "content"
			},
			properties: {
				context: {
					type: "any"
				},
				document: {
					type: "any"
				},
				impactPath: {
					type: "any"
				},
				doImpact :{
					type: "any"
				},
				doLineage :{
					type: "any"
				},
				fileExtension : {
					type : "any"
				},
				selentity :{
					type : "any"
				},
				"hidden": {

	                type: "boolean",

	                defaultValue: false

	            }
			}
		},
		 /*setHidden: function(hidden) {
             this._hidden = hidden;
             this.setProperty("hidden", hidden, true);
          }, */
		renderer: {
			render: function(oRm, oControl) {
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("_classicalLayout"));
				oRm.write("</div>");
			}
		},
		 setHidden: function(hidden) {

		        this.setProperty("hidden", hidden, true);

		        var domId = this.getId();

		        var editorElement = jQuery.sap.domById(domId);

		        if (editorElement) {

		            editorElement.style.display = hidden ? "none" : ""; 

		        }

		    },
		    exit: function() {

		        this.destroyAggregation("content", true);

		    },
		init: function() {
			this.addStyleClass("impactEditor");
			//this.defineIAServiceProvider(this);
			
			

			this.impactPath = " ";
			//var impactPath = this.impactPath;
			var editorContext = this.context;

			// Define the IA object adapter
			//this.definedIAObjectAdapter();
			//this.createcontroller();
			//this.loadDiagramDefinition();
			this.createImpactEditor(this);
			// Defines IA Service provider

		}

	});

	impactEditor.prototype.loadDiagramDefinition = function() {
		var oDiagramDefinition = {
			contents: {
				"Sap.Galilei.ImpactAnalysis.Diagram": {
					classDefinition: "sap.galilei.model.Package",
					displayName: "Impact Analysis Diagram",
					namespaceName: "sap.calcView.impactAnalysis.ui",
					classifiers: {
						/**
						 * @class
						 * @name Diagram
						 * The Impact Analysis Diagram
						 */
						"Diagram": {
							displayName: "Diagram",
							parent: "sap.galilei.ui.diagram.Diagram",
							properties: {
								orientation: {
									dataType: sap.galilei.model.dataTypes.gString,
									defaultValue: sap.galilei.ui.symbol.Orientation.horizontal
								},
								showImpact: {
									dataType: sap.galilei.model.dataTypes.gBool,
									defaultValue: true
								},
								showLineage: {
									dataType: sap.galilei.model.dataTypes.gBool,
									defaultValue: false
								}
							}
						},

						/**
						 * @class
						 * @name NodeSymbol
						 * The Impact Analysis node symbol
						 */
						"NodeSymbol": {
							displayName: "Node Symbol",
							parent: "sap.galilei.ui.diagram.Symbol",
							properties: {
								"NodeSymbol.isAdjustToContent": {
									name: "isAdjustToContent",
									defaultValue: false
								},
								"NodeSymbol.isKeepSize": {
									name: "isKeepSize",
									defaultValue: true
								},
								"NodeSymbol.isKeepPosition": {
									name: "isKeepPosition",
									defaultValue: true
								},
								"NodeSymbol.showImpact": {
									name: "showImpact",
									get: function() {
										return this.diagram.showImpact && this.object && (this.object.isRoot || this.object.isImpact) && this.object.hasImpact;
									}
								},
								"NodeSymbol.showLineage": {
									name: "showLineage",
									get: function() {
										return this.diagram.showLineage && this.object && (this.object.isRoot || this.object.isLineage) && this.object.hasLineage;
									}
								}
							},
							statics: {
								objectClass: {
									value: "sap.galilei.impactAnalysis.Node"
								},
								layoutTemplate: {
									mainShape: [
										{
											shape: "RoundedRectangle",
											domClass: "node",
											padding: 0,
											r: "{object/isRoot:radius}",
											stroke: "{object/isRoot:stroke}",
											strokeWidth: "{object/isRoot:strokeWidth}",
											fill: "{object/isRoot:fill}",
											width: 120,
											height: "{object/isRoot:height}"
                                        },
										{
											shape: "Panel",
											isFixedDocking: true,
											shapes: [
												{
													shape: "Image",
													useReference: true,
													width: 10,
													height: 10,
													href: "{object/isImpactExpanded:expanderIcon}",
													isVisible: "{showImpact}",
													dockPosition: "{diagram/orientation:impactExpanderPosition}",
													marginRight: "{diagram/orientation:impactExpanderMarginRight}",
													marginBottom: "{diagram/orientation:impactExpanderMarginBottom}",
													fill: "{object/isImpactExpanded:expanderFill}",
													events: {
														pointerdown: function(oEvent, oSymbol, oExtension) {
															var oImpactAnalyzer = oExtension.impactAnalyzer;
															oEvent.preventDefault();
															oEvent.stopPropagation();
															oImpactAnalyzer.onToggleImpactExpander(oSymbol);
														}
													}
                                                },
												{
													shape: "Image",
													useReference: true,
													width: 10,
													height: 10,
													href: "{object/isLineageExpanded:expanderIcon}",
													isVisible: "{showLineage}",
													dockPosition: "{diagram/orientation:lineageExpanderPosition}",
													marginLeft: "{diagram/orientation:lineageExpanderMarginLeft}",
													marginTop: "{diagram/orientation:lineageExpanderMarginTop}",
													fill: "{object/isLineageExpanded:expanderFill}",
													events: {
														pointerdown: function(oEvent, oSymbol, oExtension) {
															var oImpactAnalyzer = oExtension.impactAnalyzer;
															oEvent.preventDefault();
															oEvent.stopPropagation();
															oImpactAnalyzer.onToggleLineageExpander(oSymbol);
														}
													}
                                                }
                                            ]
                                        }
                                    ],
									contentShape: {
										shape: "Stack",
										orientation: "horizontal",
										horizontalAlignment: "width",
										verticalAlignment: "height",
										padding: 2,
										innerPadding: 0,
										shapes: [
											{
												shape: "Image",
												href: "{object/icon}",
												isVisible: "{object/icon:hasIcon}",
												width: 16,
												height: 16,
												verticalAlignment: "middle"
											},
											{
												shape: "Text",
												domClass: "nodeName",
												text: "{object/displayName}",
												font: "{object/isRoot:textFont}",
												fill: "black",
												horizontalAlignment: "{object/isRoot:textHorzAlignment}",
												verticalAlignment: "middle",
												isWordWrap: "{object/isRoot:wordWrap}",
												isEllipsis: true
                                            }
                                        ]
									}
								},
								formatters: {
									radius: function(vValue, oObject, oSymbol) {
										return vValue ? 8 : 4;
									},
									impactExpanderPosition: {
										horizontal: "right",
										vertical: "bottom"
									},
									impactExpanderMarginRight: {
										horizontal: -10,
										vertical: 0
									},
									impactExpanderMarginBottom: {
										horizontal: 0,
										vertical: -10
									},
									expanderIcon: function(vValue, oObject, oSymbol) {
										return vValue ? "#ImpactAnalysis.RoundExpanderExpanded" : "#ImpactAnalysis.RoundExpanderCollapsed";
									},
									lineageExpanderPosition: {
										horizontal: "left",
										vertical: "top"
									},
									lineageExpanderMarginLeft: {
										horizontal: -10,
										vertical: 0
									},
									lineageExpanderMarginTop: {
										horizontal: 0,
										vertical: -10
									},
									//                                    expanderFill: function (vValue, oObject, oSymbol) {
									//                                        return vValue ? "white" : "#0099EB";
									//                                    },
									stroke: function(vValue, oObject, oSymbol) {
										return vValue ? sap.galilei.ui.common.style.Color.green : "#428EB0";
										//return vValue ? "#92c1d6" : "#428EB0";
									},
									fill: function(vValue, oObject, oSymbol) {
										return vValue ? sap.galilei.ui.common.style.Color.getBrighterColor(sap.galilei.ui.common.style.Color.green, 0.8) : "white";
										//return vValue ? "#92c1d6" : "white";
									},
									strokeWidth: function(vValue, oObject, oSymbol) {
										return vValue ? 3 : 1;
									},
									height: function(vValue, oObject, oSymbol) {
										return vValue ? 38 : 16;
									},
									textHorzAlignment: function(vValue, oObject, oSymbol) {
										//return vValue ? "width" : "left";
										return "width";
									},
									textFont: function(vValue, oObject, oSymbol) {
										return vValue ? "bold 16px Calibri" : "bold 12px Calibri";
									},
									wordWrap: function(vValue, oObject, oSymbol) {
										return vValue ? true : false;
									},
									hasIcon: function(vValue, oObject, oSymbol) {
										return vValue ? true : false;
									}
								}
							}
						},
						/**
						 * @class
						 * @name NodeLinkSymbol
						 * The impact analysis link symbol
						 */
						"NodeLinkSymbol": {
							displayName: "Node Link Symbol",
							parent: "sap.galilei.ui.diagram.LinkSymbol",
							properties: {
								"NodeLinkSymbol.isKeepPosition": {
									name: "isKeepPosition",
									defaultValue: true
								},
								"NodeLinkSymbol.lineStyle": {
									name: "lineStyle",
									get: function() {
										//                                        var aLinks;
										//
										//                                        if (this.targetSymbol) {
										//                                            aLinks = this.targetSymbol.getLinkSymbols(false, true);
										//                                        }
										//                                        if (aLinks && aLinks.length <= 1) {
										//                                            return this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LineStyle.vertDiagonalBezier : sap.galilei.ui.common.LineStyle.horzDiagonalBezier;
										//                                        } else {
										//                                            return sap.galilei.ui.common.LineStyle.Rounded;
										//                                        }
										return this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LineStyle
											.vertDiagonalBezier : sap.galilei.ui.common.LineStyle.horzDiagonalBezier;
									}
								},
								supportedSourceDirections: {
									get: function() {
										return [this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LinkDirection
											.north : sap.galilei.ui.common.LinkDirection.east];
									}
								},
								supportedTargetDirections: {
									get: function() {
										return [this.diagram && this.diagram.orientation === sap.galilei.ui.symbol.Orientation.vertical ? sap.galilei.ui.common.LinkDirection
											.south : sap.galilei.ui.common.LinkDirection.west];
									}
								}
							},
							statics: {
								layoutTemplate: {
									stroke: "#428EB0",
									strokeWidth: 1,
									lineStyle: "{lineStyle}"
								}
							}
						}
					}
				}
			}
		};
		sap.galilei.model.metamodel("Sap.Hana.Ide.Impact.Ui", oDiagramDefinition);
		// Load all metamodels defined
		sap.galilei.model.loadMetamodels();
	};

	impactEditor.prototype.definedIAObjectAdapter = function() {
		namespace("sap.hana.impactAnalysis");
		sap.hana.impactAnalysis.ObjectAdapter = sap.galilei.core.defineClass({
			// Define class name
			fullClassName: "sap.hana.impactAnalysis.ObjectAdapter",

			// Define parent class
			parent: sap.galilei.impactAnalysis.generic.ObjectAdapter,

			// Define methods
			methods: {
				/**
				 * Gets the icon URL of the object.
				 * @name getIcon
				 * @memberOf sap.galilei.impactAnalysis.generic.ObjectAdapter#
				 * @param {Object} oAnalysisObject The analysis object.
				 * @returns {String}
				 */
				getDisplayName: function(oAnalysisObject) {
					var Nname = oAnalysisObject ? (oAnalysisObject.displayName || oAnalysisObject.name) : "";
					var pos = Nname.lastIndexOf("/");
					var vname = Nname.substring(pos + 1, Nname.length);
					//return oAnalysisObject ? (oAnalysisObject.displayName || oAnalysisObject.name) : "";
					return vname;
				},
				getIcon: function(oAnalysisObject) {
					return oAnalysisObject.type === "VIEW" ? "resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/view.jpg" :
						"resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/images/Table.png";
				}
			},

			// Define static members
			statics: {
				/**
				 * The shared object adapter instance.
				 * @static
				 * @private
				 */
				_instance: undefined,

				/**
				 * Gets the shared object adapter instance.
				 * @static
				 * @name getInstance
				 * @memberOf sap.galilei.impactAnalysis.generic.ObjectAdapter#
				 * @param {Object} oAnalysisObject The analysis object.
				 * @param {Function} fnSuccess The success(Collection|Array) callback function.
				 * @param {Function} fnError The error(sError) callback function.
				 * @returns {Boolean}
				 */
				getInstance: function() {
					if (!this._instance) {
						this._instance = new sap.hana.impactAnalysis.ObjectAdapter();
					}
					return this._instance;
				}
			}
		});
	};
	impactEditor.prototype.defineIAServiceProvider = function(editor) {
		namespace("sap.hana.impactAnalysis");
		/**
		 * @class
		 * Impact and Lineage analysis service used to retrieve impact and lineage data from server.
		 */
		sap.hana.impactAnalysis.ServiceProvider = sap.galilei.core.defineClass({
			// Define class name
			fullClassName: "sap.hana.impactAnalysis.ServiceProvider",

			// Define parent
			parent: sap.galilei.impactAnalysis.ServiceProvider,

			// Define methods
			methods: {
				/**
				 * Gets the impact and lineage data asynchronously for the object URI.
				 * @param sObjectUri
				 * @param bGetImpact
				 * @param bGetLineage
				 * @returns {jQuery.Deferred()}
				 */
		getImpactAndLineageAsync: function(sObjectUri, bGetImpact, bGetLineage) {
				var a= editor.context;
                var oResult = jQuery.Deferred(),
                sUri,
                sUrlprefix = "/metadataapi/hdiservices/",
                sEncodeObjectUri,
                sUriParameters,
                ajaxRequest,
                oIAData,
                oImpactData;

         function encodeObjectUri(sObjectUri) {

                //var index,
                //index2,
                //sEncodeUri;

         /*if (sObjectUri) {
                index = sObjectUri.indexOf(sUrlprefix);
                if (index !== -1) {
                       // Removes the prefix /metadataapi/dbobjects/
                       sEncodeUri = sObjectUri.substring(index + sUrlprefix.length);
   var sDataUri = (sEncodeUri.match(/\./g) || []).length;
                       // Replaces . by %2E
                       sEncodeUri = sEncodeUri.replace(/\./g, "%2E");



  
                       // TODO: Should we encode :: ?

                       // Replaces the last / by %2F
                       index = sObjectUri.lastIndexOf(".");
                       if (index === -1) {
                              index = sObjectUri.lastIndexOf(":");
                       }
                       index2 = sObjectUri.lastIndexOf("/");
                       if (index !== -1 && index2 !== -1 && index2 > index) {
                              index2 = sEncodeUri.lastIndexOf("/");
                              if(sDataUri >1){
                              sEncodeUri = sEncodeUri.substring(0, index2) + "%2F" + sEncodeUri.substring(index2 + 1);
                              }

                                     else if(sDataUri ===1){
                                sEncodeUri = sEncodeUri.substring(0, index2) + "/" + sEncodeUri.substring(index2 + 1); 



                              }

                       } else if (index2 !== -1 && index2 > index) {
                              index2 = sEncodeUri.lastIndexOf("/");

                              if(sDataUri >1){
                                  sEncodeUri = sEncodeUri.substring(0, index2) + "%2F" + sEncodeUri.substring(index2 + 1);


                              }
                              else if (sDataUri ===1){
                                  sEncodeUri = sEncodeUri.substring(0, index2) + "/" + sEncodeUri.substring(index2 + 1); 


                              }
                             
                       }

               




                }


         } */
         if (sObjectUri) {
                         var sObjectUrichange = sObjectUri.replace('dbobjects', 'xref');
            var index = sObjectUrichange.indexOf(sUrlprefix);
                                                  if (index !== -1) {
                                                        
                              var sEncodeUri = sObjectUrichange.substring(index + sUrlprefix.length);
                                 }
                     var xrefurl = sEncodeUri.substring(sEncodeUri.indexOf("xref"),sEncodeUri.length);
                     
                 var sEncodeUri2 = sEncodeUri.replace(/xref.*$/i, "");
            
              
             var sEncodeUri3 = sEncodeUri2.substring(0, sEncodeUri2.length-1);
            
             var sEncodeUri4 = sEncodeUri3.replace(/\//g, "%2F");
              var sObjectUrinew = sUrlprefix + sEncodeUri4 + "/" + xrefurl;
         }
                                                               
         return sObjectUrinew;
         
        
  }

         function getUriParameters() {
                var sParameters,
                       nLevel = 1;

                if (bGetImpact || bGetLineage) {
                       sParameters = "direction=";
                       if (bGetImpact) {
                              sParameters += "impact";
                       }
                       if (bGetLineage) {
                              if (bGetImpact) {
                                     sParameters += ",";
                              }
                              sParameters += "lineage";
                       }
                }

                //sParameters = "lineage";

                if (nLevel !== undefined) {
                       if (sParameters) {
                              sParameters += "&";
                       }
                       sParameters += "level=" + nLevel;
                }

                return sParameters;
         }

         //sUri = "http://mo-610a10504.mo.sap.corp:49005/metadataapi/xref/";

         //sUri = "http://10.53.218.88:8081/metadataapi/xref/";
         if (sObjectUri) {
                sEncodeObjectUri = encodeObjectUri(sObjectUri);
                if (sEncodeObjectUri) {
                       sUri = sEncodeObjectUri;

                       sUriParameters = getUriParameters();
                       if (sUriParameters) {
                              sUri += "?" + sUriParameters;
                       }

                       // Returns the JSON data for the current object
                       ajaxRequest = new XMLHttpRequest();
                       //sUri = "http://mo-a96341a6e.mo.sap.corp:3000/metadataapi/xref/MINI/playground%2EVinayak_SP11%2EWHERE_USED%2FJOIN_CV";
                       ajaxRequest.open("GET", sUri, true);
                       //ajaxRequest.setRequestHeader("Access-Control-Allow-Origin", "*");
                       ajaxRequest.send(null);
                       ajaxRequest.onload = function() {
                              var sServiceResponseJson,
                                     oServiceResponseJsonObject;

                              if (ajaxRequest.readyState === 4) {
                                     sServiceResponseJson = ajaxRequest.responseText;
                                     if (sServiceResponseJson) {
                                            oServiceResponseJsonObject = JSON.parse(sServiceResponseJson);
                                     }
                                     //oResult.resolve(oServiceResponseJsonObject.xref);
                                     oResult.resolve(oServiceResponseJsonObject);
                              }
                       };
                } else {
                       oResult.resolve();
                }
         } else {
                oResult.resolve();
         }

         return oResult;
  }
			},

			statics: {
				_instance: undefined,

				getInstance: function() {
					if (!this._instance) {
						this._instance = new sap.hana.impactAnalysis.ServiceProvider();
					}
					return this._instance;
				}

			}
		});
	};
	impactEditor.prototype.analyze = function(editor) {
			var mypath = editor.impactPath;
			var context = editor.context; 
			var hdiservicename = context.serviceName;
			var hdinamespace = context.namespace;
			var fileType = editor.fileExtension;
			var selentity;
			var ventity;
			var replacement = '/';
			mypath = mypath.replace(/.([^.]*)$/, replacement + '$1');
			//var impactUri = "/metadataapi/dbobjects/MINI/" + mypath;
			//var impactUri = "/metadataapi/dbobjects/_SYS_BIC_/" + mypath;
			var pos = mypath.lastIndexOf("/");
			var vname = mypath.substring(pos + 1, mypath.length);
			var type1 ;
			var impactUri;
            if (fileType === "hdbcds"){
            	 type1 = "TABLE";
            }
            else if (fileType === "hdbcalculationview"){
                type1 = "VIEW";
            }
            if(fileType === "hdbcalculationview"){
            	
            	impactUri = "/metadataapi/hdiservices/" +hdiservicename +"/dbobjects/" + hdinamespace +"::"+vname ;
            }
            else if (fileType === "hdbcds"){
            	selentity = editor.selentity;
    		    ventity = selentity.substring(selentity.indexOf(":")+2,selentity.length);
            	impactUri = "/metadataapi/hdiservices/" +hdiservicename +"/dbobjects/" + selentity;
            	vname=ventity;
            }

			oRootObject = sap.galilei.impactAnalysis.generic.createModelAndRootObject({
				//"uri": "/metadataapi/dbobjects/MINI/playground.Vinayak_SP11.WHERE_USED/CV_SALES",
				"uri": impactUri,
				//"uri": "/metadataapi/dbobjects/MINI/playground.shweta/UNION",
				"name": vname,
				"type": type1
				//"editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4563}",
			});
			// Impact analysis
			//that.pathField = new sap.ui.commons.Label().addStyleClass("labelproperty");
			/*that.pathField = new sap.ui.commons.TextField({
				tooltip: 'pathField',
				editable: false
				//value: editor.impactPath
			});*/
	//	pathField.setText(editor.impactPath);


		if (this.doImpact) {
			oImpactAnalyzer.expandLevel =5;
				//oRootObject.uri = impactUri;
			
				oImpactAnalyzer.analyzeImpact(oRootObject);
		
			
//			oToolbar1.addItem(oLabel);
//			oToolbar1.addItem(pathField);
			//oToolbar1.addItem(oTextView1);
		} 
		 else if (this.doLineage) {
		 	oImpactAnalyzer.expandLevel =5;
			oImpactAnalyzer.analyzeLineage(oRootObject);
				//oToolbar1.addItem(oTextView2);
//			oToolbar1.addItem(oLabe2);
//			oToolbar1.addItem(pathField);

		}
	};  
	function createImpactAnalyzer(sParentSelector,that,context1,document1) {
		//var that = this;
		/* that.impactAnalyzer = new sap.galilei.ui.editor.impactAnalysis.ImpactAnalyzer({
			parentSelector: sParentSelector,
			objectAdapterClassName: "sap.hana.impactAnalysis.ObjectAdapter",
			serviceProviderClassName: "sap.hana.impactAnalysis.ServiceProvider",
			objectSerializerClassName: "sap.galilei.impactAnalysis.generic.ObjectSerializer"
			//impactAnalysisDiagramClassName: "sap.calcView.impactAnalysis.ui.Diagram",
			//impactAnalysisNodeSymbolClassName: "sap.calcView.impactAnalysis.ui.NodeSymbol",
			//impactAnalysisNodeLinkSymbolClassName: "sap.calcView.impactAnalysis.ui.NodeLinkSymbol"

		}); */


		that.impactAnalyzer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic.ImpactAnalyzer({
			parentSelector: sParentSelector,
			impactAnalysisModelClassName: "sap.galilei.impactAnalysis.Model",
            impactAnalysisNodeClassName: "sap.galilei.impactAnalysis.Node",
            impactAnalysisNodeLinkClassName: "sap.galilei.impactAnalysis.NodeLink",
			objectAdapterClassName: "sap.hana.impactAnalysis.generic.ObjectAdapter",
			serviceProviderClassName: "sap.hana.impactAnalysis.ServiceProvider",
			objectSerializerClassName: "sap.hana.impactAnalysis.generic.ObjectSerializer",
			impactAnalysisDiagramClassName: "sap.hana.impactAnalysis.ui.Diagram",
			impactAnalysisNodeSymbolClassName: "sap.hana.impactAnalysis.ui.NodeSymbol",
			impactAnalysisNodeLinkSymbolClassName: "sap.hana.impactAnalysis.ui.NodeLinkSymbol",
			extensionClass: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic.DiagramEditorExtension",
			autoUpdateExpander:false	
		});


		var symbolSelectedHandler = function(event) {
			//var that=this;
			/*if (event.sourceSymbol.__fullClassName__ == "NodeSymbol") {
				that.Name = event.sourceSymbol.object.displayName;
				that.objectType = event.object.analysisObject.type;
				that.displayname = event.object.analysisObject.displayName;
				//var nameField = sap.ui.getCore().byId("NameField");
				if (that.nameField) {
					that.nameField.setValue(that.Name);
				}
			//	var typeField = sap.ui.getCore().byId("TypeField");
				if (that.typeField) {
					that.typeField.setValue(that.objectType);
				}
			//	var displayField = sap.ui.getCore().byId("DisplayField");
				if (that.displayField) {
					that.displayField.setValue(that.displayname);
				}
				//if (that.pathField) {
					//that.pathField.setText(that.displayname);
				//}
			} */
		};
		var doubletap = function(symbol) {

			if(symbol.editor === that.impactAnalyzer.editor){
				var symbol1 = symbol;
			var oContentService1 = that.context.service.content;
			var path= that.document.getEntity()._sName;
				var symbolpath= symbol.sourceSymbol.object.analysisObject.displayName;
				if(symbolpath.indexOf(":")== -1){
					symbolpath=symbolpath;
				}
				else {
					symbolpath = symbolpath.substring(symbolpath.indexOf(":")+2,symbolpath.length);
				}
				//symbolpath = symbolpath.substring(symbolpath.indexOf(":")+2,symbolpath.length);
				path = path.substring(0,path.lastIndexOf("/")+1);
				var calcviewpath = path + symbolpath + "."+"hdbcalculationview" ;
			that.context.service.document.getDocumentByPath(calcviewpath).then(function(oDocument){
			   var oDocument = oDocument;
			   return that.context.service.editor.getDefaultEditor(oDocument).then(function(oEditor) {
								return oContentService1.open(oDocument,oEditor.service);
							});
			   
			});
			}
			
		
		};
        that.context=context1;	
        that.document = document1;
        var extensioninfo = that.document.getEntity().getSupplement().fileExtension;
		sap.galilei.core.Event.subscribe("symbols.selection.changed", symbolSelectedHandler, that, that.impactAnalyzer.editor);
		sap.galilei.core.Event.subscribe("symbol.doubletap", doubletap, that, that.impactAnalyzer.editor);
		//var fileType = editor.fileExtension;
		/*if(extensioninfo !=="hdbcds"){
		sap.galilei.core.Event.subscribe("symbol.doubletap", function(symbol){
			if(symbol.editor === that.impactAnalyzer.editor){
				var symbol1 = symbol;
			var oContentService1 = that.context.service.content;
			var path= that.document.getEntity()._sName;
				var symbolpath= symbol.sourceSymbol.object.analysisObject.displayName;
				if(symbolpath.indexOf(":")== -1){
					symbolpath=symbolpath;
				}
				else {
					symbolpath = symbolpath.substring(symbolpath.indexOf(":")+2,symbolpath.length);
				}
				//symbolpath = symbolpath.substring(symbolpath.indexOf(":")+2,symbolpath.length);
				path = path.substring(0,path.lastIndexOf("/")+1);
				var calcviewpath = path + symbolpath + "."+"hdbcalculationview" ;
			that.context.service.document.getDocumentByPath(calcviewpath).then(function(oDocument){
			   var oDocument = oDocument;
			   return that.context.service.editor.getDefaultEditor(oDocument).then(function(oEditor) {
								return oContentService1.open(oDocument,oEditor.service);
							});
			   
			});
			}
			
		},that, that.impactAnalyzer.editor);  
	} */

		return that.impactAnalyzer;
		/*return new sap.galilei.ui.editor.impactAnalysis.ImpactAnalyzer({
			parentSelector: sParentSelector,
			objectAdapterClassName: "sap.hana.impactAnalysis.ObjectAdapter",
			serviceProviderClassName: "sap.hana.impactAnalysis.ServiceProvider",
			objectSerializerClassName: "sap.galilei.impactAnalysis.generic.ObjectSerializer"
			
		});*/
	};

	impactEditor.prototype.createImpactEditor = function(editor) {
		var that = this;
		var editor = editor;
		var oToolbar1 = new sap.ui.commons.Toolbar();
		oToolbar1.addStyleClass("impacttoolbar");
		var oButton1 = new sap.ui.commons.Button({
			icon: sap.ui.core.IconPool.getIconURI("expand"),
			tooltip: "Expand",
			press: function() {
				oImpactAnalyzer.expandRooNode(editor.doImpact, editor.doLineage, true,10);
			}
		});
		oToolbar1.addItem(oButton1);

		var oButton2 = new sap.ui.commons.Button({
			icon: sap.ui.core.IconPool.getIconURI("collapse"),
			tooltip: "Collapse",
			press: function() {
				oImpactAnalyzer.collapseRooNode(editor.doImpact, editor.doLineage, true);
			}
		});
		oToolbar1.addItem(oButton2);
        
        var oTextView3 = new sap.ui.commons.TextView({
			text: '',
			//tooltip: 'This is a Tooltip',
			wrapping: false,
			width: '350px'
			//semanticColor: sap.ui.commons.TextViewColor.Positive,
			//design: sap.ui.commons.TextViewDesign.H1
		});
        	oToolbar1.addItem(oTextView3);
		var oTextView1 = new sap.ui.commons.TextView({
			text: 'Impact Analysis',
			//tooltip: 'This is a Tooltip',
			wrapping: false,
			//width: '500px',
			//semanticColor: sap.ui.commons.TextViewColor.Positive,
			design: sap.ui.commons.TextViewDesign.H1
		});
		var oLabel = new sap.ui.commons.Label({text:"Impact Analysis:"}).addStyleClass("labelproperty");
		var oLabe2 = new sap.ui.commons.Label({text:"Data Lineage:"}).addStyleClass("labelproperty");
		var pathField = new sap.ui.commons.Label().addStyleClass("labelproperty");
		//pathField.setText(editor.impactPath);
		var oTextView2 = new sap.ui.commons.TextView({
			text: 'Data Lineage',
			//tooltip: 'This is a Tooltip',
			wrapping: false,
			//width: '500px',
			//semanticColor: sap.ui.commons.TextViewColor.Positive,
			design: sap.ui.commons.TextViewDesign.H1
		});

		
	        
	
		//oToolbar1.addItem(oButton6);
		

		var afterRendering = function() {
		    var that =this;
		    //to render the editor with some delay
		    setTimeout(function(){  
			// Creates impact analyzer
			oImpactAnalyzer = createImpactAnalyzer("#" + that.getId(),that,editor.context,editor.document);
			/*var mypath = editor.impactPath;
			var context = editor.context; 
			var hdiservicename = context.serviceName;
			var hdinamespace = context.namespace;
			var fileType = editor.fileExtension;
		
			var replacement = '/';
			mypath = mypath.replace(/.([^.]*)$/, replacement + '$1');
			//var impactUri = "/metadataapi/dbobjects/MINI/" + mypath;
			//var impactUri = "/metadataapi/dbobjects/_SYS_BIC_/" + mypath;
			var pos = mypath.lastIndexOf("/");
			var vname = mypath.substring(pos + 1, mypath.length);
			var type1 ;
            if (fileType === "hdbcds"){
            	 type1 = "TABLE";
            }
            else if (fileType === "hdbcalculationview"){
                type1 = "VIEW";
            }
			var impactUri = "/metadataapi/hdiservices/" +hdiservicename +"/dbobjects/" + hdinamespace +"::"+vname ;

			oRootObject = sap.galilei.impactAnalysis.generic.createModelAndRootObject({
				//"uri": "/metadataapi/dbobjects/MINI/playground.Vinayak_SP11.WHERE_USED/CV_SALES",
				"uri": impactUri,
				//"uri": "/metadataapi/dbobjects/MINI/playground.shweta/UNION",
				"name": vname,
				"type": type1
				//"editorURL": "http://pdserver.wdf.sap.corp:8000/resources/object|{id:-4560:4563}",
			}); */
			// Impact analysis
			//that.pathField = new sap.ui.commons.Label().addStyleClass("labelproperty");
			/*that.pathField = new sap.ui.commons.TextField({
				tooltip: 'pathField',
				editable: false
				//value: editor.impactPath
			});*/
		pathField.setText(editor.impactPath);
		oImpactAnalyzer.layoutOptions.alignLevel = false;
		
			if (editor.doImpact) {
				oImpactAnalyzer.expandLevel =5;
				//oImpactAnalyzer.analyzeImpact(oRootObject);
				oToolbar1.addItem(oLabel);
				oToolbar1.addItem(pathField);
				//oToolbar1.addItem(oTextView1);
			} 
			 else if (editor.doLineage) {
			 	oImpactAnalyzer.expandLevel =5;
				//oImpactAnalyzer.analyzeLineage(oRootObject);
					//oToolbar1.addItem(oTextView2);
				oToolbar1.addItem(oLabe2);
				oToolbar1.addItem(pathField);

			}
			/*var length1 = oImpactAnalyzer.diagram.symbols.length;
			for ( var i=0; i<=length1; i++){
				var symbol1 = oImpactAnalyzer.diagram.symbols.get(i);
				oImpactAnalyzer.editor.defaultRegisterSymbolEvents(symbol1);
			} */
		    }, 10);
		};
		var mainLayout = new sap.ui.commons.layout.VerticalLayout().addStyleClass("impactEditorMainVerticalLayout");
		mainLayout.addContent(oToolbar1);
		this._svgContainer = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.DiagramContainer({
			content: '<div style="width: 100%; height: 100%; overflow: hidden;"/>',
			afterRendering: afterRendering
			//exit: onExit.bind(this)
		});
		//mainLayout.addContent(this._svgContainer);

		/*var oSplitterV = new sap.ui.commons.Splitter();
		oSplitterV.setSplitterOrientation(sap.ui.commons.Orientation.vertical);
		oSplitterV.setSplitterPosition("70%");
		//oSplitterV.setMinSizeFirstPane("70%");
		//oSplitterV.setMinSizeSecondPane("30%");
		oSplitterV.setWidth("100%");
		oSplitterV.setHeight("100%");

		oSplitterV.addFirstPaneContent(this._svgContainer); */
		var thirdLayout = new sap.ui.commons.layout.VerticalLayout().addStyleClass("impactEditor");

	//	var propPane = sap.ui.getCore().byId("PropertyLayout");
	//	if (!propPane) {
			that.secondLayout = new sap.ui.commons.layout.MatrixLayout({
				width: '300px',
				columns: 2
			}).addStyleClass("impactEditor");
			that.secondLayout.setWidths('100px', '200px');

			that.nameField = new sap.ui.commons.TextArea({
				tooltip: 'Name',
				editable: false,
				value: ''

			}).addStyleClass("propertypane");
			that.oLabel = new sap.ui.commons.Label({
				text: 'Name',
				textAlign: "Left",
				labelFor: that.nameField
			});
			that.secondLayout.createRow(that.oLabel, that.nameField);

			that.typeField = new sap.ui.commons.TextField({
				tooltip: 'Type',
				editable: false,
				value: ''
			}).addStyleClass("propertypane");
			that.oLabe2 = new sap.ui.commons.Label({
				text: 'Type',
				textAlign: "Left",
				labelFor: that.typeField
			});
			that.secondLayout.createRow(that.oLabe2, that.typeField);

			that.displayField = new sap.ui.commons.TextArea({
				tooltip: 'Display Value',
				editable: false,
				value: ''
			}).addStyleClass("propertypane");
			that.displayField.setRows(3);
			that.oLabe3 = new sap.ui.commons.Label({
				text: 'Display Value',
				textAlign: "Left",
				labelFor: that.displayField
			});
			that.secondLayout.createRow(that.oLabe3, that.displayField);
	//	}
		this.horizonatalsep = new sap.ui.commons.HorizontalDivider({
			width: "100%",
			type: "Page",
			height: "Small"
		});
		this.oOpen = new sap.ui.commons.Button({
			//icon: sap.ui.core.IconPool.getIconURI("collapse"),
			tooltip: "Open",
			text: "Open",
			press: function() {
			
			}
		}).addStyleClass("buttonPropert");
        this.secondLayout.addStyleClass("labelProperty");
		thirdLayout.addContent(that.secondLayout);
		thirdLayout.addContent(this.horizonatalsep);
		thirdLayout.addContent(this.oOpen);
		//oSplitterV.addSecondPaneContent(thirdLayout);
		//mainLayout.addContent(oSplitterV);
		mainLayout.addContent(this._svgContainer);

		this.setAggregation("_classicalLayout", mainLayout);

	};

	return impactEditor;

});

