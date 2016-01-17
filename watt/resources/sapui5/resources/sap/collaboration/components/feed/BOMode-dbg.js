/*
* ! @copyright@
*/
sap.ui.define(["./Mode", "sap/m/CustomListItem", "sap/m/Label", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/collaboration/components/utils/PendingRequestsUtil"], function(Mode, CustomListItem, Label, Filter, FilterOperator, PendingRequestsUtil) {
	
	var BOMode = Mode.extend("sap.collaboration.components.feed.BOMode",{
		constructor: function(oFeedController, oLanguageBundle) {
			// Calls the superclass's constructor. This
			// causes this class to inherit the instance
			// variables list below.
			Mode.apply(this, [oFeedController, "jam"]);
			
			// Inherited instance variables
			// this._oFeedController
			// this._oItemTemplate
			// this._oList
			// this._oViewDataModel
			// this._oJamModel
			// this._oSelectPopover
			// this._oSearchField
			
			// current Jam External BO Id
			this._sJamBOId = undefined;
			
			// Utility to keep track of the pending OData requests.
			// Can be used to abort all the pending requests.
			this._oPendingRequestsUtil = new PendingRequestsUtil();
			
			// This mode needs access to the SMIv2 OData Mode.
			this._oSMIModel = this._oFeedController.getModel("smi");
			
			// This mode requires the language bundle for texts.
			this._oLanguageBundle = oLanguageBundle;
			
			// Filter constants
			this.FILTER_CONSTANTS = {
					GROUP_WALL: "Group Wall",
					GROUP_OBJECT_WALL: "Group Object Wall"
			};
			
			// Attach event handler for filter control
			oFeedController.byId("filter_popover").attachSelectionChange(this.onFilterSelection, this);
		}
	});
	
	/**
	 * Asks the BOMode object to start.
	 * @param oFeedSourcesData - Uses this object if defined. Uses the current object otherwise.
	 */
	BOMode.prototype.start = function(oFeedSourcesData) {
		// We wrap this block in an if statement to allow
		// the scenario where the BOMode is to be
		// started where the current
		// oFeedSourcesData
		// is to be
		// kept.
		if (oFeedSourcesData) {
			this._oFeedSourcesData = oFeedSourcesData;
			// I'm worried about memory leaks in this chaining.
			// We need deeper analysis to fully understand all
			// the dangling objects that we're possibly creating.
			this._sendRequestMapInternalBOToExternalBO(
				oFeedSourcesData.appContext,
				oFeedSourcesData.collection,
				oFeedSourcesData.key,
				oFeedSourcesData.odataServicePath
			).then(
				(function(oData, oResponse) {
					return this._sendRequestExternalObjects_FindByExidAndObjectType(oData.MapInternalBOToExternalBO.Exid, oData.MapInternalBOToExternalBO.ObjectType);
				}).bind(this), // For success we chain.
				(function(oError) {
					// What are the possible things that can go wrong here?
					// 1. A network issue.
					// 2. A CSRF token issue.
					// 3. 401 (Unauthorized) Status code indicating that the user is not authorized to access the resource. This may mean the user is not authenticated.
					// 4. 5xx errors are server side errors, which I don't really know how to handle.
					
					// Although there are many error scenarios,
					// at the moment all errors are handled the same way.
					this._oFeedController.logError("The internal to external mapping for the business object could not be performed.");
					this._oFeedController._displayErrorMessage(this._oLanguageBundle.getText("SMIV2_INTERNAL_TO_EXTERNAL_BO_MAPPING_COULD_NOT_BE_PERFORMED"));
					
					// To indicate to the chained error handler not to display
					// its error message, we return the null object.
					return null;
				}).bind(this) // For errors, error messages are logged and displayed to the user.
			).then(
				(function(oData, oResponse) {
					this._sJamBOId = oData.results.Id; // set the Jam External BO id
					// We must figure out a way to deal with the things that can
					// potentially go wrong after the list sends a request for
					// the groups. Whatever callback functions we register
					// must be unregistered when the request is successful.
					// Also, the registered callback should not have to worry
					// about other parts of the component that also use the
					// list control and/or ODataModel object.
					this._oList.bindItems({
						path: "/ExternalObjects('" + oData.results.Id + "')/Groups",
						template: this._oItemTemplate
					});
				}).bind(this), // Success! We now set the path.
				(function(oError) {
					// What are the possible things that can go wrong here?
					// 1. A network issue. What does this look like?
					// 2. A tunnel issue.
					// 3. A CSRF token issue.
					// 4. 404 (Not Found) Status code indicating that the external object could not be found.
					// 5. 5xx errors are server side errors, which I don't really know how to handle.
					
					// If the oError object is null, it means the call to which we're chaining failed.
					// Therefore, since that call's error handler logged and displayed error messages,
					// none are logged or displayed here.
					if (oError !== null) {
						// Although there are many error scenarios,
						// at the moment all errors are handled the same way.
						this._oFeedController.logError("An external object associated with the given Exid and ObjectType could not be found.");
						this._oFeedController._displayErrorMessage(this._oLanguageBundle.getText("JAM_EXTERNAL_OBJECT_COULD_NOT_BE_FOUND"));
					}
				}).bind(this) // For errors, error messages are logged and displayed to the user.
			);
			
			// enable filter
			this._oViewDataModel.setProperty("/filterEnabled", true);
			
			// set filter criteria
			this._setFilterOptions(oFeedSourcesData.name);
		}
	};
	
	BOMode.prototype.stop = function() {	
		this._oPendingRequestsUtil.abortAll();
		
		// disable filter
		this._oViewDataModel.setProperty("/filterEnabled", false);
		
		//  we re-attach the event handler function for updateFinished since we need it to run only once if BO Mode is started again
		this._oList.attachUpdateFinished(this.onGroupSelectorUpdateFinished, this);
	};
	
	/**
	 * A generic method to send various kinds of requests. Handles the
	 * pending requests in a generic way.
	 * @param oODataModel - The ODataModel class instance to use to send the OData request.
	 * @param sODataModel - The name of the method to call on the ODataModel class instance.
	 * @param sODataPath - The path to use when calling the method on the ODataModel class instance.
	 * @param oURLParameters - The object representing the URL parameters to append to the URL that will be used to send the OData request.
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendODataRequest = function(oODataModel, sODataModelMethod, sODataPath, oURLParamters) {
		var oDeferred = jQuery.Deferred();
		var oAbortableRequest = oODataModel[sODataModelMethod](sODataPath, {
			urlParameters: oURLParamters,
			success: function(oData, oResponse) {
				oDeferred.resolve(oData, oResponse);
			},
			error: function(oError) {
				oDeferred.reject(oError);
			}
		});
		var oAbortableAndChainablePromiseRequest = oDeferred.promise(oAbortableRequest);
		this._oPendingRequestsUtil.add(oAbortableAndChainablePromiseRequest);
		oDeferred.always((function(){
			this._oPendingRequestsUtil.remove(oAbortableAndChainablePromiseRequest);
		}).bind(this));
		return oAbortableAndChainablePromiseRequest;
	};
	
	/**
	 * @param sApplicationContext
	 * @param sODataCollection
	 * @param sODataKeyPredicate - The content to place between parenthesis to identify the business object.
	 * For example, say the collection is Opportunities and that opportunities has a string id
	 * of say aE6f, then the URL for that Opportunity would contain Opportunities('aE6f').
	 * Hence, the sODataKeyPredicate would be the string 'aE6F'. It's important to send
	 * the single quotes in with the string. Hence, the string would be "'aE6f'" in JavaScript.
	 * @param sOdataServicePath - Path to the OData service. For example, his could be
	 * /sap/opu/odata/sap/ODataService/
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestMapInternalBOToExternalBO = function(sApplicationContext, sODataCollection, sODataKeyPredicate, sODataServicePath) {
		return this._sendODataRequest(this._oSMIModel, "callFunction", "/MapInternalBOToExternalBO", {
			ApplicationContext: sApplicationContext,
			ODataCollection: sODataCollection,
			ODataKeyPredicate: sODataKeyPredicate,
			ODataServicePath: sODataServicePath
		});
	};
	
	/**
	 * @param Exid
	 * @param ObjectType
	 * @private
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._sendRequestExternalObjects_FindByExidAndObjectType = function(Exid, ObjectType) {
		return this._sendODataRequest(this._oJamModel, "callFunction", "/ExternalObjects_FindByExidAndObjectType", {
			Exid: Exid,
			ObjectType: ObjectType
		});
	};
	
	/**
	 * Set filter options
	 * @private
	 * @param {string} BOName The name of the BO
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype._setFilterOptions = function(BOName) {
		var si18lnText;
		BOName ? si18lnText = this._oLanguageBundle.getText("GF_FILTER_OBJECT", BOName) : si18lnText =  this._oLanguageBundle.getText("GF_FILTER_OBJECT_DEFAULT");
		var mFilterData = [{ text : this._oLanguageBundle.getText("GF_FILTER_GROUP"), key : this.FILTER_CONSTANTS.GROUP_WALL },
		                   { text :  si18lnText, key : this.FILTER_CONSTANTS.GROUP_OBJECT_WALL }];
		this._oViewDataModel.setProperty("/filter", mFilterData);
		
		var oFilterPop = this._oFeedController.byId("filter_popover");
		oFilterPop.setSelectedItem(oFilterPop.getItems()[0]);
	};
	
	/**
	 * Event handler for the selector list when an item is selected.
	 * The structure of the model set on the individual list items
	 * must be known, and there must exist a way of mapping the
	 * selected list item.
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.onGroupSelected = function(oEvent) {
		var oGroupSelected = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
		this._oViewDataModel.setProperty("/groupSelected", {
			Id : oGroupSelected.Id,
			Name : oGroupSelected.Name,
			WebURL : oGroupSelected.WebURL
		});
		
		this._oViewDataModel.setProperty("/url", "/Groups('" + oGroupSelected.Id + "')/FeedEntries");
		
		// reset the filter and remove filter message
		this._oViewDataModel.setProperty("/filterMessage", "");
		var oFilterPop = this._oFeedController.byId("filter_popover");
		oFilterPop.setSelectedItem(oFilterPop.getItems()[0]); 
		
		this._oGroupSelectPopover.close();
	};
	
	/**
	 * Event handler for when the top left button is pressed to allow
	 * the user to select a feed source. In this case, the feed
	 * source list is a list of groups.
	 * @param oEvent - This event handler is registered to listen to the the top left
	 * button's onPress event. This means't the event's source's control is the
	 * button. Shouldn't be any need of this button control.
	 */
	BOMode.prototype.onGroupSelectorButtonPress = function(oEvent) {
		this._oGroupSelectPopover.openBy(oEvent.getSource());
	};
	
	BOMode.prototype.onGroupSelectorUpdateStarted = function(oEvent) {
		
	};
	
	BOMode.prototype.onBatchCompleted = function(oEvent) {
		
	};
	
	/**
	 * When the group list is finished updating, then we make the
	 * the currently selected group equal to the first group
	 * in the list.
	 */
	BOMode.prototype.onGroupSelectorUpdateFinished = function(oControlEvent) {
		var oList = oControlEvent.getSource();
		if (!oList.getSelectedItem()) {
			oList.setSelectedItem(oList.getItems()[0]);
		}
		var oGroup = oList.getItems()[0].getBindingContext().getObject();
		this._oViewDataModel.setProperty("/groupSelected", oGroup);
		this._oViewDataModel.setProperty("/url", "/Groups('" + oGroup.Id + "')/FeedEntries");
		
		// detach this event handler function since we only want it to run once, this will get re-attached on the stop() method
		this._oList.detachUpdateFinished(this.onGroupSelectorUpdateFinished, this);
	};
	
	BOMode.prototype.onGroupSearch = function(oControlEvent) {
		var aFilters = [];
		var sQuery = oControlEvent.getSource().getValue();
		if (sQuery && sQuery.length > 0) {
			var filter = new Filter("Name", FilterOperator.Contains, sQuery);
			aFilters.push(filter);
		}
		var oGroupSelectList = this._oList;
		oGroupSelectList.getBinding("items").filter(aFilters);
	};
	
	/**
	 * Event handler for filter selection
	 * @private
	 * @param {object} controlEvent the event from the selection change on the filter control
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	
	BOMode.prototype.onFilterSelection = function (controlEvent) {
		var sSelectedFilter = controlEvent.getParameter("listItem");
		var oFilterData = sSelectedFilter.getBindingContext().getObject();
		var sGroupId = this._oViewDataModel.getProperty("/groupSelected/Id");
		
		switch (oFilterData.key) {
			case this.FILTER_CONSTANTS.GROUP_WALL:
				this._oViewDataModel.setProperty("/url", "/Groups('" + sGroupId + "')/FeedEntries");
				this._oViewDataModel.setProperty("/filterMessage", "");
				break;
			case this.FILTER_CONSTANTS.GROUP_OBJECT_WALL:
				this._oViewDataModel.setProperty("/url", "/GroupExternalObjects(GroupId='" + sGroupId + "',ExternalObjectId='" + this._sJamBOId + "')/FeedEntries");
				this._oViewDataModel.setProperty("/filterMessage", this._oLanguageBundle.getText("ST_FILTER_TEXT") + " " + oFilterData.text);
				break;
		}
	};
	
	/**
	 * Add post to Jam
	 * @param {string} content The content to post to Jam
	 * @param {string} groupId The Jam Group Id to post to
	 * @return {object} A JQuery Deferred promise object
	 * @public
	 * @memberOf sap.collaboration.components.feed.BOMode
	 */
	BOMode.prototype.addPost = function (content, groupId) {
		var sPath = "/GroupExternalObjects(GroupId='" + groupId + "',ExternalObjectId='" + this._sJamBOId + "')/FeedEntries";
		
		return Mode.prototype.addPost.apply(this, [content, sPath]);
	};
	
	return BOMode;
	
}, /* bExport */ true);
