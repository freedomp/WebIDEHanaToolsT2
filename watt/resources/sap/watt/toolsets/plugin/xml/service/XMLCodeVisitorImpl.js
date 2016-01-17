define(
		[ "../codecompletion/XMLVisitor" ],
		function(XMLVisitor) {

			var XMLCodeVisitor = function() {
				this.xmlVisitor = new XMLVisitor();
			};

			XMLCodeVisitor.prototype = {

				/**
				 * Get code env for the current xml content at the specified offset. 
				 * <p>
				 * This method will parse the given xml content and get the env obj.
				 *
				 * The format of oSettings: 
				 * {
				 * 		rootNode: [{nameSpace: "sap.ui.core", name: "View"}, {nameSpace: "sap.ui.core", name: "FragmentDefinition"}],
				 *		bParsingAll: false
				 * }
				 *
				 * @param 	sContent 	{string}	the xml content . 
				 * @param 	iOffset 	{number}	the specified offset. 
				 * @param 	oSettings 	{object}	the settings for parsing which including rootNode specification, bParsingAll etc. 
				 * @return 	Env object including required information.
				 */

				getEnv : function(sContent, iOffset, oSettings) {
					if (sContent) {
						if (iOffset == null) {
							iOffset = sContent.length;
						}
						var that = this;
						//get the env obj
						var oDeferred = Q.defer();
						try {
							var envObj = null;
							var retObj = this.xmlVisitor.getEnv(sContent, iOffset, oSettings);
							if (retObj && retObj.currentEnv) {
								envObj = {
									currentTag: retObj.currentEnv.currentTag,
									currentTagns: retObj.currentEnv.currentTagns,
									currentAttr: retObj.currentEnv.currentAttr,
									currentAttrs: retObj.currentEnv.currentAttrs,
									parentTag: retObj.currentEnv.parentTag,
									gparentTag: retObj.currentEnv.gparentTag,
									lbracket: retObj.currentEnv.lbracket,
									origText: retObj.currentEnv.origText,
									prefix: retObj.currentEnv.prefix,
									prefixns: retObj.currentEnv.prefixns,
									type: retObj.currentEnv.type,
									xmlnsList: retObj.currentEnv.xmlnsList,
									parentTagObj: retObj.parentTagObj
								};
							}
							oDeferred.resolve(envObj);
						} catch (e) {
							console.log(e);
							oDeferred.resolve(null);
						}
						
						return oDeferred.promise;
					}
				}
			};
			return XMLCodeVisitor;

		});