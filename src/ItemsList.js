var _ = require('underscore');
var Mosaic = require('mosaic-commons');
var Range = require('./Range');

module.exports = Range.extend({

    /** Returns the length of this block. */
    getLength : function() {
        var len = 0;
        var items = this.getItems();
        _.each(items, function(item) {
            len += item.getLength();
        });
        return len;
    },

    /**
     * Returns the number of items in the block.
     */
    getItemsNumber : function() {
        var items = this.getItems();
        return items.length;
    },

    /** Returns all items in this block. */
    getItems : function() {
        return this._get('itms') || [];
    },

    /** Returns the start index of the first list item. */
    getStartIndex : function() {
        return this._get('idx') || 0;
    },

    getEndIndex : function() {
        var from = this.getStartIndex();
        var items = this.getItems();
        return from + items.length;
    },

    /** Sets a new array of items in the block. */
    setItems : function(position, startIndex, items) {
        return this._setAll({
            'pos' : position,
            'idx' : startIndex,
            'itms' : items || []
        });
    },

});
