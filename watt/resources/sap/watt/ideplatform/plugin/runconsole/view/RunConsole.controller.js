sap.ui.controller("sap.watt.ideplatform.plugin.runconsole.view.RunConsole", {

    // Sign for not executables folders (such as mta folders or "local" folder)
    NOT_RUNNABLE: "NotRunnable",
    // Sign for not existing url
    NOT_EXISTING_URL: "",
    // Represent the format of the log message in the console
    _sFormat: null,
    // The max line count allow in the console
    _iMaxLineCount: null,
    // Service context
    _oContext: null,
    // Run Console service
    _oRunConsoleService: null,
    // Enum represent the possible status for an application
    _eStatus: {
        "NOT_RUNNABLE": "Not Runnable",
        "NOT_STARTED": "Not Started",
        "NEW": "New",
        "RUNNING": "Running",
        "FAILED": "Failed",
        "STOPPED": "Stopped",
        "CANCELLED": "Cancelled"
    },

    /**
     * Init the controller (called once)
     * */
    onInit: function () {
        var oView = this.getView();
        this._oContext = oView.getViewData().context;
        this._oRunConsoleService = this._oContext.service.runconsole;
        var oRunConsoleModel = new sap.ui.model.json.JSONModel({});
        oView.setModel(oRunConsoleModel);
        var oEmptyElement = {
            sLogs: "",
            eStatus: this._eStatus.NOT_RUNNABLE,
            sUrl: this.NOT_EXISTING_URL
        };
        this._addEntityToModel(this.NOT_RUNNABLE, oEmptyElement);
        oView.bindElement("/" + this.NOT_RUNNABLE);
    },

    /**
     * Handling the shutdown button press event.
     * Here we need to call to runRegistry.stop()
     * @param oEvent
     */
    onShutDownPress: function (oEvent) {
        var that = this;
        // Get project name
        var oSource = oEvent.getSource();
        var bindedElement = oSource.getBindingContext();
        var sProjectId = bindedElement.getPath();
        if (sProjectId !== "/" + this.NOT_RUNNABLE) {
            // Convert projectPath to ProjectID - replace . with /
            var sProjectPath = sProjectId.split(".").join("/");
            // Get process id of running process from Model
            var sProcessId = bindedElement.getProperty("sRunningProcessId");
            if (sProcessId) {
                // Call for stop method from run console
                this._oRunConsoleService.stopRun(sProcessId, sProjectPath).then(function (sResult) {
                	if(sResult){
                		that.updateApplicationMode(sProjectPath, that.NOT_EXISTING_URL, "url");
                	}                    
                }).done();
            }
        }
    },

    /**
     * Adding a new log message into the model.
     * If the the current project selected in the repository browser is the
     * one that gets the message - it will display the message online.
     * @param oMessage - the message object contains: timestamp, tag, message.
     * @param sCurrentPath - the path of the latest document selected in the repository browser.
     */
    addMessage: function (oMessage) {
        var sConvertedReceiverPath = this._convertPath(oMessage.tag);
        // Retrieving the property of this project from the model
        var oModel = this.getView().getModel();
        var oProjectLog = oModel.getProperty("/" + sConvertedReceiverPath);
        if (!oProjectLog) {
            oProjectLog = {
                sLogs: "",
                eStatus: this._eStatus.NOT_STARTED,
                sUrl: this.NOT_EXISTING_URL,
                iLineCount: 0,
                sRunningProcessId: null
            };
            this._addEntityToModel(sConvertedReceiverPath, oProjectLog);
        }
        // Getting the previous logs
        var sLogs = oProjectLog.sLogs;
        // If there are more lines than the maximum, cut the first line before adding a new one
        if (oProjectLog.iLineCount >= this._iMaxLineCount) {
            sLogs = this._cutLine(sLogs);
            oProjectLog.iLineCount--;
        }
        // Create the requested format
        var sMessage = this._createRequest(oMessage.tag, oMessage.timestamp, oMessage.message);
        // Create a div containing the log message
        sMessage = jQuery.sap.encodeHTML(sMessage);
        sLogs += "<div class=\"" + oMessage.level + " " + "selectable\"" + ">" + sMessage + "</div>";
        // Increase the line count
        oProjectLog.iLineCount++;
        // Set the new content
        oProjectLog.sLogs = sLogs;
        // If the selected project is the same as the receiver project - show it immediately in the console
        var sBindedPath = this.getView().getBindingContext().getPath().substring(1);
        if (sConvertedReceiverPath === sBindedPath) {
            this.clearConsole();
            this.getView().bindElement("/" + sConvertedReceiverPath);
        }
        // Scroll to view the newest messages
        this._scrollToBottom();
    },

    /**
     * Switching the content of the console according to the project selected in the repository browser.
     * @param sDocumentPath - the path of the selected document
     */
    contextSwitch: function (sDocumentPath) {
    	var that = this;
        var sDocumentPathModel = this._convertPath(sDocumentPath);
        var oModel = this.getView().getModel();
        var oElement = oModel.getProperty("/" + sDocumentPathModel);
        if (!oElement) {
        	//get initial status of application
        	return this._oRunConsoleService.getInitialStatus(sDocumentPath).then(function (oStatus) {
        		if(oStatus && !_.isEmpty(oStatus)){
        			oElement = {
        	                sLogs: "",
        	                eStatus: that._eStatus[oStatus.status],
        	                sUrl: oStatus.url? oStatus.url: that.NOT_EXISTING_URL,
        	                iLineCount: 0,
        	                sRunningProcessId: oStatus.sProcessId ? oStatus.sProcessId: null

        	            };
        		}else{
        			 oElement = {
        		                sLogs: "",
        		                eStatus: that._eStatus.NOT_STARTED,
        		                sUrl: that.NOT_EXISTING_URL,
        		                iLineCount: 0,
        		                sRunningProcessId: null

        		            };
        		}
        		that._addEntityToModel(sDocumentPathModel, oElement);
        		that.clearConsole();
        		that.getView().bindElement("/" + sDocumentPathModel);
        		return;
        	});          
        }else{
        	this.clearConsole();
            this.getView().bindElement("/" + sDocumentPathModel);
            return Q();
        }
        
    },

    /**
     * Deleting an existing key-value pair object from the model.
     * @param sFDocumentPath - the path of the selected document
     */
    deleteModelEntity: function (sDocumentPath) {
        sDocumentPath = this._convertPath(sDocumentPath);
        var oModel = this.getView().getModel();
        var oElement = oModel.getProperty("/" + sDocumentPath);
        if (oElement) {
            var oData = oModel.getData();
            oData[sDocumentPath] = null;
            oModel.setData(oData);
        }
    },

    /**
     * Clearing the content of the console.
     * */
    clearConsole: function () {
        var oBodyContainers = this._getBodyContainers();
        if (oBodyContainers) {
            oBodyContainers.oHtmlWriter.destroy();
            oBodyContainers.oVerticalLayout.removeAllContent();
            oBodyContainers.oHtmlWriter = new sap.ui.core.HTML({
                content: "{sLogs}"
            });
            oBodyContainers.oVerticalLayout.addContent(oBodyContainers.oHtmlWriter);
        }
    },

    /**
     * Updates all kinds of application modes in the model
     * @param sProjectPath - the path of the application in the workspace
     * @param sMode - the mode (url/status) to update in the model
     * @param sDelegate - the function to activate that updates the model
     */
    updateApplicationMode: function (sProjectPath, sMode, sDelegate) {
        var oView = this.getView();
        var oModel = oView.getModel();
        var sConvertedProjectPath = this._convertPath(sProjectPath);
        var oProjectLog = oModel.getProperty("/" + sConvertedProjectPath);
        var fModeToUpdate = this._updateApplicationModel[sDelegate];
        if (oProjectLog && fModeToUpdate) {
            fModeToUpdate.apply(this, [oProjectLog, sMode]);
            var sBindedPath = oView.getBindingContext().getPath().substring(1);
            if (sConvertedProjectPath === sBindedPath) {
                var oData = oModel.getData();
                oData[sConvertedProjectPath] = oProjectLog;
                oModel.setData(oData);
                oView.bindElement("/" + sConvertedProjectPath);
            }
        }
    },

    /**
     * Converting the project path to have the form of "parentFolder.applicationFolder" (to adjust the MTA)
     * @param sPath - the formatted path of the selected document
     * @returns {new string}
     * @private
     */
    _convertPath: function (sPath) {
        if (sPath !== this.NOT_RUNNABLE) {
            sPath = (sPath[0] === "/") ? sPath.substring(1) : sPath;
            return sPath.split("/").join(".");
        }
        return sPath;
    },

    /**
     * Adding a new key-value pair object to the model.
     * @param sKey - the formatted path of the current project
     * @param oValue - the object to add to the model
     * @private
     */
    _addEntityToModel: function (sKey, oValue) {
        var oModel = this.getView().getModel();
        var oData = oModel.getData();
        oData[sKey] = oValue;
        oModel.setData(oData);
    },

    /**
     * Scrolling the console overflow to the bottom to view the newest messages.
     * @private
     */
    _scrollToBottom: function () {
        setTimeout(function () {
            var myDiv = $("#runConsoleCenter");
            if (myDiv) {
                myDiv.scrollTop(myDiv[0].scrollHeight);
            }
        }, 100);
    },

    /**
     * Retrieving the control that contains the logs
     * @returns {{oVerticalLayout: sap.ui.core.Control, oHtmlWriter: *}}
     * @private
     */
    _getBodyContainers: function () {
        var oVerticalLayout = $("#runConsoleContainer").control()[0];
        if (oVerticalLayout) {
            var oHTML = oVerticalLayout.getContent()[0];
            return {
                oVerticalLayout: oVerticalLayout,
                oHtmlWriter: oHTML
            };
        }
        return null;
    },

    /**
     * Cutting the first message before adding a new one.
     * @param sLogs - the logs of the current project
     * @returns {string|*}
     * @private
     */
    _cutLine: function (sLogs) {
        var iIndex = sLogs.indexOf("</div>");
        if (iIndex >= 0) {
            return sLogs.substr(iIndex + 6, sLogs.length);
        }
    },

    /**
     * Creating the format of the log message.
     * @param sProjectPath - the name/path of the project
     * @param oTimestamp - the time of the message
     * @param sLog - the encoded message
     * @returns {the formatted message}
     * @private
     */
    _createRequest: function (sProjectPath, oTimestamp, sLog) {
        var sMessage = this._sFormat;
        sMessage = sMessage.replace("$TIME", oTimestamp.toLocaleTimeString());
        sMessage = sMessage.replace("$TAG", sProjectPath);
        sMessage = sMessage.replace("$MESSAGE", sLog);
        return sMessage;
    },

    /**
     * Object that contains methods who change the mode of an application in the model
     */
    _updateApplicationModel: {
        status: function (oProjectLog, sStatus) {
            oProjectLog.eStatus = this._eStatus[sStatus];
        },
        url: function (oProjectLog, sUrl) {
            oProjectLog.sUrl = sUrl;
        },
        processId: function (oProjectLog, sProcessId) {
            oProjectLog.sRunningProcessId = sProcessId;
        }
    }
});