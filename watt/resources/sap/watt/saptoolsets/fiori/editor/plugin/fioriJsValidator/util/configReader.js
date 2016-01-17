define([], function() {

	"use strict";

	return {
		zipLoadCalled: false,
		fioriDefaultConfig: {},
		fioriDefaultCustomRules: {},

		getFioriConfiguration: function () {
			var that = this;
			return Q(that.fioriDefaultConfig);
		},
		getFioriRules: function () {
			var that = this;
			return Q(that.fioriDefaultCustomRules);
		},
		getZipSourceUrl: function() {
			return require.toUrl("sap.watt.saptoolsets.fiori.editor.fioriJsValidator/rules/eslint.distribution-eslint.configuration.assembly.zip");
		},
		_loadDefaultConfig: function () {
			if (this.zipLoadCalled) {
				return Q();
			}
			this.zipLoadCalled = true;
			var that = this;
			var d = Q.defer();
			var sSourcesUrl = this.getZipSourceUrl();

			var request = new XMLHttpRequest();
			request.open("GET", sSourcesUrl, true);
			request.responseType = "arraybuffer";
			request.onload = function () {
				if (this.readyState === 4 && this.status < 300) {
					try {
						var zipObject = new JSZip();
						zipObject.load(this.response);

						var parentFolderName = "";
						for (var fileName in zipObject.files) {
							var fileContent = zipObject.files[fileName];
							if (fileContent.options && fileContent.options.dir) {//folder
								parentFolderName = fileName;
							} else {
								if (fileName === ".eslintrc") {
									var eslintrc = JSON.parse(fileContent.asText());
									that.fioriDefaultConfig = eslintrc;
								} else {
									if (fileName.indexOf(".js") !== -1) {
										var ruleId = fileName.replace(/\.js/, "");
										ruleId = ruleId.replace(parentFolderName, "");
										that.fioriDefaultCustomRules[ruleId] = that._adaptCustomRulesContent(fileContent.asText());
									}
								}
							}
						}
						d.resolve();
					} catch (e) {
						d.reject(e);
					}
				} else {
					d.reject(new Error("rules could not be found. failed with status " + this.status));
				}
			};
			request.onerror = function (error) {
				d.reject(error);
			};
			request.send(null);
			return d.promise;
		},

		_adaptCustomRulesContent: function (ruleFileContent) {
			var content = ruleFileContent.replace(/(\s*(module\.exports)\s*=)/, '\n return ');
			return content;
		}
	};

});
