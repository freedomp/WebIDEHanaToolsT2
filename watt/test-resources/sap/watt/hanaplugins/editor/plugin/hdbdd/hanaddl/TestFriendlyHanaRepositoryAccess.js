define(
    ["commonddl/commonddlUi"], //dependencies
    function (commonddlUi) {

        var AbstractSemanticCodeCompletionRepositoryAccess = commonddlUi.AbstractSemanticCodeCompletionRepositoryAccess;
        function TestFriendlyHanaRepositoryAccess() {

        }
        TestFriendlyHanaRepositoryAccess.prototype = Object.create(AbstractSemanticCodeCompletionRepositoryAccess.prototype);
        TestFriendlyHanaRepositoryAccess.prototype.project = null;
        TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess1 = function() {
            var result = new TestFriendlyHanaRepositoryAccess();
            return result;
        };
        TestFriendlyHanaRepositoryAccess.TestFriendlyHanaRepositoryAccess2 = function(project) {
            var result = new TestFriendlyHanaRepositoryAccess();
            result.project = project;
            return result;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getProject = function() {
            return this.project;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getDataSourceNames = function(namePattern) {
            if (this.dataSourceNames !== undefined) {
                return this.dataSourceNames;
            }
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getColumnNames = function(monitor,cu,dataSourceName,columnNamePattern) {
            if (this.columnNames !== undefined) {
                return this.columnNames;
            }
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getCdsTypeNames = function(namePattern) {
            if (this.cdsTypeNames !== undefined) {
                return this.cdsTypeNames;
            }
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getElementProposals = function(monitor,cu,pathNames,scope) {
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getDataSourceTypes = function(monitor,dataSourceNames) {
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.resetCache = function() {
        };
        TestFriendlyHanaRepositoryAccess.prototype.findAndParseEntity = function(monitor,namePath) {
            return null;
        };
        TestFriendlyHanaRepositoryAccess.prototype.getColumnsAndAssociations = function(progressMonitor,compilationUnit,
                                                                                        fullyQualifiedPathName,resultColumnNames,resultAssociationNames,resultAssociationTargetEntityNames) {
        };
        TestFriendlyHanaRepositoryAccess.prototype.getSelectListEntryType = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        return TestFriendlyHanaRepositoryAccess;
    }
);