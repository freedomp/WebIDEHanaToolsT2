define(["sap/watt/core/q"], 

	// This interface is a draft covering the most simple solution possible. It may be enhanced in the future. 
	// The DAO has some more possibilities to read/write single attributes with less overhead.
	// This is intentionally not yet used here.

	function(Q) {
		"use strict";

		// the EmptyDao clears all data when calling get
		var EmptyDao = function(oDao) {
			this._oDao = oDao;
		};

		EmptyDao.prototype.set = function(oSettings, sNode) {
			return true;
		};

		EmptyDao.prototype.get = function(sNode) {
			// if settings are disabled, remove all persisted data on the first get
			// because get will be called for sure and malicious settings can possibly cause an IDE crash
			if (this._oDao) {
				this._oDao.remove(sNode);
			}
			return null;
		};

		EmptyDao.prototype.remove = function(sNode) {
			return true;
		};

		// the DummyDao does nothing
		var DummyDao = function() {
			EmptyDao.call(this, arguments);
		};

		DummyDao.prototype = Object.create(EmptyDao.prototype);
		DummyDao.prototype.constructor = DummyDao;

		// @override
		DummyDao.prototype.get = function(sNode) {
			return null;
		};


		function getSettingsOption() {
			var sSettingsOption;
			var sParam = Q.sap.getURLParameter("settings");
	
			switch(sParam) {
				case "false": 	sSettingsOption = "ignore";
								break;
				case "true": 	sSettingsOption = true;
								break;
				case "delete": 	sSettingsOption = "delete";
								break;
				case "ignore": 	sSettingsOption = "ignore";
								break;
				default: 		sSettingsOption = true; 	
			}
	
			return sSettingsOption;		
		}
		
		var oSettings = {

			_oDao: undefined,

			_oConfiguredDao: undefined,

			configure: function(mSettings) {

				if (mSettings && mSettings.dao) {
					this._oConfiguredDao = mSettings.dao;
				}

				var vSettings = getSettingsOption();

				switch (vSettings) {
					case "delete":
						this._oDao = new EmptyDao(this._oConfiguredDao);
						break;
					case "ignore":
						this._oDao = new DummyDao(this._oConfiguredDao);
						break;
					default:
						this._oDao = this._oConfiguredDao || new EmptyDao(this._oConfiguredDao);
				}

			},

			set: function(oSettings, sNode) {
				return this._oDao.set(oSettings, sNode);
			},

			get: function(sNode) {
				return this._oDao.get(sNode);
			},

			remove: function(sNode) {
				return this._oDao.remove(sNode);
			}

		};

		return oSettings;

	});