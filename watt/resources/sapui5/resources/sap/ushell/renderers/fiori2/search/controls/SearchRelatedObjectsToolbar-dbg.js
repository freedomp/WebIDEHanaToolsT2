// iteration 0 : Holger
/* global sap,window,$,jQuery */

(function() {
    "use strict";

    sap.ui.core.Control.extend("sap.ushell.renderers.fiori2.search.controls.SearchRelatedObjectsToolbar", {
        metadata: {
            properties: {
                relatedObjects: "object"
            }
        },

        init: function(properties) {
            this.oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
        },

        renderer: function(oRm, oControl) {
            oRm.write("<div");
            oRm.writeControlData(oControl); // writes the Control ID
            oRm.addClass("sapUshellSearchResultListItem-RelatedObjectsToolbar");
            oRm.writeClasses();
            oRm.write(">");

            oControl._renderToolbar(oRm);

            oRm.write("</div>");
        },

        _renderToolbar: function(oRm) {
            var that = this;
            var i;

            var createPressHandler = function(link) {
                return function() {
                    var model = sap.ushell.renderers.fiori2.search.getModelSingleton();
                    model.analytics.logCustomEvent('FLP: Search', 'Launch Related Object', [link]);
                };
            };

            var relatedObjects = that.getRelatedObjects();

            if (relatedObjects.length > 0) {

                var relatedObjectsLinks = [];
                for (i = 0; i < relatedObjects.length; i++) {
                    var relatedObject = relatedObjects[i];
                    var link = new sap.m.Link({
                        text: relatedObject.label,
                        href: relatedObject.href,
                        layoutData: new sap.m.ToolbarLayoutData({
                            shrinkable: false
                        }),
                        press: createPressHandler(relatedObject.href)
                    });
                    link.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Element");
                    relatedObjectsLinks.push(link);
                }

                var toolbarContent = [];

                var toolbarSpacer = new sap.m.ToolbarSpacer();
                toolbarContent.push(toolbarSpacer);

                for (i = 0; i < relatedObjectsLinks.length; i++) {
                    toolbarContent.push(relatedObjectsLinks[i]);
                }

                that.overFlowButton = new sap.m.Button({
                    icon: sap.ui.core.IconPool.getIconURI("overflow")
                });
                that.overFlowButton.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-OverFlowButton");
                toolbarContent.push(that.overFlowButton);

                that.overFlowSheet = new sap.m.ActionSheet({
                    placement: sap.m.PlacementType.Top
                });

                that.overFlowButton.attachPress(function() {
                    that.overFlowSheet.openBy(that.overFlowButton);
                });

                that.relatedObjectActionsToolbar = new sap.m.Toolbar({
                    design: sap.m.ToolbarDesign.Solid,
                    content: toolbarContent
                });

                that.relatedObjectActionsToolbar.addStyleClass("sapUshellSearchResultListItem-RelatedObjectsToolbar-Toolbar");

                oRm.renderControl(that.relatedObjectActionsToolbar);
            }
        },





        // after rendering
        // ===================================================================
        onAfterRendering: function() {
            var that = this;

            var $overFlowButton = $(that.overFlowButton.getDomRef());
            $overFlowButton.css("display", "none");

            $(window).on("resize", function() {
                that._layoutToolbarElements();
            });
            that._layoutToolbarElements();
        },




        _layoutToolbarElements: function() {
            var that = this;

            if (!(that.getDomRef() && that.relatedObjectActionsToolbar.getDomRef())) {
                return;
            }

            var $toolbar = $(that.relatedObjectActionsToolbar.getDomRef());
            var toolbarWidth = $toolbar.innerWidth();

            if (toolbarWidth === 0 || (that.toolbarWidth && that.toolbarWidth === toolbarWidth)) {
                return;
            }

            if ($(that.getDomRef()).css("display") === "none" || $toolbar.css("display") === "none") {
                return;
            }

            that.toolbarWidth = toolbarWidth;

            var $overFlowButton = $(that.overFlowButton.getDomRef());
            $overFlowButton.css("display", "none");

            var toolbarElementsWidth = 0;

            var pressButton = function(event, externalTarget) {
                that.oCrossAppNav.toExternal(externalTarget);
            };

            var $toolbarElements = $toolbar.find(".sapUshellSearchResultListItem-RelatedObjectsToolbar-Element");
            for (var i = 0; i < $toolbarElements.length; i++) {
                var $element = $($toolbarElements[i]);
                $element.css("display", "");
                var _toolbarElementsWidth = toolbarElementsWidth + $element.outerWidth(true);

                if (_toolbarElementsWidth > toolbarWidth) {
                    if (i < $toolbarElements.length) {
                        $overFlowButton.css("display", "");
                        var overFlowButtonWidth = $overFlowButton.outerWidth(true);

                        for (; i >= 0; i--) {
                            $element = $($toolbarElements[i]);
                            _toolbarElementsWidth -= $element.outerWidth(true);
                            if (_toolbarElementsWidth + overFlowButtonWidth <= toolbarWidth) {
                                break;
                            }
                        }
                    }

                    var relatedObjects = that.getRelatedObjects();
                    that.overFlowSheet.destroyButtons();

                    for (; i < $toolbarElements.length; i++) {
                        $element = $($toolbarElements[i]);
                        $element.css("display", "none");

                        var relatedObject = relatedObjects[i];

                        var button = new sap.m.Button({
                            text: relatedObject.label
                        });
                        button.attachPress(relatedObject, pressButton);
                        that.overFlowSheet.addButton(button);
                    }
                    break;
                }
                toolbarElementsWidth = _toolbarElementsWidth;
            }
        }
    });

})();
