/*!
 * top - lib/client.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var urllib = require('urllib');
var crypto = require('crypto');
var moment = require('moment');
var Agent = require('agentkeepalive');
var HttpsAgent = Agent.HttpsAgent;

exports.Client = Client;

/**
 * API Client.
 * 
 * @param {Object} options, must set `appkey` and `appsecret`.
 * @constructor
 */
function Client(options) {
  if (!(this instanceof Client)) {
    return new Client(options);
  }
  options = options || {};
  if (!options.appkey || !options.appsecret) {
    throw new Error('appkey or appsecret need!');
  }
  this.REST_URL = options.REST_URL || 'http://gw.api.taobao.com/router/rest';
  this.appkey = options.appkey;
  this.appsecret = options.appsecret;
  this.isHttps = this.REST_URL.indexOf('https://') === 0;
  if (this.isHttps) {
    this.agent = new HttpsAgent();
  } else {
    this.agent = new Agent();
  }
  this.agent.maxSockets = 100;
}

/**
 * Get taobao user by nick.
 * 
 * @see http://api.taobao.com/apidoc/api.htm?path=cid:1-apiId:1
 * @param {Object} params, `nick` or `session` must set one.
 *  - {String} fields, (required)fields of user, e.g.: 'user_id,nick,seller_credit'.
 *  - {String} nick, (optional)user nick name.
 *  - {String} session, (optional)session id.
 * @param {Function(err, user)} callback
 * @public
 */
Client.prototype.taobao_user_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.session) {
    keys.push('nick');
  }
  checkRequired(params, keys);
  this.invoke('taobao.user.get', params, ['user_get_response', 'user'], null, 'GET', callback);
};

/**
 * Get taobao current buyer.
 * 
 * @see http://api.taobao.com/apidoc/api.htm?path=cid:1-apiId:21348
 * @param {Object} params, `nick` or `session` must set one.
 *  - {String} fields, (required)fields of user, e.g.: 'nick,sex'.
 *  - {String} access_token, (optional) oauth token, access_token or session must set one.
 *  - {String} session, (optional)session id.
 * @param {Function(err, user)} callback
 * @public
 */
Client.prototype.taobao_user_buyer_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.access_token) {
    keys.push('session');
  }
  checkRequired(params, keys);
  this.invoke('taobao.user.buyer.get', params,
    ['user_buyer_get_response', 'user'], null, 'GET', callback);
};

/**
 * Get taobao users by nick list.
 * 
 * @param  {Object} params
 *  - {String} fields, (required)fields of user. 
 *  - {String} nicks, (required)user nick name list, separate by (,), e.g.: mk2,aerdeng
 * @param  {Function(err, users)} callback
 * @public
 */
Client.prototype.taobao_users_get = function (params, callback) {
  checkRequired(params, [ 'fields', 'nicks' ]);
  this.invoke('taobao.users.get', params,
    ['users_get_response', 'users', 'user'], [], 'GET', callback);
};

/**
 * Get taobao current seller.
 * 
 * @see http://api.taobao.com/apidoc/api.htm?path=cid:1-apiId:21349
 * @param {Object} params, `nick` or `session` must set one.
 *  - {String} fields, (required)fields of user, e.g.: 'nick,sex'.
 *  - {String} access_token, (optional) oauth token, access_token or session must set one.
 *  - {String} session, (optional)session id.
 * @param {Function(err, user)} callback
 * @public
 */
Client.prototype.taobao_user_seller_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.access_token) {
    keys.push('session');
  }
  checkRequired(params, keys);
  this.invoke('taobao.user.seller.get', params,
    ['user_seller_get_response', 'user'], null, 'GET', callback);
};

/**
 * tmall.selected.items.search 天猫类目精选商品库
 * 
 * @see http://api.taobao.com/apidoc/api.htm?path=cid:10240-apiId:11116
 * @param {Object} params
 *  - {Number|String} cid
 * @param {Function(err, items)} callback
 *  - {Array} items [{
 *    cid: 1101,
 *    num_iid: 13088700250,
 *    shop_id: 59227746,
 *    item_score: "67.33659988217163"
 *  }, ...]
 * @public
 */
Client.prototype.tmall_selected_items_search = function (params, callback) {
  checkRequired(params, ['cid']);
  this.invoke('tmall.selected.items.search', params,
    ['tmall_selected_items_search_response', 'item_list', 'selected_item'], [],
    'GET', callback);
};

Client.prototype.taobao_item_get = function (params, callback) {
  checkRequired(params, ['num_iid', 'fields']);
  this.invoke('taobao.item.get', params,
    ['item_get_response', 'item'], {}, 'GET', callback);
};

/**
 * Get taobao shop by nick.
 *
 * @see http://api.taobao.com/apidoc/api.htm?spm=0.0.0.34.b8913b&path=cid:9-apiId:68
 * @param  {Object} params
 *  - {String} fields, (required)fields of user.
 *  - {String} nick, (optional)user nick name.
 *  - {String} session, (optional)session id.
 * @param  {Function(err, user)} callback
 * @public
 */
Client.prototype.taobao_shop_get = function (params, callback) {
  checkRequired(params, ['nick', 'fields']);
  this.invoke('taobao.shop.get', params,
    ['shop_get_response', 'shop'], null, 'GET', callback);
};

/**
 * Invoke an api by method name.
 * 
 * @param {String} method, method name
 * @param {Object} params
 * @param {Array} reponseNames, e.g. ['tmall_selected_items_search_response', 'tem_list', 'selected_item']
 * @param {Object} defaultResponse
 * @param {String} type
 * @param {Function(err, response)} callback
 */
Client.prototype.invoke = function (method, params, reponseNames, defaultResponse, type, callback) {
  params.method = method;
  this.request(params, type, function (err, result) {
    if (err) {
      return callback(err);
    }
    var response = result;
    if (reponseNames && reponseNames.length > 0) {
      for (var i = 0; i < reponseNames.length; i++) {
        var name = reponseNames[i];
        response = response[name];
        if (response === undefined) {
          break;
        }
      }
    }
    if (response === undefined) {
      response = defaultResponse;
    }
    callback(null, response);
  });
};

/**
 * Request API.
 * 
 * @param {Object} params
 * @param {String} [type='GET']
 * @param {Function(err, result)} callback
 * @public
 */
Client.prototype.request = function (params, type, callback) {
  checkRequired(params, 'method');
  if (typeof type === 'function') {
    callback = type;
    type = null;
  }
  var args = {
    timestamp: this.timestamp(),
    format: 'json',
    app_key: this.appkey,
    v: '2.0',
    sign_method: 'md5'
  };
  for (var k in params) {
    args[k] = params[k];
  }
  args.sign = this.sign(args);
  type = type || 'GET';
  urllib.request(this.REST_URL, {type: type, data: args, agent: this.agent},
  function (err, buffer) {
    var data;
    if (buffer) {
      try {
        data = JSON.parse(buffer);
      } catch (e) {
        err = e;
        e.data = buffer.toString();
        data = null;
      }
    }
    if (data && data.error_response && !data.error_response.sub_msg) {
      // sub_msg error, let caller handle it.
      // request() only handle root error, like code 40, 41 error.
      var msg = data.error_response.msg;
      err = new Error(data.error_response.code + ': ' + msg);
      err.code = data.error_response.code;
      err.data = buffer.toString();
      data = null;
    }
    callback(err, data);
  }, this);
};

/**
 * Get now timestamp with 'yyyy-MM-dd HH:mm:ss' format.
 * @return {String}
 */
Client.prototype.timestamp = function () {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * Sign API request.
 * see http://open.taobao.com/doc/detail.htm?id=111#s6
 * 
 * @param  {Object} params
 * @return {String} sign string
 */
Client.prototype.sign = function (params) {
  var sorted = Object.keys(params).sort();
  var basestring = this.appsecret;
  // (md5(secretkey1value1key2value2...secret))
  for (var i = 0, l = sorted.length; i < l; i++) {
    var k = sorted[i];
    basestring += k + params[k];
  }
  basestring += this.appsecret;
  return md5(basestring);
};

function checkRequired(params, keys) {
  if (!Array.isArray(keys)) {
    keys = [keys];
  }
  for (var i = 0, l = keys.length; i < l; i++) {
    var k = keys[i];
    if (params[k] === undefined) {
      throw new Error('`' + k + '` required');
    }
  }
}

/**
 * MD5 hex upper case string.
 * 
 * @param  {String|Buffer} s
 * @return {String}
 */
function md5(s) {
  var hash = crypto.createHash('md5');
  hash.update(Buffer.isBuffer(s) ? s : new Buffer(s));
  return hash.digest('hex').toUpperCase();
}