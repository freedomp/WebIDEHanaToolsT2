define(["./ABAPRepositoryConstants"],function(Constants) {

    /*
    * Extracts the xml base from the given xml atom feed
    */
    var _getXmlBaseUrl = function(appAtomFeedXml) {
	    var sXmlBaseValue;
	    var elements = $(appAtomFeedXml).xpath("//@xml:base");
	    if (elements && elements.length > 0) {
	        sXmlBaseValue = elements[0].value;
	    }
	    
	    return sXmlBaseValue;
	};
	
	/*
    * Extracts the content url from the given xml atom feed
    */
	var _getContentUrl = function(appAtomFeedXml, sXmlBaseValue) {
	    var sContentUrl;
	    
	    // get the atom:content element
	    var elements = $(appAtomFeedXml).find("atom\\:content, content");
		if (elements && elements.length > 0) {
			var element = elements[0];
			// get the "src" attribute value
			sContentUrl = jQuery(element).attr("src");
			sContentUrl = URI(sContentUrl).absoluteTo(sXmlBaseValue).toString();
		}
	    
		return sContentUrl;
	};
	
   	/* 
	 * Parses the application atom feed xml and extract the app index url.
	 * if exists - returns it,
	 * if not - returns undefined
	 
	    Example of such document with this link:
	    =======================================
	    <?xml version="1.0" encoding="UTF-8"?>
        <atom:entry xmlns:atom="http://www.w3.org/2005/Atom" xml:base="/sap/bc/adt/filestore/ui5-bsp/objects/">
           <atom:author />
           <atom:category term="folder" />
           <atom:content type="application/atom+xml;type=feed" src="./test_esty/content" />
           <atom:contributor />
           <atom:id>test_esty</atom:id>
           =========================================================
           <atom:link href="../appindex/test_esty" rel="appindex" />
           =========================================================
           <atom:link href="./test_esty" rel="self" type="application/atom+xml;type=entry" />
           <atom:summary type="text">SAPUI5 Application</atom:summary>
           <atom:title>test_esty</atom:title>
        </atom:entry>
	 */
	var _getAppIndexUrl = function(appAtomFeedXml, sXmlBaseValue) {
	    var appIndexUrl;
	    
        var elements = jQuery(appAtomFeedXml).find("[rel='appindex']");
		if (elements && elements.length > 0) {
			var element = elements[0];
			appIndexUrl = jQuery(element).attr("href");
			appIndexUrl = URI(appIndexUrl).absoluteTo(sXmlBaseValue).toString();
		}
	    
		return appIndexUrl;
	};

	var buildUpdateNotification = function(filesDiff, oContext) {
		var msg = "";
		var i = 0;

		if (filesDiff.deleted.length > 0) {
			msg = msg + oContext.i18n.getText("i18n", "DeployWizard_Deleted") + "\n";
			for (i = 0; i < filesDiff.deleted.length; i++) {
				msg = msg + filesDiff.deleted[i].getEntity().getName() + "\n";
			}
			msg = msg + "\n\n";
		}

		if (filesDiff.updated.length > 0) {
			msg = msg + oContext.i18n.getText("i18n", "DeployWizard_Updated") + "\n";
			for (i = 0; i < filesDiff.updated.length; i++) {
				msg = msg + filesDiff.updated[i].getEntity().getName() + "\n";
			}
			msg = msg + "\n\n";
		}

		if (filesDiff.created.length > 0) {
			msg = msg + oContext.i18n.getText("i18n", "DeployWizard_Created") + "\n";
			for (i = 0; i < filesDiff.created.length; i++) {
				msg = msg + filesDiff.created[i].getEntity().getName() + "\n";
			}
			msg = msg + "\n\n";
		}

		if (msg === "") {
			msg = oContext.i18n.getText("i18n", "DeployWizard_UpdateApp");
		}

		msg = msg + oContext.i18n.getText("i18n", "DeployWizard_Continue");

		return msg;
	};

	var _buildUpdateMessage = function(syncActions, oContext) {
		var diffStruct = {
			updated: [],
			deleted: [],
			created: []
		};

		for (var i = 0; i < syncActions.length; i++) {
			if (syncActions[i].actionType === Constants.CREATE_ACTION) {
				diffStruct.created.push(syncActions[i].remoteDocument);
			}
			if (syncActions[i].actionType === Constants.UPDATE_ACTION) {
				diffStruct.updated.push(syncActions[i].remoteDocument);
			}
			if (syncActions[i].actionType === Constants.DELETE_ACTION) {
				diffStruct.deleted.push(syncActions[i].remoteDocument);
			}
		}

		return buildUpdateNotification(diffStruct, oContext);

	};

	return {
	    getXmlBaseUrl: _getXmlBaseUrl,
	    getContentUrl: _getContentUrl,
	    getAppIndexUrl: _getAppIndexUrl,
		buildUpdateMessage: _buildUpdateMessage
	};
});