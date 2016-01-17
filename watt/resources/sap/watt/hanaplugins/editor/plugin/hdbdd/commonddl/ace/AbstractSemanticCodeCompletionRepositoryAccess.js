/*eslint-disable no-eq-null,max-len*/
// based on commit
//55a1d9e93c70630ca0b6273c708f4dd30f79f21e Adopting Mass enabled API
define(
    [], //dependencies
    function () {

        function AbstractSemanticCodeCompletionRepositoryAccess() {
            this.cachedDataSourceNames = {};
        }
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNames1 = function(namePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.cachedDataSourceNames = {};
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNameObjects = function(namePattern) {
            var result = this.cachedDataSourceNames[namePattern];
            if (result != null) {
                return result;
            }
            var names = this.getDataSourceNames(namePattern);
            if (names == null) {
                return null;
            }
            result = this.getListOfDataSourceNames(names);
            this.cachedDataSourceNames[namePattern] = result;
            return result;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getListOfDataSourceNames = function(names) {
            var result = [];
            for (var nameCount = 0;nameCount < names.length;nameCount++) {
                var name = names[nameCount];
                result.push({name:name,data:null});
            }
            return result;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceNames2 = function(namePattern,requestScope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getColumnNames = function(monitor,cu,dataSourceName,columnNamePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getElementProposals = function(monitor,cu,pathNames,scope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getElementProposalsWithUnlimitedResultSize = function(monitor,cu,pathNames,scope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceTypes = function(monitor,dataSourceNames) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.resetCache = function() {
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.findAndParseEntity = function(monitor,namePath) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getColumnsAndAssociations = function(progressMonitor,compilationUnit,fullyQualifiedPathName,resultColumnNames,resultAssociationNames,resultAssociationTargetEntityNames) {
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getSelectListEntryType = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getProject = function() {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getElementProposalsWithUris = function(monitor,pathNames,scope) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataElements = function(monitor,namePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDomains = function(monitor,namePattern) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getDataSourceInformation = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        AbstractSemanticCodeCompletionRepositoryAccess.prototype.getSelectListEntryTypes = function(progressMonitor,compilationUnit,fullyQualifiedPathNames) {
            return null;
        };
        return AbstractSemanticCodeCompletionRepositoryAccess;
    }
);