define({

	_bAlive : true,
	_bSessionLost : false,
	
	logout : function() {

	},

	login : function(sUsername, sPassword) {
	    if(!window.ui5WattQunit){
		    return this.context.event.fireLoggedIn();
	    }else{
	        return Q();
	    }
	},

	isAlive : function() {
		if (!this._bAlive) {
			throw new Error("SERVER_ERROR");
		} else {
			if (this._bSessionLost) {
				throw new Error("SESSION_LOST");
			} else {
				return this._bAlive;
			}
		};
	},

	setAlive : function(bAlive, bSessionLost) {
		this._bAlive = bAlive;
		if (bSessionLost) {
			this._bSessionLost = bSessionLost;
		}
		return this._bAlive;
	},

	setSessionLost : function(bSessionLost) {
		this._bSessionLost = bSessionLost;
	},

	getSystemInfo : function() {
		return {
			sDbname : "Fake", // TODO REMOTE This is just to specify a title for the root node
			sUsername : "Hugo"
		};
	}

});
