/*!
 * mosaic-scroller v0.0.8 | License: MIT 
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
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__) {
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
	    ScrollerBlock : __webpack_require__(2),
	    ScrollerView : __webpack_require__(3)
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var Mosaic = __webpack_require__(5);
	
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
	
	            return that.options.loadItems({
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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var Mosaic = __webpack_require__(5);
	
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var React = __webpack_require__(6);
	var Mosaic = __webpack_require__(5);
	var ScrollBarTracker = __webpack_require__(7);
	var ScrollerBlock = __webpack_require__(2);
	var Scroller = __webpack_require__(1);
	
	var ResizeMixin = {
	    addResizeListener : function(listener) {
	        if (window.attachEvent) {
	            window.attachEvent('onresize', listener);
	        } else if (window.addEventListener) {
	            window.addEventListener('resize', listener, true);
	        }
	    },
	    removeResizeListener : function(listener) {
	        if (window.detachEvent) {
	            window.detachEvent('onresize', listener);
	        } else if (window.removeEventListener) {
	            window.removeEventListener('resize', listener, true);
	        }
	    }
	
	};
	
	module.exports = React.createClass({
	    mixins : [ ResizeMixin ],
	
	    componentWillMount : function() {
	        var that = this;
	        that._renderParams = {
	            index : 0,
	            length : 0,
	            items : []
	        };
	        this._updatePosition = true;
	        that.addResizeListener(that._onResize);
	        that._tracker = new ScrollBarTracker();
	        that._scroller = new Scroller(_.extend({
	            itemLen : 10,
	            blockSize : 10,
	            scrollerLen : function() {
	                if (!that.isMounted())
	                    return 10;
	                var container = that.getDOMNode();
	                var scrollerLen = container.offsetHeight;
	                return scrollerLen;
	            },
	        }, that.props, {
	            itemsNumber : function() {
	                return that.props.getItemsNumber();
	            },
	            loadItems : function(params) {
	                return that._startItemsRendering(params);
	            }
	        }));
	        that._scroller.addChangeListener(function() {
	            if (!that.isMounted())
	                return;
	            var itemsElm = that.refs.items.getDOMNode();
	            var blockShift = that._scroller.getBlockShift();
	            itemsElm.style.marginTop = blockShift + 'px';
	        });
	        that._tracker.addChangeListener(function(ev) {
	            if (!that.isMounted())
	                return;
	            var scrollerElm = that.refs.scroller.getDOMNode();
	            if (ev.position != scrollerElm.scrollTop) {
	                scrollerElm.scrollTop = ev.position;
	            }
	            var itemsElm = that.refs.items.getDOMNode();
	            itemsElm.style.top = ev.position + 'px';
	            that._scroller.setDelta(-ev.delta);
	        }, that);
	    },
	    componentWillUnmount : function() {
	        this.removeResizeListener(this._onResize);
	    },
	    componentDidMount : function() {
	        var that = this;
	        that._scroller.setDelta(0);
	        setTimeout(function() {
	            that._updateScroller();
	        }, 1);
	    },
	    componentWillReceiveProps : function(props) {
	        this._updatePosition = true;
	    },
	    componentDidUpdate : function() {
	        if (this._updatePosition) {
	            this._updatePosition = false;
	            this._scroller.focusItem(this.props.index || 0);
	        }
	        this._finishItemsRendering();
	    },
	    _onResize : function() {
	        this._updateScroller();
	        this._scroller.setDelta(0);
	    },
	    _onScroll : function() {
	        this._updateScroller();
	    },
	    getInitialState : function() {
	        return {};
	    },
	    _updateScroller : function() {
	        var container = this.getDOMNode();
	        var scroller = this.refs.scroller.getDOMNode();
	        this._tracker.setPosition(scroller.scrollTop);
	        scroller.style.height = container.offsetHeight + 'px';
	        var placeholderLen = this._tracker.getLength();
	        var placeholder = this.refs.placeholder.getDOMNode();
	        placeholder.style.height = placeholderLen + 'px';
	    },
	    _startItemsRendering : function(params) {
	        var that = this;
	        that._renderParams = _.extend(that._renderParams, params);
	        return Mosaic.P.then(function() {
	            return that.props.renderItems(that._renderParams);
	        }).then(function(items) {
	            that._renderParams.items = items;
	            if (!that._deferredRendering) {
	                that._deferredRendering = Mosaic.P.defer();
	                that._deferredRendering.promise.then(function() {
	                    delete that._deferredRendering;
	                })
	                that._updateState();
	            }
	            return that._deferredRendering.promise;
	        });
	    },
	    _updateState : function() {
	        this.setState({});
	    },
	    _getScrollerWidth : function() {
	        if (this._scrollerWidth === undefined) {
	            var scroller = this.refs.scroller.getDOMNode();
	            var placeholder = this.refs.placeholder.getDOMNode();
	            scroller.style.overflowY = 'scroller';
	            var first = scroller.clientWidth;
	            var second = scroller.offsetWidth;
	            this._scrollerWidth = (second - first) || 0;
	        }
	        return this._scrollerWidth;
	    },
	    _finishItemsRendering : function() {
	        var that = this;
	
	        var container = that.getDOMNode();
	        var scrollerWidth = that._getScrollerWidth();
	        var scroller = that.refs.scroller.getDOMNode();
	        scroller.style.height = container.offsetHeight + 'px';
	        scroller.style.marginRight = '-' + scrollerWidth + 'px';
	
	        if (!that._deferredRendering)
	            return;
	
	        var itemsElm = that.refs.items.getDOMNode();
	        var children = itemsElm.childNodes;
	        var block = new ScrollerBlock({
	            getIndex : function() {
	                return that._renderParams.index;
	            },
	            getSize : function() {
	                return children.length;
	            },
	            getItemLength : function(index) {
	                var len = children.length;
	                if (index < 0 || index >= len)
	                    return 0;
	                var elm = children[index];
	                return elm.offsetHeight;
	            }
	        });
	        that._deferredRendering.resolve(block);
	        that._updateScrollbarPosition();
	
	    },
	    _updateScrollbarPosition : function() {
	        var that = this;
	        var itemsNumber = that._scroller.getItemsNumber();
	        var index = that._scroller.getFirstItemIndex();
	        var progress = itemsNumber ? (index / itemsNumber) : 0;
	        var scrollbar = that.refs.scrollbar.getDOMNode();
	        var slider = that.refs.slider.getDOMNode();
	        var sliderHeight = slider.offsetHeight;
	        var scrollbarHeight = scrollbar.offsetHeight;
	        var position = Math.round((scrollbarHeight - sliderHeight) * progress);
	        slider.style.top = position + 'px';
	    },
	    render : function() {
	        var that = this;
	        var items = that._renderParams.items;
	        var style = _.extend({}, that.props.style, {
	            overflow : 'hidden'
	        });
	        var placeholderLen = that._tracker.getLength();
	        return React.DOM.div({
	            id : that.props.id,
	            className : that.props.className,
	            style : style,
	            onScroll : that._onScroll
	        }, React.DOM.div({
	            key : 'wrapper',
	            className : 'wrapper',
	            style : {
	                position : 'absolute',
	                top : 0,
	                bottom : 0,
	                left : 0,
	                right : 0,
	                margin : 0,
	                padding : 0
	            }
	        }, React.DOM.div({
	            key : 'scroller',
	            ref : 'scroller',
	            style : {
	                overflowY : 'scroll',
	                overflowX : 'hidden',
	                position : 'relative',
	                margin : 0,
	                padding : 0
	            }
	        }, React.DOM.div({
	            key : 'placeholder',
	            ref : 'placeholder',
	            style : {
	                position : 'relative',
	                height : placeholderLen + 'px',
	                overflow : 'hidden',
	                paddingRight : '3px',
	                margin : 0,
	                padding : 0
	            }
	        }, React.DOM.div({
	            ref : 'items',
	            style : {
	                position : 'absolute',
	                left : '0px',
	                right : '0px',
	                top : '0px',
	                bottom : 'auto',
	                margin : 0,
	                padding : 0
	            }
	        }, items))), React.DOM.div({
	            key : 'scrollbar',
	            ref : 'scrollbar',
	            className : 'scrollbar',
	            style : {
	                position : 'absolute',
	                top : 0,
	                bottom : 0,
	                right : 0,
	                margin : 0,
	                padding : 0,
	                maxWidth : '10px'
	            }
	        }, React.DOM.div({
	            key : 'slider',
	            ref : 'slider',
	            className : 'slider',
	            style : {
	                position : 'absolute',
	                top : 0,
	                bottom : 0,
	                right : 0,
	                margin : '3px',
	                padding : 0,
	                minHeight : '10px',
	                minWidth : '3px'
	            }
	        }))));
	    },
	
	});


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

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

	var _ = __webpack_require__(4);
	var Mosaic = __webpack_require__(5);
	
	module.exports = Mosaic.Class.extend(Mosaic.Events.prototype, {
	
	    initialize : function(options) {
	        this.setOptions(options);
	        this._position = -1;
	        this._delta = 0;
	    },
	
	    getLength : function() {
	        return this.options.length || 100000;
	    },
	
	    getPosition : function() {
	        return this._position;
	    },
	
	    getDelta : function() {
	        return this._delta;
	    },
	
	    setPosition : function(position) {
	        var prevPosition = this._position || 0;
	        this._position = position || 0;
	        var length = this.getLength();
	        var threshold = this.getThreshold();
	        var delta = 0;
	        if (this._position < threshold || //
	        this._position > length - threshold) {
	            this._position = length / 2;
	        } else {
	            delta = this._position - prevPosition;
	        }
	        this._delta = delta;
	        this.emit('update', {
	            prevPosition : prevPosition,
	            position : this._position,
	            delta : delta
	        });
	    },
	
	    getThreshold : function() {
	        if (!this.options.threshold) {
	            var length = this.getLength();
	            this.options.threshold = Math.max(length / 4, 50);
	        }
	        return this.options.threshold;
	    },
	
	    addChangeListener : function(listener, context) {
	        this.on('update', listener, context);
	    },
	
	    removeChangeListener : function(listener, context) {
	        this.off('update', listener, context);
	    }
	
	});


/***/ }
/******/ ])
});

//# sourceMappingURL=mosaic-scroller.js.map