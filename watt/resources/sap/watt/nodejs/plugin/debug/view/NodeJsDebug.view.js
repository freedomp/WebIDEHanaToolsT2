(function() {
  "use strict";

  sap.ui.jsview("sap.xs.nodejs.debug.view.NodeJsDebug", {

    getControllerName: function getControllerName() {
      return "sap.xs.nodejs.debug.view.NodeJsDebug";
    },

    createContent: function createContent(controller) {
      var viewData = this.getViewData();
      controller._configure(viewData.logger, viewData.debugPart, viewData.debugSessionManager, viewData.breakpointManager);

      var headerSection = this._createHeaderSection(controller);
      var callStackSection = this._createCallStackSection(controller);
      var variableSection = this._createVariableSection(controller);
      var breakpointSection = this._createBreakpointSection(controller);
      var flexContent;

      // fallback as phantom.js version 1.97 does not support the new splitter functionality
      if (!/.*phantomjs.*/igm.test(navigator.userAgent)) {
        callStackSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
          minSize: 20
        }));
        variableSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
          minSize: 20
        }));
        breakpointSection.setLayoutData(new sap.ui.layout.SplitterLayoutData({
          minSize: 20
        }));
        flexContent = new sap.ui.layout.Splitter({
          width: "100%",
          height: "100%",
          orientation: sap.ui.core.Orientation.Vertical,
          contentAreas: [callStackSection, variableSection, breakpointSection]
        });
      } else {
        flexContent = new sap.ui.layout.VerticalLayout({
          width: "100%",
          content: [callStackSection, variableSection, breakpointSection]
        });
      }

      var outerLayout = new sap.ui.layout.FixFlex({
        fixContent: [headerSection],
        flexContent: flexContent
      });

      return outerLayout;
    },

    // Header Section
    _createHeaderSection: function _createHeaderSection(controller) {
      var title = new sap.ui.commons.TextView({
        text: "{i18n>debugPane_xtit}",
        wrapping: false,
        design: sap.ui.commons.TextViewDesign.H5
      });

      var debugTargetName = new sap.ui.commons.TextView("NodeJsDebugTargetName", {
        text: {
          path: "debugSessions>name",
          formatter: function(name) {
            if (name) {
              return name;
            } else {
              return "";
            }
          }
        },
        wrapping: false,
        design: sap.ui.commons.TextViewDesign.H6
      }).addStyleClass("nodeJsDebugViewTargetName");

      var titleLayout = new sap.ui.commons.layout.MatrixLayout({
        width: "100%",
        height: "auto",
        columns: 2,
        rows: [
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "auto",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                padding: sap.ui.commons.layout.Padding.None,
                content: [title]
              }),
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Center,
                hAlign: sap.ui.commons.layout.HAlign.End,
                content: [debugTargetName]
              })
            ]
          })
        ]
      });

      var messageArea = this._createMessageArea();

      var resumeSuspend = new sap.ui.commons.Button("NodeJsSuspendResumeButton", {
        tooltip: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            if (suspended === true) {
              return controller._i18n.getText("debugPane_resume_xtol", [controller._keyBindingResume]);
            } else {
              return controller._i18n.getText("debugPane_suspend_xtol", [controller._keyBindingSuspend]);
            }
          }
        },
        icon: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            if (suspended === true) {
              return "sap-icon://debug/resume";
            } else {
              return "sap-icon://debug/pause";
            }
          }
        },
        enabled: {
          path: "debugSessions>id",
          formatter: function(id) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !id);
            return !!id;
          }
        },
        lite: true,
        press: [controller._onPressResumeSuspendSession, controller]
      });

      var stepOver = new sap.ui.commons.Button("NodeJsStepOverButton", {
        tooltip: controller._i18n.getText("debugPane_stepOver_xtol", [controller._keyBindingStepOver]),
        icon: "sap-icon://debug/stepover",
        enabled: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !suspended);
            return !!suspended;
          }
        },
        lite: true,
        press: [controller._onPressStepOver, controller]
      });

      var stepInto = new sap.ui.commons.Button("NodeJsStepIntoButton", {
        tooltip: controller._i18n.getText("debugPane_stepInto_xtol", [controller._keyBindingStepInto]),
        icon: "sap-icon://debug/stepinto",
        enabled: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !suspended);
            return !!suspended;
          }
        },
        lite: true,
        press: [controller._onPressStepInto, controller]
      });

      var stepOut = new sap.ui.commons.Button("NodeJsStepOutButton", {
        tooltip: controller._i18n.getText("debugPane_stepOut_xtol", [controller._keyBindingStepOut]),
        icon: "sap-icon://debug/stepreturn",
        enabled: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !suspended);
            return !!suspended;
          }
        },
        lite: true,
        press: [controller._onPressStepOut, controller]
      });

      var attach = new sap.ui.commons.Button("NodeJsAttachButton", {
        tooltip: "{i18n>debugPane_attach_xtol}",
        icon: "sap-icon://debug/connected",
        enabled: {
          path: "debugSessions>id",
          formatter: function(id) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !!id);
            return !id;
          }
        },
        lite: true,
        press: [controller._onPressAttach, controller]
      });

      var detach = new sap.ui.commons.Button("NodeJsDetachButton", {
        tooltip: "{i18n>debugPane_detach_xtol}",
        icon: "sap-icon://debug/disconnected",
        enabled: {
          path: "debugSessions>id",
          formatter: function(id) {
            this.toggleStyleClass("nodeJsDebugIconDisabled", !id);
            return !!id;
          }
        },
        lite: true,
        press: [controller._onPressDetach, controller]
      });

      var segmentedButton = new sap.ui.commons.SegmentedButton({
        buttons: [resumeSuspend, stepOver, stepInto, stepOut, attach, detach],
        select: function(event) {
          var button = sap.ui.getCore().byId(event.getParameters().selectedButtonId);
          if (button) {
            button.removeStyleClass("sapUiSegButtonSelected");
          }
        }
      });

      var layout = new sap.ui.layout.VerticalLayout("NodeJsHeaderComposite", {
        width: "100%",
        content: [titleLayout, messageArea, segmentedButton]
      });
      return layout;
    },

    // Messsage Area
    _createMessageArea: function _createMessageArea() {
      return new sap.ui.commons.TextArea("NodeJsMessageArea", {
        value: "{controller>/message}",
        visible: {
          path: "controller>/messageType",
          formatter: function(messageType) {
            return !!messageType;
          }
        },
        wrapping: sap.ui.core.Wrapping.Hard,
        width: "100%",
        rows: 3,
        valueState: {
          path: "controller>/messageType",
          formatter: function(messageType) {
            switch (messageType) {
              case "error":
                return sap.ui.core.ValueState.Error;
              case "warning":
                return sap.ui.core.ValueState.Warning;
              default:
                return sap.ui.core.ValueState.None;
            }
          }
        }
      });
    },

    // CallStack Section
    _createCallStackSection: function _createCallStackSection(controller) {
      var noDataLabel = new sap.ui.commons.Label({
        text: "{i18n>debugPane_notPaused_xtit}",
        visible: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            return !suspended;
          }
        }
      }).addStyleClass("sapUiRrNoData");

      var functionNameTemplate = new sap.ui.commons.Label({
        text: {
          path: "debugSessions>functionName",
          formatter: function(functionName) {
            if (functionName && functionName.length > 0) {
              return functionName;
            }
            return controller._i18n.getText("debugPane_anonymousFunction_xmsg");
          }
        },
        tooltip: {
          path: "debugSessions>functionName",
          formatter: function(functionName) {
            return functionName;
          }
        }
      }).addStyleClass("nodeJsDebugViewTableLabel");

      var locationTemplate = new sap.ui.commons.Label({
        text: {
          path: "debugSessions>location",
          formatter: function(location) {
            var text = "";
            if (location) {
              if (location.resource) {
                text += controller._getUiLocationString(location.resource.url, location.lineNumber);
              }
            }
            return text;
          }
        },
        tooltip: {
          path: "debugSessions>location",
          formatter: function(location) {
            var tooltip = "";
            if (location) {
              if (location.resource) {
                tooltip = location.resource.url + ":" + (location.lineNumber + 1);
              }
            }
            return tooltip;
          }
        }
      }).addStyleClass("nodeJsDebugViewTableLabel");

      //			var noCallStackLabel = new sap.ui.commons.Label({
      //				text: "No Call Stack"
      //			}).addStyleClass("sapUiRrNoData");

      var callStackTable = new sap.ui.table.Table("NodeJsCallStackTable", {
        width: "100%",
        editable: false,
        columnHeaderVisible: false,
        enableColumnReordering: false,
        selectionMode: sap.ui.table.SelectionMode.Single,
        selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
        noData: "{i18n>debugPane_noCallstack_xtit}",
        visible: {
          path: "debugSessions>suspended",
          formatter: function(suspended) {
            return !!suspended;
          }
        },
        visibleRowCount: {
          path: "debugSessions>stackFrames/length",
          formatter: function(length) {
            return length > 1 ? length : 1;
          }
        },
        columns: [
          new sap.ui.table.Column({
            hAlign: sap.ui.core.HorizontalAlign.Begin,
            template: functionNameTemplate
          }),

          new sap.ui.table.Column({
            hAlign: sap.ui.core.HorizontalAlign.Begin,
            template: locationTemplate
          })
        ],
        rows: "{debugSessions>stackFrames}",
        rowSelectionChange: [controller._onStackFrameSelectionChange, controller]
      });

      var layout = new sap.ui.commons.layout.MatrixLayout({
        width: "100%",
        height: "100%",
        columns: 1,
        rows: [
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "auto",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Center,
                padding: sap.ui.commons.layout.Padding.None,
                content: [noDataLabel]
              })
            ]
          }),
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "100%",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                padding: sap.ui.commons.layout.Padding.None,
                content: [new sap.ui.layout.VerticalLayout({
                  width: "100%",
                  content: [callStackTable]
                })]
              })
            ]
          })
        ]
      });
      var panel = new sap.ui.commons.Panel("NodeJsCallStackComposite", {
        width: "100%",
        height: "100%",
        showCollapseIcon: false,
        areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
        borderDesign: sap.ui.commons.enums.BorderDesign.None,
        applyContentPadding: false,
        title: new sap.ui.core.Title({
          text: "{i18n>debugPane_callStack_xtit}",
          level: sap.ui.core.TitleLevel.H3
        }),
        content: [layout]
      });

      return panel;
    },

    // Variables Section
    _createVariableSection: function _createVariableSection(controller) {
      // node binding is updated by the controller whenever the stack frame selection changes
      var noDataLabel = new sap.ui.commons.Label("NodeJsVariableNoData", {
        text: "{i18n>debugPane_notPaused_xtit}",
        visible: {
          path: "debugSessions>",
          formatter: function(stackframe) {
            return !stackframe;
          }
        }
      }).addStyleClass("sapUiRrNoData");

      var variableTree = new sap.ui.commons.Tree("NodeJsVariableTree", {
        width: "100%",
        height: "100%",
        showHeader: false,
        showHorizontalScrollbar: true,
        selectionMode: sap.ui.commons.TreeSelectionMode.Single,
        visible: {
          path: "debugSessions>",
          formatter: function(stackframe) {
            return !!stackframe;
          }
        }
      });
      variableTree.onAfterRendering = function() {
        if (!controller._variableTreeNodeExpanded) {
          // do not invoke default implementation as this would always restore the previous scroll position
          // which would cause an invalid scroll position in case a different stackframe is selected.
          // In this case the scroll position should be set to 0.
          controller._restoreVariableTreeScrollPosition();
        } else {
          controller._variableTreeNodeExpanded = false;
          sap.ui.commons.Tree.prototype.onAfterRendering.apply(this, arguments);
        }
      };

      var layout = new sap.ui.commons.layout.MatrixLayout({
        width: "100%",
        height: "100%",
        columns: 1,
        rows: [
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "auto",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Center,
                padding: sap.ui.commons.layout.Padding.None,
                content: [noDataLabel]
              })
            ]
          }),
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "100%",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                padding: sap.ui.commons.layout.Padding.None,
                content: [variableTree]
              })
            ]
          })
        ]
      });

      var panel = new sap.ui.commons.Panel("NodeJsVariableComposite", {
        width: "100%",
        height: "100%",
        showCollapseIcon: false,
        areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
        borderDesign: sap.ui.commons.enums.BorderDesign.None,
        applyContentPadding: false,

        title: new sap.ui.core.Title({
          text: "{i18n>debugPane_variables_xtit}",
          //icon: "sap-icon://debug/variable-section",
          level: sap.ui.core.TitleLevel.H3
        }),
        content: [layout]
      });
      return panel;
    },

    // Breakpoints Section
    _createBreakpointSection: function _createBreakpointSection(controller) {
      var noDataLabel = new sap.ui.commons.Label({
        text: "{i18n>debugPane_noBreakpoints_xtit}",
        visible: {
          path: "breakpoints>/breakpoints/0",
          formatter: function(breakpoint) {
            return !breakpoint;
          }
        }
      }).addStyleClass("sapUiRrNoData");

      var enabledStateTemplate = new sap.ui.commons.CheckBox({
        checked: "{breakpoints>enabled}",
        change: [controller._onBreakpointEnablementChange, controller]
      });

      var locationTemplate = new sap.ui.commons.Label({
        text: {
          parts: ["breakpoints>filePath", "breakpoints>lineNumber"],
          formatter: function(filePath, lineNumber) {
            if (filePath && lineNumber >= 0) {
              return controller._breakpointManager.getFileName(filePath) + ":" + (lineNumber + 1);
            }
          }
        },
        tooltip: "{breakpoints>filePath}"
      }).addStyleClass("nodeJsDebugViewTableLabel");

      var statementTemplate = new sap.ui.commons.Label({
        text: "{breakpoints>statement}",
        tooltip: "{breakpoints>statement}"
      }).addStyleClass("nodeJsDebugViewTableLabel");

      // subclass table in order to support double click
      var DblClickTable = sap.ui.table.Table.extend('DblClickTable', {
        metadata: {
          events: {
            dblClick: {}
          }
        },
        renderer: {},
        onAfterRendering: function() {
          if (sap.ui.table.Table.prototype.onAfterRendering) {
            sap.ui.table.Table.prototype.onAfterRendering.apply(this, arguments);
          }
          var tbl = this;

          this.getRows().forEach(function(r, i) {
            var cxt = tbl.getContextByIndex(i);
            if (cxt) {
              r.$().dblclick(function() {
                tbl.fireDblClick({
                  rowIndex: i,
                  rowContext: cxt
                });
              });
            }
          });

          this.$().find('.sapUiTableRowHdr').each(function(i) {
            var cxt = tbl.getContextByIndex(i);
            if (cxt) {
              $(this).dblclick(function() {
                tbl.fireDblClick({
                  rowIndex: i,
                  rowContext: cxt
                });
              });
            }
          });
        }
      });

      var breakpointTable = new DblClickTable("NodeJsBreakpointTable", {
        width: "100%",
        editable: false,
        columnHeaderVisible: false,
        enableColumnReordering: false,
        selectionMode: sap.ui.table.SelectionMode.None,
        selectionBehavior: sap.ui.table.SelectionBehavior.RowOnly,
        showNoData: false,
        visible: {
          path: "breakpoints>/breakpoints/0",
          formatter: function(breakpoint) {
            return !!breakpoint;
          }
        },
        visibleRowCount: {
          path: "breakpoints>/breakpoints/length",
          formatter: function(length) {
            return length > 1 ? length : 1;
          }
        },
        columns: [
          new sap.ui.table.Column({
            hAlign: sap.ui.core.HorizontalAlign.Begin,
            template: enabledStateTemplate
          }),
          new sap.ui.table.Column({
            hAlign: sap.ui.core.HorizontalAlign.Begin,
            template: locationTemplate,
            sorted: true,
            sortProperty: "location"
          }),
          new sap.ui.table.Column({
            hAlign: sap.ui.core.HorizontalAlign.Begin,
            template: statementTemplate
          })
        ],
        rows: {
          path: "breakpoints>/breakpoints",
          sorter: controller._createBreakpointSorter()
        },
        dblClick: [controller._onBreakpointDblClick, controller],
        cellContextmenu: [this._showBreakpointContextMenu, this]
      });

      var layout = new sap.ui.commons.layout.MatrixLayout({
        width: "100%",
        height: "100%",
        columns: 1,
        rows: [
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "auto",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Center,
                padding: sap.ui.commons.layout.Padding.None,
                content: [noDataLabel]
              })
            ]
          }),
          new sap.ui.commons.layout.MatrixLayoutRow({
            height: "100%",
            cells: [
              new sap.ui.commons.layout.MatrixLayoutCell({
                vAlign: sap.ui.commons.layout.VAlign.Top,
                hAlign: sap.ui.commons.layout.HAlign.Begin,
                padding: sap.ui.commons.layout.Padding.None,
                content: [new sap.ui.layout.VerticalLayout({
                  width: "100%",
                  content: [breakpointTable]
                })]
              })
            ]
          })
        ]
      });

      var panel = new sap.ui.commons.Panel("NodeJsBreakpointComposite", {
        width: "100%",
        height: "100%",
        showCollapseIcon: false,
        areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
        borderDesign: sap.ui.commons.enums.BorderDesign.None,
        applyContentPadding: false,
        title: new sap.ui.core.Title({
          text: "{i18n>debugPane_breakpoints_xtit}",
          //icon: "sap-icon://debug/breakpoint-section",
          level: sap.ui.core.TitleLevel.H3
        }),
        content: [layout]
      });
      return panel;
    },

    /**
     * Right click on some breakpoint table entry opens the custom context menu.
     */
    _showBreakpointContextMenu: function _showBreakpointContextMenu(event) {
      var that = this;
      var point = {
        x: window.event.clientX,
        y: window.event.clientY
      };
      var bindingContext = event.getParameters().rowBindingContext;
      var breakpoint = bindingContext ? bindingContext.getModel().getProperty(bindingContext.getPath()) : null;

      if (breakpoint) {
        // disable default context menu
        event.preventDefault();

        this.getController()._context.service.commandGroup.getGroup("sap.xs.nodejs.debug.breakpoint").then(function(group) {
          group.getItems().then(function(items) {
            items.forEach(function(item) {
              item.getCommand().setValue(breakpoint);
            });
            that.getController()._context.service.contextMenu.open(group, point.x, point.y).done();
          });
        });
      }
    }
  });
}());
