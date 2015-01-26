var _ = require('underscore');
var React = require('react');
var Mosaic = require('mosaic-commons');
var ScrollBarTracker = require('./ScrollBarTracker');
var ScrollerBlock = require('./ScrollerBlock');
var Scroller = require('./Scroller');

module.exports = React.createClass({
    componentWillMount : function() {
        var that = this;
        this._tracker = new ScrollBarTracker();
        this._scroller = new Scroller(_.extend({
            itemLen : 10,
            blockSize : 10,
            scrollerLen : function() {
                if (!that.isMounted())
                    return 10;
                var container = that.getDOMNode();
                return container.offsetHeight;
            },
        }, this.props, {
            itemsNumber : function() {
                return that.props.getItemsNumber();
            },
            items : function(params) {
                return that._startItemsRendering(params);
            }
        }));
        this._scroller.addChangeListener(function() {
            if (!that.isMounted())
                return;
            var itemsElm = that.refs.items.getDOMNode();
            var blockShift = that._scroller.getBlockShift();
            var firstIndex = that._scroller.getFirstItemIndex();
            var firstShift = that._scroller.getFirstItemShift();
            itemsElm.style.marginTop = blockShift + 'px';
        });
        this._tracker.addChangeListener(function(ev) {
            if (!that.isMounted())
                return;
            var scrollerElm = that.refs.scroller.getDOMNode();
            if (ev.position != scrollerElm.scrollTop) {
                scrollerElm.scrollTop = ev.position;
            }
            var itemsElm = that.refs.items.getDOMNode();
            itemsElm.style.top = ev.position + 'px';
            this._scroller.setDelta(-ev.delta);
        }, this);
    },
    componentDidMount : function() {
        this._tracker.setPosition(0);
        this._scroller.focusItem(this.props.index);
    },
    componentWillReceiveProps : function(props) {
        this._scroller.focusItem(props.index);
    },
    componentDidUpdate : function() {
        this._finishItemsRendering();
    },
    _onScroll : function() {
        var scroller = this.refs.scroller.getDOMNode();
        this._tracker.setPosition(scroller.scrollTop);
    },
    getInitialState : function() {
        return {
            index : 0,
            length : 0,
            items : [],
        };
    },
    _startItemsRendering : function(params) {
        var that = this;
        return Mosaic.P.then(function() {
            return that.props.renderItems(params);
        }).then(function(items) {
            var deferred = Mosaic.P.defer();
            that.setState(_.extend({}, params, {
                deferred : deferred,
                items : items
            }));
            return deferred.promise;
        });
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

        if (!that.state || !that.state.deferred)
            return;

        var state = that.state;
        var items = state.items;
        var itemsElm = that.refs.items.getDOMNode();
        var children = itemsElm.childNodes;
        var block = new ScrollerBlock({
            getIndex : function() {
                return state.index;
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
        state.deferred.resolve(block);
    },
    render : function() {
        var that = this;
        var items = that.state.items || [];
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
            ref : 'scroller',
            style : {
                overflowY : 'scroll',
                overflowX : 'hidden',
                position : 'relative'
            }
        }, React.DOM.div({
            ref : 'placeholder',
            style : {
                position : 'relative',
                height : placeholderLen + 'px',
                overflow : 'hidden',
                paddingRight : '3px'
            }
        }, React.DOM.div({
            ref : 'items',
            style : {
                position : 'absolute',
                left : '0px',
                right : '0px',
                top : '0px',
                bottom : 'auto'
            }
        }, items))));
    },

});
