var _ = require('underscore');
var Mosaic = require('mosaic-commons');

/**
 * This class is used to load and manage positions of items in an infinite
 * scroll list.
 */
module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {

    /**
     * Initializes internal fields of this object.
     */
    initialize : function(options) {
        this.setOptions(options);
        this._firstItemIndex = 0;
        this._firstItemShift = 0;
        this._block = null;
        this._blockShift = 0; // Read-only value updated by this class
    },

    // -------------------------------------------------------------------------
    // Main methods of this class

    /**
     * Focus the item at the specified absolute position.
     */
    focusItem : function(index, shift) {
        var that = this;
        return Mosaic.P.then(function() {
            var size = that.getItemsNumber();
            that._firstItemIndex = Math.max(0, Math.min(index, size - 1));
            that._firstItemShift = shift || 0;
            if (that._firstItemIndex === 0) {
                that._firstItemShift = Math.min(0, that._firstItemShift);
            }
            return that._loadItems();
        });
    },

    /**
     * Shifts the scroll to the specified delta. This method reloads data if
     * neccessery and updates the block position.
     */
    setDelta : function(delta) {
        var that = this;
        return Mosaic.P.then(function() {
            var itemLen = that.getAverageItemLength();
            if (!that._block) {
                var index = Math.floor(Math.max(0, delta) / itemLen);
                var shift = -Math.abs(delta) % itemLen;
                return that.focusItem(index, shift);
            }
            var index = that._block.getIndex();
            var blockSize = that._block.getSize();

            var shift = that._blockShift + delta;
            var firstIndex = index;
            for (var i = 0; shift < 0 && i < blockSize; i++) {
                var len = that._block.getItemLength(i);
                shift += len;
                firstIndex++;
            }
            // TODO: go directly to the required item if the delta is too big
            return that.focusItem(firstIndex, shift);
        });
    },

    // -------------------------------------------------------------------------
    // Public class methods

    /**
     * Returns already loaded block of items.
     */
    getBlock : function() {
        return this._block;
    },

    /**
     * Returns the shift (in pixels) of the block.
     */
    getBlockShift : function() {
        return this._blockShift;
    },

    /**
     * Returns the size of blocks - the minimal number of items to load at once.
     */
    getBlockSize : function() {
        return this._getOptionValue('blockSize') || 5;
    },

    /**
     * Returns the total number of items in the list.
     */
    getItemsNumber : function() {
        return this._getOptionValue('itemsNumber') || 0;
    },

    /**
     * Returns an average length of individual item.
     */
    getAverageItemLength : function() {
        return this._getOptionValue('itemLen') || 10;
    },

    /**
     * Returns the length of the scroller.
     */
    getScrollerLength : function() {
        return this._getOptionValue('scrollerLen') || 0;
    },

    /**
     * Returns the shift of the first loaded item.
     */
    getFirstItemShift : function() {
        return this._firstItemShift;
    },

    /**
     * Returns the index of the first loaded item.
     */
    getFirstItemIndex : function() {
        return this._firstItemIndex;
    },

    // -------------------------------------------------------------------------
    // Listeners

    /** Adds a change listener */
    addChangeListener : function(listener, context) {
        this.on('update', listener, context);
    },

    /** Removes a change listener */
    removeChangeListener : function(listener, context) {
        this.off('update', listener, context);
    },

    // -------------------------------------------------------------------------
    // Private methods

    /**
     * Load block of items starting from the _firstItemIndex and covering this
     * scroller.
     */
    _loadItems : function() {
        var that = this;
        return Mosaic.P.then(function() {
            var blockSize = that.getBlockSize();
            var itemLen = that.getAverageItemLength();
            var scrollerLen = that.getScrollerLength();
            var itemsNumber = that.getItemsNumber();

            var index = that._firstItemIndex;
            index = Math.max(0, Math.min(index, itemsNumber - 1));

            var count = Math.ceil(scrollerLen * 2 / itemLen);
            var delta = Math.ceil(Math.abs(that._firstItemShift) / itemLen);
            if (that._firstItemShift >= 0) {
                index -= delta;
            } else {
                count += delta;
            }
            index = Math.floor(Math.max(0, index) / blockSize) * blockSize;
            count = Math.ceil(count / blockSize) * blockSize;
            count = Math.max(0, Math.min(count, itemsNumber - index));

            var load = //
            !that._block || //
            that._block.getIndex() !== index || //
            that._block.getSize() !== count;

            if (!load)
                return that._block;
            return that.options.items({
                index : index,
                length : count
            });
        }).then(function(block) {
            that._block = block;
            var index = that._block.getIndex();
            var beforeLen = 0;
            for (var i = index; i < that._firstItemIndex; i++) {
                var len = that._block.getItemLength(i - index);
                beforeLen += len;
            }

            //
            var size = that._block.getSize();
            var itemsNumber = that.getItemsNumber();
            if (index + size === itemsNumber) {
                var tailLen = 0;
                for (var i = that._firstItemIndex; i < itemsNumber; i++) {
                    var len = that._block.getItemLength(i - index);
                    tailLen += len;
                }
                var scrollerLength = that.getScrollerLength();
                that._firstItemShift = //
                Math.max(that._firstItemShift, scrollerLength - tailLen);
            }

            // 
            if (that._firstItemIndex === 0) {
                that._firstItemShift = Math.min(0, that._firstItemShift);
            }

            that._blockShift = that._firstItemShift - beforeLen;
            if (index === 0) {
                that._blockShift = Math.min(0, that._blockShift);
                that._firstItemShift = //
                Math.min(that._blockShift + beforeLen, that._firstItemShift);
            }
            that.emit('update', that);
        });
    },

    /**
     * Returns an option value corresponding to the specified key. If there is a
     * function with the specified key then the execution result of this
     * function is returned instead.
     */
    _getOptionValue : function(key) {
        var value = this.options[key];
        if (_.isFunction(value)) {
            value = value();
        }
        return value;
    }
});
