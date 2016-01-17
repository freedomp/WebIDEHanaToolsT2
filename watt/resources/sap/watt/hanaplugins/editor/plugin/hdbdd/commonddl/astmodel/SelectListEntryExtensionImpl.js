define(
    ["commonddl/astmodel/SelectListEntryImpl"], //dependencies
    function (SelectListEntryImpl) {
        function SelectListEntryExtensionImpl() {
            SelectListEntryImpl.call(this);
        }
        SelectListEntryExtensionImpl.prototype = Object.create(SelectListEntryImpl.prototype);
        SelectListEntryExtensionImpl.prototype.constructor = SelectListEntryExtensionImpl;
        return SelectListEntryExtensionImpl;
    }
);