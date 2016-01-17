define([], function(){
	return {
		showPreview : function(oWindow, oUrl, mCustomSettings) {
			oWindow.location.href = oUrl.toString();
			console.debug("end   - " + Date.now());
		}
	};
});