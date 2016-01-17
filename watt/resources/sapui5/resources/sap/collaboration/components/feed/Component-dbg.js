/* @copyright */

/**
* Constructor for the Feed Component.
*
* Accepts an object literal <code>mSettings</code> that defines initial 
* property values, aggregated and associated objects as well as event handlers.
* 
*
* @param {string} [sId] id for the new component, generated automatically if no id is given 
* @param {map} [mSettings] initial settings for the new component. See the documentation of the component's properties for the structure of the expected data.
* 
* @class 
* The Feed Component is an SAPUI5 component that allows you to display SAP Jam feeds. 
* It includes the option to add new posts and reply to entries and view other users' social profiles from SAP Jam,
*
* @extends sap.ui.core.UIComponent
* @version ${version}
* @since 1.30
* 
* @constructor
* @public
* @name sap.collaboration.components.feed.Component
* 
*/
(function() {
	var sComponentName = "sap.collaboration.components.feed.Component";
	jQuery.sap.require("sap.ui.core.UIComponent");
	jQuery.sap.require("sap.suite.ui.commons.library");
	jQuery.sap.declare(sComponentName);
	sap.ui.core.UIComponent.extend(sComponentName, {

	    metadata : {
	        stereotype: "component",
	    	version: "1.0",
	    	includes: ["../resources/css/MorePopover.css"],
	    	dependencies: {
	    		libs: [],
	    		components: [],
	    		ui5version: ""
	    	},
	    	library: "sap.collaboration",
	    	properties: {
				"axisOrientation": {type:"sap.suite.ui.commons.TimelineAxisOrientation",group:"Misc",defaultValue:sap.suite.ui.commons.TimelineAxisOrientation.Vertical},
				"feedSources": {type:"object|string[]"}
	    	},
	    	
	        rootView : null, // the rootView to open (view name as string or view configuration object)
	        publicMethods: [ "setSettings" ],
	        aggregations: {
	        },
		    routing: {  
	        },
	        config: {
	        },
	        customizing: {
	        }
	    },
		/**
		* Initializes the Component instance after creation. 
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		init: function() {
			this._logger = new jQuery.sap.log.getLogger(sComponentName);
			sap.ui.core.UIComponent.prototype.init.apply(this); // call superclass; needed to call createContent
		},
		/**
		* Cleans up the component instance before destruction.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		exit: function() {
			
		},
		/**
		* Function is called when the rendering of the Component Container is started.
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		onBeforeRendering: function() {			
			
		},
		
		/**
		* Function is called when the rendering of the Component Container is completed. 
		* @protected
		* @memberOf sap.collaboration.components.feed.Component
		*/
		onAfterRendering: function() {
		},
		/**
		 * The method to create the Content (UI Control Tree) of the Component. 
		 * @protected
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		createContent: function() {
			this._view = sap.ui.view({
				id: this.createId("group_feed_view"),
				height: "100%",
				type:sap.ui.core.mvc.ViewType.XML, 
				viewName:"sap.collaboration.components.feed.views.GroupFeed"
			});
			
			this.setAxisOrientation(this.getAxisOrientation());
			
			return this._view;
		},
		/**
		 * Sets all the properties passed in oSettings.
		 * @param {map} settings - key/value map for settings
		 * @memberOf sap.collaboration.components.feed.Component 
		 * @public
		 */
		setSettings: function(settings) {
			for(var key in settings) {
				if(settings.hasOwnProperty(key)) {
					this._setProperty(key, settings[key]);
				}
			}
		},
		/**
		 * Set the property's new value in the component and in the view's model
		 * @param {string} propertyName
		 * @param {string} propertyValue
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		_setProperty: function(propertyName, propertyValue) {
			this._logger.info(propertyName + ": " + propertyValue);
			this._view.getModel().setProperty("/" + propertyName, propertyValue);
			this.setProperty(propertyName, propertyValue);
		},
		/**
		 * Set the axis orientation for the timeline
		 * 
		 * @override 
		 * @param {sap.suite.ui.commons.TimelineAxisOrientation} axisOrientation
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setAxisOrientation: function(axisOrientation) {
			this._setProperty("axisOrientation", axisOrientation);
		},
		/**
		 * Sets the sources for the feed
		 * - Array of strings representing the Jam group IDs (e.g. ["groupid1", "groupid2"])
		 * 
		 * @override 
		 * @param {object} feedSources
		 * @memberOf sap.collaboration.components.feed.Component
		 */
		setFeedSources: function(feedSources) {
			this._setProperty("feedSources", feedSources);
		}
	});
})();
