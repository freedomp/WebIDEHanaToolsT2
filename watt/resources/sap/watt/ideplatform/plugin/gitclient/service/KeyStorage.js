define({
	_oSsh : {},
	_oHttps : {},

	get : function(sHost, sType) {
		if (sType.toUpperCase() === 'SSH') {
			return this._oSsh[sHost];
		} else if (sType.toUpperCase() === 'HTTPS') {
			return this._oHttps[sHost];
		} else {
			throw new Error('Unsupported type');
		}
	},

	setSsh : function(sHost, sUsername, sKey) {
		this._oSsh[sHost] = {
			username : sUsername,
			key : sKey
		};
	},

	setHttps : function(sHost, sUsername, sPassword) {
		this._oHttps[sHost] = {
			username : sUsername,
			password : sPassword
		};
	},

	resetKeys : function() {
		this._oSsh = {};
		this._oHttps = {};
	}

});
