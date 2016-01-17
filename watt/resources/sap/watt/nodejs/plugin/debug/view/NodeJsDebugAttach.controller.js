(function() {
	"use strict";
	sap.ui.controller("sap.xs.nodejs.debug.view.NodeJsDebugAttach", {

		_context: null,
		_selectedProject: null,

		_advancedAttachMode: false,

		_configure: function _configure(context, selectedProject) {
			this._context = context;
			this._selectedProject = selectedProject;

			this._advancedAttachMode = this._getUrlParam("sap-ide-nodejs-attachmode") // if this is set
				? this._getUrlParam("sap-ide-nodejs-attachmode") === "advanced" // then take this explict value
				: !!this._getUrlParam("sap-ide-dev"); // otherwise check development mode
		},

		_logError: function _logError(message) {
			this._context.service.log.error(message, ["system"]).done();
		},

		_getUrlParam: function _getUrlParam(name, defaultValue) {
			var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
			if (!results) { return defaultValue; }
			return results[1] || defaultValue;
		},

		_getProjectsWithDebugURL: function _getProjectsWithDebugURL() {
			var nodejsLauncher = this._context.service.nodejsLauncher;
			return nodejsLauncher.getRunnersByProject().then(function(runnersByProjectPath) {
				// map to project wrappers with a 'path' property
				var projectWrappers = Object.keys(runnersByProjectPath).map(function(projectPath) {
					return {path: projectPath};
				});
				// map projects to promises that fill the debug URL
				return Q.all(projectWrappers.map(function(project) {
					var runners = runnersByProjectPath[project.path];
					if (runners && runners.length > 0) {
						return nodejsLauncher.getDebugUri(runners[0]).then(function(uri) {
							project.debugURL = uri;
						});
					}
				})).then(function() {
					// finally return the complete project object, not the debug URLs
					return Q.resolve(projectWrappers);
				});
			});
		},

		_createAttachData: function _createAttachData() {
			return {
				advanced: this._advancedAttachMode,
				projects: [],
				// TODO load last-used connection from prefs
				connection:	{
					projectPath: null,
					debugURL: null,
					setDebugURL: function(urlString) {
						this.debugURL = urlString;
						if (this.debugURL) {
							var url = new URI(this.debugURL);
							this.debugHost = url.hostname();
							this.debugWebPort = url.port();
							this.debugUser = url.username();
							this.debugPassword = url.password();
							this.secureConnection = url.scheme() === "https";
						} else {
							this.debugHost = this.debugWebPort = this.debugUser = this.debugPassword = null;
							this.secureConnection = false;
						}
					},
					condense: function() {
						var clone = { projectPath: this.projectPath, proxyURI: this.proxyURI };
						if (this.debugHost) {
							this.debugURL = new URI({
								protocol: (this.secureConnection ? "https" : "http"),
								hostname: this.debugHost,
								port: this.debugWebPort,
								username: this.debugUser,
								password: this.debugPassword
							}).toString();
							clone.debugURL = this.debugURL;
						}
						return clone;
					}
                }
			};
		},

		_withAttachData: function _withAttachData() {
			var that = this;
			return this._getProjectsWithDebugURL().then(function(projects) {
				var attachData = that._createAttachData();
				attachData.projects = projects;
				var selectedProjects = projects.filter(function(project) {
					if (that._selectedProject) {
						return project.path === that._selectedProject.getFullPath();
					}
				});

				if (selectedProjects.length == 1) { // selected project in IDE
					attachData.connection.projectPath = selectedProjects[0].path;
					attachData.connection.setDebugURL(selectedProjects[0].debugURL);
				}
				// else: the first nodejs project
				else if (projects.length > 0) {
					attachData.connection.projectPath = projects[0].path;
					attachData.connection.setDebugURL(projects[0].debugURL);
				}
				// else: in advanced mode also show the selected project
				// so that at least we can use it for source lookup, though we don't have a debug URL
				else if (that._advancedAttachMode && that._selectedProject) { 
					attachData.projects.push({ path: that._selectedProject.getFullPath() });
					attachData.connection.projectPath = that._selectedProject.getFullPath();
				}

				return Q.resolve(attachData);
			});
		},

		openViewInDialog: function openViewInDialog() {
			var that = this;
			var dialog = null;
			var destroy = function() {
				if (dialog) {
					var d = dialog;
					dialog = null;
					d.destroy();
				}
			};
			return this._withAttachData().then(function(attachData) {
				var deferred = Q.defer();

				var cancelHandler = function(){
					destroy();
					deferred.resolve(null);
				};
				var buttonCancel = new sap.ui.commons.Button({
					text: "{i18n>attachView_cancel_xbut}",
					press: cancelHandler
				});

				var okHandler = function() {
					destroy();
					// cleanse the data to the attach-relevant fields
					var connectionData = attachData.connection.condense();
					deferred.resolve(connectionData); // actual attach
				};
				var buttonOk = new sap.ui.commons.Button({
					text: "{i18n>attachView_ok_xbut}",
					press: okHandler
				});

				var view = that.getView();
				view.setModel(new sap.ui.model.json.JSONModel(attachData));

				dialog = new sap.ui.commons.Dialog({
					modal: true,
					title: "{i18n>attachView_attachToRunningApp_xtit}",
					buttons: [buttonOk, buttonCancel],
					defaultButton: buttonOk,
					showCloseButton: true,
					content: [view],
					initialFocus: attachData.advanced ? "host" : "projectList",
					closed: function() {
						destroy();
					}
				});
				if (that._context.i18n) {
					that._context.i18n.applyTo(dialog);
				}
				dialog.open();
				that._afterDialogOpen(okHandler, cancelHandler);
				return deferred.promise;
			}).fail(function(error) {
				that._logError(error);
				sap.ui.commons.MessageBox.alert("Error:" + error.message + "\n\nDetails:\n" + error.stack, null, "Error");
			}).fin(function() {
				destroy();
			});
		},
		
		_afterDialogOpen: function _afterDialogOpen(okHandler, cancelHandler) {
		}

	});
}());