define(function() {
	"use strict";
	
	var keyPrefix = "sap.watt.platform.content/service/dirtyDocumentStorage_";
	
	// saves changed content of the dirty documents
	var _save = function(dirtyDocuments) {
		// remove all keys starting with the keyPrefix
		_clearStorage();
		
		for (var i = 0; i < dirtyDocuments.length; i++) {
			saveDirtyDocument(dirtyDocuments[i]);
		}
	};
	
	var getStoredValue = function(key) {
		var storedValue = null;
		// value example: {changedOn:1417094123004, unsavedContent: some text here...}
		var strValue = execute(localStorage.getItem, [key]);
		if (strValue) {
			
			storedValue = JSON.parse(strValue);
			
			execute(localStorage.removeItem, [key]);
		}
		
		return storedValue;
	};

	// remove all keys starting with the keyPrefix 
	// key example: sap.watt.common.content/service/dirtyDocumentStorage_/myApp/myFile.txt
	var _clearStorage = function() {
		if (isStorageExists()) {
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key.indexOf(keyPrefix) === 0) {
					execute(localStorage.removeItem, [key]);
				}
			}
		}
	};
	
	// save a dirty document
	var saveDirtyDocument = function(dirtyDocument) {
		if (isStorageExists()) {
			var dirtyDocumentPath = dirtyDocument.getEntity().getFullPath();
			// key example: sap.watt.common.content/service/dirtyDocumentStorage_/myApp/myFile.txt
			var key = keyPrefix + dirtyDocumentPath;
			// changedOn example: 1417094123004
			var changedOn = dirtyDocument.getDocumentMetadata().changedOn;
			dirtyDocument.getContent().then(function(unsavedContent) {
				// value example: {changedOn:1417094123004, unsavedContent: some text here...}
				var value = {};
				value.unsavedContent = unsavedContent;
				value.changedOn = changedOn;
				var strValue = JSON.stringify(value);

				execute(localStorage.setItem, [key, strValue]);
			}).done();
		} else {
			console.log("No Web Storage support");
		}
	};

	
	var isStorageExists = function() {
		return (typeof(Storage) !== "undefined");
	};
	
	// executes localStorage function
	var execute = function(func, args) {
		try {
			return func.apply(localStorage, args);
		} catch (error) {
			console.log(error.message);
		}
	};
	
	
	var _getContent = function(oDocument) {
		if (isStorageExists()) {
			var dirtyDocumentLocation = oDocument.getEntity().getFullPath();
			// key example: sap.watt.common.content/service/dirtyDocumentStorage_/myApp/myFile.txt
			var key = keyPrefix + dirtyDocumentLocation; 
			
			var storedValue = getStoredValue(key);
			if (storedValue) {		
				
				var currentChangedOn = oDocument.getDocumentMetadata().changedOn;
				if (currentChangedOn <= storedValue.changedOn) {
					return storedValue.unsavedContent;
				}
			}
		} else {
			console.log("No Web Storage support");
		}
		
		return null;
	};

	
	return {
		save: _save,
		getContent: _getContent,
		clearStorage: _clearStorage
	};		
});