/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["require"],
    function(require) {
        "use strict";

        return {

            execute: function() {

                var that = this;
                return that.context.service.selection.assertNotEmpty().then(function(aSelection) {
                    var folderDocument = aSelection[0].document;
                    return folderDocument.getFolderContent().then(function(aEntries) {

                        require(["../dialogs/NewAnalyticPrivilegeDialog"], function(NewAnalyticPrivilegeDialog) {
                            var fCreateCallback = function(sName, sLabel, sType,namespace) {
                                that._createFile(folderDocument, sName, sLabel, sType,namespace);

                            };
                            var oNewApeDialog = new NewAnalyticPrivilegeDialog({
                                createCallback: fCreateCallback,
                                folderDocument: aSelection[0].document,
                                entries: aEntries,
                                contextMenu: true,
                                context: that.context
                            });
                            oNewApeDialog.openDialog();
                        });

                    });
                });


            },

            _createFile: function(oFolder, sFileName, sLabel, sType,namespace) {
                var that = this;
                require(["../model/AnalyticPrivilegeModel", "../model/AnalyticPrivilegeXmlRenderer", "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/base/XmlSerializer"], function(AnalyticPrivilegeModel, AnalyticPrivilegeXmlRenderer, XmlSerializer) {
                    var sExtension = ".hdbanalyticprivilege";
                    oFolder.createFile(sFileName + sExtension).then(function(fileDocument) {

                        if (fileDocument) {
                            var oModel = new AnalyticPrivilegeModel.AnalyticPrivilegeModel(true);
                            oModel.createAnalyticPrivilege({
                                name: sFileName,
                                id:namespace +"::"+ sFileName
                            });
  
                            oModel.analyticPrivilege.label = sLabel;
                            if(sType === AnalyticPrivilegeModel.PrivilegeType.SQL_ANALYTIC_PRIVILEGE){
                                oModel.analyticPrivilege.privilegeType = AnalyticPrivilegeModel.PrivilegeType.SQL_ANALYTIC_PRIVILEGE;
                            } else if (sType === AnalyticPrivilegeModel.PrivilegeType.ANALYTIC_PRIVILEGE){
                                oModel.analyticPrivilege.privilegeType = AnalyticPrivilegeModel.PrivilegeType.ANALYTIC_PRIVILEGE;
                            } else {
                                oModel.analyticPrivilege.privilegeType = undefined;  
                            }
                            //Secured Model is neeeded by XML Renderer
                            oModel.analyticPrivilege.createSecuredModels();
                            var doc = AnalyticPrivilegeXmlRenderer.renderAnalyticPrivilege(oModel);
                            var content = XmlSerializer.serializeToString(doc);

                            return fileDocument.setContent(content).then(function() {							
								return Q.all([
										fileDocument.save(),
                                        that.context.service.document.open(fileDocument),
                                        that.context.service.repositorybrowser.setSelection(fileDocument, true)
                                    ]);
                              /*  return that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider) {
                                    return Q.all([
                                        utilityProvider.saveDocumentInactive(fileDocument, true),
                                        that.context.service.document.open(fileDocument),
                                        that.context.service.repositorybrowser.setSelection(fileDocument, true)
                                    ]);
                                }); */
                            });
                        }
                    }).done();

                });

            },

            isAvailable: function() {
                return true;
            },

            isEnabled: function() {
                return this.context.service.repositorybrowserUtils.isSingleFolderNotRootSelection(this.context.service);
            }
        };
    });
