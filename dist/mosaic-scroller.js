/*!
 * mosaic-scroller v0.0.1 | License: MIT 
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("mosaic-commons"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "mosaic-commons", "react"], factory);
	else if(typeof exports === 'object')
		exports["mosaic-scroller"] = factory(require("underscore"), require("mosaic-commons"), require("react"));
	else
		root["mosaic-scroller"] = factory(root["underscore"], root["mosaic-commons"], root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    ItemsList : __webpack_require__(1),
	    Range : __webpack_require__(2),
	    Scroller : __webpack_require__(3),
	    ScrollerView : __webpack_require__(4)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(5);
	var Mosaic = __webpack_require__(6);
	var Range = __webpack_require__(2);
	
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(5);
	var Mosaic = __webpack_require__(6);
	
	module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
	
	    initialize : function(options) {
	        this.setOptions(options);
	    },
	    _setAll : function(obj) {
	        var updated = false;
	        _.each(obj, function(value, key) {
	            updated |= !this._equal(value, this.options[key]);
	            this.options[key] = value;
	        }, this);
	        return this._notify(updated);
	    },
	    _set : function(key, value) {
	        var updated = !this._equal(value, this.options[key]);
	        this.options[key] = value;
	        return this._notify(updated);
	    },
	    _get : function(key) {
	        return this.options[key];
	    },
	    _equal : function(first, second) {
	        return first == second;
	    },
	    _notify : function(updated) {
	        if (updated) {
	            this.fire('updated');
	        }
	        return updated;
	    },
	    setLength : function(value) {
	        return this._set('len', value || 0);
	    },
	
	    getLength : function(value) {
	        return this._get('len');
	    },
	
	    setPosition : function(value) {
	        return this._set('pos', value || 0);
	    },
	    getPosition : function(value) {
	        return this._get('pos');
	    },
	    setPositionAndLength : function(pos, len) {
	        return this._setAll({
	            'pos' : pos,
	            'len' : len
	        });
	    }
	
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(5);
	var Mosaic = __webpack_require__(6);
	var Range = __webpack_require__(2);
	var ItemsList = __webpack_require__(1);
	
	module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
	    initialize : function(options) {
	        this.setOptions(options);
	        this.list = new ItemsList(options);
	        this.scroll = new Range(options);
	        this.placeholder = new Range(options);
	    },
	
	    getLength : function() {
	        return this.placeholder.getLength();
	    },
	
	    setScroll : function(scrollPos, scrollLen) {
	        var that = this;
	        return that._handle(function(len) {
	            var fullScrollerLen = that._getFullScrollerLen(len);
	            var progress = scrollPos / fullScrollerLen;
	            progress = Math.max(0.0, Math.min(1.0, progress));
	            return that._updateScrollPosition(len, progress, scrollLen);
	        });
	    },
	
	    focusItem : function(index, scrollLen) {
	        var that = this;
	        return that._handle(function(len) {
	            index = index || 0;
	            var progress = len ? index / len : 0;
	            progress = Math.max(0.0, Math.min(1.0, progress));
	            return that._updateScrollPosition(len, progress, scrollLen);
	        });
	    },
	
	    _updateScrollPosition : function(len, progress, scrollLen) {
	        var that = this;
	        var listProgress = 0;
	        var listIndex = 0;
	        var fullScrollerLen = that._getFullScrollerLen(len);
	        var scrollPos = Math.round(fullScrollerLen * progress);
	        return Mosaic.P.then(function() {
	            that.placeholder.setLength(fullScrollerLen + scrollLen);
	            that.scroll.setPositionAndLength(scrollPos, scrollLen);
	
	            var itemId = Math.floor(progress * len);
	            itemId = Math.max(0, Math.min(len - 1, itemId));
	
	            var blockSize = that._getBlockSize(len);
	            var startIdx = Math.floor(itemId / blockSize) * blockSize;
	
	            var itemLen = that._getAverageItemLength();
	            var endIdx = Math.ceil((itemId + scrollLen / itemLen) / //
	            blockSize) * blockSize;
	
	            listIndex = startIdx;
	            var listSize = endIdx - startIdx;
	            listProgress = (progress * len - startIdx) / listSize;
	            return that._loadItems(listIndex, listSize);
	        }).then(function(items) {
	            var listLength = 0;
	            _.each(items, function(item) {
	                listLength += item.getLength();
	            });
	            var updated;
	            if (listIndex == 0 && items.length >= len && //
	            listLength < scrollLen) {
	                that.placeholder.setLength(scrollLen);
	                that.scroll.setPositionAndLength(0, scrollLen);
	                updated = that.list.setItems(0, 0, items);
	            } else {
	                var listShift = listProgress * listLength;
	                var listPos = Math.round(scrollPos - listShift);
	                updated = that.list.setItems(listPos, listIndex, items);
	            }
	            if (updated) {
	                that.fire('updated');
	            }
	        });
	    },
	
	    _getFullScrollerLen : function(len) {
	        var size = 0;
	        if (len > 0) {
	            var n = Math.ceil(Math.log(len) / Math.log(10));
	            var itemLen = this._getAverageItemLength();
	            size = itemLen * Math.pow(10, n);
	        }
	        return size;
	    },
	
	    /**
	     * Returns a block size - a minimal number of items to load at once.
	     */
	    _getBlockSize : function(len) {
	        return this.options.blockSize || 5;
	    },
	
	    /**
	     * Returns an average item length. This length is used to estimate the
	     * number of items to load.
	     */
	    _getAverageItemLength : function() {
	        return this._itemLen || this.options.itemLen || 10;
	    },
	
	    /**
	     * Sets a new average item length. This length is used to estimate the
	     * number of items to load.
	     */
	    _setAverageItemLength : function(len) {
	        this._itemLen = len || 10;
	    },
	
	    _handle : function(action) {
	        var that = this;
	        return Mosaic.P.then(function() {
	            if (that._handling) {
	                return;
	            }
	            that._handling = true;
	            return that._load('__loadlength', function() {
	                var len = that.options.getItemsNumber;
	                if (_.isFunction(len)) {
	                    len = len();
	                }
	                return len;
	            }).then(action).then(function(result) {
	                that._handling = false;
	                return result;
	            }, function(err) {
	                that._handling = false;
	                throw err;
	            });
	        });
	    },
	
	    /**
	     * Loads items using the "load" method specified in the class options and
	     * returns a promise with results.
	     */
	    _loadItems : function(idx, len) {
	        return this._load('__loadItems', function() {
	            return this.options.loadItems({
	                index : idx,
	                length : len
	            });
	        });
	    },
	
	    _load : function(key, action) {
	        var that = this;
	        if (that[key]) {
	            that[key].reject('Interrupted');
	        }
	        var deferred = that[key] = Mosaic.P.defer();
	        Mosaic.P.then(function() {
	            return action.apply(that);
	        }).then(deferred.resolve, deferred.reject);
	        return deferred.promise.then(function(result) {
	            delete that[key];
	            return result;
	        }, function(err) {
	            delete that[key];
	            throw err;
	        });
	    },
	
	});


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(5);
	var React = __webpack_require__(7);
	var Scroller = __webpack_require__(3);
	
	module.exports = React.createClass({
	    getInitialState : function() {
	        this.manager = new Scroller(this.props);
	        this.manager.on('updated', this._onUpdate, this);
	        return this._newState();
	    },
	    componentDidMount : function(nextProps) {
	        this._updateScrollPos();
	    },
	    componentDidUpdate : function(nextProps) {
	        this._updateScrollPos();
	    },
	    render : function() {
	        var scroll = this.manager.scroll;
	        var list = this.manager.list;
	        var scrollPos = scroll.getPosition();
	        var scrollLen = scroll.getLength();
	        var listPos = list.getPosition();
	        var listLen = list.getLength();
	
	        var items = this._renderItems();
	        var placeholder = this.manager.placeholder;
	        var style = _.extend({}, this.props.style, {
	            overflowY : 'auto',
	            overflowX : 'hidden'
	        });
	        return React.DOM.div({
	            id : this.props.id,
	            className : this.props.className,
	            style : style,
	            onScroll : this._onScroll
	        }, React.DOM.div({
	            style : {
	                position : 'relative',
	                height : placeholder.getLength() + 'px'
	            }
	        }, React.DOM.div({
	            style : {
	                position : 'absolute',
	                height : list.getLength() + 'px',
	                top : list.getPosition() + 'px',
	                left : '0px',
	                right : '0px',
	                bottom : 'auto'
	            }
	        }, items)));
	    },
	    _onUpdate : function() {
	        this.setState(this._newState());
	    },
	    _newState : function(options) {
	        return _.extend({}, this.state, options);
	    },
	    _renderItems : function() {
	        var list = this.manager.list;
	        var items = list.getItems();
	        return this.props.renderItems({
	            items : items,
	            index : list.getStartIndex(),
	            position : list.getPosition(),
	            length : list.getLength()
	        });
	    },
	    /** This handler is called when the scroller changes its position. */
	    _onScroll : function(event) {
	        var container = this.getDOMNode();
	        var scrollPos = container.scrollTop;
	        var height = container.offsetHeight;
	        this.manager.setScroll(scrollPos, height);
	    },
	    _updateScrollPos : function() {
	        var container = this.getDOMNode();
	        var height = container.offsetHeight;
	        var index = this.props.index || 0;
	        this.manager.focusItem(index, height);
	    },
	
	});


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }
/******/ ])
});

//# sourceMappingURL=mosaic-scroller.js.map