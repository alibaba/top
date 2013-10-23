var util = require('./util');

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
exports.taobao_user_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.session) {
    keys.push('nick');
  }
  var err = util.checkRequired(params, keys);
  if (err) {
    return callback(err);
  }
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
exports.taobao_user_buyer_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.access_token) {
    keys.push('session');
  }
  var err = util.checkRequired(params, keys);
  if (err) {
    return callback(err);
  }
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
exports.taobao_users_get = function (params, callback) {
  var err = util.checkRequired(params, [ 'fields', 'nicks' ]);
  if (err) {
    return callback(err);
  }
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
exports.taobao_user_seller_get = function (params, callback) {
  var keys = ['fields'];
  if (!params.access_token) {
    keys.push('session');
  }
  var err = util.checkRequired(params, keys);
  if (err) {
    return callback(err);
  }
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
exports.tmall_selected_items_search = function (params, callback) {
  var err = util.checkRequired(params, ['cid']);
  if (err) {
    return callback(err);
  }
  this.invoke('tmall.selected.items.search', params,
    ['tmall_selected_items_search_response', 'item_list', 'selected_item'], [],
    'GET', callback);
};

exports.taobao_item_get = function (params, callback) {
  var err = util.checkRequired(params, ['num_iid', 'fields']);
  if (err) {
    return callback(err);
  }
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
exports.taobao_shop_get = function (params, callback) {
  var err = util.checkRequired(params, ['nick', 'fields']);
  if (err) {
    return callback(err);
  }
  this.invoke('taobao.shop.get', params,
    ['shop_get_response', 'shop'], null, 'GET', callback);
};

/**
 * Send qianniu message.
 *
 * @see http://api.taobao.com/apidoc/api.htm?path=cid:20378-apiId:22542
 * @param {Object} params
 *  - {Array} messages, (required)Message list.
 * @param  {Function(err, result)} callback
 * @public
 */
exports.taobao_jindoucloud_message_send = function (params, callback) {
  var err = util.checkRequired(params, ['messages']);
  if (err) {
    return callback(err);
  }
  this.invoke('taobao.jindoucloud.message.send', params,
    ['jindoucloud_message_send_response', 'send_results', 'send_result'], null, 'GET', callback);
};
