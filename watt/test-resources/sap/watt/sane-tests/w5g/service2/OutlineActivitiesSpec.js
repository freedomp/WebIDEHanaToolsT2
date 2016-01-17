define(["STF", "sap/watt/lib/lodash/lodash"], function (STF, _) {
	"use strict";
	var suiteName = "Outline activities", getService = STF.getServicePartial(suiteName);
	describe(suiteName, function () {
		var jQuery, W5gUi5LibraryMediator, w5gTestUtils, oW5gEditor, oW5gEditorPrivate, oW5GOutline, mDocuments, w5gUtils, oTestSetControl;

		before(function () {
			return STF.startWebIde(suiteName, {
				config: "w5g/config.json",
				html: "w5g/service2/w5geditor.html"
			}).then(function (oWindow) {
				return STF.require(suiteName, ["sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUi5LibraryMediator",
					"sane-tests/w5g/w5gTestUtils", "sap/watt/saptoolsets/fiori/editor/plugin/ui5wysiwygeditor/utils/W5gUtils"]).spread(function (mediator, util, utils) {
					jQuery = oWindow.jQuery;
					sap.ui.getCore().loadLibrary("sap.m");
					w5gTestUtils = util;
					W5gUi5LibraryMediator = mediator;
					var oProjectSettings = getService('setting.project');
					w5gTestUtils.initializeBeforeServiceTest(oProjectSettings);
					oW5gEditor = getService('ui5wysiwygeditor');
					oW5GOutline = getService('w5gOutline');
					w5gUtils = utils;
					return w5gTestUtils.retrieveDocumentsAndSetupW5G(getService).then(function (mDocs) {
						mDocuments = mDocs;
						return STF.getServicePrivateImpl(oW5gEditor).then(function (oPrivateImplWysiwygEditor) {
							oW5gEditorPrivate = oPrivateImplWysiwygEditor;
						});
					});
				});
			});
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});

		//get Aggregation by testSet helper function
		function _getAggregation(oParent, sAggregationName) {
			var aAggregation = oParent[oParent.getMetadata().getAllAggregations()[sAggregationName]["_sGetter"]]();
			if (!_.isArray(aAggregation)) {
				aAggregation = [aAggregation];
			}
			return aAggregation;
		}

		describe("mass add all supported controls via outline (non ui)", function () {
			var aCoveredControls = [];

			before(function () {
				return w5gTestUtils.openDocument(oW5gEditor, mDocuments.oOtherViewDoc);
			});

			after(function () {
				return oW5gEditor.getDesignTime().then(function (oDesignTime) {
					return w5gTestUtils.closeAndResetDocument(oW5gEditor, mDocuments.oOtherViewDoc).then(function () {
						var aAvailableControlNames = W5gUi5LibraryMediator.getSupportedControls(oDesignTime).map(function (oControlData) {
							return oControlData.name;
						});
						var aUncoveredControls = _.without.apply(_, [aAvailableControlNames].concat(aCoveredControls)
							.concat(["sap.ui.core.mvc.XMLView"]));
						if (aUncoveredControls.length) {
							console.error("The following controls were not covered by the test: " + aUncoveredControls.join(",\n"));
						}
						expect(aUncoveredControls).to.be.empty;
					});
				});
			});

			[
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Toolbar"},
					{aggregation: "content", newOne: "sap.m.ToolbarSpacer"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Toolbar"},
					{aggregation: "content", newOne: "sap.m.ToolbarSeparator"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.OverflowToolbar"},
					{aggregation: "content", newOne: "sap.m.OverflowToolbarButton"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Select"},
					{aggregation: "items", newOne: "sap.ui.core.Item"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Select"},
					{aggregation: "items", newOne: "sap.ui.core.ListItem"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.SimpleForm"},
					{aggregation: "title", newOne: "sap.ui.core.Title"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Table"},
					{aggregation: "columns", newOne: "sap.m.Column"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Table"},
					{aggregation: "items", newOne: "sap.m.ColumnListItem"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.m.IconTabHeader"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.SelectList"},
				[{parentId: "page", aggregation: "content", newOne: "sap.m.IconTabBar"},
					{aggregation: "items", newOne: "sap.m.IconTabSeparator"}],
				[{parentId: "page", aggregation: "content", newOne: "sap.m.IconTabBar"},
					{aggregation: "items", newOne: "sap.m.IconTabFilter"}],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.UploadCollection"},
					{aggregation: "items", newOne: "sap.m.UploadCollectionItem"}
				],
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.core.LayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.m.FlexItemData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.m.ToolbarLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.core.VariantLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.form.GridContainerData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.GridData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.form.GridElementData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.ResponsiveFlowLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.SplitterLayoutData"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.HorizontalLayout"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Button"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ToggleButton"},
				{parentId: "page", aggregation: "content", newOne: "sap.ushell.ui.footerbar.AddBookmarkButton"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.SegmentedButton"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.CheckBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Image"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Input"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Label"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.DisplayListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.InputListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.StandardListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.List"},
				//{parentId: "page", aggregation: "content", newOne: "sap.m.Page"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.RadioButton"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.SearchField"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.TextArea"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ActionSelect"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ComboBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Slider"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.DatePicker"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Text"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.FlexBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.HBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.VBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.VerticalLayout"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.Calendar"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.CalendarLegend"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Bar"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ProgressIndicator"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Switch"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Link"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectNumber"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectAttribute"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectStatus"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectIdentifier"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectHeader"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.StandardTile"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.CustomTile"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.TileContainer"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.FeedListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ObjectListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.Grid"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Shell"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.core.InvisibleText"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.GroupHeaderListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.PullToRefresh"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.ActionListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.CustomListItem"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Panel"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.core.Icon"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.BusyIndicator"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.semantic.SemanticPage"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.Page"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.semantic.MasterPage"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.semantic.ShareMenuPage"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.semantic.DetailPage"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Carousel"},
					{aggregation: "pages", newOne: "sap.m.semantic.FullscreenPage"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.m.FeedInput"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.MessageStrip"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.RadioButtonGroup"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.RatingIndicator"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.NavContainer"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.PagingButton"},
				{parentId: "page", aggregation: "customData", newOne: "sap.ui.core.CustomData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.m.FlexItemData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.m.ToolbarLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.core.LayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.core.VariantLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.GridData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.ResponsiveFlowLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.SplitterLayoutData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.form.GridContainerData"},
				{parentId: "page", aggregation: "layoutData", newOne: "sap.ui.layout.form.GridElementData"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.PagingButton"},

				{parentId: "page", aggregation: "content", newOne: "sap.m.Title"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Token"},
				{parentId: "page", aggregation: "content", newOne: "sap.m.Tokenizer"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Tokenizer"},
					{aggregation: "tokens", newOne: "sap.m.Token"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.FixFlex"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "formContainers", newOne: "sap.ui.layout.form.FormContainer"},
					{aggregation: "formElements", newOne: "sap.ui.layout.form.FormElement"},
					{aggregation: "fields", newOne: "sap.m.Button"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "title", newOne: "sap.ui.core.Title"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "layout", newOne: "sap.ui.layout.form.FormLayout"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "layout", newOne: "sap.ui.layout.form.GridLayout"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "layout", newOne: "sap.ui.layout.form.ResponsiveGridLayout"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "layout", newOne: "sap.ui.layout.form.ResponsiveLayout"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.layout.form.Form"},
					{aggregation: "formContainers", newOne: "sap.ui.layout.form.FormContainer"},
					{aggregation: "title", newOne: "sap.ui.core.Title"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.Currency"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.FileUploader"},
					{aggregation: "parameters", newOne: "sap.ui.unified.FileUploaderParameter"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.SplitContainer"},
					{aggregation: "content", newOne: "sap.m.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.ApplicationHeader"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Button"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.CheckBox"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.ColorPicker"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.FileUploader"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.MenuBar"},
					{aggregation: "items", newOne: "sap.ui.unified.MenuItem"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.MenuButton"},
					{aggregation: "menu", newOne: "sap.ui.unified.Menu"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Paginator"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Panel"},
					{aggregation: "buttons", newOne: "sap.ui.commons.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.PasswordField"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.ProgressIndicator"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.RadioButton"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.RangeSlider"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.RatingIndicator"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.SegmentedButton"},
					{aggregation: "buttons", newOne: "sap.ui.commons.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Slider"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Splitter"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.TextArea"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.TextField"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Toolbar"},
					{aggregation: "items", newOne: "sap.ui.commons.Button"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.commons.Tree"},
					{aggregation: "nodes", newOne: "sap.ui.commons.TreeNode"},
					{aggregation: "nodes", newOne: "sap.ui.commons.TreeNode"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.ux3.FeedChunk"},
					{aggregation: "comments", newOne: "sap.ui.ux3.FeedChunk"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.ui.ux3.Feeder"},
				//[
				//	{parentId: "page", aggregation: "content", newOne: "sap.ui.ux3.NavigationBar"},
				//	{aggregation: "items", newOne: "sap.ui.ux3.NavigationItem"},
				//	{aggregation: "subItems", newOne: "sap.ui.ux3.NavigationItem"}
				//],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.ui.ux3.ExactArea"},
					{aggregation: "toolbarItems", newOne: "sap.ui.commons.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.BusinessCard"},
				//[
				//	{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.ChartContainer"},
				//	{aggregation: "content", newOne: "sap.suite.ui.commons.ChartContainerContent"},
				//	{aggregation: "content", newOne: "sap.m.Button"}
				//],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.ComparisonChart"},
					{aggregation: "data", newOne: "sap.suite.ui.commons.ComparisonData"}
				],
				//[
				//	{parentId: "page", aggregation: "content", newOne: "sap.ui.ux3.NavigationBar"},
				//	{aggregation: "items", newOne: "sap.suite.ui.commons.CountingNavigationItem"}
				//],
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.DateRangeSliderInternal"},
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.DeltaMicroChart"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.GenericTile"},
					{aggregation: "tileContent", newOne: "sap.suite.ui.commons.TileContent"},
					{aggregation: "content", newOne: "sap.m.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.DynamicContainer"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.FacetOverview"},
					{aggregation: "content", newOne: "sap.m.Button"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.HarveyBallMicroChart"},
					{aggregation: "items", newOne: "sap.suite.ui.commons.HarveyBallMicroChartItem"},
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.HeaderCell"},
					{aggregation: "west", newOne: "sap.suite.ui.commons.HeaderCellItem"},
					{aggregation: "content", newOne: "sap.m.Button"}
				],
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.HeaderContainer"},
					{aggregation: "items", newOne: "sap.m.Button"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.JamContent"},
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.NewsContent"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.NoteTaker"},
					{aggregation: "cards", newOne: "sap.suite.ui.commons.NoteTakerCard"}
				],
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.NoteTakerFeeder"},
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.NumericContent"},
				//{parentId: "page", aggregation: "content", newOne: "sap.m.DateTimeInput"},
				{parentId: "page", aggregation: "content", newOne: "sap.ui.unified.ShellOverlay"},
				{parentId: "page", aggregation: "content", newOne: "sap.uxap.ObjectPageHeader"},
				{parentId: "page", aggregation: "content", newOne: "sap.uxap.ObjectPageHeaderContent"},
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.DateRangeScroller"},
				//{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.DateRangeSlider"},
				{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.KpiTile"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.suite.ui.commons.TileContent"},
					{aggregation: "content", newOne: "sap.m.Button"}
				],

				// tests for add from container using getContainerTargetAggregation
				{parentId: "page", aggregation: null, newOne: "sap.m.Button"},
				[
					{parentId: "page", aggregation: "content", newOne: "sap.m.Bar"},
					{aggregation: null, newOne: "sap.m.Button"}
				]

			].forEach(function (/** Array<{parentId: string, aggregation: string, newOne: string}> */aTestSet) {
					if (!_.isArray(aTestSet)) {
						aTestSet = [aTestSet];
					}
					it("injects " + aTestSet[0].newOne + " into control " + aTestSet[0].parentId + " aggregation " + aTestSet[0].aggregation + ", delete after",
						//recursively check control injection and selection
						function () {
							function handle(aSingleTestActivities) {
								if (aSingleTestActivities.length === 0) {
									return Q();
								}
								var oTestSet = aSingleTestActivities[0];
								aCoveredControls.push(oTestSet.newOne);
								return oW5gEditor.selectUI5Control(oTestSet.parentId).then(function () {
									if (!oTestSet.aggregation) {
										return oW5gEditor.getCurrentSelectedControl().then(function (oTestSetControl) {
											oTestSet.aggregation = w5gUtils.getContainerTargetAggregation(oTestSetControl);
											return oW5gEditor.injectElementToAggregation(oTestSet.newOne, oTestSet.aggregation);
										});
									} else {
										return oW5gEditor.injectElementToAggregation(oTestSet.newOne, oTestSet.aggregation);
									}
								}).then(function () {
									return oW5gEditorPrivate._getUI5ControlById(oTestSet.parentId);
								}).then(function (oSel) { // checking selection on control added second before
									var oParent = oSel;
									return oW5gEditor.getCurrentSelectedControl().then(function (oCurrCtrl) {
										var aAggregation = _getAggregation(oParent, oTestSet.aggregation);
										var oNew = _.last(aAggregation);
										expect(oCurrCtrl.getId()).to.equal(oNew.getId());
									});
								}).then(function () {
									return oW5gEditorPrivate._getUI5ControlById(oTestSet.parentId);
								}).then(function (oControl) { //dive into next aggregation level
									var aAggregation = _getAggregation(oControl, oTestSet.aggregation),
										oAddedControl = _.last(aAggregation);
									expect(oAddedControl.getMetadata().getName()).to.equal(oTestSet.newOne);
									var aReducedArray = aSingleTestActivities.splice(1);
									if (aReducedArray.length) {
										aReducedArray[0].parentId = oAddedControl.getId();
									}
									return handle(aReducedArray).then(function () {
										return oW5gEditor.deleteUI5Control(oAddedControl);
									});
								});
							}

							return handle(aTestSet);
						});
				});
		});

		describe("Manual aggregation hosting", function () {

			before(function () {
				return w5gTestUtils.openDocument(oW5gEditor, mDocuments.oViewDoc);
			});

			after(function () {
				return w5gTestUtils.closeAndResetDocument(oW5gEditor, mDocuments.oViewDoc);
			});

			it("avoid nested layoutData injection in control's layoutData aggregation", function () {
				return oW5gEditor.selectUI5Control("button").then(function () {
					return oW5gEditor.getCurrentSelectedControl().then(function (oControl) {
						return oW5gEditor.injectElementToAggregation("sap.ui.layout.GridData", "layoutData");
					}).then(function () {
						return oW5gEditor.getCurrentSelectedControl().then(function (oControl) {
							return oW5gEditor.injectElementToAggregation("sap.ui.layout.GridData", "layoutData");
						}).then(function () {
							return oW5gEditor.selectUI5Control("button").then(function () {
								return oW5gEditor.getCurrentSelectedControl().then(function (oControl) {
									expect(oControl.getMetadata().getName()).to.equal("sap.m.Button");
									var layoutDataAggregation = _getAggregation(oControl, "layoutData");
									expect(layoutDataAggregation.length).to.equal(1);
									expect(layoutDataAggregation[0].getMetadata().getName()).to.equal("sap.ui.layout.GridData");
									var layoutDataNestedAggregation = _getAggregation(layoutDataAggregation[0], "layoutData");
									expect(layoutDataNestedAggregation.length).to.equal(1);
									expect(layoutDataNestedAggregation[0]).to.be.null;
								});
							});
						});
					});
				});
			});
		});
	});
});
