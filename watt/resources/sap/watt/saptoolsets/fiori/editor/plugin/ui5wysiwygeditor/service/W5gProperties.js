define(
	[
		"sap/watt/common/plugin/platform/service/ui/AbstractPart",
		"sap/watt/lib/lodash/lodash",
		"../utils/ResourcesHelper",
		"../utils/W5gUtils",
		"../utils/EventsUtils",
		"../utils/EventBusHelper",
		"../models/W5gPropertiesModel",
		"../view/ui5ctrlpropertieseditor.controller",
		"../view/ui5ctrleventseditor.controller"
	],
	function (AbstractPart, _, ResourcesHelper, W5gUtils, EventsUtils, EventBusHelper, W5gPropertiesModel) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * Array of service sections. Each section contains reference to a service, its name and priority and a
			 * reference to <code>sap.ui.core.Control</code> as a service wrapper
			 *
			 * @type {Array<object>}
			 * @private
			 */
			_aSections = null,

			/**
			 * Reference to service document
			 *
			 * @type {object} document
			 * @private
			 */
			_oDocument = null,

			/**
			 * Reference to selected view control
			 *
			 * @type {sap.ui.core.mvc.View} sap.ui.View
			 * @private
			 */
			_oView = null,

			/**
			 * Reference window
			 *
			 * @type {Window} window
			 * @private
			 */
			_oWindow = null,

			/**
			 * The last selected control if any
			 *
			 * @type {sap.ui.core.Control}
			 * @private
			 */
			_oSelectedControl = null,

			/**
			 * The root view of <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5gProperties</code>
			 *
			 * @type {sap.ui.core.mvc.View | sap.ui.commons.Accordion}
			 * @private
			 */
			_oRoot = null,

			/**
			 * The container for sections if any
			 *
			 * @type {sap.ui.commons.Accordion}
			 * @private
			 */
			_oAccordion = null,

			/**
			 * Resize listener id
			 *
			 * @type {string}
			 * @private
			 */
			_sAccordionResizeListenerId = null,

			/**
			 * The properties editor view
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor}
			 * @private
			 */
			_oPropertiesView = null,

			/**
			 * The events editor view
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor}
			 * @private
			 */
			_oEventsView = null,

			/**
			 * The properties model
			 *
			 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPropertiesModel}
			 * @private
			 */
			_oPropertiesModel = null;

		/**
		 * Creates accordion section
		 *
		 * @param {string} sTitle section title
		 * @param {object} oContent section content
		 * @param {number} iIndex section index
		 *
		 * @name _createSection
		 * @function
		 * @private
		 */
		function _createSection(sTitle, oContent, iIndex) {
			var oSection = new sap.ui.commons.AccordionSection({
				title: sTitle,
				content: oContent
			});
			_oAccordion.insertSection(oSection, iIndex);
			_aSections[iIndex].ui = oSection.getId();
		}

		/**
		 * Opens section by index if any
		 *
		 * @name _openSection
		 * @param iIndex {number} accordion index to open
		 * @function
		 * @private
		 */
		function _openSection(iIndex) {
			if (_aSections.length > iIndex) {
				_oAccordion.openSection(_aSections[iIndex].ui);
			}
		}

		/**
		 * Checks if all sections in the accordion are collapsed
		 *
		 * @name _isAllCollapsed
		 * @return {boolean}
		 * @function
		 * @private
		 */
		function _isAllCollapsed() {
			if (!_oAccordion) {
				return true;
			}
			return _.every(_oAccordion.getSections(), function (oSection) {
				return oSection.getCollapsed();
			});
		}

		/**
		 * Adjusts height of accordion' expanded section
		 *
		 * @param {object} oEvent an event object
		 *
		 * @name _fixAccordionHeight
		 * @function
		 * @private
		 */
		function _fixAccordionHeight(oEvent) {
			if (oEvent.type === "resize" && (!oEvent.size.height || oEvent.oldSize.height === oEvent.size.height)) {
				//...switch between tabs triggers this event with .height = 0
				//...avoid this case - it leads to wrong 'maxHeight' calculation!!!!
				return;
			}
			var $this = _oAccordion.$(),
				iHeight = $this.height() - $this.find(".sapUiAcdSectionHdr").height() * (_aSections.length - 1) - 7;

			jQuery.each(_oAccordion.getSections(), function () {
				if (this.getCollapsed() === false) {
					this.setMaxHeight(iHeight + "px");
					return false;
				}
			});
		}

		/**
		 * Returns the root ui control of <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5gProperties</code>
		 * Creates it if does not exist
		 *
		 * @param {object} oContext service context
		 * @param {boolean=} bView
		 * @returns {sap.ui.layout.VerticalLayout|Array<sap.ui.core.mvc.View>}
		 *
		 * @name _getViews
		 * @function
		 * @private
		 */
		function _getViews(oContext, bView) {
			var aPromises = [];

			if (!_oRoot) {
				_oPropertiesView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrlpropertieseditor",
					type: sap.ui.core.mvc.ViewType.XML
				});

				_oEventsView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.view.ui5ctrleventseditor",
					type: sap.ui.core.mvc.ViewType.XML
				});

				_oPropertiesModel = new W5gPropertiesModel();

				_oPropertiesView.getController().setModel(_oPropertiesModel);
				_oEventsView.getController().setModel(_oPropertiesModel);

				_oAccordion = new sap.ui.commons.Accordion({
					sectionOpen: _fixAccordionHeight
				})
					.addStyleClass("sapWysiwygRightSection")
					.addEventDelegate({
						onAfterRendering: function () {
							_sAccordionResizeListenerId = sap.ui.core.ResizeHandler.register(_oAccordion.getDomRef(), _fixAccordionHeight);

							var aSections = _oAccordion.getSections();
							aSections.forEach(function (oSection, iIndex) {
								if (_aSections[iIndex].iconClass) {
									oSection.$().find('.sapUiAcdSectionLabel').addClass(_aSections[iIndex].iconClass);
								}
							});
						},
						onBeforeRendering: function () {
							if (_sAccordionResizeListenerId) {
								sap.ui.core.ResizeHandler.deregister(_sAccordionResizeListenerId);
								_sAccordionResizeListenerId = null;
							}
						}
					}).attachSectionClose(function (oEvent) {
						var sSectionId = oEvent.getParameters().closeSectionId;
						var iSectionIndex = _.findIndex(_aSections, function (oSection) {
							return oSection.ui === sSectionId;
						});
						if (_aSections.length === iSectionIndex + 1) {
							_openSection(iSectionIndex - 1);
						} else {
							_openSection(iSectionIndex + 1);
						}
					});

				_aSections.unshift({
					title: oContext.i18n.getText("w5g_properties_editor_title"),
					service: null,
					view: _oPropertiesView,
					prio: 1,
					iconClass: "sapWysiwygPropertiesIcon"
				}, {
					title: oContext.i18n.getText("w5g_events_editor_title"),
					service: null,
					view: _oEventsView,
					prio: 0,
					iconClass: "sapWysiwygEventsIcon"
				});

				_aSections.sort(function (oSection1, oSection2) {
					return oSection1.prio - oSection2.prio;
				}).forEach(function (oConfSection, iIndex) {
					var oService = oConfSection.service;
					if (oService) {
						aPromises.push(oService.getContent().then(function (oContent) {
							_createSection(oConfSection.title, oContent, iIndex);
						}));
					} else { //properties + events editors
						_createSection(oConfSection.title, oConfSection.view, iIndex);
					}
				});


				_oRoot = _oAccordion.addEventDelegate({
					//Grabs the focus from another service when starting edit a property.
					//It will prevent executions of wrong commands like 'remove'
					onAfterRendering: function () {
						oContext.service.focus.attachFocus(oContext.self).done();
					},
					onBeforeRendering: function () {
						oContext.service.focus.detachFocus(oContext.self).done();
					}
				});
			}

			return Q.all(aPromises).then(function () {
				return bView ? [_oPropertiesView, _oEventsView] : _oRoot;
			});
		}

		/**
		 * Updates selection
		 *
		 * @param {object} oContext service context
		 * @param {object} oOwner Reference to the selection owner
		 * @param {sap.ui.core.Control} oControl selected control
		 * @returns {Q} Returns promise
		 *
		 * @name _setSelection
		 * @function
		 * @private
		 */
		function _setSelection(oContext, oOwner, oControl) {
			_oSelectedControl = oControl;
			return _getViews(oContext, true).then(function (aViews) {
				var aPromises = aViews.map(function (oView) {
					return oView.getController().setSelection(_oSelectedControl, oOwner);
				});
				return Q.all(aPromises).then(function () {
					if (_isAllCollapsed()) {
						_openSection(1);
					}
				});
			});
		}

// End
// Private variables and methods

		/**
		 * WYSIWYG properties panel service
		 * @extends sap.watt.common.service.ui.Part
		 */
		return AbstractPart.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5gProperties", {
// Service Methods
// Begin
			/**
			 * Sets service configuration

			 * @param {object} mConfig configuration object
			 *
			 * @name configure
			 * @function
			 * @public
			 */
			configure: function (mConfig) {
				_aSections = mConfig.sections || [];
			},

			/**
			 * service initialization
			 *
			 * @name init
			 * @function
			 * @public
			 */
			init: function () {
				var that = this;
				EventsUtils.init(this.context);
				EventBusHelper.subscribe(EventBusHelper.IDENTIFIERS.EVENTS_NEW_FUNC_ADDED, function (oData) {
					that.addFunctionToController(that.context, oData.funcName, oData.path);
				});
				EventBusHelper.subscribe(EventBusHelper.IDENTIFIERS.EVENTS_NAVIGATE_TO_CONTROLLER, function (oData) {
					that.navigateToController(that.context, oData.funcName);
				});
			},

			/**
			 * View has changed handler, should rebuild properties if needed
			 *
			 * @param {{params: {editor: sap.watt.common.plugin.platform.service.ui.AbstractEditor} }} oEvent
			 * @return {Q}
			 */
			onViewHasChanged: function (oEvent) {
				var that = this,
					oEditor = oEvent.params.editor,
					bState = false;

				return Q.all([
					oEditor.getRoot(),
					oEditor.getScope(),
					oEditor.getSelection()
				]).spread(function (/** sap.ui.core.mvc.View */ oView, /** Window */ oScope, aSelection) {
					var oContext = that.getContext(),
						oSelection = (aSelection && aSelection[0]) || {};
					_oView = oView;
					_oWindow = oScope;
					_oDocument = oSelection.document;
					return _setSelection(oContext, oEditor, oSelection.control).then(function () {
						return W5gUtils.getControllerDocument(oContext, _oView, _oWindow).then(function (oDocument) {
							if (oDocument) {
								return oDocument.getContent().then(function (oContent) {
									var aMethods = [{signature: ""}].concat(EventsUtils.fetchMethodsFromController(oContent));
									if (_oPropertiesModel) {
										_oPropertiesModel.setMethods(aMethods);
									}
									bState = true;
								});
							}
						}).catch(function (oError) {
							jQuery.sap.log.error(oError);
						}).finally(function () {
							if (_oEventsView) {
								_oEventsView.getController().setControllerAvailable(bState);
							}
						});
					});
				});
			},

			/**
			 * Returns the focus element for <code>sap.watt.common.service.ui.Part</code>
			 *
			 * @returns {sap.ui.core.Control} Focus element
			 *
			 * @override sap.watt.common.service.ui.Part#getFocusElement
			 */
			getFocusElement: function () {
				return _oRoot;
			},

			/**
			 * Returns title for <code>sap.watt.common.service.ui.Part</code>
			 *
			 * @returns {string} title
			 *
			 * @override sap.watt.common.service.ui.Part#getTitle
			 */
			getTitle: function () {
				return this.getContext().i18n.getText("w5g_properties_title");
			},

			/**
			 * Returns tooltip for <code>sap.watt.common.service.ui.Part</code>
			 *
			 * @returns {string} tooltip
			 *
			 * @override sap.watt.common.service.ui.Part#getTooltip
			 */
			getTooltip: function () {
				return this.getContext().i18n.getText("w5g_properties_tooltip");
			},

			/**
			 * Sets visibility of ui element representing the <code>sap.watt.common.service.ui.Part</code>
			 *
			 * @param {boolean} bVisible
			 *
			 * @override sap.watt.common.service.ui.Part#setVisible
			 */
			setVisible: function (bVisible) {
				return AbstractPart.prototype.setVisible.apply(this, arguments).then(function () {
					return _oRoot.setVisible(bVisible);
				});
			},

			/**
			 * Returns true if ui element representing the <code>sap.watt.common.service.ui.Part</code> is visible
			 *
			 * @returns {boolean} visibility
			 *
			 * @override sap.watt.common.service.ui.Part#isVisible
			 */
			isVisible: function () {
				return !!(_oRoot && _oRoot.$() && _oRoot.$().is(":visible"));
			},

			/**
			 * Gets service selection
			 *
			 * @returns {object} selection
			 *
			 * @override sap.watt.common.service.selection.Provider#getSelection
			 */
			getSelection: function () {
				return [{
					document: _oDocument,
					control: _oRoot
				}];
			},

			/**
			 * Returns UI5 WYSIWYG editor context
			 *
			 * @returns {object} context
			 *
			 */
			getContext: function () {
				return this.context.service.ui5wysiwygeditor.context;
			},

			/**
			 * Returns ui element which represents the <code>sap.watt.common.service.ui.Part</code>
			 *
			 * @returns {sap.ui.core.Control} ui element
			 *
			 * @override sap.watt.common.service.ui.Part#getContent
			 */
			getContent: function () {
				var oContext = this.getContext();

				return AbstractPart.prototype.getContent.apply(this, arguments).then(function () {
					return _getViews(oContext);
				});
			},

			/**
			 * Event handler for changed selection.
			 * Notifies the controller if selection was changed
			 *
			 * @param {object} oEvent event object
			 * @returns {Q} Returns promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.W5gProperties#onViewElementSelected
			 * @function
			 * @public
			 */
			onViewElementSelected: function (oEvent) {
				var oOwner = oEvent.params.owner,
					oSelection = {},
					oContext = this.getContext();
				if (oEvent.params.selection.length) {
					oSelection = oEvent.params.selection[0];
					_oDocument = oSelection.document;
				}
				if (_oSelectedControl === oSelection.control) {
					return Q();
				}
				if (!ResourcesHelper.isMetadataLoaded()) {
					var oDeferred = Q.defer(),
						oSelectedControl = oSelection.control;
					ResourcesHelper.attachMetadataLoadedOnce(function () {
						_setSelection(oContext, oOwner, oSelectedControl).then(function () {
							oDeferred.resolve();
						}).done();
					});
					return oDeferred.promise;
				}
				return _setSelection(oContext, oOwner, oSelection.control);
			},

			/**
			 * append empty function to end of controller
			 * The controller will be saved if not dirty
			 *
			 * @param {object} oContext service context
			 * @param {string} sFunctionName new function name
			 * @param {string} sPath model path to update with function name on success (to reflect in relevant field
			 * @returns {Q} Returns promise
			 *
			 * @name addFunctionToController
			 * @function
			 */
			addFunctionToController: function (oContext, sFunctionName, sPath) {
				return W5gUtils.getControllerDocument(oContext, _oView, _oWindow)
					.then(function (oDocument) {
						if (oDocument) {
							return oDocument.getContent().then(function (sContent) {
								var sNewContent = EventsUtils.injectEventToController(sContent, sFunctionName, _oView.getControllerName());
								if (sNewContent) {
									var bIsDocDirty = oDocument.isDirty();
									return oDocument.setContent(sNewContent).then(function () {
										if (!bIsDocDirty) {
											return oDocument.save();
										}
									}).then(function () {
										_oPropertiesModel.addMethod({signature: sFunctionName});
										_oPropertiesModel.setProperty(sPath, sFunctionName);
									});
								}
							});
						}

					});
			},

			/**
			 * navigate to controller document
			 * If valid function name is given the function code will be selected
			 *
			 * @param {object} oContext service context
			 * @param {string} sFunctionName new function name
			 * @returns {Q} Returns promise
			 *
			 * @name navigateToController
			 * @function
			 */
			navigateToController: function (oContext, sFunctionName) {
				return W5gUtils.getControllerDocument(oContext, _oView, _oWindow)
					.then(function (oDocument) {
						if (oDocument) {
							return EventsUtils.navigateToControllerAndSelectFunction(oDocument, sFunctionName);
						}
					});
			}


// End
// Service Methods
		});
	}
);
