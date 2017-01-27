var dust = require('dust')();
var serand = require('serand');
var utils = require('utils');
var Make = require('vehicle-makes-service');
var Model = require('vehicle-models-service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-search'));

var query = function (options) {
    var name;
    var value;
    var q = '';
    var i;
    for (name in options) {
        if (!options.hasOwnProperty(name)) {
            continue;
        }
        if (name === '_') {
            continue;
        }
        value = options[name];
        if (!value) {
            continue;
        }
        value = value instanceof Array ? value : [value];
        for (i = 0; i < value.length; i++) {
            q += q ? '&' : '';
            q += name + '=' + value[i];
        }
    }
    return q ? '?' + q : '';
};

var select = function (el, val) {
    el = $('select', el);
    return val ? el.val(val) : el;
};

var search = function (selections) {
    serand.redirect('/vehicles' + query(selections));
};

var update = function (elem, options) {
    var name;
    var value;
    var checkboxes = ['transmission', 'condition', 'fuel'];
    var i;
    var length = checkboxes.length;
    for (i = 0; i < length; i++) {
        name = checkboxes[i];
        $('.' + name, elem).find('input[type=checkbox]').prop('checked', false);
    }
    for (name in options) {
        if (!options.hasOwnProperty(name)) {
            continue;
        }
        if (name === 'make' || name === 'model') {
            continue;
        }
        value = options[name];
        if (checkboxes.indexOf(name) !== -1) {
            value = value instanceof Array ? value : [value];
            for (i = 0; i < value.length; i++) {
                $('.' + name, elem).find('input[type=checkbox][value=' + value[i] + ']').prop('checked', true);
            }
            continue;
        }
        $('[data-name="' + name + '"]', elem).val(value);
    }
};

var updateModels = function (elem, options) {
    var el = $('.model', elem);
    if (!options.make) {
        select(el).selecter({
            callback: function (val) {
                options.model = val;
                search(options);
            }
        });
        return;
    }
    Model.find(options.make, function (err, models) {
        if (err) {
            return;
        }
        var html = '<option value="">Any Model</option>';
        var i;
        var model;
        for (i = 0; i < models.length; i++) {
            model = models[i];
            html += '<option value="' + model.id + '">' + model.title + '</option>';
        }
        select(el).html(html);
        select(el, options.model || '').selecter('destroy').selecter({
            callback: function (val) {
                options.model = val;
                search(options);
            }
        });
    });
};

module.exports = function (sandbox, fn, options) {
    options = options || {};
    var _ = options._ || (options._ = {});
    Make.find(function (err, makes) {
        if (err) {
            return;
        }
        _.makes = makes;
        dust.render('vehicles-search', options, function (err, out) {
            if (err) {
                return;
            }

            var elem = sandbox.append(out);
            update(elem, options);

            select($('.make', elem), options.make).selecter({
                callback: function (val) {
                    options.make = val;
                    options.model = null;
                    updateModels(elem, options);
                    search(options);
                }
            });

            updateModels(elem, options);

            $(elem).on('change', 'input', function () {
                var index;
                var input = $(this);
                var checked = input.is(':checked');
                var name = input.data('name');
                var old = options[name];
                var value = input.val();

                if (checked) {
                    if (!old) {
                        options[name] = value;
                        return search(options);
                    }
                    if (!(old instanceof Array)) {
                        old = [old];
                        options[name] = old;
                    }
                    index = old.indexOf(value);
                    if (index !== -1) {
                        return search(options);
                    }
                    old.push(value);
                    return search(options);
                }
                if (old instanceof Array) {
                    index = old.indexOf(value);
                    if (index === -1) {
                        return search(options);
                    }
                    old.splice(index, 1);
                    return search(options);
                }
                options[name] = null;
                search(options);
            });

            fn(false, function () {
                $('.vehicles-search', sandbox).remove();
            });
        });
    });
};
