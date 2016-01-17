/*!
 * @copyright@
 */

jQuery.sap.require("sap.collaboration.library");
jQuery.sap.require("sap.collaboration.components.fiori.notification.NotificationContainer");

sap.ui.jsview("sap.collaboration.components.fiori.notification.Notification", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf Notification
	*/ 
	getControllerName : function() {
		return "sap.collaboration.components.fiori.notification.Notification";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away.
	* Creates and returns a UI5 mobile VBox 
	* @memberOf Notification
	*/ 
	createContent : function(oController) {
		this.sPrefixId = this.getViewData().controlId;
		this.oLangBundle = this.getViewData().langBundle;
		this.sStyleClassPrefix = this.getViewData().styleClassPrefix;
		this.iNumberOfNotifications = this.getViewData().numberOfNotifications;
		this.sNotificationsTargetURL = this.getViewData().notificationsTargetUrl;
		
		var oContainerBox = this.createContainerBox();
		return oContainerBox;
	},
	
	createContainerBox : function(){
		
		var self = this;
		this.aProfilePhotos = this.createProfilePhotos();
		this.oNotificationTypeText = this.createNotificationTypeText();
		this.oNotificationMessageText = this.createNotificationMessageText();
		
		var oNotificationUnreadCountVBox = this.createNotificationUnreadCountVBox();
		var oAgeAndGroupVBox = this.createNotificationAgeAndGroupVBox();
		
		var oContainerBox = new sap.collaboration.components.fiori.notification.NotificationContainer(this.sPrefixId + "_ContainerBox", {
		    		styleClassPrefix : this.sStyleClassPrefix
		});
		for (var i = 0; i < this.aProfilePhotos.length; ++i) {
			oContainerBox.addContent(this.aProfilePhotos[i]);
		}
		oContainerBox.addContent(this.oNotificationTypeText);
		oContainerBox.addContent(this.oNotificationMessageText);
		oContainerBox.addContent(oNotificationUnreadCountVBox);
		oContainerBox.addContent(oAgeAndGroupVBox);
		
		return oContainerBox;
	},
	
	createProfilePhotos : function() {
		var aProfilePhotos = [];
		for (var i = 0; i < this.iNumberOfNotifications; ++i) {
			aProfilePhotos.push(
			    new sap.m.Image(this.sPrefixId + "_ProfileImage" + i,{
			    	densityAware: false,
			    	decorative: true
			    }).addStyleClass(this.sStyleClassPrefix + "ProfileImage")
			      .addStyleClass(this.sStyleClassPrefix + "ProfileImageHidden")
			      .addStyleClass(this.sStyleClassPrefix + "CursorPointer")
			);
		}
		return aProfilePhotos;
	},
	
	createNotificationTypeText : function() {
		return new sap.m.Text(this.sPrefixId + "_NotificationType").addStyleClass(this.sStyleClassPrefix + "NotificationTypeText")
		                                                           .addStyleClass(this.sStyleClassPrefix + "CursorPointer");
	},
	
	createNotificationMessageText : function() {
		return new sap.m.Text(this.sPrefixId + "_NotificationMessage").addStyleClass(this.sStyleClassPrefix + "NotificationMessageText")
                                                                      .addStyleClass(this.sStyleClassPrefix + "CursorPointer");
	},
	
	createNotificationUnreadCountText : function() {
		return new sap.m.Text(this.sPrefixId + "_NotificationUnreadCount").addStyleClass(this.sStyleClassPrefix + "NotificationUnreadCountText")
   		                                                                  .addStyleClass(this.sStyleClassPrefix + "CursorPointer");
	},
	
	createNotificationNewNotificationOrErrorText : function() {
		return new sap.m.Text(this.sPrefixId + "_NewNotificationOrErrorText").addStyleClass(this.sStyleClassPrefix + "CursorPointer");
	},
	
	createNotificationUnreadCountVBox : function() {
		this.oNotificationUnreadCountText = this.createNotificationUnreadCountText();
		this.oNotificationNewNotificationOrErrorText = this.createNotificationNewNotificationOrErrorText();
		
		var oNotificationUnreadCountVBox = new sap.m.VBox(this.sPrefixId + "_UnreadCountVBox", {
			items:[
			  this.oNotificationUnreadCountText,
			  this.oNotificationNewNotificationOrErrorText
			]
		}).addStyleClass(this.sStyleClassPrefix + "NotificationUnreadContainer");
		
		return oNotificationUnreadCountVBox;
	},
	
	createNotificationAgeAndGroupVBox : function() {
		this.oNotificationAgeText = new sap.m.Text(this.sPrefixId + "_NotificationAge", {
			textAlign: sap.ui.core.TextAlign.Right,
			}).addStyleClass(this.sStyleClassPrefix + "NotificationAgeAndGroupText")
		                                                .addStyleClass(this.sStyleClassPrefix + "CursorPointer");
		this.oNotificationGroupText = new sap.m.Text(this.sPrefixId + "_NotificationGroup", {
			textAlign: sap.ui.core.TextAlign.Right,
			}).addStyleClass(this.sStyleClassPrefix + "NotificationAgeAndGroupText")
		                                                .addStyleClass(this.sStyleClassPrefix + "CursorPointer");
		
		var oAgeAndGroupVBox = new sap.m.VBox(this.sPrefixId + "_AgeAndGroupVBox", {
			items:[this.oNotificationAgeText, this.oNotificationGroupText]
		}).addStyleClass(this.sStyleClassPrefix + "NotificationAgeAndGroupContainer");
//		oAgeAndGroupVBox.setAlignItems(sap.m.FlexAlignItems.End); // Ensures that all items in the VBox are aligned 
		
		return oAgeAndGroupVBox;
	},
	
	// When clicking on the view, the tap event is triggered for desktop
	ontap : function() {
		window.open(this.sNotificationsTargetURL, window.name);
	}
});