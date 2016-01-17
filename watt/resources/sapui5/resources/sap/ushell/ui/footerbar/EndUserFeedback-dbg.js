/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ushell.ui.footerbar.EndUserFeedback.
jQuery.sap.declare("sap.ushell.ui.footerbar.EndUserFeedback");
jQuery.sap.require("sap.ushell.library");
jQuery.sap.require("sap.m.Button");


/**
 * Constructor for a new ui/footerbar/EndUserFeedback.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getShowAnonymous showAnonymous} : boolean (default: true)</li>
 * <li>{@link #getShowLegalAgreement showLegalAgreement} : boolean (default: true)</li>
 * <li>{@link #getShowCustomUIContent showCustomUIContent} : boolean (default: true)</li>
 * <li>{@link #getFeedbackDialogTitle feedbackDialogTitle} : string</li>
 * <li>{@link #getTextAreaPlaceholder textAreaPlaceholder} : string</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getCustomUIContent customUIContent} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 
 *
 * 
 * In addition, all settings applicable to the base type {@link sap.m.Button#constructor sap.m.Button}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Add your documentation for the newui/footerbar/EndUserFeedback
 * @extends sap.m.Button
 * @version 1.32.6
 *
 * @constructor
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback
 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
 */
sap.m.Button.extend("sap.ushell.ui.footerbar.EndUserFeedback", { metadata : {

	library : "sap.ushell",
	properties : {
		"showAnonymous" : {type : "boolean", group : "Misc", defaultValue : true},
		"showLegalAgreement" : {type : "boolean", group : "Misc", defaultValue : true},
		"showCustomUIContent" : {type : "boolean", group : "Misc", defaultValue : true},
		"feedbackDialogTitle" : {type : "string", group : "Misc", defaultValue : null},
		"textAreaPlaceholder" : {type : "string", group : "Misc", defaultValue : null}
	},
	aggregations : {
		"customUIContent" : {type : "sap.ui.core.Control", multiple : true, singularName : "customUIContent"}
	}
}});


/**
 * Creates a new subclass of class sap.ushell.ui.footerbar.EndUserFeedback with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.ushell.ui.footerbar.EndUserFeedback.extend
 * @function
 */


/**
 * Getter for property <code>showAnonymous</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showAnonymous</code>
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getShowAnonymous
 * @function
 */

/**
 * Setter for property <code>showAnonymous</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowAnonymous  new value for property <code>showAnonymous</code>
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#setShowAnonymous
 * @function
 */


/**
 * Getter for property <code>showLegalAgreement</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showLegalAgreement</code>
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getShowLegalAgreement
 * @function
 */

/**
 * Setter for property <code>showLegalAgreement</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowLegalAgreement  new value for property <code>showLegalAgreement</code>
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#setShowLegalAgreement
 * @function
 */


/**
 * Getter for property <code>showCustomUIContent</code>.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showCustomUIContent</code>
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getShowCustomUIContent
 * @function
 */

/**
 * Setter for property <code>showCustomUIContent</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowCustomUIContent  new value for property <code>showCustomUIContent</code>
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#setShowCustomUIContent
 * @function
 */


/**
 * Getter for property <code>feedbackDialogTitle</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>feedbackDialogTitle</code>
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getFeedbackDialogTitle
 * @function
 */

/**
 * Setter for property <code>feedbackDialogTitle</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sFeedbackDialogTitle  new value for property <code>feedbackDialogTitle</code>
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#setFeedbackDialogTitle
 * @function
 */


/**
 * Getter for property <code>textAreaPlaceholder</code>.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>textAreaPlaceholder</code>
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getTextAreaPlaceholder
 * @function
 */

/**
 * Setter for property <code>textAreaPlaceholder</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTextAreaPlaceholder  new value for property <code>textAreaPlaceholder</code>
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#setTextAreaPlaceholder
 * @function
 */


/**
 * Getter for aggregation <code>customUIContent</code>.<br/>
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#getCustomUIContent
 * @function
 */


/**
 * Inserts a customUIContent into the aggregation named <code>customUIContent</code>.
 *
 * @param {sap.ui.core.Control}
 *          oCustomUIContent the customUIContent to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the customUIContent should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the customUIContent is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the customUIContent is inserted at 
 *             the last position        
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#insertCustomUIContent
 * @function
 */

/**
 * Adds some customUIContent <code>oCustomUIContent</code> 
 * to the aggregation named <code>customUIContent</code>.
 *
 * @param {sap.ui.core.Control}
 *            oCustomUIContent the customUIContent to add; if empty, nothing is inserted
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#addCustomUIContent
 * @function
 */

/**
 * Removes an customUIContent from the aggregation named <code>customUIContent</code>.
 *
 * @param {int | string | sap.ui.core.Control} vCustomUIContent the customUIContent to remove or its index or id
 * @return {sap.ui.core.Control} the removed customUIContent or null
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#removeCustomUIContent
 * @function
 */

/**
 * Removes all the controls in the aggregation named <code>customUIContent</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#removeAllCustomUIContent
 * @function
 */

/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>customUIContent</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oCustomUIContent the customUIContent whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#indexOfCustomUIContent
 * @function
 */
	

/**
 * Destroys all the customUIContent in the aggregation 
 * named <code>customUIContent</code>.
 * @return {sap.ushell.ui.footerbar.EndUserFeedback} <code>this</code> to allow method chaining
 * @public
 * @name sap.ushell.ui.footerbar.EndUserFeedback#destroyCustomUIContent
 * @function
 */

// Start of sap/ushell/ui/footerbar/EndUserFeedback.js
(function () {
    "use strict";
    /*global jQuery, sap, window*/

    /**
     * EndUserFeedbackButton
     *
     * @name sap.ushell.ui.footerbar.EndUserFeedback
     * @private
     * @since 1.26.0
     */
    jQuery.sap.declare("sap.ushell.ui.footerbar.EndUserFeedback");
    jQuery.sap.require("sap.ushell.resources");
    jQuery.sap.require("sap.ushell.ui.launchpad.AccessibilityCustomData");



    sap.ushell.ui.footerbar.EndUserFeedback.prototype.init = function () {
        jQuery.sap.require("sap.ushell.services.Container");

        var userInfo = sap.ushell.Container.getUser(),
            sFormFactor = sap.ushell.utils.getFormFactor();

        this.oUserDetails = {
            userId: userInfo.getId(),
            eMail: userInfo.getEmail()
        };
        this.translationBundle = sap.ushell.resources.i18n;
        this.oEndUserFeedbackService = sap.ushell.Container.getService("EndUserFeedback");
        this.appConfiguration = sap.ushell.services.AppConfiguration;
        //Set RndUserFeedback model.
        this.oEndUserFeedbackModel = new sap.ui.model.json.JSONModel();
        this.oEndUserFeedbackModel.setData({
            feedbackViewTitle: this.translationBundle.getText("userFeedback_title"),
            legalAgreementViewTitle: this.translationBundle.getText("userFeedbackLegal_title"),
            textAreaPlaceholderText: this.translationBundle.getText("feedbackPlaceHolderHeader"),
            presentationStates: {
                //When in 'init', the getters retrieve only their default values.
                showAnonymous: this.getShowLegalAgreement(),
                showLegalAgreement: this.getShowLegalAgreement(),
                showCustomUIContent: this.getShowCustomUIContent()
            },
            clientContext: {
                userDetails: jQuery.extend(true, {}, this.oUserDetails),
                navigationData: {
                    formFactor: sFormFactor,
                    applicationInformation: {},
                    navigationHash: null
                }
            },
            isAnonymous: true,
            applicationIconPath: '',
            leftButton: {
                feedbackView: this.translationBundle.getText("sendBtn"),
                legalAgreementView: this.translationBundle.getText("approveBtn")
            },
            rightButton: {
                feedbackView: this.translationBundle.getText("cancelBtn"),
                legalAgreementView: this.translationBundle.getText("declineBtn")
            },
            states: {
                isLegalAgreementChecked: false,
                isRatingSelected: false,
                isInFeedbackView: true
            },
            technicalLink: {
                state: 0, // 0 - hidden, 1- visible
                title: [
                    this.translationBundle.getText("technicalDataLink"),
                    this.translationBundle.getText("technicalDataLinkHide")
                ]
            },
            textArea: {
                inputText: ''
            },
            contextText: '',
            ratingButtons: [
                {
                    text: sap.ushell.resources.i18n.getText("ratingExcellentText"),
                    color: 'sapUshellRatingLabelFeedbackPositiveText',
                    iconSymbol: 'sap-icon://BusinessSuiteInAppSymbols/icon-face-very-happy',
                    id: 'rateBtn1',
                    index: 1
                },
                {
                    text: sap.ushell.resources.i18n.getText("ratingGoodText"),
                    color: 'sapUshellRatingLabelFeedbackPositiveText',
                    iconSymbol: 'sap-icon://BusinessSuiteInAppSymbols/icon-face-happy',
                    id: 'rateBtn2',
                    index: 2
                },
                {
                    text: sap.ushell.resources.i18n.getText("ratingAverageText"),
                    color: 'sapUshellRatingLabelFeedbackNeutralText',
                    iconSymbol: 'sap-icon://BusinessSuiteInAppSymbols/icon-face-neutral',
                    id: 'rateBtn3',
                    index: 3
                },
                {
                    text: sap.ushell.resources.i18n.getText("ratingPoorText"),
                    color: 'sapUshellRatingLabelFeedbackCriticalText',
                    iconSymbol: 'sap-icon://BusinessSuiteInAppSymbols/icon-face-bad',
                    id: 'rateBtn4',
                    index: 4
                },
                {
                    text: sap.ushell.resources.i18n.getText("ratingVeyPoorText"),
                    color: 'sapUshellRatingLabelFeedbackNegativeText',
                    iconSymbol: 'sap-icon://BusinessSuiteInAppSymbols/icon-face-very-bad',
                    id: 'rateBtn5',
                    index: 5
                }
            ],
            selectedRating: {
                text: '',
                color: '',
                index: 0
            }
        });

        this.setIcon('sap-icon://marketing-campaign');
        this.setWidth('100%');
        this.setText(sap.ushell.resources.i18n.getText("endUserFeedbackBtn"));
        this.setTooltip(sap.ushell.resources.i18n.getText("endUserFeedbackBtn_tooltip"));
        this.attachPress(this.ShowEndUserFeedbackDialog);
        this.setEnabled();// disables button if shell not initialized
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.ShowEndUserFeedbackDialog = function () {
        this.updateModelContext();
        if (this.oDialog) {
            this.updateTechnicalInfo();
            this.oDialog.open();
            return;
        }
        jQuery.sap.require("sap.ui.layout.form.SimpleForm");
        jQuery.sap.require("sap.ui.layout.HorizontalLayout");
        jQuery.sap.require("sap.ui.layout.VerticalLayout");
        jQuery.sap.require("sap.m.TextArea");
        jQuery.sap.require("sap.m.Link");
        jQuery.sap.require("sap.m.Label");
        jQuery.sap.require("sap.m.Text");
        jQuery.sap.require("sap.m.Dialog");
        jQuery.sap.require("sap.m.Button");
        jQuery.sap.require("sap.m.Image");

        var sModulePath = jQuery.sap.getModulePath("sap.ushell"),
            sDefaultLogo = sModulePath + '/themes/base/img/launchpadDefaultIcon.jpg',
            bIsDesktop = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/formFactor') === 'desktop';

        this.oLegalAgreementInfoLayout = null;
        this.oBackButton = new sap.m.Button('endUserFeedbackBackBtn', {
            visible: {
                path: "/states/isInFeedbackView",
                formatter: function (oIsInFeedbackView) {

                    return !oIsInFeedbackView;
                }
            },
            icon: sap.ui.core.IconPool.getIconURI("nav-back"),
            press: function () {
                this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView', true);
            }.bind(this),
            tooltip: sap.ushell.resources.i18n.getText("feedbackGoBackBtn_tooltip")
        });
        this.oPopoverTitle = new sap.m.Text("PopoverTitle", {
            text: {
                parts: [
                    {path: '/states/isInFeedbackView'},
                    {path: '/feedbackViewTitle'}
                ],
                formatter: function (bIsInFeedbackView) {
                    return this.oEndUserFeedbackModel.getProperty(bIsInFeedbackView ? "/feedbackViewTitle" : "/legalAgreementViewTitle");
                }.bind(this)
            }
        });
        this.oHeadBar = new sap.m.Bar({
            contentLeft: [this.oBackButton],
            contentMiddle: [this.oPopoverTitle]
        });
        this.oLogoImg = new sap.m.Image('sapFeedbackLogo', {
            src: sDefaultLogo,
            width: '4.5rem',
            height: '4.5rem',
            visible: {
                path: '/applicationIconPath',
                formatter: function (applicationIconPath) {
                    return !applicationIconPath;
                }
            }
        });
        this.oAppIcon = new sap.ui.core.Icon('sapFeedbackAppIcon', {
            src: '{/applicationIconPath}',
            width: '4.5rem',
            height: '4.5rem',
            visible: {
                path: '/applicationIconPath',
                formatter: function (applicationIconPath) {
                    return !!applicationIconPath;
                }
            }
        }).addStyleClass("sapUshellFeedbackAppIcon");
        this.oContextName = new sap.m.Text('contextName', {text: '{/contextText}'});
        this.oContextLayout = new sap.ui.layout.HorizontalLayout('contextLayout', {content: [this.oLogoImg, this.oAppIcon, this.oContextName]});
        this.oRatingLabel = new sap.m.Label('ratingLabel', {required: true, text: sap.ushell.resources.i18n.getText("ratingLabelText")});
        this.oRatingSelectionText = new sap.m.Text('ratingSelectionText', {
            text: {
                path: '/selectedRating',
                formatter: function (oSelectedRating) {
                    if (this.lastSelectedColor) {
                        this.removeStyleClass(this.lastSelectedColor);
                    }
                    if (oSelectedRating.color) {
                        this.addStyleClass(oSelectedRating.color);
                    }
                    this.lastSelectedColor = oSelectedRating.color;

                    return oSelectedRating.text;
                }
            }
        });
        this.oRatingButtonTemplate = new sap.m.Button({icon: '{iconSymbol}', height: '100%', width:'20%'});
        this.oRatingButtons = new sap.m.SegmentedButton('ratingButtons', {
            width: "98%",
            selectedButton: 'noDefalut',
            buttons: {
                path: "/ratingButtons",
                template: this.oRatingButtonTemplate
            },
            select: function (eObj) {
                var sId = eObj.mParameters.id,
                    sPath = sap.ui.getCore().byId(sId).getBindingContext().getPath(),
                    oButtonContext = this.oEndUserFeedbackModel.getProperty(sPath);

                this.oEndUserFeedbackModel.setProperty('/selectedRating', { text: oButtonContext.text, color: oButtonContext.color, index: oButtonContext.index});
                this.oEndUserFeedbackModel.setProperty('/states/isRatingSelected', true);
            }.bind(this)
        });
        this.oRatingButtons.addAriaLabelledBy("ratingLabel");
        if (bIsDesktop) {
            this.oRatingIndicationLayout = new sap.ui.layout.HorizontalLayout('ratingIndicationLayout', {content: [this.oRatingLabel, this.oRatingSelectionText]});
        } else {
            this.oRatingIndicationLayout = new sap.ui.layout.VerticalLayout('ratingIndicationLayoutMob', {content: [this.oRatingLabel, this.oRatingSelectionText]});
        }
        this.oRatingLayout = new sap.ui.layout.VerticalLayout('ratingLayout', {
            width: "100%",
            content: [this.oRatingIndicationLayout, this.oRatingButtons]
        });

        this.oAnonymousCheckbox = new sap.m.CheckBox('anonymousCheckbox', {
            name: 'anonymousCheckbox',
            visible: '{/presentationStates/showAnonymous}',
            text: sap.ushell.resources.i18n.getText("feedbackSendAnonymousText"),
            selected: '{/isAnonymous}',
            select: function (oEvent) {
                var bChecked = oEvent.getParameter("selected");
                this._handleAnonymousSelection(bChecked);
            }.bind(this)
        });
        var isAnonymous = (!this.oEndUserFeedbackModel.getProperty("/presentationStates/showAnonymous") || this.oEndUserFeedbackModel.getProperty("/isAnonymous"));
        this._handleAnonymousSelection(isAnonymous);

        this.oLegalAgrementCheckbox = new sap.m.CheckBox('legalAgreement', {
            name: 'legalAgreement',
            visible: '{/presentationStates/showLegalAgreement}',
            selected: '{/states/isLegalAgreementChecked}',
            text: this.translationBundle.getText("agreementAcceptanceText")
        });
        this.oLegalAgreeementLink = new sap.m.Link('legalAgreementLink', {
            text: this.translationBundle.getText("legalAgreementLinkText"),
            visible: '{/presentationStates/showLegalAgreement}',
            press: function () {
                var oPromise = this.oEndUserFeedbackService.getLegalText();

                oPromise.done(this._showLegalAgreementInfo.bind(this));
            }.bind(this)
        });
        this.aCustomUIContent = jQuery.extend([], this.getCustomUIContent());
        this.oCustomUILayout = new sap.ui.layout.VerticalLayout('customUILayout', {
            visible: {
                path: '/presentationStates/showCustomUIContent',
                formatter: function (bShowCustomUIContent) {
                    return (bShowCustomUIContent && this.aCustomUIContent.length) ? true : false;
                }.bind(this)
            },
            content: this.getCustomUIContent(),
            width: "100%"
        });
        this.oLegalLayout = new sap.ui.layout.VerticalLayout('legalLayout', {content: [this.oAnonymousCheckbox, this.oLegalAgrementCheckbox, this.oLegalAgreeementLink]});
        this.oTechnicalDataLink = new sap.m.Link('technicalDataLink', {
            text: {
                path: '/technicalLink/state',
                formatter: function (oState) {
                    return this.getModel().getProperty('/technicalLink/title/' + oState);
                }
            },
            press: function () {
                var _state = this.oEndUserFeedbackModel.getProperty("/technicalLink/state");

                this.oEndUserFeedbackModel.setProperty('/technicalLink/state', Math.abs(_state - 1));
            }.bind(this)
        });
        this.oTechnicalDataLayout = new sap.ui.layout.HorizontalLayout('technicalDataLayout', {content: [this.oTechnicalDataLink]});
        this.leftButton = new sap.m.Button("EndUserFeedbackLeftBtn", {
            text: {
                path: "/states/isInFeedbackView",
                formatter: function (bIsInFeedbackView) {
                    return this.getModel().getProperty('/leftButton/' + (bIsInFeedbackView ? 'feedbackView' : 'legalAgreementView'));
                }
            },
            enabled: {
                parts: [
                    {path: '/states/isInFeedbackView'},
                    {path: '/states/isLegalAgreementChecked'},
                    {path: '/states/isRatingSelected'},
                    {path: '/presentationStates/showLegalAgreement'}
                ],
                formatter: function (bIsInFeedbackView, bIsLegalAgreementChecked, bIsRatingSelected, bShowLegalAgreement) {
                    return !bIsInFeedbackView || (bIsRatingSelected && (bIsLegalAgreementChecked || !bShowLegalAgreement));
                }
            },
            press: function () {
                var bIsInFeedbackView = this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");

                if (bIsInFeedbackView) {
                    var oFeedbackObject = {
                            feedbackText: this.oEndUserFeedbackModel.getProperty('/textArea/inputText'),
                            ratings: [
                                {
                                    questionId: "Q10",
                                    value: this.oEndUserFeedbackModel.getProperty('/selectedRating/index')
                                }
                            ],
                            clientContext: this.oEndUserFeedbackModel.getProperty('/clientContext'),
                            isAnonymous: this.oEndUserFeedbackModel.getProperty('/isAnonymous')
                        },
                        promise = this.oEndUserFeedbackService.sendFeedback(oFeedbackObject);

                    promise.done(function () {
                        sap.ushell.Container.getService("Message").info(this.translationBundle.getText('feedbackSendToastTxt'));
                    }.bind(this));
                    promise.fail(function () {
                        sap.ushell.Container.getService("Message").error(this.translationBundle.getText('feedbackFailedToastTxt'));
                    }.bind(this));
                    this.oDialog.close();
                } else {
                    this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView', true);
                    this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked', true);
                }
            }.bind(this)
        });
        this.rightButton = new sap.m.Button("EndUserFeedbackRightBtn", {
            text: {
                path: "/states/isInFeedbackView",
                formatter: function (bIsInFeedbackView) {
                    return this.getModel().getProperty('/rightButton/' + (bIsInFeedbackView ? 'feedbackView' : 'legalAgreementView'));
                }
            },
            press: function () {
                var bIsInFeedbackView = this.oEndUserFeedbackModel.getProperty("/states/isInFeedbackView");
                if (bIsInFeedbackView) {
                    this.oDialog.close();
                } else {
                    this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView', true);
                    this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked', false);
                }
            }.bind(this)
        });
        this.oTextArea = new sap.m.TextArea("feedbackTextArea", {
            rows: 6,
            value: '{/textArea/inputText}',
            placeholder: '{/textAreaPlaceholderText}'
        });
        //Add support for scren readers.
        this.oTextArea.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({
            key: "aria-label",
            value: this.oEndUserFeedbackModel.getProperty('/textAreaPlaceholderText'),
            writeToDom: true
        }));
        this.oDialog = new sap.m.Dialog({
            id: "UserFeedbackDialog",
            contentWidth: "25rem",
            leftButton: this.leftButton,
            rightButton: this.rightButton,
            stretchOnPhone: true,
            initialFocus: "textArea",
            afterOpen: function () {
                //Fix ios 7.1 bug in ipad4 where there is a gray box on the screen when you close the keyboards
                jQuery("#textArea").on("focusout", function () {
                    window.scrollTo(0, 0);
                });
            }
        }).addStyleClass("sapUshellEndUserFeedbackDialog");
        this.oDialog.setModel(this.oEndUserFeedbackModel);
        this.oDialog.setCustomHeader(this.oHeadBar);
        this.oDialog.addCustomData(new sap.ushell.ui.launchpad.AccessibilityCustomData({
            key: "aria-label",
            value: this.translationBundle.getText("endUserFeedbackAreaLabel"),
            writeToDom: true
        }));
        this.oTechnicalInfoBoxLayout = this._createTechnicalDataContent();
        this.oFeedbackLayout = new sap.ui.layout.VerticalLayout('feedbackLayout', {
            visible: '{/states/isInFeedbackView}',
            content: [this.oContextLayout, this.oRatingLayout, this.oTextArea, this.oTechnicalDataLayout, this.oTechnicalInfoBoxLayout, this.oLegalLayout, this.oCustomUILayout]
        }).addStyleClass("sapUshellFeedbackLayout");
        this.oMainLayout = new sap.ui.layout.VerticalLayout("mainLayout", {editable: false, content: [this.oFeedbackLayout]});
        this.oDialog.addContent(this.oMainLayout);
        this.oDialog.open();
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype._handleAnonymousSelection = function (bChecked) {
        var anonymousTxt = this.translationBundle.getText('feedbackAnonymousTechFld');

        this.oEndUserFeedbackModel.setProperty('/isAnonymous', bChecked);
        this.oEndUserFeedbackModel.setProperty('/clientContext/userDetails/eMail', bChecked ? anonymousTxt : this.oUserDetails.eMail);
        this.oEndUserFeedbackModel.setProperty('/clientContext/userDetails/userId', bChecked ? anonymousTxt : this.oUserDetails.userId);
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype._createTechnicalDataContent = function () {
        this.oTechnicalInfoBox = new sap.ui.layout.form.SimpleForm('feedbackTechnicalInfoBox', {
            layout: sap.ui.layout.form.SimpleFormLayout.ResponsiveLayout,
            content: this.getTechnicalInfoContent()
        });
        if (sap.ui.Device.os.ios && sap.ui.Device.system.phone) {
            this.oTechnicalInfoBox.addStyleClass("sapUshellContactSupportFixWidth");
        }

        var originalAfterRenderSimpleForm = this.oTechnicalInfoBox.onAfterRendering;
        this.oTechnicalInfoBox.onAfterRendering = function () {
            originalAfterRenderSimpleForm.apply(this, arguments);
            var node = jQuery(this.getDomRef());
            node.attr("tabIndex", 0);
            jQuery.sap.delayedCall(700, node, function () {
                this.focus();
            });
        };
        return new sap.ui.layout.HorizontalLayout('technicalInfoBoxLayout', {
            visible: {
                path: '/technicalLink/state',
                formatter: function (state) {
                    return state === 1;
                }
            },
            content: [this.oTechnicalInfoBox]
        });
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype._createLegalAgreementLayout = function (sLegalAgreementText) {
        this.oLegalText = new sap.m.TextArea('legalText', {cols: 50, rows: 22 });
        this.oLegalText.setValue([sLegalAgreementText]);
        this.oLegalText.setEditable(false);
        var origLegalTextOnAfterRendering = this.oLegalText.onAfterRendering;
        this.oLegalText.onAfterRendering = function () {
            if (origLegalTextOnAfterRendering) {
                origLegalTextOnAfterRendering.apply(this, arguments);
            }
            var jqLegalText = jQuery(this.getDomRef());
            jqLegalText.find("textarea").attr("tabindex", "0");
        };
        this.oLegalAgreementInfoLayout = new sap.ui.layout.VerticalLayout('legalAgreementInfoLayout', {
            visible: {
                path: "/states/isInFeedbackView",
                formatter: function (bIsInFeedbackView) {
                    return !bIsInFeedbackView;
                }
            },
            content: [this.oLegalText]
        });
        this.oMainLayout.addContent(this.oLegalAgreementInfoLayout);
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype._showLegalAgreementInfo = function (sLegalAgreementText) {
        this.oEndUserFeedbackModel.setProperty('/states/isInFeedbackView', false);

        if (!this.oLegalAgreementInfoLayout) { // if not initialized yet
            this._createLegalAgreementLayout(sLegalAgreementText);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.addCustomUIContent = function (oControl) {
        var isLegalControl = oControl && oControl.getMetadata && oControl.getMetadata().getStereotype && oControl.getMetadata().getStereotype() === 'control';

        if (isLegalControl) {
            if (this.getShowCustomUIContent()) {
                this.oEndUserFeedbackModel.setProperty('/presentationStates/showCustomUIContent', true);
            }
            this.addAggregation('customUIContent', oControl);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowAnonymous = function (bValue) {
        if (typeof bValue === 'boolean') {
            this.oEndUserFeedbackModel.setProperty('/presentationStates/showAnonymous', bValue);
            this.setProperty('showAnonymous', bValue, true);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowLegalAgreement = function (bValue) {
        if (typeof bValue === 'boolean') {
            this.oEndUserFeedbackModel.setProperty('/presentationStates/showLegalAgreement', bValue);
            this.setProperty('showLegalAgreement', bValue, true);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setShowCustomUIContent = function (bValue) {
        if (typeof bValue === 'boolean') {
            this.oEndUserFeedbackModel.setProperty('/presentationStates/showCustomUIContent', bValue);
            this.setProperty('showCustomUIContent', bValue, true);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setFeedbackDialogTitle = function (sValue) {
        if (typeof sValue === 'string') {
            this.oEndUserFeedbackModel.setProperty('/feedbackViewTitle', sValue);
            this.setProperty('feedbackDialogTitle', sValue, true);
        }
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setTextAreaPlaceholder = function (sValue) {
        if (typeof sValue === 'string') {
            this.oEndUserFeedbackModel.setProperty('/textAreaPlaceholderText', sValue);
            this.setProperty('textAreaPlaceholder', sValue, true);
        }
    };
    sap.ushell.ui.footerbar.EndUserFeedback.prototype.updateModelContext = function () {
        var oURLParsing = sap.ushell.Container.getService("URLParsing"),
            sHash,
            oParsedHash,
            sIntent,
            currentPage,
            sourcePage,
            sUrlText;

        // Extract the intent from the current URL.
        // If no hash exists then the intent is set to an empty string
        sHash = oURLParsing.getShellHash(window.location);
        oParsedHash = oURLParsing.parseShellHash(sHash);
        sIntent = (oParsedHash !== undefined) ? oParsedHash.semanticObject + "-" + oParsedHash.action : "";
        currentPage = this.getModel().getProperty("/currentState/stateName");
        if (currentPage === "home" || currentPage === "catalog") {
            sourcePage = this.translationBundle.getText(currentPage + '_title');
        }

        this.currentApp = this.appConfiguration.getCurrentAppliction();
        this.bHasAppName = (this.currentApp && this.appConfiguration.getMetadata(this.currentApp) && this.appConfiguration.getMetadata(this.currentApp).title);
        this.sAppIconPath = (this.currentApp && this.appConfiguration.getMetadata(this.currentApp) && this.appConfiguration.getMetadata(this.currentApp).icon);
        this.oEndUserFeedbackModel.setProperty('/contextText', this.bHasAppName ? this.appConfiguration.getMetadata(this.currentApp).title : this.translationBundle.getText('feedbackHeaderText'));


        sUrlText = null;
        if (this.currentApp && this.currentApp.url) {
            sUrlText = this.currentApp.url.split('?')[0];
        } else if (currentPage) {
            sUrlText = this.translationBundle.getText("flp_page_name");
        }
        this.oEndUserFeedbackModel.setProperty('/clientContext/navigationData/applicationInformation', {
            url: sUrlText,
            additionalInformation: (this.currentApp && this.currentApp.additionalInformation) ? this.currentApp.additionalInformation : null,
            applicationType: (this.currentApp && this.currentApp.applicationType) ? this.currentApp.applicationType : null
        });

        this.oEndUserFeedbackModel.setProperty('/clientContext/navigationData/navigationHash', sourcePage ? sourcePage : sIntent);
        this.oEndUserFeedbackModel.setProperty('/selectedRating', { text: '', color: '', index: 0});
        this.oEndUserFeedbackModel.setProperty('/states/isRatingSelected', false);
        this.oEndUserFeedbackModel.setProperty('/states/isLegalAgreementChecked', false);
        this.oEndUserFeedbackModel.setProperty('/technicalLink/state', 0);
        this.oEndUserFeedbackModel.setProperty('/textArea/inputText', '');
        this.oEndUserFeedbackModel.setProperty('/applicationIconPath', this.sAppIconPath);
        this._handleAnonymousSelection(true);

    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.updateTechnicalInfo = function () {
        this.oTechnicalInfoBox.destroyContent();
        this.oTechnicalInfoBox.removeAllContent();
        var aTechnicalInfoContent = this.getTechnicalInfoContent(),
            contentIndex;

        for (contentIndex in aTechnicalInfoContent) {
            this.oTechnicalInfoBox.addContent(aTechnicalInfoContent[contentIndex]);
        }
        this.oRatingButtons.setSelectedButton('noDefalut');
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.getTechnicalInfoContent = function () {
        var aFormContent = [],
            sFormFactor = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/formFactor'),
            sUserId = this.oEndUserFeedbackModel.getProperty('/clientContext/userDetails/userId'),
            sEmail = this.oEndUserFeedbackModel.getProperty('/clientContext/userDetails/eMail'),
            sAppUrl = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/url'),
            sAppType = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/applicationType'),
            sAppAdditionalInfo = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/applicationInformation/additionalInformation'),
            sNavHash = this.oEndUserFeedbackModel.getProperty('/clientContext/navigationData/navigationHash'),
            currentPage = this.getModel().getProperty("/currentState/stateName"),
            bDisplayData = (currentPage === "home" || currentPage === "catalog") ? false : true;

        aFormContent.push(new sap.m.Text({text: this.translationBundle.getText("loginDetails")}).addStyleClass('sapUshellContactSupportHeaderInfoText'));
        aFormContent.push(sUserId ? new sap.m.Label({text: this.translationBundle.getText("userFld")}) : null);
        aFormContent.push(sUserId ? new sap.m.Text('technicalInfoUserIdTxt', {text: '{/clientContext/userDetails/userId}'}) : null);
        aFormContent.push(sEmail ? new sap.m.Label({text: this.translationBundle.getText("eMailFld")}) : null);
        aFormContent.push(sEmail ? new sap.m.Text({text: '{/clientContext/userDetails/eMail}'}) : null);
        aFormContent.push(sFormFactor ? new sap.m.Label({text: this.translationBundle.getText('formFactorFld')}) : null);
        aFormContent.push(sFormFactor ? new sap.m.Text({text: '{/clientContext/navigationData/formFactor}'}) : null);
        //Required to align the following Text under the same column.
        aFormContent.push(new sap.m.Text({text: ''}));
        aFormContent.push(new sap.m.Text({text: this.translationBundle.getText(this.currentApp ? 'applicationInformationFld' : 'feedbackHeaderText')}).addStyleClass('sapUshellEndUserFeedbackHeaderInfoText').addStyleClass("sapUshellEndUserFeedbackInfoTextSpacing"));
        aFormContent.push(sAppUrl && bDisplayData ? new sap.m.Label({text: this.translationBundle.getText("urlFld")}) : null);
        aFormContent.push(sAppUrl && bDisplayData ? new sap.m.Text({text: '{/clientContext/navigationData/applicationInformation/url}'}) : null);
        aFormContent.push(sAppType ? new sap.m.Label({text: this.translationBundle.getText("applicationTypeFld")}) : null);
        aFormContent.push(sAppType ? new sap.m.Text({text: '{/clientContext/navigationData/applicationInformation/applicationType}'}) : null);
        aFormContent.push(sAppAdditionalInfo ? new sap.m.Label({text: this.translationBundle.getText("additionalInfoFld")}) : null);
        aFormContent.push(sAppAdditionalInfo ? new sap.m.Text({text: '{/clientContext/navigationData/applicationInformation/additionalInformation}'}) : null);
        aFormContent.push(sNavHash && bDisplayData ? new sap.m.Label({text: this.translationBundle.getText("hashFld")}) : null);
        aFormContent.push(sNavHash && bDisplayData ? new sap.m.Text({text: '{/clientContext/navigationData/navigationHash}'}) : null);

        return aFormContent.filter(Boolean);
    };

    sap.ushell.ui.footerbar.EndUserFeedback.prototype.setEnabled = function (bEnabled) {
        if (!sap.ushell.Container) {
            if (this.getEnabled()) {
                jQuery.sap.log.warning(
                    "Disabling 'End User Feedback' button: unified shell container not initialized",
                    null,
                    "sap.ushell.ui.footerbar.EndUserFeedback"
                );
            }
            bEnabled = false;
        }
        sap.m.Button.prototype.setEnabled.call(this, bEnabled);
    };
}());
