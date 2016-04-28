var dust = require('dust')();
var serand = require('serand');

dust.loadSource(dust.compile(require('./template'), 'auto-search'));

var query = function (options) {
    var name;
    var value;
    var q = '';
    for (name in options) {
        if (options.hasOwnProperty(name)) {
            value = options[name];
            if (!value) {
                continue;
            }
            q += q ? '&' : '';
            q += name + '=' + value;
        }
    }
    return q ? '?' + q : '';
};

var select = function (el, val) {
    return val ? el.val(val) : el;
};

module.exports = function (sandbox, fn, options) {
    options = options || {};
    dust.render('auto-search', {}, function (err, out) {
        if (err) {
            return;
        }
        var elem = sandbox.append(out);
        var selections = {};
        select($('.make', elem), options.make).selecter({
            callback: function (val) {
                selections.make = val;
            }
        });

        select($('.model', elem), options.model).selecter({
            callback: function (val) {
                selections.model = val;
            }
        });

        $('.search', elem).click(function () {
            serand.redirect('/vehicles' + query({
                make: selections.make,
                model: selections.model
            }));
        });

        fn(false, function () {
            $('.auto-search', sandbox).remove();
        });
    });
};
