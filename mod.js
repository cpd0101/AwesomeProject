/**
 * @file mod.js
 * @author tanshaohui <tanshaohui@baidu.com>
 * @date 2015-11-28 12:32:49
 * @last-modified-by tanshaohui
 * @last-modified-time 2015-11-28 15:29:08
 */

'use strict';

(function (global) {
    if (typeof global.define === 'undefined') {
        global.define = global.__d;
    }

    global.define.amd = {
        host: 'https://raw.githubusercontent.com',
        jsPath: '/cpd0101/react-native-webroot/master/build'
    };

    var _define = global.define;
    var modules = Object.create(null);

    var define = function (id, factory) {
        _define.call(global, id, factory);
        modules[id] = {
            factory: factory,
            module: {
                exports: {}
            },
            isInitialized: false,
            hasError: false
        };
    };

    for (var key in _define) {
        if (_define.hasOwnProperty(key)) {
            define[key] = _define[key];
        }
    }

    global.define = define;

    global.require.async = function (ids, callback, failureCallback) {
        var mods = [];

        if (typeof ids == 'string') {
            mods = [ids];
        } else {
            mods = ids;
        }

        var count = mods.length;
        for (var i = 0; i < mods.length; i++) {
            loadModule(resolveId(mods[i]), function () {
                if (--count === 0) {
                    var args = [];
                    for (var j = 0; j < mods.length; j++) {
                        args[j] = require(mods[j]);
                        callback && callback.apply(global, args);
                    }
                }
            }, failureCallback);
        }

    };

    var _require = global.require;

    var require = function (id) {
        id = resolveId(id);
        return _require.call(global, id);
    };

    for (var key in _require) {
        if (_require.hasOwnProperty(key)) {
            require[key] = _require[key];
        }
    }

    global.require = require;

    var resolveId = function (id, parentId = '') {
        if (id.match(/^.*\.js$/gi)) {
            id = id.slice(0, id.length - 3);
        }

        var arr = id.split('/');
        var isRelativePath = false;

        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                if (arr[i] === '.') {
                    isRelativePath = true;
                    i++;
                    break;
                } else if (arr[i] === '..') {
                    isRelativePath = true;
                    parentId = getParentId(parentId);
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        if (isRelativePath) {
            arr = arr.slice(i);
            return (parentId ? parentId + '/' : '') + arr.join('/');
        } else {
            return id;
        }
    };

    var getParentId = function (id) {
        if (id.lastIndexOf('/') === -1) {
            if (id) {
                return '';
            } else {
                return getParentId(global.define.amd.jsPath);
            }
        } else {
            return id.slice(0, id.lastIndexOf('/'));
        }
    };

    var loadModule = function (id, callback, failureCallback) {
        var filename = id + '.js';

        var url = global.define.amd.host;

        if (filename.indexOf('/') === 0) {
            url += filename;
        } else {
            url += global.define.amd.jsPath + '/' + filename;
        }

        fetch(url).then(function (res) {
            if (res.ok) {
                res.text().then(function (code) {
                    var reg = /require\([\'\"]([^\(\)]*)[\'\"]\)/g;
                    var matches = reg.exec(code);
                    if (matches === null) {
                        execModule(id, code, callback, failureCallback);
                    } else {
                        var mods = [];
                        mods.push(matches);
                        while (matches = reg.exec(code)) {
                            mods.push(matches);
                        }
                        var count = mods.length;
                        for (var i = 0; i < mods.length; i++) {
                            var tempId = resolveId(mods[i][1], getParentId(id));
                            code = code.replace(mods[i][0], 'require(\'' + tempId + '\')');
                            if (modules[tempId]) {
                                --count === 0 && execModule(id, code, callback, failureCallback);
                            } else {
                                loadModule(tempId, function () {
                                    --count === 0 && execModule(id, code, callback,
                                        failureCallback);
                                }, failureCallback);
                            }
                        }
                    }
                });
            } else {
                failureCallback && failureCallback();
            }
        }, failureCallback);
    };

    var execModule = function (id, code, callback, failureCallback) {
        try {
            (new Function('define(\'' + id + '\', function(global, require, module, exports) {' + code + '});'))();
        } catch (e) {
            if (__DEV__) {
                console.log(e);
            }
            return failureCallback && failureCallback();
        }
        callback && callback();
    };

    define('react-native', function (global, require, module, exports) {
        module.exports = require('react-native');
    });
})(global);
