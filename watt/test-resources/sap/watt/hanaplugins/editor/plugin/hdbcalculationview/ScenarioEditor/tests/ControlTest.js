define([
        "./Util",
        "sap/hana/ide/editor/plugin/analytics/control/EditorLayout"
    ],
    function(Util) {
        "use strict";

        function verifyCollapseLeft(parent, layout, trigger) {
            var collapsedLeftReceived = false;
            layout.attachCollapsedLeft(function() {
                collapsedLeftReceived = true;
            });
            var collapsedRightReceived = false;
            layout.attachCollapsedRight(function() {
                collapsedRightReceived = true;
            });
            var expandedLeftReceived = false;
            layout.attachExpandedLeft(function() {
                expandedLeftReceived = true;
            });
            var expandedRightReceived = false;
            layout.attachExpandedRight(function() {
                expandedRightReceived = true;
            });
            var beforeLeft = layout.getCollapseLeft();
            var beforeRight = layout.getCollapseRight();

            trigger();
            sap.ui.getCore().applyChanges();

            var leftContent = layout.getCollapsedContentLeft().length > 0 ? layout.getCollapsedContentLeft()[0] : null;
            var rightContent = layout.getCollapsedContentRight().length > 0 ? layout.getCollapsedContentRight()[0] : null;

            strictEqual(layout.getCollapseLeft(), true, "collapseLeft after collapse left");
            strictEqual(layout.getCollapseRight(), false, "collapseRight after collapse left");
            strictEqual(layout.$().find('.editorLayoutCollapsedLeft').is(':hidden'), false, "left pane visible after collapse left");
            strictEqual(layout.getSplitterPosition(), "0%", "splitter position after collapse left");
            ok(layout.$().find('.editorLayoutContent').width() < parent.width(), "content width smaller after collapse left");

            if (leftContent) {
                strictEqual(leftContent.$().is(':hidden'), false, "left pane content visible after collapse left");
            }
            if (rightContent) {
                strictEqual(rightContent.$().is(':hidden'), true, "right pane content hidden after collapse left");
            }

            strictEqual(collapsedLeftReceived, !beforeLeft, "collapsed left event received after collapse left");
            ok(!collapsedRightReceived, "collapse right event not received after collapse left");
            ok(!expandedLeftReceived, "expanded left event not received after collapse left");
            strictEqual(expandedRightReceived, beforeRight, "expanded right event received after collapse left");
        }

        function verifyExpandLeft(parent, layout, expectedSplitterPosition, trigger) {
            var collapsedLeftReceived = false;
            layout.attachCollapsedLeft(function() {
                collapsedLeftReceived = true;
            });
            var collapsedRightReceived = false;
            layout.attachCollapsedRight(function() {
                collapsedRightReceived = true;
            });
            var expandedLeftReceived = false;
            layout.attachExpandedLeft(function() {
                expandedLeftReceived = true;
            });
            var expandedRightReceived = false;
            layout.attachExpandedRight(function() {
                expandedRightReceived = true;
            });
            var expectedRight = layout.getCollapseRight();
            var beforeLeft = layout.getCollapseLeft();
            var rightWidth = expectedRight ? layout.$().find('.editorLayoutCollapsedRight').width() : 0;

            trigger();
            sap.ui.getCore().applyChanges();

            var leftContent = layout.getCollapsedContentLeft().length > 0 ? layout.getCollapsedContentLeft()[0] : null;
            var rightContent = layout.getCollapsedContentRight().length > 0 ? layout.getCollapsedContentRight()[0] : null;

            strictEqual(layout.getCollapseLeft(), false, "collapseLeft after expand left");
            strictEqual(layout.getCollapseRight(), expectedRight, "collapseRight after expand left");
            strictEqual(layout.$().find('.editorLayoutCollapsedLeft').is(':hidden'), true, "left pane hidden after expand left");
            strictEqual(layout.getSplitterPosition(), expectedSplitterPosition, "splitter position after expand left");
            strictEqual(layout.$().find('.editorLayoutContent').width(), parent.width() - rightWidth, "content full width after expand left");

            if (leftContent) {
                strictEqual(leftContent.$().is(':hidden'), true, "left pane content hidden after expand left");
            }
            if (rightContent) {
                strictEqual(rightContent.$().is(':hidden'), !expectedRight, "right pane content hidden after expand left");
            }

            ok(!collapsedLeftReceived, "collapsed left event not received after expand left");
            ok(!collapsedRightReceived, "collapse right event not received after expand left");
            strictEqual(expandedLeftReceived, beforeLeft, "expanded left event received after expand left");
            ok(!expandedRightReceived, "expanded right event not received after expand left");
        }

        function verifyCollapseRight(parent, layout, trigger) {
            var collapsedLeftReceived = false;
            layout.attachCollapsedLeft(function() {
                collapsedLeftReceived = true;
            });
            var collapsedRightReceived = false;
            layout.attachCollapsedRight(function() {
                collapsedRightReceived = true;
            });
            var expandedLeftReceived = false;
            layout.attachExpandedLeft(function() {
                expandedLeftReceived = true;
            });
            var expandedRightReceived = false;
            layout.attachExpandedRight(function() {
                expandedRightReceived = true;
            });
            var beforeLeft = layout.getCollapseLeft();
            var beforeRight = layout.getCollapseRight();

            trigger();
            sap.ui.getCore().applyChanges();

            var leftContent = layout.getCollapsedContentLeft().length > 0 ? layout.getCollapsedContentLeft()[0] : null;
            var rightContent = layout.getCollapsedContentRight().length > 0 ? layout.getCollapsedContentRight()[0] : null;

            strictEqual(layout.getCollapseLeft(), false, "collapseLeft after collapse right");
            strictEqual(layout.getCollapseRight(), true, "collapseRight after collapse right");
            strictEqual(layout.$().find('.editorLayoutCollapsedRight').is(':hidden'), false, "right pane visible after collapse right");
            // splitter position will be less than 100% because of splitter width > 0
            // strictEqual(layout.getSplitterPosition(), "100%", "splitter position after collapse right");
            ok(layout.$().find('.editorLayoutContent').width() < parent.width(), "content width smaller after collapse right");

            if (leftContent) {
                strictEqual(leftContent.$().is(':hidden'), true, "left pane content hiddem after collapse right");
            }
            if (rightContent) {
                strictEqual(rightContent.$().is(':hidden'), false, "right pane content visible after collapse right");
            }

            ok(!collapsedLeftReceived, "collapsed left event not received after collapse right");
            strictEqual(collapsedRightReceived, !beforeRight, "collapse right event received after collapse right");
            strictEqual(expandedLeftReceived, beforeLeft, "expanded left event received after collapse right");
            ok(!expandedRightReceived, "expanded right event not received after collapse right");
        }

        function verifyExpandRight(parent, layout, expectedSplitterPosition, trigger) {
            var collapsedLeftReceived = false;
            layout.attachCollapsedLeft(function() {
                collapsedLeftReceived = true;
            });
            var collapsedRightReceived = false;
            layout.attachCollapsedRight(function() {
                collapsedRightReceived = true;
            });
            var expandedLeftReceived = false;
            layout.attachExpandedLeft(function() {
                expandedLeftReceived = true;
            });
            var expandedRightReceived = false;
            layout.attachExpandedRight(function() {
                expandedRightReceived = true;
            });
            var expectedLeft = layout.getCollapseLeft();
            var beforeRight = layout.getCollapseRight();
            var leftWidth = expectedLeft ? layout.$().find('.editorLayoutCollapsedLeft').width() : 0;

            trigger();
            sap.ui.getCore().applyChanges();

            var leftContent = layout.getCollapsedContentLeft().length > 0 ? layout.getCollapsedContentLeft()[0] : null;
            var rightContent = layout.getCollapsedContentRight().length > 0 ? layout.getCollapsedContentRight()[0] : null;

            strictEqual(layout.getCollapseLeft(), expectedLeft, "collapseLeft after expand right");
            strictEqual(layout.getCollapseRight(), false, "collapseRight after expand right");
            strictEqual(layout.$().find('.editorLayoutCollapsedRight').is(':hidden'), true, "right pane hidden after expand right");
            strictEqual(layout.getSplitterPosition(), expectedSplitterPosition, "splitter position after expand right");
            strictEqual(layout.$().find('.editorLayoutContent').width(), parent.width() - leftWidth, "content full width after expand right");

            if (leftContent) {
                strictEqual(leftContent.$().is(':hidden'), !expectedLeft, "left pane content hidden after expand right");
            }
            if (rightContent) {
                strictEqual(rightContent.$().is(':hidden'), true, "right pane content hidden after expand right");
            }

            ok(!collapsedLeftReceived, "collapsed left event not received after expand right");
            ok(!collapsedRightReceived, "collapse right event not received after expand right");
            ok(!expandedLeftReceived, "expanded left event not received after expand right");
            strictEqual(expandedRightReceived, beforeRight, "expanded right event received after expand right");
        }

        function createDefaults(layout) {
            var controls = {
                firstPaneContent: [],
                secondPaneContent: [],
                collapsedContentLeft: [],
                collapsedContentRight: []
            };

            // add content
            var contentFirst = new sap.ui.commons.TextView({
                text: "test"
            });
            layout.addFirstPaneContent(contentFirst);
            controls.firstPaneContent.push(contentFirst);
            var contentSecond = new sap.ui.commons.TextView({
                text: "test"
            });
            layout.addSecondPaneContent(contentSecond);
            controls.secondPaneContent.push(contentSecond);

            // add items
            var leftLabel = new sap.hana.ide.editor.plugin.analytics.control.EditorLayoutRotatedLabel({
                text: "Left Label"
            });
            controls.collapsedContentLeft.push(leftLabel);
            layout.addCollapsedContentLeft(leftLabel);
            var rightLabel = new sap.hana.ide.editor.plugin.analytics.control.EditorLayoutRotatedLabel({
                text: "Right Label"
            });
            controls.collapsedContentRight.push(rightLabel);
            layout.addCollapsedContentRight(rightLabel);
            var rightButton1 = new sap.hana.ide.editor.plugin.analytics.control.EditorLayoutRotatedButton({
                text: "Right Button1",
                icon: "sap-icon://delete"
            });
            controls.collapsedContentRight.push(rightButton1);
            layout.addCollapsedContentRight(rightButton1);
            var rightButton2 = new sap.hana.ide.editor.plugin.analytics.control.EditorLayoutRotatedButton({
                text: "Right Button2"
            });
            controls.collapsedContentRight.push(rightButton2);
            layout.addCollapsedContentRight(rightButton2);

            return controls;
        }

        function mouseMove(layout, pageX, pageY) {
            var splitterBar = layout.$().find(".sapUiVerticalSplitterBar");
            var splitterOffset = splitterBar.offset();

            var posStart = {
                pageX: splitterOffset.left,
                pageY: pageY
            };

            var posEnd = {
                pageX: pageX,
                pageY: pageY
            };
            splitterBar.trigger(new $.Event("mousedown", posStart));
            splitterBar.trigger(new $.Event("mousemove", posEnd));
            splitterBar.trigger(new $.Event("mouseup", posEnd));
        }

        var placeAt = Util.moduleUI5("ControlTest");

        test("empty layout", function() {

            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            strictEqual(layout.getSplitterPosition(), "50%", "default splitterPosition");
            strictEqual(layout.getCollapseLeft(), false, "default collapsedLeft");
            strictEqual(layout.getCollapseRight(), false, "default collapsedRight");
            deepEqual(layout.getCollapsedContentLeft(), [], "default collapsedContentLeft");
            deepEqual(layout.getCollapsedContentRight(), [], "default collapsedContentRight");
            deepEqual(layout.getFirstPaneContent(), [], "default firstPaneContent");
            deepEqual(layout.getSecondPaneContent(), [], "default secondPaneContent");

            ok(layout.$().hasClass('editorLayout'), "layout style class found");
            strictEqual(layout.$().find('.editorLayoutContent').length, 1, "content style class found");
            strictEqual(layout.$().find('.editorLayoutCollapsedLeft').length, 1, "content style class found");
            strictEqual(layout.$().find('.editorLayoutCollapsedRight').length, 1, "content style class found");
            strictEqual(layout.$().find('.editorLayoutCollapsedContent').length, 0, "content style class found");
            strictEqual(layout.$().find('.editorLayoutExpandButton').length, 2, "expand button style class found");

            strictEqual(layout.$().find('.editorLayoutCollapsedLeft').is(':hidden'), true, "left initially hidden");
            strictEqual(layout.$().find('.editorLayoutCollapsedRight').is(':hidden'), true, "right initially hidden");

            strictEqual(layout.$().find('.editorLayoutContent').width(), parent.width(), "initial content width");
            strictEqual(layout.$().find('.editorLayoutContent').height(), parent.height(), "inital content height");
            ok(layout.$().find('.editorLayoutContent').width() !== 0, "initial content width not 0");
            ok(layout.$().find('.editorLayoutContent').height() !== 0, "inital content height not 0");
        });

        test("add content", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            strictEqual(controls.firstPaneContent[0].$().parents('.editorLayoutContent').length, 1, "content added");
            strictEqual(controls.secondPaneContent[0].$().parents('.editorLayoutContent').length, 1, "content added");
        });

        test("add items", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var llParent = controls.collapsedContentLeft[0].$().parents('.editorLayoutCollapsedLeft');
            strictEqual(llParent.length, 1, "left content item 1 is contained by collapsed left");

            var rlParent = controls.collapsedContentRight[0].$().parents('.editorLayoutCollapsedRight');
            strictEqual(rlParent.length, 1, "right content item 1 is contained by collapsed right");

            var rbParent = controls.collapsedContentRight[1].$().parents('.editorLayoutCollapsedRight');
            strictEqual(rbParent.length, 1, "right content item 2 is contained by collapsed right");

            rbParent = controls.collapsedContentRight[2].$().parents('.editorLayoutCollapsedRight');
            strictEqual(rbParent.length, 1, "right content item 3 is contained by collapsed right");

            strictEqual(controls.collapsedContentLeft[0].$().is(':hidden'), true, "left content item 1 is hidden initially");
            strictEqual(controls.collapsedContentRight[2].$().is(':hidden'), true, "right content item 1 is hidden initially");

            // collapse right
            layout.setCollapseRight(true);
            sap.ui.getCore().applyChanges();
            strictEqual(controls.collapsedContentRight[0].$().is(':hidden'), false, "right content item 1 is visible after collapse right");
        });

        test("collapse/expand left", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var splitterPosBefore = layout.getSplitterPosition();

            // collapse left via property
            verifyCollapseLeft(parent, layout, function() {
                layout.setCollapseLeft(true);
            });

            // expand left via button
            verifyExpandLeft(parent, layout, splitterPosBefore, function() {
                var expandLeftButton = layout.$().find('.editorLayoutCollapsedLeft').find('.editorLayoutExpandButton').first();
                expandLeftButton.trigger('click');
            });
        });

        test("collapse/expand right", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var splitterPosBefore = layout.getSplitterPosition();

            // collapse right via property
            verifyCollapseRight(parent, layout, function() {
                layout.setCollapseRight(true);
            });

            // expand right via button
            verifyExpandRight(parent, layout, splitterPosBefore, function() {
                var expandRightButton = layout.$().find('.editorLayoutCollapsedRight').find('.editorLayoutExpandButton').first();
                expandRightButton.trigger('click');
            });
        });

        test("collapse toggle", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var splitterPosBefore = layout.getSplitterPosition();

            // collapse right via property
            verifyCollapseRight(parent, layout, function() {
                layout.setCollapseRight(true);
            });

            // collapse left via property
            verifyCollapseLeft(parent, layout, function() {
                layout.setCollapseLeft(true);
            });

            // expand left via property
            verifyExpandLeft(parent, layout, splitterPosBefore, function() {
                layout.setCollapseLeft(false);
            });

            // collapse left via property
            verifyCollapseLeft(parent, layout, function() {
                layout.setCollapseLeft(true);
            });

            // collapse right via property
            verifyCollapseRight(parent, layout, function() {
                layout.setCollapseRight(true);
            });

            // expand right via property
            verifyExpandRight(parent, layout, splitterPosBefore, function() {
                layout.setCollapseRight(false);
            });
        });

        test("move by arrow keys", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var widthBefore = layout.$().find('.editorLayoutContent').width();

            // collapse left, simulate arrow keys
            verifyCollapseLeft(parent, layout, function() {
                var splitter = layout.getAggregation("_content");
                splitter.sBarPosition = 0;
                splitter.resizeSplitterElements();
            });

            var widthAfter = layout.$().find('.editorLayoutContent').width();
            var moveByPixel = 1;
            var position = moveByPixel * 100 / widthAfter;
            var positionAfter = (widthBefore - widthAfter + moveByPixel) * 100 / widthBefore;

            // expand left, simulate arrow keys
            verifyExpandLeft(parent, layout, positionAfter.toString() + "%", function() {
                var splitter = layout.getAggregation("_content");
                splitter.sBarPosition = position;
                splitter.resizeSplitterElements();
            });
        });

        test("move by mouse events", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var splitterPosBefore = layout.getSplitterPosition();
            var widthBefore = layout.$().find('.editorLayoutContent').width();
            var offset = layout.$().find('.editorLayoutContent').offset();

            // collapse left
            verifyCollapseLeft(parent, layout, function() {
                mouseMove(layout, offset.left + 10, offset.top - 10);
            });

            var offset2 = layout.$().find('.editorLayoutContent').offset();

            // do not expand by mouse if not moved
            var moveBy = 0;
            verifyCollapseLeft(parent, layout, function() {
                mouseMove(layout, offset2.left + moveBy, offset.top - 10);
            });

            // expand left via property
            verifyExpandLeft(parent, layout, splitterPosBefore, function() {
                layout.setCollapseLeft(false);
            });

            // expand left via property
            verifyCollapseLeft(parent, layout, function() {
                layout.setCollapseLeft(true);
            });

            // expand by mouse
            moveBy = 10;
            var positionAfter = (offset2.left + moveBy - offset.left) * 100 / widthBefore;
            verifyExpandLeft(parent, layout, positionAfter.toString() + "%", function() {
                mouseMove(layout, offset2.left + moveBy, offset.top - 10);
            });
        });

        test("twice", function() {
            var layout = new sap.hana.ide.editor.plugin.analytics.control.EditorLayout();
            var controls = createDefaults(layout);
            var parent = placeAt(layout);
            sap.ui.getCore().applyChanges();

            var splitterPosBefore = layout.getSplitterPosition();

            // collapse right via property
            verifyCollapseRight(parent, layout, function() {
                layout.setSplitterPosition("100%");
            });
            // collapse right via position
            verifyCollapseRight(parent, layout, function() {
                layout.setCollapseRight(true);
            });

            // collapse left via position
            verifyCollapseLeft(parent, layout, function() {
                layout.setSplitterPosition("0%");
            });

            // collapse left via property
            verifyCollapseLeft(parent, layout, function() {
                layout.setCollapseLeft(true);
            });

            // expand right via property, left still collapsed
            verifyExpandRight(parent, layout, "0%", function() {
                layout.setCollapseRight(false);
            });

            // expand left via property
            verifyExpandLeft(parent, layout, splitterPosBefore, function() {
                layout.setCollapseLeft(false);
            });

            // expand left via property
            verifyExpandLeft(parent, layout, splitterPosBefore, function() {
                layout.setCollapseLeft(false);
            });
        });

    });