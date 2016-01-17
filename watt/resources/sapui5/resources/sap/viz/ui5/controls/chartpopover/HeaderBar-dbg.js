/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
sap.ui.define([
    'jquery.sap.global',
    'sap/m/Bar',
    'sap/m/Button',
    'sap/m/Label',
    'sap/ui/core/IconPool'
    ],
function(jQuery, Bar, Button, Label, IconPool) {
    /**
     * @author I071838
     */
    var HeaderBar = Bar.extend('sap.viz.ui5.controls.chartpopover.HeaderBar', {
        metadata : {
            properties : {
                'showNavButton' : 'boolean',
                'title' : 'string'
            },
            publicMethods : [],
            events : {
                "navButtonPress" : {},
                "closeButtonPress" : {}
            }
        },
        renderer : {}
    });

    HeaderBar.prototype.getContentLeft = function() {
        if (!this._oNavButton) {
            this._oNavButton = new Button(this._createId("popoverNavButton"), {
                type : sap.m.ButtonType.Back,
                press : jQuery.proxy(function() {
                    this.fireNavButtonPress();
                }, this)
            }).addStyleClass('sapUiIcon');
        }
        this._oNavButton.setVisible(this.getShowNavButton());
        return [this._oNavButton];
    };

    HeaderBar.prototype.getContentMiddle = function() {
        if (!this._oTitleLabel) {
            this._oTitleLabel = new Label(this._createId('popoverHeaderTitle'));
        }
        this._oTitleLabel.setText(this.getTitle());
        return [this._oTitleLabel];
    };

    HeaderBar.prototype.getContentRight = function() {
        if (!this._oCloseButton) {
            this._oCloseButton = new Button(this._createId("popoverCloseButton"), {
                icon : IconPool.getIconURI("decline"),
                tooltip : sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MESSAGEPOPOVER_CLOSE"),
                press : jQuery.proxy(function() {
                    this.fireCloseButtonPress();
                }, this)
            }).addStyleClass('sapUiIcon');
        }
        return [this._oCloseButton];
    };

    HeaderBar.prototype.exit = function() {
        if (this._oCloseButton) {
            this._oCloseButton.destroy();
            this._oCloseButton = null;
        }

        if (this._oTitleLabel) {
            this._oTitleLabel.destroy();
            this._oTitleLabel = null;
        }

        if (this._oNavButton) {
            this._oNavButton.destroy();
            this._oNavButton = null;
        }
    };

    HeaderBar.prototype._createId = function(sId) {
        return this.getId() + "-" + sId;
    };
    
    return HeaderBar;
});
