define(function() {
	"use strict";
	var FileFolderEntity = function(sType, sName, sParentPath, sDAO, sVersionId) {

        if (!sParentPath && sName !== null) {
			var index = sName.lastIndexOf("/");
			sParentPath = sName.substr(0, index);
			sName = sName.substr(index + 1);
		}

		//It is allowed to pass in the parent document and the path will be fetched
		if (jQuery.type(sParentPath) === "object") {
			var oDocument = sParentPath;
			sParentPath = oDocument.getEntity().getFullPath();
		}

		this._sType = sType; // file / folder
		this._sName = sName;
		this._sParentPath = sParentPath;
		this._sVersionId = sVersionId;
		this._sDAO = sDAO || "workspace";
	};
	
	FileFolderEntity.prototype = {
		/**
		 * @memberOf sap.watt.common.plugin.filesystem.document.FileFolderEntity
		 */
		
      isProject : function() {
	       	if (this.isRoot()) {
	       		return false;
	       	}
        	// a project is a folder that is located under root or its _bProject is true
            return this.isFolder() && (this.getParentPath() === "" || this._bProject === true); 
        },

        isFolder : function() {
            return this.getType() === "folder"; 
        },
        
        isFile : function() {
        	return this.getType() === "file";
        },

        //
		getType : function() {
			return this._sType;
		},

		contains : function(oEntity, bOnlyDirectChildren) {
			bOnlyDirectChildren = (bOnlyDirectChildren === true);
			
			if (!oEntity.isFile() && !oEntity.isFolder()) {
				return false;
			}

			if (this.isFile()) {
				return false;
			}
			
			var sOwnFullPathWithSlash = this.getFullPath() + "/";
			var sOtherFullPath = oEntity.getFullPath();
			
			if (sOtherFullPath === "") {
				return false;
			}
			// check if the document located under the current one
			if (sOtherFullPath.indexOf(sOwnFullPathWithSlash) === 0 && bOnlyDirectChildren === false) {
				return true;
			} 
			// check if the document is a direct child of the current one
			if (bOnlyDirectChildren === true && sOtherFullPath.replace(sOwnFullPathWithSlash, "").indexOf("/") === -1) {
				return true;
			} 
			
			return false;
		},

		getName : function() {
			return this._sName;
		},

		setName : function(sName) {
			this._sName = sName;
		},

		getParentPath : function() {
			return this._sParentPath;
		},

		getVersionId : function() {
			return this._sVersionId;
		},
		
		getDAO : function() {
			return this._sDAO;
		},

		isRoot : function() {
			return (this._sParentPath === "" && this._sName === "");
		},

		getFullPath : function() {
			if (this.isRoot()) {
				return "";
			}

			var sPath = this._sParentPath ? this._sParentPath + "/" + this._sName : "/" + this._sName;
			return sPath;
		},
		
		getProjectRelativePath : function() {
			var oPath = URI(this.getFullPath());
			return oPath.segment(0,"").toString();
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
			var sVersionId = this.getVersionId();
			return this.getType() + ":" + this.getFullPath() + ":" + this._sDAO + ((sVersionId) ? (":" + sVersionId) : "");
		},
		
		getTitle : function() {
			//TODO We should enhance the title functionality to be more intelligent and add helpful path segments
			//e.g. if there are several Plugin.js files add what is the difference
			return this.getName();
		}

	};
	
	FileFolderEntity.fromKeyString = function(sKeyString){
		// The key string is not expected to contain any : except the separators (not a valid char for filenames & versions)
		var mParts = sKeyString.split(":");
		return new FileFolderEntity(mParts[0], mParts[1], null, mParts[2] || "workspace", mParts[3]);
	};

	return FileFolderEntity;
});