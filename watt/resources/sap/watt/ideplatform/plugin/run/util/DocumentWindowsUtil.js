define(function() {

	var aDocumentWindows = {};
	var sLoadingPageUrl = require.toUrl("sap.watt.common.platform/ui/LoadingPage.html");
	
	var _isWindowIdValid = function(sWindowId) {
	    if (sWindowId && (typeof sWindowId === "string")) {
	        return true;
	    } 
	    
	    return false;
	};
	
	var _deleteClosedWindows = function() {
		var aWindowIds = Object.keys(aDocumentWindows);
		aWindowIds.forEach(function(sWindowId) {
			if (aDocumentWindows[sWindowId].closed) {
				delete aDocumentWindows[sWindowId];
			}
		});
	};
	
	var _getWindow = function(sWindowId) {
		// delete closed windows
		_deleteClosedWindows();

		if (_isWindowIdValid(sWindowId)) {
			return aDocumentWindows[sWindowId];
		}
		
		return undefined;
	};
	
		var _renameWindow = function(sOldWindowId, sNewWindowId) {
		// delete closed windows
		_deleteClosedWindows();

		if (_isWindowIdValid(sOldWindowId) && _isWindowIdValid(sNewWindowId)) {
			var oWindow = aDocumentWindows[sOldWindowId];
			if (oWindow) {
			    oWindow.name = sNewWindowId;
			    aDocumentWindows[sNewWindowId] = oWindow;
			    delete aDocumentWindows[sOldWindowId];
			}
		}
	};
	
	var _closeWindow = function(sWindowId) {
		if (_isWindowIdValid(sWindowId)) {
			var oDocumentWindow = aDocumentWindows[sWindowId];
		    if (oDocumentWindow && !oDocumentWindow.closed) {
		    	// close the window if it exists and opened
		    	oDocumentWindow.close();
		    	oDocumentWindow = null;
		    }
		    
		    delete aDocumentWindows[sWindowId];
		}
	};
	
	var _openWindow = function() {
		// delete closed windows
		_deleteClosedWindows();
		// create temporary window name
		var sWindowId = "tmpWin_" + Math.floor((Math.random() * 10000000) + 1);
	    // open window with key
	    aDocumentWindows[sWindowId] = window.open(sLoadingPageUrl, sWindowId);
	    return sWindowId;
	};
	
	return {
		openWindow :_openWindow,
		getWindow : _getWindow,
		closeWindow : _closeWindow,
		renameWindow : _renameWindow
	};
});