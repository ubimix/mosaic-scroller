var _ = require('underscore');
var Mosaic = require('mosaic-commons');

module.exports = Mosaic.Class.extend({

    /**
     * This constructor overloads fields of this object with specified in the
     * parameter.
     */
    initialize : function(options) {
        _.extend(this, options);
    },

    /**
     * Returns the absolute index of the first item.
     */
    getIndex : function() {
        return this.index;
    },

    /**
     * Returns the real number of items contained in this block.
     */
    getSize : function() {
        return this.items.length;
    },

    /**
     * Returns the length of the item from the specified position.
     */
    getItemLength : function(index) {
        var len = this.items.length;
        if (index < 0 || index >= len)
            return 0;
        var item = this.items[index];
        return item.offsetHeight;
    }
});
