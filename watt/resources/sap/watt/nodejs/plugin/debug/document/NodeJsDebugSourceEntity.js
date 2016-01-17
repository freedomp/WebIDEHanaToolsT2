define(function() {
	"use strict";
	var NodeJsDebugSourceEntity = function(url) {

        if (url) {
			var index = url.lastIndexOf("/");
			this._sName = url.substr(index + 1);
			this._url = url;
			this._path = url.substr(0, index);
		}
	};

	NodeJsDebugSourceEntity.prototype = {

		isProject : function() {
	       	return false;
        },

        isFolder : function() {
            return false;
        },

        isFile : function() {
        	return true;
        },

		getType : function() {
			// should be "file", but using null avoids follow-up bugs with the validation
			return null;
		},

		contains : function(oEntity, bOnlyDirectChildren) {
			return false;
		},

		getName : function() {
			return this._sName;
		},

		setName : function(sName) {
			this._sName = sName;
		},

		getParentPath : function() {
			return this._path;
		},

		getVersionId : function() {
			return 0;
		},

		getDAO : function() {
			return null;
		},

		isRoot : function() {
			return false;
		},

		getFullPath : function() {
			return this._url;
		},

		getProjectRelativePath : function() {
			return null;
		},

		getFileExtension : function() {
			var sExtension = "";
			var index = this._sName.lastIndexOf(".");
			if (index >= 0) {
				sExtension = this._sName.substr(index + 1);
			}
			return sExtension;
		},

		setBackendData : function(mBackenData) {
			this._mBackenData = mBackenData;
		},

		getBackendData : function() {
			return this._mBackenData;
		},

		getKeyString : function() {
			return this._url;
		},

		getTitle : function() {
			//TODO We should enhance the title functionality to be more intelligent and add helpful path segments
			//e.g. if there are several Plugin.js files add what is the difference
			return this.getName();
		}

	};

	NodeJsDebugSourceEntity.fromKeyString = function(sKeyString){
		// The key string is not expected to contain any : except the separators (not a valid char for filenames & versions)
		return new NodeJsDebugSourceEntity(sKeyString);
	};

	return NodeJsDebugSourceEntity;
});