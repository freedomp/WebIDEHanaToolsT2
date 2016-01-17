define(["sap/watt/core/Proxy", "sap.watt.platform.externalcommand/ui/CommandsConfirmationDialog"], function(Proxy, confirmationDialog) {

	var ExternalCommand = function(sId, mConfig, oContext, oProxy) {
		this._sId = sId;
		this._mConfig = mConfig;
		this._oContext = oContext;
		this._oProxy = oProxy;
	};

    // A list of white-listed commands.
    // Each command uses configuration in its plugin.json to add itself. 
    // The configuration includes the following properties: id, description and externalCommand.
    // This white listed object is build from the externalCommand property
    // ********** White-listed commands MUST be approved by security expert **********
    var _whiteListedCommands = {"sap.watt.saptoolsets.fiori.common.fioriexternalcommands/extendproject/ExtendProject": true,
                                "sap.watt.ideplatform.externalcommands/cloneandopen/CloneAndOpen": true};

	/**
	 *
	 * every external command must implement this method in order to supply its logic
	 *
	 * @param params
	 * @returns
	 */
	ExternalCommand.prototype.execute = function(params) {
		return this._oProxy.execute(params).then(function(result) {
			return Q(result);
		}).fail(function(error) {
			console.log(error);
		});
	};

	/**
	 * returns the commands id.
	 *
	 * @returns
	 */
	ExternalCommand.prototype.getCommandName = function() {
		return this._mConfig.id;
	};

	ExternalCommand.prototype.getDescription = function() {
		var sParams = ExternalCommand._mInputParams[this._mConfig.id];
		return this._mConfig.description + "\n" + context.i18n.getText("i18n", "ExternalCommand_Command_parameters") + "\n" + JSON.stringify(
			sParams, null, 2) + "\n";
	};
	ExternalCommand.prototype.getParameters = function() {
		return ExternalCommand._mInputParams[this._mConfig.id];
	};
	/**
	 * =============================
	 * STATIC METHODS
	 * =============================
	 */
	ExternalCommand._mExternalCommands = {};
	ExternalCommand._mInputParams = null;
	var context;
	var NO = "NO";

	ExternalCommand.getCommandById = function(sId) {
		return this._mExternalCommands[sId];
	};

	ExternalCommand.register = function(sId, mConfig, oContext) {
		if (this._mExternalCommands[sId]) {
			oContext.service.log.error("ExternalCommand", sId + " " + oContext.i18n.getText("i18n", "ExternalCommand_already_Registered"), ["user"])
				.done();
		} else {
			var mNewConfig = {
				id: null,
				parameters: null
			};

			if (typeof mConfig === "string") {
				mNewConfig.externalCommand = mConfig;
			} else {
				mNewConfig = jQuery.extend(this._mConfig, mConfig);
			}

			var that = this;
			if (mNewConfig.externalCommand instanceof Proxy) {
				var oExternalCommand = new ExternalCommand(sId, mNewConfig, oContext, mNewConfig.externalCommand);
				that._mExternalCommands[sId] = oExternalCommand;
				return oExternalCommand;
			} else {
				throw new Error(oContext.i18n.getText("i18n", "ExternalCommand_instance_of_Proxy"));
			}
		}

	};

	//recursive external command execution
	var executeCommand = function(index, commandIds) {
		if ((index) < commandIds.length) {
			var externalCommand = ExternalCommand._mExternalCommands[commandIds[index]];

			if (externalCommand) { //validate if the external command is known
				// log in browser console
				console.log(context.i18n.getText("i18n", "ExternalCommand_exe", [commandIds[index]]));

				// log in IDE console
				context.service.log.info(context.i18n.getText("i18n", "ExternalCommand_title"),
					context.i18n.getText("i18n", "ExternalCommand_exe", [commandIds[index]]), ["user"]).done();

				// display lite notification
				context.service.usernotification.liteInfo(context.i18n.getText("i18n", "ExternalCommand_exe", [commandIds[index]])).done();

				var param = ExternalCommand._mInputParams[commandIds[index]]; //extract the parameter for execution
				return externalCommand.execute(param).then(function() {
					// log in browser console
					console.log(context.i18n.getText("i18n", "ExternalCommand_finish", [commandIds[index]]));

					// log in IDE console
					context.service.log.info(context.i18n.getText("i18n", "ExternalCommand_title"),
						context.i18n.getText("i18n", "ExternalCommand_finish", [commandIds[index]]), ["user"]).done();

					// display lite notification
					context.service.usernotification.liteInfo(context.i18n.getText("i18n", "ExternalCommand_finish", [commandIds[index]])).done();

					return executeCommand(index + 1, commandIds);
				});
			} else {
				return executeCommand(index + 1, commandIds);
			}
		} else {
			ExternalCommand._mInputParams = null; //clear the input params
			return Q();
		}

	};

	/**
	 * Reads the hash tags from the URL and clears it evry time.
	 * This makes injection attack harder.
	 *
	 *
	 */
	var getInputFromHash = function() {
		var hash = window.location.hash.slice(1);
		removeHash();
		return hash;
	};

	var getExternalCommandDescription = function(externalCommand) {
		return externalCommand.getDescription().then(function(descrition) {
			return descrition;
		});
	};

	var displayConfirmation = function(commandIds) {

		var aCommands = [];
		var i = 0;
	
		for (i = 0; i < commandIds.length; i++) {
		    if(ExternalCommand._mExternalCommands[commandIds[i]]){
			aCommands.push(ExternalCommand._mExternalCommands[commandIds[i]]);
		    }
		}

		if (aCommands.length === 0) {
			return Q({
				sResult: NO,
				bResult: NO
			});
		}
		return confirmationDialog.open(aCommands, context).then(function(oRet) {
			return oRet;
		});

	};

    var removeHash = function() {
        // Build the current URL without the hash.
        // Note: simply concatenating the location's pathname and search doesn't work if the path is '//'
        // since this has a sepcial meaning (it is treated as full url, not relative; look it up in Google)
        var sUrlNoHash = window.location.href;
        var indexOfHash = window.location.href.indexOf('#');
        if (indexOfHash != -1) {
            sUrlNoHash = sUrlNoHash.substring(0, indexOfHash);
        }
        history.replaceState("", document.title, sUrlNoHash);
        history.pushState("", document.title, sUrlNoHash);
    };

    var invokeExecution = function(commandIds) {
		return context.service.perspective.getCurrentPerspective().then(function(currentPerspective) {
			if ("development" === currentPerspective) {
			    return executeCommand(0, commandIds);    
			} else {
        		return context.service.perspective.renderPerspective("development").then(function() {
        			return executeCommand(0, commandIds);
        		});			    
			}
		});        
    };

    // Return true if ALL the commands are white listed
    var areAllCommandsWhiteListed = function(commandIds) {
        var whiteListedCount = 0;
        jQuery.each(commandIds, function(index, commandId) {
            var commandConf = ExternalCommand._mExternalCommands[commandId];
			if (commandConf && commandConf._mConfig && commandConf._mConfig.externalCommand && 
			    _whiteListedCommands[commandConf._mConfig.externalCommand._sName] === true) {
                whiteListedCount++;
			}
		});
		return whiteListedCount === commandIds.length;
    };

	var handleInput = function(input) {
		if (input) {
			var objAsString = decodeURIComponent(input);
			try {
				ExternalCommand._mInputParams = JSON.parse(objAsString); //security validation
			} catch (err) {
				context.service.log.info(context.i18n.getText("i18n", "ExternalCommand_title"),
					context.i18n.getText("i18n", "ExternalCommand_Illegal"), ["user"]).done();
				console.log(context.i18n.getText("i18n", "ExternalCommand_Illegal") + err);
				return;
			}

			var commandIds = Object.keys(ExternalCommand._mInputParams);
			if (areAllCommandsWhiteListed(commandIds)) {
                // White listed, so execute immediatly
                invokeExecution(commandIds).done();
			} else {
                //show pop-up to the user - continue yes/no
                displayConfirmation(commandIds).then(function(oRet) {
                    if (oRet.sResult === NO) {
                        return Q();
                    }
                    return invokeExecution(commandIds);
                }).done();
			}
		}
	};

	return {

		/**
		 * event notification when the RDE has finished loading
		 *
		 * @param oEvent
		 * @returns
		 */
		onAfterStarted: function(oEvent) {
			var input = getInputFromHash();
			if (input) {
				handleInput(input);
			}
			//register to navigation event
			$(window).on("hashchange", function() {
				var inputFromUrl = getInputFromHash();
				if (inputFromUrl) {
					handleInput(inputFromUrl);
				}
			});
		},

		/**
		 * Register a mExternalCommand based on the settings defined in its plugin.json
		 *
		 * @param mConfig {object} the settings of the ExternalCommand to register
		 */
		configure: function(mConfig) {

			var that = this;
			context = that.context;
			jQuery.each(mConfig.externalCommands, function(iIndex, mExternalCommand) {
				ExternalCommand.register(mExternalCommand.id, mExternalCommand, that.context);
			});
		},

		/**
		 * Retrieve all the registered external commands
		 *
		 * @return {object} a map holds all the mExternalCommand settings by the template names
		 */
		getExternalCommands: function() {
			return ExternalCommand._mExternalCommands;
		}

	};

});