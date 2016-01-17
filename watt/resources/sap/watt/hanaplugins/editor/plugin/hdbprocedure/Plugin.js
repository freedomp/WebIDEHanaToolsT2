define(["./constants/HDBProcedureConstants"],
    function(HDBProcedureConstants) {
        return {

            _oAceeditorService: null,
            _oEditorDocument: null,
            _oEditorSession: null,
            //        _oSessionAdapter: null,
            _sSource: null,

            initialize: function() {
                // this.context.service.aceeditor.setModuleUrl('ace/mode/hdbprocedure',jQuery.sap.getModulePath("sap.hana.ide.editor.plugin.editors.hdbprocedure.mode") + "/mode-hdbprocedure.js").done();
            },

            onOpened: function(event) {
                //SQL PARSER

                // var oCurrentEditorInstance = this._getCurrentEditorInstance(event);
                // var that = this;
                // var sCurrentPath;

                // if (oCurrentEditorInstance && oCurrentEditorInstance.getUI5Editor) {
                //  oCurrentEditorInstance.getUI5Editor().then(function(oUI5Editor) {
                //      if (oUI5Editor) {
                //          oUI5Editor.attachEditorGutterMousedown(that._onEditorGutterMousedown, this);
                //          sCurrentPath = oUI5Editor.getCurrentFilePath();
                //          if (sCurrentPath && sCurrentPath.match(/\.hdbprocedure$/)) {
                //                          return that.context.service.sqlparser.setSource(oUI5Editor.getValue(), oUI5Editor, "CREATE\n");
                //          }
                //      }
                //  }).done();
                // }
            },

            onSelectionChange: function(event) {
                var that = this;

                //set aceeditor instance
                var oCurrentEditorInstance = this._getCurrentEditorInstance(event);
                if (!oCurrentEditorInstance) {
                    return;
                }
                if (this._oAceeditorService !== oCurrentEditorInstance) {
                    this._oAceeditorService = oCurrentEditorInstance;
                    //this._registerEvents();
                }
                if (!this._oAceeditorService) {
                    return;
                }
                this._oAceeditorService.getUI5Editor().then(function(oUI5Editor) {
                    if (oUI5Editor) {
                        //set current document instance
                        var oCurrentDocument = event.params.selection[0] ? event.params.selection[0].document : undefined;
                        if (oCurrentDocument) {
                            oCurrentDocument.getProject().then(function(oProjectDocument) {
                                var path = oProjectDocument.getEntity().getFullPath();
                                that.context.service.chebackend.XS2ServicesDAO.getAllRequireServices(path).then(function(allServices) {

                                    var serviceName = null;
                                    for (var i = 0; i < allServices.length; i++) {
                                        if (allServices[i].resourceType === "com.sap.xs.hdi-container") {
                                            serviceName = allServices[i].xsaName;
                                            break;
                                        }
                                    }
                                    that.context.service.sqlcodecompletion.setCurrentService(serviceName);
                                });
                            });
                        }
                        if (oCurrentDocument && oCurrentDocument !== that._oEditorDocument) {
                            that._oEditorDocument = oCurrentDocument;
                            var fileExtension = that._oEditorDocument.getEntity().getFileExtension();
                            if (fileExtension === HDBProcedureConstants.HDBPROC_FILE_EXTENSION) {
                                //SQL PARSER
                                // that.context.service.sqlparser.setTokenTooltip(oUI5Editor, "CREATE\n");
                                //set current document EditorSession
                                that._oEditorSession = oUI5Editor.getSession();
                                //                            that._oSessionAdapter = new SessionAdapter(that._oEditorSession, that.context);
                            }
                        }
                    }
                }).done();
            },

            _getCurrentEditorInstance: function(event) {
                var oCurrentEditorInstance = event.params.owner || event.source;
                if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
                    return oCurrentEditorInstance;
                }
                return null;
            },

            // Set mousedown x and mousedown y for get line number. This is used for enable and disable breakpoint in procedure debug
            _onEditorGutterMousedown: function(oEvent) {
                // Handle here only mouse right click button.
                if (oEvent.mParameters.mouseEvent.getButton() !== 2) {
                    return;
                }

                window.mousedownX = oEvent.mParameters.mouseEvent.domEvent.clientX;
                window.mousedownY = oEvent.mParameters.mouseEvent.domEvent.clientY;
            }
        };
    });