/**
 * The ImpactAnalyzer is a helper to implement the impact and lineage analysis.
 * User: I063946
 * Date: 04/05/15
 * (c) Copyright 2013-2015 SAP SE. All rights reserved
 */

namespace("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic",function (namespace) {
    "use strict";

    /**
     * @class
     * The ImpactAnalyzer is a helper to implement the impact and lineage analysis.
     * The constructor could have the following parameters:
     * <ul>
     * <li><i>oAnalysisObject</i> - The object to be analyzed for the impact and the lineage.
     * <li><i>oParams</i> - The option parameters:
     *     {sap.galilei.ui.editor.DiagramEditor} editor - (Optional) The diagram editor.
     *     {String} parentSelector - (Optional) The parent node CSS selector. If the diagram editor is not specified, a default one will be created.
     *     {Function|String} extensionClass - (Optional) The diagram editor extension class or class name.
     *     {Object} editorParams - (Optional) The editor parameters.
     *     {Object} viewerParams - (Optional) The viewer parameters.
     * </ul>
     */
    namespace.ImpactAnalyzer = sap.galilei.core.defineClass({
        // Define class name
        fullClassName: "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.impactanalysis.generic",
        parent: sap.galilei.ui.editor.impactAnalysis.ImpactAnalyzer,
    });
});