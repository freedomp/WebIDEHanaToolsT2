define(
    [], //dependencies
    function () {

        function Region(regionOffset, regionLength) {
            this.regionOffset = regionOffset;
            this.regionLength = regionLength;
        }
        Region.prototype.regionOffset = -1;
        Region.prototype.regionLength = -1;
        Region.prototype.getOffset = function() {
            return this.regionOffset;
        };
        Region.prototype.getLength = function() {
            return this.regionLength;
        };
        return Region;
    }
);