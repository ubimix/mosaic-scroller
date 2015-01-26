var expect = require('expect.js');
var Scroller = require('../src/Scroller');
var ScrollerBlock = require('../src/ScrollerBlock');
var Mosaic = require('mosaic-commons');
var _ = require('underscore');

describe('Scroller', function() {
    function newScroller(array, options) {
        options = options || {};
        var scroller = new Scroller(_.extend({
            itemLen : 5,
            blockSize : 50,
            scrollerLen : 30,
            itemsNumber : function() {
                return array.length;
            }
        }, options, {
            items : function(params) {
                return new ScrollerBlock({
                    getIndex : function() {
                        return params.index;
                    },
                    getSize : function() {
                        return Math.min(params.length, array.length
                                - params.index);
                    },
                    getItemLength : function(index) {
                        var len = this.getSize();
                        if (index < 0 || index >= len)
                            return 0;
                        var startIdx = this.getIndex();
                        return array[startIdx + index];
                    }
                });
            }
        }));
        scroller.addChangeListener(function() {
            options.blockShift = scroller.getBlockShift();
            options.firstIndex = scroller.getFirstItemIndex();
            options.firstShift = scroller.getFirstItemShift();
        });
        return scroller;
    }

    it('should be able to focus items in one block', function(done) {
        var options = {};
        var scroller = newScroller([ 100, 50, 80, 110 ], options);
        Mosaic.P //
        .then(function() {
            return scroller.focusItem(1).then(function() {
                expect(options.blockShift).to.eql(-100);
                expect(scroller.getBlockShift()).to.eql(-100);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        })//
        .then(function() {
            return scroller.focusItem(2).then(function() {
                expect(options.blockShift).to.eql(-150);
                expect(scroller.getBlockShift()).to.eql(-150);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(function() {
            return scroller.focusItem(3).then(function() {
                expect(options.blockShift).to.eql(-230);
                expect(scroller.getBlockShift()).to.eql(-230);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(3);
            });
        })//
        .then(function() {
            return scroller.focusItem(1).then(function() {
                expect(options.blockShift).to.eql(-100);
                expect(scroller.getBlockShift()).to.eql(-100);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        }).then(done, done);
    });

    it('should be able to load appropriate blocks to focus items', function(
            done) {
        var options = {
            blockSize : 2,
            itemLen : 50,
            scrollerLen : 30,
        };
        var scroller = newScroller([ 100, 50, 80, 110 ], options);
        Mosaic.P //
        .then(function() {
            return scroller.focusItem(1).then(function() {
                expect(options.blockShift).to.eql(-100);
                expect(scroller.getBlockShift()).to.eql(-100);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        })//
        .then(function() {
            return scroller.focusItem(0).then(function() {
                expect(options.blockShift).to.eql(0);
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(0);
            });
        })//
        .then(function() {
            return scroller.focusItem(2).then(function() {
                expect(options.blockShift).to.eql(0);
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(function() {
            return scroller.focusItem(3).then(function() {
                expect(options.blockShift).to.eql(-80);
                expect(scroller.getBlockShift()).to.eql(-80);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(3);
            });
        })//
        .then(function() {
            return scroller.focusItem(1).then(function() {
                expect(options.blockShift).to.eql(-100);
                expect(scroller.getBlockShift()).to.eql(-100);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        }).then(done, done);
    });

    it('should be able to load appropriate blocks to focus items '
            + 'with shifts', function(done) {
        var options = {
            blockSize : 2,
            itemLen : 50,
            scrollerLen : 150,
        };
        var scroller = newScroller([ 100, 50, 80, 110 ], options);
        Mosaic.P //
        .then(function() {
            return scroller.focusItem(1, -20).then(function() {
                expect(scroller.getBlockShift()).to.eql(-120);
                expect(scroller.getFirstItemShift()).to.eql(-20);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        })//
        .then(function() {
            return scroller.focusItem(1, 20).then(function() {
                expect(scroller.getBlockShift()).to.eql(-80);
                expect(scroller.getFirstItemShift()).to.eql(20);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        })//
        .then(function() {
            return scroller.focusItem(0, -30).then(function() {
                expect(scroller.getBlockShift()).to.eql(-30);
                expect(scroller.getFirstItemShift()).to.eql(-30);
                expect(scroller.getFirstItemIndex()).to.eql(0);
            });
        })//
        .then(function() {
            return scroller.focusItem(0, 30).then(function() {
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(0);
            });
        })//
        .then(function() {
            return scroller.focusItem(2, 120).then(function() {
                expect(options.blockShift).to.eql(-30);
                expect(scroller.getBlockShift()).to.eql(-30);
                expect(scroller.getFirstItemShift()).to.eql(120);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(function() {
            return scroller.focusItem(2, 190).then(function() {
                expect(options.blockShift).to.eql(0);
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(150);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(function() {
            return scroller.focusItem(3, 50).then(function() {
                expect(options.blockShift).to.eql(-30);
                expect(scroller.getBlockShift()).to.eql(-30);
                expect(scroller.getFirstItemShift()).to.eql(50);
                expect(scroller.getFirstItemIndex()).to.eql(3);
            });
        })//
        .then(function() {
            return scroller.focusItem(3, 80).then(function() {
                expect(options.blockShift).to.eql(-150);
                expect(scroller.getBlockShift()).to.eql(-150);
                expect(scroller.getFirstItemShift()).to.eql(80);
                expect(scroller.getFirstItemIndex()).to.eql(3);
            });
        })//
        .then(function() {
            return scroller.focusItem(2, -30).then(function() {
                expect(options.blockShift).to.eql(-30);
                expect(scroller.getBlockShift()).to.eql(-30);
                expect(scroller.getFirstItemShift()).to.eql(-30);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        }).then(done, done);
    });

    it('should be able update scroll position with delta ', function(done) {
        var options = {
            blockSize : 2,
            itemLen : 10,
            scrollerLen : 200,
        };
        var scroller = newScroller([ 100, 50, 80, 110 ], options);
        Mosaic.P //
        .then(function() {
            return scroller.setDelta(0).then(function() {
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(0);
            });
        })//
        .then(function() {
            return scroller.setDelta(-110).then(function() {
                expect(scroller.getBlockShift()).to.eql(-110);
                expect(scroller.getFirstItemShift()).to.eql(-10);
                expect(scroller.getFirstItemIndex()).to.eql(1);
            });
        }) //
        .then(function() {
            return scroller.setDelta(+110).then(function() {
                expect(scroller.getBlockShift()).to.eql(0);
                expect(scroller.getFirstItemShift()).to.eql(0);
                expect(scroller.getFirstItemIndex()).to.eql(0);
            });
        })//
        .then(function() {
            return scroller.setDelta(-180).then(function() {
                expect(scroller.getBlockShift()).to.eql(-30);
                expect(scroller.getFirstItemIndex()).to.eql(2);
                expect(scroller.getFirstItemShift()).to.eql(-30);
            });
        })//
        .then(function() {
            return scroller.setDelta(-20).then(function() {
                expect(scroller.getBlockShift()).to.eql(-50);
                expect(scroller.getFirstItemShift()).to.eql(-50);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(function() {
            return scroller.setDelta(+60).then(function() {
                expect(scroller.getBlockShift()).to.eql(-140);
                expect(scroller.getFirstItemShift()).to.eql(+10);
                expect(scroller.getFirstItemIndex()).to.eql(2);
            });
        })//
        .then(done, done);
    });
});
