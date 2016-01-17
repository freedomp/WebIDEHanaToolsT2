define(
    ["commonddl/WordFormattingEnum"], //dependencies
    function (WordFormattingEnum) {
        function DdlSourceFormattingStyle() {
        }
        DdlSourceFormattingStyle.prototype.formattingKeyword = WordFormattingEnum.LowerCase;
        DdlSourceFormattingStyle.prototype.formattingIdentifier = WordFormattingEnum.NoChange;
        DdlSourceFormattingStyle.DdlSourceFormattingStyle1 = function(keywordFormatting,identifierFormatting) {
            var result = new DdlSourceFormattingStyle();
            result.formattingKeyword = keywordFormatting;
            result.formattingIdentifier = identifierFormatting;
            return result;
        };
        DdlSourceFormattingStyle.DdlSourceFormattingStyle2 = function() {
            var result = new DdlSourceFormattingStyle();
            return result;
        };
        DdlSourceFormattingStyle.prototype.setKeywordFormatting = function(keywordFormatting) {
            this.formattingKeyword = keywordFormatting;
        };
        DdlSourceFormattingStyle.prototype.getKeywordFormatting = function() {
            return this.formattingKeyword;
        };
        DdlSourceFormattingStyle.prototype.setIdentifierFormatting = function(identifierFormatting) {
            this.formattingIdentifier = identifierFormatting;
        };
        DdlSourceFormattingStyle.prototype.getIdentifierFormatting = function() {
            return this.formattingIdentifier;
        };
        DdlSourceFormattingStyle.convertToCamelCase = function(text) {
            var textConverted = text.substring(0,1).toUpperCase() + text.substring(1,text.length).toLowerCase();
            return textConverted;
        };
        return DdlSourceFormattingStyle;
    }
);