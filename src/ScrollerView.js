var _ = require('underscore');
var React = require('react');
var Scroller = require('./Scroller');
var Mosaic = require('mosaic-commons');

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
        if (this._handling)
            return;
        var container = this.getDOMNode();
        var scrollPos = container.scrollTop;
        this.manager.updateScrollPosition(scrollPos);
    },
    _finishRendering : function() {
        var container = this.getDOMNode();
        var height = container.offsetHeight;
        this.manager.setScrollLength(height);

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
            var scrollPos = this.manager.getScrollPosition();
            container.scrollTop = scrollPos;
            deferred.resolve(result);
        }
        var index = this.props.index || 0;
        var that = this;
        that._handling = true;
        this.manager.scrollToItem(index).then(function() {
            setTimeout(function() {
                that._handling = false;
            }, 10);
        });
    },

});
