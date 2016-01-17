define([ "commonddl/astmodel/SourceRangeImpl"

], // dependencies
function(SourceRangeImpl) {
    function RoleComponentDeclarationImpl() {
        SourceRangeImpl.call(this);
    }
    RoleComponentDeclarationImpl.prototype = Object
            .create(SourceRangeImpl.prototype);
    RoleComponentDeclarationImpl.prototype.constructor = RoleComponentDeclarationImpl;
    return RoleComponentDeclarationImpl;
});