define(
    [
        "commonddl/astmodel/CaseExpressionImpl"
    ], //dependencies
    function (
        CaseExpressionImpl
        ) {
        function SearchedCaseExpressionImpl() {
            CaseExpressionImpl.call(this);
        }
        SearchedCaseExpressionImpl.prototype = Object.create(CaseExpressionImpl.prototype);
        SearchedCaseExpressionImpl.prototype.constructor = SearchedCaseExpressionImpl;
        return SearchedCaseExpressionImpl;
    }
);