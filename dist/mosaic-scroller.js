/*!
 * mosaic-scroller v0.0.6 | License: MIT 
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
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__) {
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
	    Scroller : __webpack_require__(1),
	    ScrollerView : __webpack_require__(2)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(3);
	var Mosaic = __webpack_require__(4);
	
	module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
	    initialize : function(options) {
	        this.setOptions(options);
	        this._scrollPosition = 0;
	        this._scrollLength = 0;
	        this._placeholderLength = 0;
	    },
	
	    getPlaceholderLength : function() {
	        return this._placeholderLength;
	    },
	
	    getScrollLength : function() {
	        return this._scrollLength;
	    },
	
	    setScrollLength : function(len) {
	        this._scrollLength = len || 1;
	    },
	
	    getScrollPosition : function() {
	        return this._scrollPosition;
	    },
	
	    updateScrollPosition : function(scrollPos) {
	        var that = this;
	        return that._handle(function(len) {
	            var fullScrollerLen = that._getFullScrollerLen(len);
	            var progress = scrollPos / fullScrollerLen;
	            progress = Math.max(0.0, Math.min(1.0, progress));
	            return that._updateScrollPosition(len, progress, -1);
	        });
	    },
	
	    scrollToItem : function(index) {
	        var that = this;
	        return that._handle(function(len) {
	            index = index || 0;
	            var progress = len ? index / len : 0;
	            progress = Math.max(0.0, Math.min(1.0, progress));
	            return that._updateScrollPosition(len, progress, index);
	        });
	    },
	
	    _updateScrollPosition : function(len, progress, focused) {
	        var that = this;
	        var listProgress = 0;
	        var listIndex = 0;
	        var fullScrollerLen = that._getFullScrollerLen(len);
	        var scrollPos = Math.round(fullScrollerLen * progress);
	        var scrollLen = that.getScrollLength();
	        return Mosaic.P.then(function() {
	            that._placeholderLength = fullScrollerLen + scrollLen;
	            that._scrollPosition = scrollPos;
	
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
	            return that.options.renderItems({
	                index : listIndex,
	                length : listSize,
	                focused : focused
	            });
	        }).then(function(info) {
	            var listLength = info.length;
	            var size = info.size;
	            var itemsPosition = 0;
	            if (listIndex == 0 && size >= len && listLength < scrollLen) {
	                that._placeholderLength = scrollLen;
	                that._scrollPosition = 0;
	            } else {
	                var listShift = info.shift;
	                if (listShift === undefined || listShift < 0) {
	                    listShift = listProgress * listLength;
	                }
	                itemsPosition = Math.round(scrollPos - listShift);
	            }
	            return that.options.updateItemsPosition({
	                index : listIndex,
	                position : itemsPosition
	            });
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
	        if (!that._handling) {
	            that._handling = Mosaic.P.then(function() {
	                var len = that.options.getItemsNumber;
	                if (_.isFunction(len)) {
	                    len = len();
	                }
	                return len;
	            }).then(action).then(function(result) {
	                delete that._handling;
	                return result;
	            }, function(err) {
	                delete that._handling;
	                throw err;
	            });
	        }
	        return that._handling;
	    },
	
	});


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(3);
	var React = __webpack_require__(5);
	var Scroller = __webpack_require__(1);
	var Mosaic = __webpack_require__(4);
	
	module.exports = React.createClass({
	    getInitialState : function() {
	        var that = this;
	        this.manager = new Scroller({
	            getItemsNumber : this.props.getItemsNumber,
	            renderItems : function(options) {
	                return Mosaic.P.then(function() {
	                    return that.props.renderItems(options);
	                }).then(function(items) {
	                    var deferred = Mosaic.P.defer();
	                    options.deferred = deferred;
	                    var index = options.index;
	                    var length = options.length;
	                    var state = _.extend({}, options, {
	                        items : items,
	                        deferred : deferred
	                    });
	                    that.setState(that._newState(state));
	                    return deferred.promise;
	                });
	            },
	            updateItemsPosition : function(options) {
	                var itemsBlock = that.refs.items;
	                var div = itemsBlock.getDOMNode();
	                var position = options.position;
	                div.style.top = position + 'px';
	            }
	        });
	        return this._newState({
	            items : [],
	            index : 0,
	            length : 0,
	            deferred : undefined
	        });
	    },
	    componentDidMount : function(nextProps) {
	        this._finishRendering();
	    },
	    componentDidUpdate : function(nextProps) {
	        this._finishRendering();
	    },
	    render : function() {
	        var items = this.state.items;
	        var placeholderLength = this.manager.getPlaceholderLength();
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
	                height : placeholderLength + 'px'
	            }
	        }, React.DOM.div({
	            ref : 'items',
	            style : {
	                position : 'absolute',
	                left : '0px',
	                right : '0px',
	                bottom : 'auto'
	            }
	        }, items)));
	    },
	    _newState : function(options) {
	        return _.extend({}, this.state, options);
	    },
	    /** This handler is called when the scroller changes its position. */
	    _onScroll : function(event) {
	        var container = this.getDOMNode();
	        var scrollPos = container.scrollTop;
	        this.manager.updateScrollPosition(scrollPos);
	    },
	    _finishRendering : function() {
	        var container = this.getDOMNode();
	        var height = container.offsetHeight;
	        this.manager.setScrollLength(height);
	        var scrollPos = this.manager.getScrollPosition();
	        container.scrollTop = scrollPos;
	
	        var deferred = this.state.deferred;
	        if (deferred) {
	            var itemsBlock = this.refs.items;
	            var div = itemsBlock.getDOMNode();
	            var length = div.offsetHeight;
	
	            var shift = -1;
	            var index = this.state.index;
	            var focused = this.state.focused;
	            if (focused >= 0) {
	                var child = div.firstChild;
	                shift = -1;
	                for (var i = index; child && i < focused; i++) {
	                    var len = child.offsetHeight;
	                    if (shift < 0) {
	                        shift = len;
	                    } else {
	                        shift += len;
	                    }
	                    child = child.nextSibling;
	                }
	            }
	            var result = {
	                length : length,
	                size : this.state.items.length,
	                shift : shift
	            };
	            deferred.resolve(result);
	        }
	        var index = this.props.index || 0;
	        this.manager.scrollToItem(index);
	    },
	
	});


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }
/******/ ])
});

//# sourceMappingURL=mosaic-scroller.js.map