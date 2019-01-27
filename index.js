var dust = require('dust')();
var serand = require('serand');
var form = require('form');
var Make = require('vehicle-makes-service');
var Model = require('vehicle-models-service');

dust.loadSource(dust.compile(require('./template'), 'vehicles-search'));

var toQuery = function (options) {
    var name;
    var value;
    var q = '';
    var i;
    options = to(options);
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

var to = function (o) {
    var oo = {};
    Object.keys(o).forEach(function (name) {
        oo[name.replace(/-/g, ':')] = o[name];
    });
    return oo;
};

var from = function (o) {
    var oo = {};
    Object.keys(o).forEach(function (name) {
        oo[name.replace(/:/g, '-')] = o[name];
    });
    return oo;
};

var findQuery = function (vform, done) {
    vform.find(function (err, data) {
        if (err) {
            return done(err);
        }
        vform.validate(data, function (err, errors, data) {
            if (err) {
                return done(err);
            }
            if (errors) {
                return vform.update(errors, data, done);
            }
            done(null, data);
        });
    });
};

var findModels = function (make, done) {
    if (!make) {
        return done(null, []);
    }
    Model.find(make, function (err, models) {
        if (err) {
            return done(err);
        }
        done(null, models);
    });
};

var configs = {
    type: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.type', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    make: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        update: function (context, source, error, value, done) {
            serand.blocks('select', 'update', source, {
                value: value
            }, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.make', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    serand.blocks('select', 'update', $('.model', vform.elem), {
                        value: ''
                    }, function (err) {
                        if (err) {
                            return done(err);
                        }
                        findQuery(vform, function (err, query) {
                            if (err) {
                                return console.error(err);
                            }
                            serand.direct('/vehicles' + toQuery(query));
                        });
                    });
                }
            }, done);
        }
    },
    model: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.model', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    manufacturedAt: {
        find: function (context, source, done) {
            serand.blocks('select', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt', vform.elem);
            serand.blocks('select', 'create', el, {
                value: value ? moment(value).year() : ''
            }, done);
        }
    },
    condition: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.condition', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    transmission: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.transmission', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    fuel: {
        find: function (context, source, done) {
            serand.blocks('radios', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.fuel', vform.elem);
            serand.blocks('radios', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    color: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    mileage: {
        find: function (context, source, done) {
            done(null, $('input', source).val());
        },
        update: function (context, source, error, value, done) {
            $('input', source).val(value);
            done();
        }
    },
    'price-gte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, function (err, value) {
                if (err) {
                    return done(err);
                }
                done(null, parseInt(value, 10) || null)
            });
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.price-gte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    'price-lte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, function (err, value) {
                if (err) {
                    return done(err);
                }
                done(null, parseInt(value, 10) || null)
            });
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.price-lte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    'manufacturedAt-gte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt-gte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    },
    'manufacturedAt-lte': {
        find: function (context, source, done) {
            serand.blocks('text', 'find', source, done);
        },
        render: function (ctx, vform, data, value, done) {
            var el = $('.manufacturedAt-lte', vform.elem);
            serand.blocks('text', 'create', el, {
                value: value,
                change: function () {
                    findQuery(vform, function (err, query) {
                        if (err) {
                            return console.error(err);
                        }
                        serand.direct('/vehicles' + toQuery(query));
                    });
                }
            }, done);
        }
    }
};

module.exports = function (ctx, container, options, done) {
    var sandbox = container.sandbox;
    options = options || {};
    Make.find(function (err, makes) {
        if (err) {
            return done(err);
        }

        var makeData = [{label: 'All Makes', value: ''}];
        makeData = makeData.concat(_.map(makes, function (make) {
            return {
                value: make.id,
                label: make.title
            };
        }));

        var query = _.cloneDeep(options.query) || {};

        findModels(query.make, function (err, models) {
            if (err) {
                return done(err);
            }

            var modelData = [{label: 'All Models', value: ''}];
            modelData = modelData.concat(_.map(models, function (model) {
                return {
                    value: model.id,
                    label: model.title
                };
            }));

            var manufacturedAt = [{label: 'All Years', value: ''}];
            var year = moment().year();
            var start = year - 100;
            while (year > start) {
                manufacturedAt.push({label: year, value: year});
                year--;
            }

            query._ = {};
            query._.makes = makeData;
            query._.models = modelData;
            query._.types = [
                {label: 'All Types', value: ''},
                {label: 'SUV', value: 'suv'},
                {label: 'Car', value: 'car'},
                {label: 'Cab', value: 'cab'},
                {label: 'Bus', value: 'bus'},
                {label: 'Lorry', value: 'lorry'},
                {label: 'Backhoe', value: 'backhoe'},
                {label: 'Motorcycle', value: 'motorcycle'},
                {label: 'Threewheeler', value: 'threewheeler'},
            ];
            query._.manufacturedAt = manufacturedAt;
            query._.conditions = [
                {label: 'Brand New', value: 'brand-new'},
                {label: 'Used', value: 'used'},
                {label: 'Unregistered', value: 'unregistered'}
            ];
            query._.transmissions = [
                {label: 'Automatic', value: 'automatic'},
                {label: 'Manual', value: 'manual'},
                {label: 'Manumatic', value: 'manumatic'}
            ];
            query._.fuels = [
                {label: 'None', value: 'none'},
                {label: 'Petrol', value: 'petrol'},
                {label: 'Diesel', value: 'diesel'},
                {label: 'Hybrid', value: 'hybrid'},
                {label: 'Electric', value: 'electric'}
            ];

            dust.render('vehicles-search', query, function (err, out) {
                if (err) {
                    return done(err);
                }

                var elem = sandbox.append(out);
                var vform = form.create(elem, configs);
                vform.render(ctx, from(query), function (err) {
                    if (err) {
                        return done(err);
                    }
                    done(null, function () {
                        $('.vehicles-search', sandbox).remove();
                    });
                });
            });
        });
    });
};
