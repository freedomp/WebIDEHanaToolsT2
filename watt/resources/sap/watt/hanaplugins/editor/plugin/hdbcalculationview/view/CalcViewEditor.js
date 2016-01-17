/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "require",
        "../util/ResourceLoader",
        "../dialogs/NewCalculationViewDialog",
        "../viewmodel/model",
        "../viewmodel/commands",
        "../viewmodel/RepositoryXmlParser",
        "../viewmodel/RepositoryXmlParserHelper",
        "../viewmodel/RepositoryXmlRenderer",
        "../base/XmlSerializer",
        "../base/modelbase",
        "./DetailsPane",
        "../viewmodel/ModelProxyResolver",
        "./CalcViewEditorUtil",
        "../viewmodel/services/ViewModelService",
        "../viewmodel/services/PerformanceAnalysisService",
       "sap/watt/ideplatform/che/plugin/chebackend/dao/File",
       	"sap/watt/hanaplugins/editor/common/utils/util",
        "../control/EditorContainer",
        "../control/EditorLayout"
    ],
                function(
                                require,
                                ResourceLoader,
                                NewCalculationViewDialog,
                                viewmodel,
                                commands,
                                RepositoryXmlParser,
                                RepositoryXmlParserHelper,
                                RepositoryXmlRenderer,
                                XmlSerializer,
                                modelbase,
                                DetailsPane,
                                ModelProxyResolver,
                                CalcViewEditorUtil,
                                ViewModelService,
                                PerformanceAnalysisService,
                                FileService,
                                util
                ) {
                                "use strict";

                                var DeleteService = ViewModelService.DeleteService;
                                var cons = typeof console !== "undefined" ? console : undefined;

                                function requireWithPromise(moduleName) {
                                                var q = Q.defer();
                                                require([moduleName], function(module) {
                                                                if (!module) {
                                                                                q.reject(moduleName + " could not be loaded. The file exists," +
                                                                                                " but is defining a module with a different name. Please remove the module name or adjust it.");
                                                                } else {
                                                                                q.resolve(module);
                                                                }
                                                }, function(e) {
                                                                q.reject(new Error("Error loading module from path '" + moduleName + "'" + "\nOriginal error message: " + e.message +
                                                                                "\nError stack: " + e.stack + "\n -----------"));
                                                });
                                                return q.promise;
                                }


                                var ViewModelEvents = commands.ViewModelEvents;
                                var _isDefaultNode = false;

                                var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
                //            var schemaMapping = SchemaMappingService.schemaMapping;

                                var CalcViewEditor = function(context, oDocument) {
                                                this.fileService = FileService;
                                                this._context = context;
                                                this._document = oDocument;
                                                this._context.packageName = this.getPackageName();
                                                this._model = new viewmodel.ViewModel(true);
                                                this._undoManager = this._model.$getUndoManager();
                                                this._currentNode = null;
                                                this._isSemanticsNode = false;
                                                this._display = null;
                                                this._detailsPane = null;
                                                this._rendered = false;
                                                this._hidden = false;
                                                this._editorLayout = null;
                                                this._isScriptNode = false;
                                                this._flushedContent = null;
                                                this._changed = false;
                                                this._documentProperties = {};
                                                this.performancAnalysisService = undefined;
                                                this.fillNameSpace();
                                                this.init();
                                };

                                CalcViewEditor.prototype = {

                                                getModel: function() {
                                                                return this._model;
                                                },

                                                getContent: function() {
                                                                return this._display;
                                                },
                                                getPackageName: function() {
                                                                if (this._document) {
                                                                                var fullName = this._document.getKeyString();
                                                                                var names = fullName.split("/");
                                                                                var packageName;
                                                                                if (names.length > 2) {
                                                                                                for (var i = 1; i < (names.length - 1); i++) {
                                                                                                                if (packageName)
                                                                                                                                packageName = packageName + "." + names[i];
                                                                                                                else
                                                                                                                                packageName = names[i];
                                                                                                }
                                                                                }
                                                                                return packageName;
                                                                }
                                                },
                                                fillNameSpace:function(){
                                                                var that = this;
                                                                if (this._document) {
                                                                                var fullName = this._document.getEntity().getBackendData().getContentUrl();
                                                                                var locationName = this._document.getEntity().getBackendData().getLocationUrl();
                                                                                var names = fullName.split("/");
                                                                                var locationNames = locationName.split("/");
                                                                                var projectName = locationNames[1];
                                                                                var moduleName = locationNames[2];
                                                                                var workspaceId = names[2];
																				//that._context.serviceName = workspaceId +  "-" + moduleName
																				that._context.serviceName = workspaceId + "-" + projectName + "-" + moduleName
																				
                                                                                var srcFolderPath;
                                                                                if (names.length > 2) {
                                                                                                for (var i = 1; i < (names.length - 1); i++) {
                                                                                                                if(names[i] !== "src"){
                                                                                                                if (srcFolderPath)
                                                                                                                                srcFolderPath = srcFolderPath + "/" + names[i];
                                                                                                                else
                                                                                                                                srcFolderPath = names[i];
                                                                                                                }else{
                                                                                                                                                srcFolderPath = srcFolderPath + "/" + names[i];
                                                                                                                                              //  that._context.serviceName = names[i-1];
                                                                                                                }
                                                                                                }
                                                                                }                                                                              
                                                                                var result = this.fileService.readFileContent(srcFolderPath+"/.hdinamespace",false).then(function(result){
                                                                                                that._context.namespace = JSON.parse(result).name;
                                                                                }).done();   
                                                                                
                                                                               util.getServiceName(this._document,that._context,function(serviceName){
                                                                            	   if(serviceName){
                                                                            	   that._context.serviceName = serviceName;
                                                                            	   that._reloadContent(true);
                                                                            	   }else{
                                                                            		   that._reloadContent(true);
                                                                            	   }
                                                                               });
                                                                }
                                                },




                                                init: function() {
                                                                var that = this;

                                                                if (this._rendered) return;
                                                                this._rendered = true;

                                                                this._editorLayout = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.EditorLayout();

                                                                this._display = new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.Editor({
                                                                                hidden: this._hidden,
                                                                                content: this._editorLayout
                                                                });
                                                                this._editorLayout.addStyleClass("calcViewEditorMain");

                                                                this._model.selectionProvider = {
                                                                                node: "Semantics",
                                                                                selection: undefined
                                                                };

                                                                this._detailsPane = new DetailsPane();

                                                                var modelEvents = this._model.$getEvents();
                                                                modelEvents.subscribe(ViewModelEvents.CHANGED, this.onUndoManagerStateChanged, this);
                                                },

                                                _onCollapseLeft: function() {
                                                                if (this._editorLayout) {
                                                                                this._editorLayout.setCollapseLeft(true);
                                                                }
                                                },

                                                _getTrailingSpaces: function() {
                                                                if (!this._trailingSpaces) {
                                                                                this._trailingSpaceIndex = 1;
                                                                                if (this._documentProperties.spacesAfterDocumentElement.length > 1) {
                                                                                                this._trailingSpaces = ["", " "];
                                                                                } else {
                                                                                                this._trailingSpaces = ["  ", "   "];
                                                                                }
                                                                }
                                                                this._trailingSpaceIndex = 1 - this._trailingSpaceIndex;
                                                                return this._trailingSpaces[this._trailingSpaceIndex];
                                                },

                                                onUndoManagerStateChanged: function() {
                                                                // make a dummy change to invalidate the document
                                                                var that = this;
                                                                this._document.getContent().then(function(currValue) {
                                                                                if (!currValue || !that._flushedContent) {
                                                                                                return Q();
                                                                                }
                                                                                that._changed = true;
                                                                                return that._document.setContent(that._flushedContent + that._getTrailingSpaces(), that._context.self);
                                                                }).done();
                                                },

                                                setHidden: function(hidden) {
                                                                this._hidden = hidden;
                                                                if (this._display) {
                                                                                this._display.setHidden(hidden);
                                                                }
                                                },

                                                getHidden: function() {
                                                                return this._hidden;
                                                },

                                                _viewNodeSelected: function(event) {
                                                                var previousNode = this._currentNode;
                                                                this.getModel().selectionProvider.selectedKey = undefined;
                                                                if (event.name === "Semantics Node") {
                                                                                //if (!this._isSemanticsNode) {
                                                                                this._isSemanticsNode = true;
                                                                                this._currentNode = this._model.columnView.getDefaultNode();
                                                                                this._reloadSecondPane(previousNode, false).done();
                                                                                this.getModel().selectionProvider.node = "Semantics";
                                                                                // }
                                                                } else {
                                                                                this._currentNode = this._model.columnView.viewNodes.get(event.name);
                                                                                this.getModel().selectionProvider.node = this._currentNode.type;
                                                                                if (previousNode !== this._currentNode || this._isSemanticsNode) {
                                                                                                this._isSemanticsNode = false;
                                                                                                this._reloadSecondPane(previousNode, false).done();
                                                                                }
                                                                }
                                                },
                                                _viewNodeSwitchReload:function(event){
                                                    var previousNode = this._currentNode;
                                                    this.getModel().selectionProvider.selectedKey = undefined;
                                                    this._currentNode = this._model.columnView.viewNodes.get(event.name);
                                                    this.getModel().selectionProvider.node = this._currentNode.type;
                                                    if(previousNode === this._currentNode){ 
                                                        this._isSemanticsNode = false;
                                                                                this._reloadSecondPane(previousNode, false).done();
                                                    }
                                                },
                                                _isPerformanceAnalysis: function() {
                                                                //check user settings here
                                                                if (this._model.preferenceStore) {
                                                                                this._model.isPerformanceAnalysis = this._model.isPerformanceAnalysis || this._model.preferenceStore.performanceAnalysisAlwaysOn ||
                                                                                                false;
                                                                } else {
                                                                                this._model.isPerformanceAnalysis = this._model.isPerformanceAnalysis || false;
                                                                }
                                                                return this._model.isPerformanceAnalysis;
                                                },

                                                _togglePerformanceAnalysis: function(event) {
                                                                var that = this;
                                                                if (typeof this._model.isPerformanceAnalysis === 'undefined' || !this._model.isPerformanceAnalysis) {
                                                                                this._model.isPerformanceAnalysis = true;
                                                                                if (!this._isSemanticsNode) {
                                                                                                var item = this._getPerformanceAnalysisItem(this._currentNode);
                                                                                                (this._detailsPane.addItem(item, "performanceAnalysis")).then(function(tabItem) {
                                                                                                                that._detailsPane.selectTab(tabItem, "performanceAnalysis");
                                                                                                });
                                                                                }

                                                                                //run background thread
                                                                                this._loadAnalysisData(this._currentNode);
                                                                } else {
                                                                                this._model.isPerformanceAnalysis = false;
                                                                                if (this.performancAnalysisService) {
                                                                                                this.performancAnalysisService.clearData();
                                                                                                this.performancAnalysisService = undefined;
                                                                                }
                                                                                this._detailsPane.removeItem("performanceAnalysis");
                                                                                var events = that._model.columnView.$getEvents();
                                                                                events.publish(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
                                                                }
                                                },

                                                _getPerformanceAnalysisItem: function(selectedNode) {
                                                                return {
                                                                                key: "performanceAnalysis",
                                                                                text: resourceLoader.getText("tit_performance_analysis"),
                                                                                modelKey: "viewNode",
                                                                                content: {
                                                                                                creator: "./performance_workbench/PerformanceAnalysisTab",
                                                                                                parameters: {
                                                                                                                context: this._context,
                                                                                                                viewNode: selectedNode,
                                                                                                                model: this._model
                                                                                                }
                                                                                },
                                                                                icon: "sap-icon://activity-items"
                                                                };
                                                },

                                                _loadAnalysisData: function(currentNode) {
                                                                if (currentNode) {
                                                                                var that = this;
                                                                                if (this._isPerformanceAnalysis()) {
                                                                                                this.performancAnalysisService = new PerformanceAnalysisService(this._model, this._context);
                                                                                                var onComplete = function() {
                                                                                                                var events = that._model.columnView.$getEvents();
                                                                                                                events.publish(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
                                                                                                                that._reloadEditor(false, currentNode).done(); // currently, we do not wait for the refresh, i.e. we terminate the promise chain
                                                                                                };
                                                                                                this.performancAnalysisService.injectAnalysisData(onComplete);
                                                                                }
                                                                }
                                                },

                                                _reloadContent: function(isOpen) {
                                                                var that = this;
                                                                var previousNode = this._currentNode;
                                                                var resolverResult = Q.defer();
                                                                if (isOpen) {
                                                                                this._currentNode = this._model.columnView.getDefaultNode();
                                                                                ModelProxyResolver.ProxyResolver.resolve(this._model, this._context, function() {
                                                                                                //: CALC View is build on CDS Entity, Decision table, etc -> Close Editor
                                                                                                that._checkUnsupportedEntities();
                                                                                                //: Passing propagateDataTypeToDefaultNode () as callback to ProxyResolver.resolve because it should be called after ProxyResolver.resolve
                                                                                                RepositoryXmlParser.propagateDataTypeToDefaultNode(that._model.columnView);
                                                                                                //: Conversion to Filer Expression requires Column's datatype to be filled; so calling it as a callback after propagateDataTypeToDefaultNode()
                                                                                                RepositoryXmlParserHelper.convertElementFilterToFilerExpression(that._model.columnView);

                                                                                                if (that._model.columnView.errorMsg) {
                                                                                                                //ConsoleLogger.writeSuccessMessage(that._model.columnView.errorMsg);
                                                                                                }
                                                                                                that._model.$finishLoading();
                                                                                                //that._checkProxyElements();
                                                                                                var events = that._model.columnView.$getEvents();
                                                                                                events.publish(ViewModelEvents.COLUMNVIEW_LOADING_FINISHED);
                                                                                                that._reloadEditor(true, previousNode).done(resolverResult.resolve);
                                                                                                that._loadAnalysisData(that._currentNode);
                                                                                });

                                                                                this._model.columnView.$getEvents().subscribe(ViewModelEvents.CHANGED, this._columnViewChanged, this);
                                                                                this._model.columnView.$getEvents().subscribe(ViewModelEvents.VIEWNODE_SELECTED, this._viewNodeSelected, this);
                                                                                this._model.columnView.$getEvents().subscribe(ViewModelEvents.SWITCH_VIEWNODE_RELOAD, this._viewNodeSwitchReload, this);
                                                                                this._model.columnView.$getEvents().subscribe(ViewModelEvents.PERFORMANCE_ANALYSIS_CHANGED, this._togglePerformanceAnalysis, this);
                                                                                
                                                                                    //for union pruning 
                                                                                                that._model.columnView.readPruningInformation=true;
                                                                                                ModelProxyResolver.ProxyResolver.readPruningInfo(that._model, that._context, function(){
                                                                                                                                  that._model.columnView.$$events.publish(commands.ViewModelEvents.VIEWNODE_CHANGED);
                                                                                                });
                                                                                                                                
                                                                                
                                                                                // this._model.columnView.$getEvents().subscribe(ViewModelEvents.COLUMNVIEW_CHANGED, this._columnViewChanged, this);
                                                                } else {
                                                                                that._reloadEditor(false, previousNode).done(resolverResult.resolve);
                                                                }
                                                                return resolverResult.promise;
                                                },

                                                _checkUnsupportedEntities: function() {
                                                                var that = this;

                                                                if (that._model && that._model.severityType === "Error") {
                                                                                var oDialog = new sap.ui.commons.Dialog({
                                                                                                title: resourceLoader.getText("tit_unsupported_feature"),
                                                                                                modal: true, // RK: keep UI in sync. with message box for unsupported feature 
                                                                                                width: "500px",
                                                                                                closed: function() {
                                                                                                                // wait for the dialog to be closed before closing the document
                                                                                                                // otherwise focus will stay on repositorybrowser, which causes Run (F8) to still use the already closed document
                                                                                                                that._context.service.content.close(that._document, that._context.self)
                                                                                                                                .then(function() {
                                                                                                                                                return that._context.service.focus.setFocus(that._context.service.content);
                                                                                                                                })
                                                                                                                                .done();
                                                                                                }
                                                                                });

                                                                                oDialog.addButton(new sap.ui.commons.Button({
                                                                                                text: "OK",
                                                                                                press: function() {
                                                                                                                oDialog.close();
                                                                                                }
                                                                                }));

                                                                                var oText = new sap.ui.commons.TextView({
                                                                                                text: that._model.message
                                                                                });

                                                                                var oImage1 = new sap.ui.commons.Image({
                                                                                                src: resourceLoader.getImagePath("info.png")
                                                                                }).addStyleClass("dialogImg");
                                                                                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                                                                                                layoutFixed: false,
                                                                                                columns: 2
                                                                                });

                                                                                mLayout.createRow(oImage1, oText);

                                                                                var oLayout = new sap.ui.layout.VerticalLayout();
                                                                                oLayout.addContent(mLayout);

                                                                                var referenceInfo;
                                                                                if (that._model.referenceEntiities) {
                                                                                                that._model.referenceEntiities.foreach(function(entity) {
                                                                                                                if (referenceInfo) {
                                                                                                                                referenceInfo = referenceInfo + "\n" + entity.fqName;
                                                                                                                } else {
                                                                                                                                referenceInfo = entity.fqName;
                                                                                                                }
                                                                                                });
                                                                                }

                                                                                var oInput = new sap.ui.commons.TextArea({
                                                                                                width: "450px",
                                                                                                rows: 7,
                                                                                                editable: false
                                                                                                //enabled: false
                                                                                }).addStyleClass("textAreaBorder");

                                                                                oInput.setValue(referenceInfo);
                                                                                oLayout.addContent(oInput);
                                                                                oDialog.addContent(oLayout);
                                                                                oDialog.open();
                                                                }
                                                },

                                                _checkProxyElements: function() {
                                                                var that = this;
                                                                var referenceInfo;
                                                                var viewNodeName;
                                                                var inputName;
                                                                this._model.columnView.viewNodes.foreach(function(viewNode) {
                                                                                viewNodeName = viewNode.name;
                                                                                viewNode.inputs.foreach(function(input) {
                                                                                                if (input && input.getSource() && input.getSource().$$className === "Entity") {
                                                                                                                inputName = input.getSource().fqName;
                                                                                                                input.getSource().elements.foreach(function(element) {
                                                                                                                                if (element.isProxy) {
                                                                                                                                                if (referenceInfo) {
                                                                                                                                                                referenceInfo = referenceInfo + "\n" + element.name + " (" + viewNodeName + " > " + inputName + " > " + element.name + ")";
                                                                                                                                                } else {
                                                                                                                                                                referenceInfo = element.name + " (" + viewNodeName + " > " + inputName + " > " + element.name + ")";
                                                                                                                                                }
                                                                                                                                }
                                                                                                                });
                                                                                                }
                                                                                });
                                                                });
                                                                if (referenceInfo) {
                                                                                var oDialog = new sap.ui.commons.Dialog({
                                                                                                title: resourceLoader.getText("tit_unsupported_feature"),
                                                                                                modal: true, // RK: keep UI in sync. with message box for unsupported feature 
                                                                                                width: "500px",
                                                                                                closed: function() {
                                                                                                                // wait for the dialog to be closed before closing the document
                                                                                                                // otherwise focus will stay on repositorybrowser, which causes Run (F8) to still use the already closed document
                                                                                                                that._context.service.content.close(that._document, that._context.self)
                                                                                                                                .then(function() {
                                                                                                                                                return that._context.service.focus.setFocus(that._context.service.content);
                                                                                                                                })
                                                                                                                                .done();
                                                                                                }
                                                                                });

                                                                                oDialog.addButton(new sap.ui.commons.Button({
                                                                                                text: "OK",
                                                                                                press: function() {
                                                                                                                oDialog.close();
                                                                                                }
                                                                                }));

                                                                                var oText = new sap.ui.commons.TextView({
                                                                                                text: resourceLoader.getText("msg_proxy_unsupported")
                                                                                });

                                                                                var oImage1 = new sap.ui.commons.Image({
                                                                                                src: resourceLoader.getImagePath("info.png")
                                                                                }).addStyleClass("dialogImg");
                                                                                var mLayout = new sap.ui.commons.layout.MatrixLayout({
                                                                                                layoutFixed: false,
                                                                                                columns: 2
                                                                                });

                                                                                mLayout.createRow(oImage1, oText);

                                                                                var oLayout = new sap.ui.layout.VerticalLayout();
                                                                                oLayout.addContent(mLayout);

                                                                                var oInput = new sap.ui.commons.TextArea({
                                                                                                width: "450px",
                                                                                                rows: 7,
                                                                                                editable: false
                                                                                                //enabled: false
                                                                                }).addStyleClass("textAreaBorder");

                                                                                oInput.setValue(referenceInfo);
                                                                                oLayout.addContent(oInput);
                                                                                oDialog.addContent(oLayout);
                                                                                oDialog.open();
                                                                }
                                                },

                                                _columnViewChanged: function(event) {
                                                                if (this._isScriptNode) {
                                                                                this._reloadSecondPane(this._currentNode, false).done();
                                                                } else {
                                                                                this._refreshSecondPane(this._currentNode);
                                                                }
                                                },

                                                _reloadEditor: function(isOpen, previousNode) {
                                                                var that = this;
                                                                if (!that._model || that._model.$isDisposed()) {
                                                                                return Q();
                                                                }

                                                                this._isScriptNode = this._currentNode.isScriptNode();
                                                                if (isOpen) {
                                                                                if (this._isScriptNode) {
                                                                                                this._editorLayout.addSecondPaneContent(this._detailsPane.getContent());
                                                                                                this.getModel().selectionProvider.node = "Script";
                                                                                                return this._reloadSecondPane(previousNode, isOpen);
                                                                                } else {
                                                                                                this._editorLayout.addCollapsedContentLeft(new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.EditorLayoutRotatedLabel({
                                                                                                                text: resourceLoader.getText("tit_scenario")
                                                                                                }));
                                                                                                this._editorLayout.addCollapsedContentRight(new sap.watt.hanaplugins.editor.plugin.hdbcalculationview.control.EditorLayoutRotatedLabel({
                                                                                                                text: resourceLoader.getText("tit_details")
                                                                                                }));
                                                                                                this._editorLayout.addSecondPaneContent(this._detailsPane.getContent(true));
                                                                                                that._editorLayout.setSplitterPosition("30%");
                                                                                                this._isSemanticsNode = true;
                                                                                                return Q.all([
                            that._reloadSecondPane(previousNode, isOpen),
                            requireWithPromise("../diagram/DiagramPane").then(function(DiagramPane) {
                                                                                                                                if (!that._model || that._model.$isDisposed()) {
                                                                                                                                                return Q();
                                                                                                                                }
                                                                                                                                var diagramPane = new DiagramPane(that._model, that._context, that._onCollapseLeft.bind(that));
                                                                                                                                that._editorLayout.addFirstPaneContent(diagramPane.getContent());
                                                                                                                                that._detailsPane.scenarioEditor=diagramPane;
                                                                                                                                
                                                                                                                })
                        ]);
                                                                                }
                                                                } else {
                                                                                return this._reloadSecondPane(previousNode, isOpen);
                                                                }
                                                },

                                                _reloadSecondPane: function(previousNode, isOpen) {
                                                                var that = this;
                                                                // allow to wait for details pane to be initialized
                                                                var promise = Q();
                                                                if (!that._model || that._model.$isDisposed()) {
                                                                                return promise;
                                                                }

                                                                var selectedNode = this._currentNode;
                                                                var items = [];
                                                                var defaultPane = "details_columns";

                                                                if (this._isScriptNode) {
                                                                                if (previousNode !== selectedNode || this._isSemanticsNode) {
                                                                                                if (previousNode) {
                                                                                                                previousNode.$getEvents().unsubscribe(ViewModelEvents.CHANGED, this._columnViewChanged, this);
                                                                                                }

                                                                                                items.push({
                                                                                                                key: "properties",
                                                                                                                text: resourceLoader.getText("tit_properties"),
                                                                                                                modelKey: "columnView",
                                                                                                                content: {
                                                                                                                                creator: "./DetailsPropertiesPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                isScriptNode: this._isScriptNode,
                                                                                                                                                isStarJoin: selectedNode.isStarJoin(),
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://hint"
                                                                                                });

                                                                                                items.push({
                                                                                                                key: "script",
                                                                                                                text: resourceLoader.getText("tit_script"),
                                                                                                                modelKey: "viewNode",
                                                                                                                content: {
                                                                                                                                creator: "./ScriptEditor",
                                                                                                                                noPadding: true,
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                document: this._document,
                                                                                                                                                context: this._context
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://activity-items"
                                                                                                });
                                                                                                if (selectedNode) {
                                                                                                                selectedNode.$getEvents().subscribe(ViewModelEvents.CHANGED, this._columnViewChanged, this);
                                                                                                                items.push({
                                                                                                                                key: "columns",
                                                                                                                                text: resourceLoader.getText("tit_columns"),
                                                                                                                                count: "columnsCount",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "columnsProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./SemanticsColumnsPane",
                                                                                                                                                parameters: {
                                                                                                                                                                model: this._model,
                                                                                                                                                                isScriptNode: this._isScriptNode,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                viewNode: selectedNode
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                                defaultPane = "script";
                                                                                                }
                                                                                                items.push({
                                                                                                                key: "hierarchies",
                                                                                                                text: resourceLoader.getText("tit_hierarchies"),
                                                                                                                count: "hierarchiesCount",
                                                                                                                modelKey: "columnView",
                                                                                                                hasProxy: "hierarchiesProxy",
                                                                                                                content: {
                                                                                                                                creator: "./hierarchies/HierarchiesPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                viewNode: selectedNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://activity-items"
                                                                                                });
                                                                                                items.push({
                                                                                                                key: "parameters_variables",
                                                                                                                text: resourceLoader.getText("tit_parameters_variables"),
                                                                                                                count: "parameters/length",
                                                                                                                modelKey: "columnView",
                                                                                                                hasProxy: "parametersProxy",
                                                                                                                content: {
                                                                                                                                creator: "./DetailsParametersPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                isSemanticsNode: this._isSemanticsNode,
                                                                                                                                                viewNode: selectedNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://attachment"
                                                                                                });
                                                                                                promise = this._detailsPane.setItems(items, defaultPane);
                                                                                }

                                                                } else if (selectedNode) {
                                                                                if (this._model.columnView.getDefaultNode() === selectedNode) {
                                                                                                _isDefaultNode = true;
                                                                                } else {
                                                                                                _isDefaultNode = false;
                                                                                }
                                                                                // if (previousNode !== selectedNode || this._isSemanticsNode) {
                                                                                if (previousNode) {
                                                                                                previousNode.$getEvents().unsubscribe(ViewModelEvents.CHANGED, this._columnViewChanged, this);
                                                                                }

                                                                                selectedNode.$getEvents().subscribe(ViewModelEvents.CHANGED, this._columnViewChanged, this);

                                                                                if (this._isSemanticsNode) {
                                                                                                items.push({
                                                                                                                key: "properties",
                                                                                                                text: resourceLoader.getText("tit_properties"),
                                                                                                                modelKey: "columnView",
                                                                                                                content: {
                                                                                                                                creator: "./DetailsPropertiesPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                isScriptNode: this._isScriptNode,
                                                                                                                                                isStarJoin: selectedNode.isStarJoin(),
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://hint"
                                                                                                });
                                                                                                items.push({
                                                                                                                key: "columns",
                                                                                                                text: resourceLoader.getText("tit_columns"),
                                                                                                                count: "columnsCount",
                                                                                                                modelKey: "viewNode",
                                                                                                                hasProxy: "columnsProxy",
                                                                                                                content: {
                                                                                                                                creator: "./SemanticsColumnsPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                isScriptNode: this._isScriptNode,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                viewNode: selectedNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://activity-items"
                                                                                                });
                                                                                               /* items.push({
                                                                                                                key: "hierarchies",
                                                                                                                text: resourceLoader.getText("tit_hierarchies"),
                                                                                                                count: "hierarchiesCount",
                                                                                                                modelKey: "columnView",
                                                                                                                hasProxy: "hierarchiesProxy",
                                                                                                                content: {
                                                                                                                                creator: "./hierarchies/HierarchiesPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                viewNode: selectedNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://activity-items"
                                                                                                });*/
                                                                                                items.push({
                                                                                                                key: "parameters_variables",
                                                                                                                text: resourceLoader.getText("tit_parameters_variables"),
                                                                                                                count: "parameters/length",
                                                                                                                modelKey: "columnView",
                                                                                                                hasProxy: "parametersProxy",
                                                                                                                content: {
                                                                                                                                creator: "./DetailsParametersPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                isSemanticsNode: this._isSemanticsNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://attachment"
                                                                                                });

                                                                                                defaultPane = "columns";
                                                                                } else {

                                                                                                if (selectedNode.type === "JoinNode") {
                                                                                                                //if (selectedNode.isDefaultNode()) {
                                                                                                                items.push({
                                                                                                                                key: "Join",
                                                                                                                                text: resourceLoader.getText("tit_join_definition"),
                                                                                                                                modelKey: "viewNode",
                                                                                                                                content: {
                                                                                                                                                creator: "./join/diagram/JoinDefinitionPane",
                                                                                                                                                parameters: {
                                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                model: this._model,
                                                                                                                                                                context: this._context
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                                /*} else {
                               items.push({
                                    key: "Join",
                                    text: resourceLoader.getText("tit_join_definition"),
                                    modelKey: "viewNode",
                                    content: {
                                        creator: "./join/JoinDefinitionPane",
                                        parameters: {
                                            viewNode: selectedNode,
                                            undoManager: this._undoManager,
                                            model: this._model
                                        }
                                    },
                                    icon: "sap-icon://activity-items"
                                });
                            }*/
                                                                                                                defaultPane = "Join";
                                                                                                } else {
                                                                                                                defaultPane = "Mapping";
                                                                                                }

                                                                                                items.push({
                                                                                                                key: "Mapping",
                                                                                                                text: resourceLoader.getText("tit_mapping_pane"),
                                                                                                                modelKey: "viewNode",
                                                                                                                hasProxy: "mappingProxy",
                                                                                                                content: {
                                                                                                                                creator: "./mapping/MappingPane",
                                                                                                                                parameters: {
                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                model: this._model
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://activity-items"
                                                                                                });

                                                                                                var calculatedColumnText = resourceLoader.getText("tit_calculated_columns");

                                                                                                if ((this._model.columnView.dataCategory !== "DIMENSION" && selectedNode.isDefaultNode() && selectedNode.type === "Aggregation") ||
                                                                                                                selectedNode.isStarJoin()) {
                                                                                                                calculatedColumnText = resourceLoader.getText("tit_calculated_columns_counters");
                                                                                                }

                                                                                                if (selectedNode.type !== "Rank" && selectedNode.isDataSource !== true) {
                                                                                                                items.push({
                                                                                                                                key: calculatedColumnText === resourceLoader.getText("tit_calculated_columns") ? "calculated_columns" : "calculated_columns_counters",
                                                                                                                                text: calculatedColumnText,
                                                                                                                                count: "calculatedColumns/length",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "calculatedColumnsProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./calculatedcolumn/CalculatedColumnsPane",
                                                                                                                                                parameters: {
                                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                model: this._model
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                }

                                                                                                if (this._model.columnView.dataCategory !== "DIMENSION" && selectedNode.isDefaultNode() && (selectedNode.type === "Aggregation" ||
                                                                                                                selectedNode.isStarJoin()) && selectedNode.isDataSource !== true) {
                                                                                                               /* items.push({
                                                                                                                                key: "restricted_columns",
                                                                                                                                text: resourceLoader.getText("tit_restricted_columns"),
                                                                                                                                count: "restrictedColumns/length",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "restrictedColumnsProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./restricted_columns/RestrictedColumnsPane",
                                                                                                                                                parameters: {
                                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                model: this._model
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });*/
                                                                                                }

                                                                                                if (selectedNode.type === "Rank" ) {
                                                                                                                items.push({
                                                                                                                                key: "rank_node",
                                                                                                                                text: "Definition",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "rankNodeProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./RankNodePane",
                                                                                                                                                parameters: {
                                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                model: this._model
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                }
											if(selectedNode.isDataSource !== true){
                                                                                                items.push({
                                                                                                                key: "parameters",
                                                                                                                text: resourceLoader.getText("tit_parameters"),
                                                                                                                count: "parameters/length",
                                                                                                                modelKey: "viewNode",
                                                                                                                hasProxy: "parametersProxy",
                                                                                                                content: {
                                                                                                                                creator: "./DetailsParametersPane",
                                                                                                                                parameters: {
                                                                                                                                                model: this._model,
                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                context: this._context,
                                                                                                                                                viewNode: selectedNode,
                                                                                                                                                isSemanticsNode: this._isSemanticsNode
                                                                                                                                }
                                                                                                                },
                                                                                                                icon: "sap-icon://attachment"
                                                                                                });
                                                                                                }

                                                                                                if (selectedNode._isDefaultNode) {

                                                                                                                items.push({
                                                                                                                                key: "columns",
                                                                                                                                text: resourceLoader.getText("tit_columns"),
                                                                                                                                count: "columnsCount",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "columnsProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./SemanticsColumnsPane",
                                                                                                                                                parameters: {
                                                                                                                                                                model: this._model,
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                viewNode: selectedNode
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                } else if (selectedNode.isDataSource !== true){
                                                                                                                items.push({
                                                                                                                                key: "details_columns",
                                                                                                                                text: resourceLoader.getText("tit_columns"),
                                                                                                                                count: "columns/length",
                                                                                                                                modelKey: "viewNode",
                                                                                                                                hasProxy: "columnsProxy",
                                                                                                                                content: {
                                                                                                                                                creator: "./DetailsColumnsPane",
                                                                                                                                                parameters: {
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                model: this._model,
                                                                                                                                                                viewNode: selectedNode
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                }if (selectedNode.type === "Graph") {
							items = [];
							items.push({
								key: "details_columns",
								text: resourceLoader.getText("tit_columns"),
								count: "columns/length",
								modelKey: "viewNode",
								hasProxy: "columnsProxy",
								content: {
									creator: "./DetailsColumnsPane",
									parameters: {
										undoManager: this._undoManager,
										context: this._context,
										model: this._model,
										viewNode: selectedNode
									}
								},
								icon: "sap-icon://activity-items"
							});
							items.push({
								key: "script",
								text: resourceLoader.getText("tit_script"),
								modelKey: "viewNode",
								content: {
									creator: "./GraphScriptEditor",
									noPadding: true,
									parameters: {
										model: this._model,
										undoManager: this._undoManager,
										document: this._document,
										context: this._context,
										viewNode: selectedNode
									}
								},
								icon: "sap-icon://activity-items"
							});
							defaultPane = "details_columns";
						}

                                                                                                if ((selectedNode.type === "Projection" || selectedNode.type === "Aggregation") && this._model.columnView.getDefaultNode() !==
                                                                                                                selectedNode && selectedNode.isDataSource !== true) {
                                                                                                                items.push({
                                                                                                                                key: "expression",
                                                                                                                                text: resourceLoader.getText("tit_filter_expression"),
                                                                                                                                modelKey: "viewNode",
                                                                                                                                content: {
                                                                                                                                                creator: "./FilterExpressionPane",
                                                                                                                                                parameters: {
                                                                                                                                                                undoManager: this._undoManager,
                                                                                                                                                                context: this._context,
                                                                                                                                                                model: this._model,
                                                                                                                                                                viewNode: selectedNode
                                                                                                                                                }
                                                                                                                                },
                                                                                                                                icon: "sap-icon://activity-items"
                                                                                                                });
                                                                                                }if (selectedNode.isDataSource === true || selectedNode.isDataSource === "true") {
							items = [];
							items.push({
								key: "details_columns",
								text: resourceLoader.getText("tit_columns"),
								count: "columns/length",
								modelKey: "viewNode",
								hasProxy: "columnsProxy",
								content: {
									creator: "./DetailsColumnsPane",
									parameters: {
										undoManager: this._undoManager,
										context: this._context,
										model: this._model,
										viewNode: selectedNode
									}
								},
								icon: "sap-icon://activity-items"
							});

							defaultPane = "details_columns";
						}
                                                                                                //if performance analysis mode is on in preferences/user settings, add tab for it
                                                                                                if (this._model.isPerformanceAnalysis) {
                                                                                                                items.push(this._getPerformanceAnalysisItem(selectedNode));
                                                                                                                defaultPane = "performanceAnalysis";
                                                                                                                /* if(typeof this.performancAnalysisService === 'undefined'){
                                this._loadAnalysisData(selectedNode);
                            }*/
                                                                                                }
                                                                                }
                                                                                promise = this._detailsPane.setItems(items, defaultPane, this._isSemanticsNode ? resourceLoader.getText("txt_semantics") :
                                                                                                selectedNode.name ,that._model);
                                                                }

                                                                this._refreshSecondPane();
                                                                return promise;
                                                },

                                                _refreshSecondPane: function(previousNode) {
                                                                var that = this;
                                                                var model = this._model;
                                                                var selectedNode = this._currentNode;
                                                                var items = [];
                                                                var columnViewProperties;
                                                                var viewNodeProperties;
                                                                var parameters = [];
                                                                var hierarchies = [];
                                                                var historyParameterList = [];
                                                                var runWithValue;
                                                                var dimensionValue;
                                                                var defaultSchemaValue;
                                                                var hierarchiesProxy = undefined;
                                                                var parametersProxy = undefined;

                                                                historyParameterList.push({
                                                                                name: ""
                                                                });

                                                                model.columnView.parameters.foreach(function(parameter) {
                                                                                if (!parametersProxy && that.isBasedOnElementProxy(parameter, selectedNode)) {
                                                                                                parametersProxy = true;
                                                                                }
                                                                                parameters.push(parameter);
                                                                                if (parameter.inlineType && parameter.inlineType.primitiveType === "DATE" || parameter.inlineType.primitiveType === "SECONDDATE"||parameter.inlineType.primitiveType === "TIME"||parameter.inlineType.primitiveType === "TRIMESTAMP") {
                                                                                                historyParameterList.push({
                                                                                                                name: parameter.name
                                                                                                });
                                                                                }
                                                                });

                                                                if (model.columnView.executionHints.runWithInvokerPrivileges) {
                                                                                runWithValue = "INVOKER";
                                                                } else {
                                                                                runWithValue = "DEFINER";
                                                                }

                                                                if (model.columnView.dimensionType === "TIME") {
                                                                                dimensionValue = model.columnView.dimensionType;
                                                                } else {
                                                                                dimensionValue = "STANDARD";
                                                                }

                                                                defaultSchemaValue = model.columnView.defaultSchema;
                                                                if (defaultSchemaValue && defaultSchemaValue !== "") {
                                                                                /*schemaMapping.getPhysicalSchema(defaultSchemaValue, that._context, function(results) {
                                                                                                if (results) {
                                                                                                                defaultSchemaValue += " " + "(" + results + ")";
                                                                                                }
                                                                                });*/
                                                                }

                                                                model.columnView.inlineHierarchies.foreach(function(inlineHierarchy) {
                                                                                if (!hierarchiesProxy && that.isBasedOnElementProxy(inlineHierarchy, selectedNode)) {
                                                                                                hierarchiesProxy = true;
                                                                                }
                                                                                hierarchies.push(inlineHierarchy.name);
                                                                });

                                                                var hierarchiesCount = hierarchies.length;
                                                                if (model.columnView.getDefaultNode().isStarJoin()) {
                                                                                var sharedHierarchiesCount = 0;
                                                                                model.columnView.getDefaultNode().inputs.foreach(function(input) {
                                                                                                if (input.selectAll && input.getSource() && input.getSource().inlineHierarchies) {
                                                                                                                sharedHierarchiesCount += input.getSource().inlineHierarchies.count();
                                                                                                }
                                                                                });
                                                                                hierarchiesCount = hierarchiesCount + "," + sharedHierarchiesCount;
                                                                }

                                                                columnViewProperties = {
                                                                                //defaultSchema: model.columnView.defaultSchema,
                                                                                defaultSchema: defaultSchemaValue,
                                                                                applyPrivilegeType: model.columnView.applyPrivilegeType,
                                                                                dataCategory: model.columnView.dataCategory,
                                                                                label: model.columnView.label,
                                                                                name: model.columnView.name,
                                                                                parameters: parameters,
                                                                                parametersProxy: parametersProxy,
                                                                                hierarchiesCount: hierarchiesCount,
                                                                                hierarchiesProxy: hierarchiesProxy,
                                                                                dimensionType: dimensionValue,
                                                                                defaultMember: model.columnView.defaultMember,
                                                                                historyEnabled: model.columnView.historyEnabled,
                                                                                historyParam: model.columnView.historyParameter,
                                                                                historyParamName: model.columnView.historyParameter ? model.columnView.historyParameter.name : undefined,
                                                                                historyParameterList: historyParameterList,
                                                                                alwaysAggregateResult: model.columnView.executionHints.alwaysAggregateResult,
                                                                                preferredEngine: model.columnView.executionHints.preferredEngine,
                                                                                cacheInvalidationPeriod: model.columnView.executionHints.cacheInvalidationPeriod,
                                                                                runWithInvokerPrivileges: model.columnView.executionHints.runWithInvokerPrivileges,
                                                                                clientDependent: model.columnView.clientDependent,
                                                                                fixedClient: model.columnView.fixedClient,
                                                                                runWithValue: runWithValue,
                                                                                deprecated:model.columnView.deprecated,
                                                                                translationRelevant:model.columnView.translationRelevant,
                                                                                pruningTable:model.columnView.pruningTable
                                                                };

                                                                // empty row
                                                                this._detailsPane.setModelData("columnView", columnViewProperties);
                                                                this._detailsPane.setModelData("viewModel", model);

                                                                if (selectedNode) {
                                                                                viewNodeProperties = {
                                                                                                columns: [],
                                                                                                sharedColumns: undefined,
                                                                                                calculatedColumns: [],
                                                                                                restrictedColumns: [],
                                                                                                parameters: []
                                                                                };
                                                                                viewNodeProperties.name = selectedNode.name;
                                                                                if (this._isSemanticsNode) {
                                                                                                selectedNode.elements.foreach(function(element) {
                                                                                                                if (!viewNodeProperties.columnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                viewNodeProperties.columnsProxy = true;
                                                                                                                }
                                                                                                                if (element.calculationDefinition && element.measureType !== viewmodel.MeasureType.RESTRICTION) {
                                                                                                                                if (!viewNodeProperties.calculatedColumnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                                viewNodeProperties.calculatedColumnsProxy = true;
                                                                                                                                }
                                                                                                                                viewNodeProperties.calculatedColumns.push(element.name);
                                                                                                                }
                                                                                                                if (element.measureType === viewmodel.MeasureType.RESTRICTION) {
                                                                                                                                if (!viewNodeProperties.restrictedColumnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                                viewNodeProperties.restrictedColumnsProxy = true;
                                                                                                                                }
                                                                                                                                viewNodeProperties.restrictedColumns.push(element.name);
                                                                                                                }
                                                                                                                var temp = CalcViewEditorUtil.createModelForElement(element, selectedNode, model.columnView);

                                                                                                                if (temp.engineAggregation && temp.engineAggregation.toUpperCase() === "COUNT" && temp.aggregationBehavior && temp.aggregationBehavior
                                                                                                                                .toUpperCase() === "COUNT") {
                                                                                                                                // that._context.hasEngineAggregation =true;
                                                                                                                                model.columnView.hasEngineAggregation = true;
                                                                                                                }

                                                                                                                viewNodeProperties.columns.push(temp);
                                                                                                });
                                                                                                this._model.columnView.parameters.foreach(function(parameter) {
                                                                                                                if (!viewNodeProperties.parametersProxy && that.isBasedOnElementProxy(parameter, selectedNode)) {
                                                                                                                                viewNodeProperties.parametersProxy = true;
                                                                                                                }
                                                                                                                viewNodeProperties.parameters.push(parameter.name);
                                                                                                });

                                                                                } else {
                                                                                                selectedNode.elements.foreach(function(element) {
                                                                                                                if (!viewNodeProperties.columnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                viewNodeProperties.columnsProxy = true;
                                                                                                                }
                                                                                                                if (element.calculationDefinition && element.measureType !== viewmodel.MeasureType.RESTRICTION) {
                                                                                                                                if (!viewNodeProperties.calculatedColumnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                                viewNodeProperties.calculatedColumnsProxy = true;
                                                                                                                                }
                                                                                                                                viewNodeProperties.calculatedColumns.push(element.name);
                                                                                                                }
                                                                                                                if (element.measureType === viewmodel.MeasureType.RESTRICTION) {
                                                                                                                                if (!viewNodeProperties.restrictedColumnsProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                                viewNodeProperties.restrictedColumnsProxy = true;
                                                                                                                                }
                                                                                                                                viewNodeProperties.restrictedColumns.push(element.name);
                                                                                                                }
                                                                                                                viewNodeProperties.columns.push(CalcViewEditorUtil.createModelForElement(element, selectedNode, model.columnView));
                                                                                                });
                                                                                                this._model.columnView.parameters.foreach(function(parameter) {
                                                                                                                if (!parameter.isVariable) {
                                                                                                                                if (!viewNodeProperties.parametersProxy && that.isBasedOnElementProxy(parameter, selectedNode)) {
                                                                                                                                                viewNodeProperties.parametersProxy = true;
                                                                                                                                }
                                                                                                                                viewNodeProperties.parameters.push(parameter.name);
                                                                                                                }
                                                                                                });
                                                                                                selectedNode.elements.foreach(function(element) {
                                                                                                                if (!element.calculationDefinition && !element.measureType) {
                                                                                                                                if (!viewNodeProperties.mappingProxy && that.isBasedOnElementProxy(element, selectedNode)) {
                                                                                                                                                viewNodeProperties.mappingProxy = true;
                                                                                                                                }
                                                                                                                }
                                                                                                });
                                                                                                if (selectedNode.type === "Rank") {
                                                                                                                if (selectedNode.windowFunction) {
                                                                                                                                if (selectedNode.windowFunction.partitionElements) {
                                                                                                                                                selectedNode.windowFunction.partitionElements.foreach(function(partitionElement) {
                                                                                                                                                                if (!viewNodeProperties.rankNodeProxy && that.isBasedOnElementProxy(partitionElement, selectedNode)) {
                                                                                                                                                                                viewNodeProperties.rankNodeProxy = true;
                                                                                                                                                                }
                                                                                                                                                });
                                                                                                                                }
                                                                                                                                if (selectedNode.windowFunction.rankThreshold && selectedNode.windowFunction.rankThreshold.parameter) {
                                                                                                                                                if (!viewNodeProperties.rankNodeProxy && that.isBasedOnElementProxy(selectedNode.windowFunction.rankThreshold.parameter,
                                                                                                                                                                selectedNode)) {
                                                                                                                                                                viewNodeProperties.rankNodeProxy = true;
                                                                                                                                                }
                                                                                                                                }
                                                                                                                                if (selectedNode.windowFunction.orders && selectedNode.windowFunction.orders.count() > 0) {
                                                                                                                                                var orderFirstValue = selectedNode.windowFunction.orders._values[0];
                                                                                                                                                if (orderFirstValue && orderFirstValue.byElement) {
                                                                                                                                                                if (!viewNodeProperties.rankNodeProxy && that.isBasedOnElementProxy(orderFirstValue.byElement, selectedNode)) {
                                                                                                                                                                                viewNodeProperties.rankNodeProxy = true;
                                                                                                                                                                }
                                                                                                                                                }
                                                                                                                                }
                                                                                                                }
                                                                                                }
                                                                                }
                                                                                if (selectedNode.isStarJoin()) {
                                                                                                viewNodeProperties.sharedColumns = CalcViewEditorUtil.createModelForSharedColumns(selectedNode, model.columnView);
                                                                                }
                                                                                viewNodeProperties.columnsCount = viewNodeProperties.columns.length;
                                                                                if (viewNodeProperties.sharedColumns) {
                                                                                                viewNodeProperties.columnsCount = viewNodeProperties.columns.length + "," + viewNodeProperties.sharedColumns.length;
                                                                                }if (selectedNode.isDataSource === true || selectedNode.isDataSource === "true") {
						if (selectedNode.inputs.getAt(0) !== undefined && selectedNode.inputs.getAt(0).getSource() !== undefined) {

							var aData = [];
							selectedNode.inputs.getAt(0).getSource().elements.foreach(function(element) {

								var dataTypeString = element.inlineType ? element.inlineType.primitiveType : undefined;
								if (dataTypeString) {
									if (element.inlineType.length) {
										dataTypeString = dataTypeString + "(" + element.inlineType.length;
										if (element.inlineType.scale) {
											dataTypeString = dataTypeString + "," + element.inlineType.scale;
										}
										dataTypeString = dataTypeString + ")";
									}
								}
								var ob = {
									name: element.name,
									dataTypeString: dataTypeString
								};
								aData.push(ob);
							});
							viewNodeProperties.columns = aData;
						}
					}
                                                                                this._detailsPane.setModelData("viewNode", viewNodeProperties);
                                                                }
                                                },
                                                isBasedOnElementProxy: function(element, selecetdNode) {
                                                                if (element) {
                                                                                var results = CalcViewEditorUtil.isBasedOnElementProxy({
                                                                                                object: element,
                                                                                                columnView: this._model.columnView,
                                                                                                viewNode: selecetdNode
                                                                                });
                                                                                if (results) {
                                                                                                return true;
                                                                                }
                                                                }
                                                                return false;
                                                },

                                                open: function() {
                                                                var that = this;

                                                                return that._document.getContent().then(function(value) {
                                                                                if (!value) {
                                                                                                // should not happen
                                                                                                throw new Error("unable to open emtpy document");
                                                                                }
                                                                                if (!that._model || that._model.$isDisposed()) return;

                                                                                if (value === that._flushedContent) {
                                                                                                return that._detailsPane.reopen().then(function() {
                                                                                                                return that._context.event.fireOpened({
                                                                                                                                document: that._document
                                                                                                                });
                                                                                                });
                                                                                }

                                                                                that._flushedContent = value;
                                                                                that._changed = false;
                                                                                try {
                                                                                                that._documentProperties = RepositoryXmlParser.parseScenario(value, that._model, true);
                                                                                } catch (e) {
                                                                                                if (e instanceof modelbase.UnsupportedOperationException) {
                                                                                                                var featureName;
                                                                                                                if (e.objects && e.objects.length > 0) {
                                                                                                                                featureName = e.objects[0];
                                                                                                                                if (typeof featureName !== "string") {
                                                                                                                                                featureName = undefined;
                                                                                                                                }
                                                                                                                }
                                                                                                                var message;
                                                                                                                if (featureName) {
                                                                                                                                message = resourceLoader.getText("txt_encountered_unsupported_feature_with_name") + featureName + "." + resourceLoader.getText(
                                                                                                                                                "txt_open_model_text_editor");
                                                                                                                } else {
                                                                                                                                message = resourceLoader.getText("txt_encountered_unsupported_features") + "." + resourceLoader.getText(
                                                                                                                                                "txt_open_model_text_editor");
                                                                                                                }
                                                                                                                sap.ui.commons.MessageBox.show(message,
                                                                                                                                sap.ui.commons.MessageBox.Icon.INFORMATION,
                                                                                                                                resourceLoader.getText("tit_unsupported_feature"), [sap.ui.commons.MessageBox.Action.OK],
                                                                                                                                function() {
                                                                                                                                                that._context.service.content.close(that._document, that._context.self).done();
                                                                                                                                },
                                                                                                                                sap.ui.commons.MessageBox.Action.OK);
                                                                                                                return Q();
                                                                                                } else {
                                                                                                                if (cons) {
                                                                                                                                cons.log(e);
                                                                                                                }
                                                                                                                sap.ui.commons.MessageBox.show(e instanceof Object ? e.toString() : e,
                                                                                                                                sap.ui.commons.MessageBox.Icon.ERROR,
                                                                                                                                resourceLoader.getText("tit_error_loading_document", [that._document.getTitle()]), [sap.ui.commons.MessageBox.Action.OK],
                                                                                                                                function() {
                                                                                                                                                that._context.service.content.close(that._document, that._context.self).done();
                                                                                                                                },
                                                                                                                                sap.ui.commons.MessageBox.Action.OK);
                                                                                                                return Q();
                                                                                                }
                                                                                }
                                                                                if (that._documentProperties.fixedContent) {
                                                                                                if (cons) {
                                                                                                                cons.log("document " + that._document.getKeyString() + " contains mixed line endings, changed to " +
                                                                                                                                (that._documentProperties.detectedLineEndings === "\n" ? "LF" : "CRLF"));
                                                                                                }
                                                                                }

                                                                                that._model.$finishLoading();
                                                                                
//                                                                                that._reloadContent(true).then(function() {
//                                                                                                return that._context.event.fireOpened({
//                                                                                                                document: that._document
//                                                                                                });
//                                                                                }).done();

                                                                                return that._context.event.fireOpened({
                                                                                                document: that._document
                                                                                });
                                                                

                                                                                //: Test code to check propagate DataType To DefaultNode
                                                                                /*setTimeout(function() {
                        // Call propagateDataTypeToDefaultNode after 2 seconds; Does not look good approack;
                        // need to find alternative to call it as callback once ProxyResolver finishes resolving enities
                        try {
                            // RepositoryXmlParser.propagateDataTypeToDefaultNode(that._model.columnView);
                        } catch (e) {}
                    }, 2000);*/

                                                                });
                                                },

                                                close: function() {
                                                                var that = this;
                                                                return this._detailsPane.close().then(function() {
                                                                                that._model.$dispose();
                                                                                that._model = null;
                                                                                that._undoManager = null;
                                                                                that._currentNode = null;
                                                                                that._document = null;
                                                                                that._flushedContent = null;
                                                                                // do not set context to null since parts of the UI might still be alive when the editor is closed
                                                                                // that._context = null;
                                                                                // see also destroy for cleaup of UI5 controls
                                                                });
                                                },

                                                flush: function() {
                                                                var that = this;
                                                                if (this._model.$isLoading() || !this._changed) {
                                                                                return Q();
                                                                }
                                                                /*if (!this._isScriptNode) {
                    var columnView = this._model.columnView;
                    var viewNode = columnView.getDefaultNode();
                    var autoAssignCommands = CalcViewEditorUtil.autoAssignCommands(commands, viewNode, columnView);
                    if (autoAssignCommands.length > 0) {
                        this._undoManager.execute(new modelbase.CompoundCommand(autoAssignCommands));
                    }
                }*/
                                                                var xmlDocument = RepositoryXmlRenderer.renderScenario(this._model, this._documentProperties.detectedLineEndings);
                                                                this._flushedContent = XmlSerializer.serializeToString(xmlDocument);
                                                                var q = Q.defer();
                                                                this._document.setContent(this._flushedContent, this._context.self)
                                                                                .then(function() {
                                                                                                if (!that._document.isDirty()) {
                                                                                                                // the model has been changed (this._changed === true), however, the flushed content does not have changed since the last save
                                                                                                                // this might happen if users manually undo  a change, e.g. check and uncheck the same checkbox
                                                                                                                that._flushedContent += " ";
                                                                                                                return that._document.setContent(that._flushedContent, that._context.self);
                                                                                                }
                                                                                })
                                                                                .then(function() {
                                                                                                that._changed = false;
                                                                                                q.resolve();
                                                                                }).done();
                                                                return q.promise;
                                                },

                                                destroy: function() {
                                                                if (this._display !== null) {
                                                                                this._display.destroy(true);
                                                                }
                                                                this._display = null;
                                                                this._detailsPane = null;
                                                                this._editorLayout = null;
                                                },

                                                hasUndo: function() {
                                                                return this._undoManager.hasUndo();
                                                },

                                                hasRedo: function() {
                                                                return this._undoManager.hasRedo();
                                                },

                                                undo: function() {
                                                                return this._undoManager.undo();
                                                },

                                                redo: function() {
                                                                return this._undoManager.redo();
                                                },

                                                markClean: function() {
                                                                return this._undoManager.markClean();
                                                },

                                                isClean: function() {
                                                                return this._undoManager.isClean();
                                                },

                                                getSelection: function() {
                                                                if (this._document && this._detailsPane) {
                                                                                return [{
                                                                                                document: this._document,
                                                                                                pane: this._detailsPane.getSelectedContent()
                    }];
                                                                } else {
                                                                                return [];
                                                                }
                                                },
                                                setCurEditor: function(curEditor) {
				CalcViewEditorUtil.setCurEditor(curEditor); //current calculation view editor
				this._detailsPane.curEditor = curEditor;
			}

                                };
                                return CalcViewEditor;
                });
