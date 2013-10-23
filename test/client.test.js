/*!
 * top - test/client.test.js
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var should = require('should');
var mm = require('mm');
var urllib = require('urllib');
var fs = require('fs');
var path = require('path');
var top = require('../');

var REST_URL = 'http://gw.api.tbsandbox.com/router/rest';

describe('client.test.js', function () {
  var client = top.createClient({
    appkey: '1021178166',
    appsecret: 'sandboxbc0042b2231100842349ad492',
    REST_URL: REST_URL
  });

  afterEach(mm.restore);

  describe('new Client()', function () {
    it('should return Client', function () {
      var client = new top.Client({appkey: 'key', appsecret: 'secret'});
      client.should.be.instanceof(top.Client);
      var clientWithoutNew = top.Client({appkey: 'key', appsecret: 'secret'});
      clientWithoutNew.should.be.instanceof(top.Client);
    });

    it('should throw error when miss appkey or appsecret', function () {
      (function () {
        top.createClient();
      }).should.throw('appkey or appsecret need!');
      (function () {
        top.createClient({ appkey: 'test' });
      }).should.throw('appkey or appsecret need!');
      (function () {
        top.createClient({ appsecret: 'test' });
      }).should.throw('appkey or appsecret need!');
    });
  });

  describe('sign() http://open.taobao.com/doc/detail.htm?id=111#s6', function () {
    it('should equal 990FD28323F67A1EEC29336EDF373C0E', function () {
      var c = top.createClient({
        appkey: 'test',
        appsecret: 'test'
      });
      var params = {
        method: 'taobao.user.get',
        timestamp: '2011-07-01 13: 52:03',
        format: 'xml',
        app_key: 'test',
        v: '2.0',
        fields: 'nick,location.state,location.city',
        nick: '商家测试帐号17',
        sign_method: 'md5',
      };
      c.sign(params).should.equal('990FD28323F67A1EEC29336EDF373C0E');
    });
  });

  describe('timestamp()', function () {
    it('should return yyyy-MM-dd HH:mm:ss format', function () {
      var s = client.timestamp();
      s.should.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('request()', function () {
    it('should request success', function (done) {
      client.request({
        method: 'taobao.user.get',
        fields: 'nick,seller_credit',
        nick: 'sandbox_c_1'
      }, function (err, result) {
        should.not.exist(err);
        var user = result.user_get_response.user;
        user.should.have.keys(['nick', 'seller_credit']);
        user.nick.should.equal('sandbox_c_1');
        done();
      });
    });

    it('should throw error when method miss', function (done) {
      client.request({}, function (err) {
        should.exist(err);
        err.message.should.equal('`method` required');
        done();
      });
    });

    it('should return error when method wrong', function (done) {
      client.request({ method: 'not_exists' }, function (err, data) {
        should.exist(err);
        err.message.should.equal('Invalid method, code 22');
        err.code.should.equal(22);
        err.data.should.equal('{"error_response":{"code":22,"msg":"Invalid method"}}');
        done();
      });
    });
  });

  describe('_wrapJSON()', function () {
    it('should convert long id number to string', function () {
      var s = fs.readFileSync(path.join(__dirname, 'fixtures', 'tmc_messages_consume_response.json')).toString();
      s = client._wrapJSON(s);
      var o = JSON.parse(s);
      // console.log('%s, %j', s, o.tmc_messages_consume_response.messages)
      o.tmc_messages_consume_response.messages.tmc_message[0].id.should.equal('7104300007405429232');
    });
  });

  describe('invoke()', function () {
    var _request = urllib.request;
    afterEach(function () {
      urllib.request = _request;
    });

    it('should mock urllib.request() error', function (done) {
      urllib.request = function (url, options, callback) {
        process.nextTick(function () {
          callback(new Error('mock error'));
        });
      };
      client.invoke('taobao.shop.get', {nick: 'abc', fields: '123'}, [], null, 'GET',
      function (err, item) {
        should.exist(err);
        should.not.exist(item);
        err.should.have.property('message', 'mock error');
        done();
      });
    });

    it('should mock urllib.request() json parse error', function (done) {
      urllib.request = function (url, options, callback) {
        process.nextTick(function () {
          callback(null, '{');
        });
      };
      client.invoke('taobao.shop.get', {nick: 'abc', fields: '123'}, [], null, 'GET',
      function (err, item) {
        should.exist(err);
        should.not.exist(item);
        err.should.have.property('message', 'Unexpected end of input');
        err.should.have.property('name', 'SyntaxError');
        done();
      });
    });
  });

  describe('taobao_user_buyer_get()', function () {
    var _request = urllib.request;
    afterEach(function () {
      urllib.request = _request;
    });
    it('should return buyer', function (done) {
      urllib.request = function (url, options, callback) {
        process.nextTick(function () {
          callback(null, JSON.stringify(require('./fixtures/user_buyer_get_response.json')));
        });
      };
      client.taobao_user_buyer_get({
        session: 'mock',
        fields: 'nick,sex,buyer_credit,avatar,has_shop,vip_info', 
        nick: 'sandbox_c_1'
      }, function (err, user) {
        should.not.exist(err);
        user.should.have.keys('nick,sex,buyer_credit,avatar,has_shop,vip_info'.split(','));
        user.nick.should.equal('sandbox_c_1');
        done();
      });
    });

    it('should return null when session wrong', function (done) {
      client.taobao_user_buyer_get({session: 'mock', fields: 'sex,nick', nick: 'alipublic01notexists'}, 
      function (err, user) {
        should.exist(err);
        err.name.should.equal('TOPClientError');
        err.message.should.equal('Invalid session, code 27; sessionkey-not-generated-by-server: RealSession don&apos;t create by top ! appKey is : 1021178166');
        err.code.should.equal(27);
        err.sub_code.should.equal('sessionkey-not-generated-by-server');
        should.not.exist(user);
        done();
      });
    });

    it('should throw error when nick miss', function (done) {
      client.taobao_user_buyer_get({fields: 'sex,nick'}, function (err, user) {
        should.exist(err);
        err.message.should.equal('`session` required');
        done();
      });
    });
  });

  describe('taobao_user_seller_get()', function () {
    var _request = urllib.request;
    afterEach(function () {
      urllib.request = _request;
    });
    it('should return seller', function (done) {
      var fields = 'user_id,nick,sex,seller_credit,type,has_more_pic,item_img_num,item_img_size,prop_img_num,prop_img_size,auto_repost,promoted_type,status,alipay_bind,consumer_protection,avatar,liangpin,sign_food_seller_promise,has_shop,is_lightning_consignment,has_sub_stock,is_golden_seller,vip_info,magazine_subscribe,vertical_market,online_gaming';
      urllib.request = function (url, options, callback) {
        process.nextTick(function () {
          var user = require('./fixtures/user_seller_get_response.json');
          var keys = fields.split(',');
          var seller = {user_seller_get_response: {user: {}}};
          for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            seller.user_seller_get_response.user[k] = user.user_seller_get_response.user[k];
          }
          callback(null, JSON.stringify(seller));
        });
      };
      client.taobao_user_seller_get({
        session: 'mock',
        fields: fields, 
        nick: 'hz0799'
      }, function (err, user) {
        should.not.exist(err);
        user.should.have.keys(fields.split(','));
        user.nick.should.equal('hz0799');
        done();
      });
    });

    it('should return err when session wrong', function (done) {
      client.taobao_user_seller_get({session: 'mock', fields: 'sex,nick', nick: 'alipublic01notexists'}, 
      function (err, user) {
        should.exist(err);
        err.name.should.equal('TOPClientError');
        err.message.should.equal('Invalid session, code 27; sessionkey-not-generated-by-server: RealSession don&apos;t create by top ! appKey is : 1021178166');
        should.not.exist(user);
        done();
      });
    });

    it('should throw error when nick miss', function (done) {
      client.taobao_user_seller_get({fields: 'sex,nick'}, function (err, user) {
        should.exist(err);
        err.message.should.equal('`session` required');
        done();
      });
    });
  });

  describe('taobao_user_get()', function () {
    it('should return user', function (done) {
      client.taobao_user_get({fields: 'seller_credit,nick', nick: 'sandbox_c_1'}, 
      function (err, user) {
        should.not.exist(err);
        user.should.have.keys(['seller_credit', 'nick']);
        user.nick.should.equal('sandbox_c_1');
        done();
      });
    });

    it('should return null when nick not exists', function (done) {
      client.taobao_user_get({fields: 'user_id,nick', nick: 'alipublic01notexists'}, 
      function (err, user) {
        should.not.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should throw error when nick miss', function (done) {
      client.taobao_user_get({fields: 'user_id,nick'}, function (err, user) {
        should.exist(err);
        err.message.should.equal('`nick` required');
        done();
      });
    });
  });

  describe('taobao_users_get()', function () {
    it('should return users list', function (done) {
      client.taobao_users_get({ fields: 'seller_credit,nick', nicks: 'sandbox_c_2,sandbox_c_1' },
      function (err, users) {
        should.not.exist(err);
        users.should.length(2);
        for (var i = users.length; i--;) {
          var user = users[i];
          user.should.have.keys(['seller_credit', 'nick']);
          user.nick.should.equal(i === 0 ? 'sandbox_c_2' : 'sandbox_c_1');
        }
        done();
      });
    });

    it('should return 4 length list when nicks are all same', function (done) {
      client.taobao_users_get({ 
        fields: 'nick', 
        nicks: 'sandbox_c_1,sandbox_c_2,sandbox_c_3,sandbox_c_4'
      }, function (err, users) {
        should.not.exist(err);
        users.should.length(4);
        for (var i = users.length; i--;) {
          var user = users[i];
          user.should.have.keys(['nick']);
          user.nick.should.match(/sandbox_c_\d/);
        }
        done();
      });
    });

    it('should return 1 length list when one nick not exists', function (done) {
      client.taobao_users_get({fields: 'nick', nicks: 'sandbox_c_3,苏千notexists'},
      function (err, users) {
        should.not.exist(err);
        users.should.length(1);
        for (var i = users.length; i--;) {
          var user = users[i];
          user.should.have.keys(['nick']);
          user.nick.should.equal('sandbox_c_3');
        }
        done();
      });
    });

    it('should return [] no nick exists', function (done) {
      client.taobao_users_get({ fields: 'user_id,nick', nicks: '苏千苏千notexists2,苏千notexists' }, 
      function (err, users) {
        should.not.exist(err);
        users.should.length(0);
        done();
      });
    });

    it('should throw error when nicks miss', function () {
      client.taobao_users_get({ fields: 'user_id,nick' }, function (err, user) {
        should.exist(err);
        err.message.should.be.equal('`nicks` required');
      });
    });
  });

  describe('tmall_selected_items_search()', function () {
    var mockData = JSON.stringify({
      "tmall_selected_items_search_response": {
        "item_list": {
          "selected_item": [{
            "cid": 1101,
            "num_iid": 13088700250,
            "shop_id": 59227746,
            "item_score": "67.33659988217163"
          }]
        }
      }
    });
    var _request = urllib.request;
    after(function () {
      urllib.request = _request;
    });
    // api permission required
    it('should return items', function (done) {
      urllib.request = function (url, options, callback) {
        process.nextTick(function () {
          callback(null, mockData);
        });
      };
      client.tmall_selected_items_search({cid: 50016349}, function (err, items) {
        should.not.exist(err);
        should.exist(items);
        items.should.be.an.instanceof(Array).with.length(1);
        items[0].should.have.keys('cid', 'num_iid', 'shop_id', 'item_score');
        client.taobao_item_get({
          num_iid: items[0].num_iid,
          fields: 'item_img.url,title,price'
        }, done);
      });
    });

    it('should return parameter missing error', function (done) {
      client.tmall_selected_items_search({}, function (err, items) {
        should.exist(err);
        err.name.should.equal('ParameterMissingError');
        err.message.should.equal('`cid` required');
        done();
      });
    });
  });

  describe('taobao_jindoucloud_message_send()', function () {
    var mockData = JSON.stringify({
      "jindoucloud_message_send_response": {
        "send_results": {
          "send_result": [{
            "nick": "nick",
            "err_msg": "nick is null",
            "err_code": "isv.invalid-parameter",
            "is_success": "false"
          }]
        }
      }
    });

    before(function () {
      mm.data(urllib, 'request', mockData);
    });

    after(function () {
      mm.restore();
    });

    // api permission required
    it('should return items', function (done) {
      var params = {
        messages: [{
          "nick": "nick",
          "title": "title",
          "view_data": ["a", "b"],
          "biz_data": {"k1": "v1", "k2": "v2"},
          "biz_id": 0,
          "send_no": 0,
          "msg_category": "item",
          "msg_type": "ItemCreate"
        }]
      };
      client.taobao_jindoucloud_message_send(params, function (err, items) {
        should.not.exist(err);
        should.exist(items);
        items.should.be.an.instanceof(Array).with.length(1);
        items[0].should.have.keys('nick', 'err_msg', 'err_code', 'is_success');
        done();
      });
    });

    it('should return parameter missing error', function (done) {
      var params = {};
      client.taobao_jindoucloud_message_send(params, function (err, items) {
        should.exist(err);
        err.name.should.equal('ParameterMissingError');
        err.message.should.equal('`messages` required');
        done();
      });
    });
  });

  describe('taobao_shop_get()', function () {
    it('should return shop info', function (done) {
      client.taobao_shop_get({nick: 'sandbox_c_1', fields: 'sid,cid,title,nick,desc,bulletin,pic_path,created,modified'},
      function (err, item) {
        should.not.exist(err);
        item.should.have.keys('sid,cid,title,nick,desc,bulletin,pic_path,created,modified'.split(','));
        done();
      });
    });

    it('should return null when user no shop', function (done) {
      client.taobao_shop_get({nick: 'sandbox_c_1_notexists', fields: 'sid,cid,title,nick,desc,bulletin,pic_path,created,modified'},
      function (err, item) {
        should.not.exist(err);
        should.not.exist(item);
        done();
      });
    });

    it('should return parameter missing error', function (done) {
      client.taobao_shop_get({}, function (err, items) {
        should.exist(err);
        err.name.should.equal('ParameterMissingError');
        err.message.should.equal('`nick` required');
        done();
      });
    });

    it('should return mock error', function (done) {
      var errRes = {
        error_response: {
          code: 11,
          msg: 'Insufficient isv permissions',
          sub_code: 'isv.permission-ip-whitelist-limit',
          sub_msg: 'The appkey 4272 is only allowed to call from 10.232.*.*,10.13.*.*,10.62.*.*,10.20.*.*,10.235.*.*,110.75.*.*,10.32.*.*,10.14.*.*,10.12.*.*,10.250.*.*,10.253.*.*,10.17.*.*,10.9.*.*,10.7.*.*,10.33.*.*,10.5.*.*,10.1.*.*,127.0.*.*,10.209.*.*,10.208.*.*,10.249.*.*,10.8.*.*, but your ip is 10.68.179.114'
        }
      };
      mm.http.request(/\//, JSON.stringify(errRes));
      client.taobao_shop_get({nick: 'sandbox_c_1', fields: 'sid,cid,title,nick,desc,bulletin,pic_path,created,modified'},
      function (err, item) {
        should.exist(err);
        err.name.should.equal('TOPClientError');
        err.message.should.include('Insufficient isv permissions, code 11; isv.permission-ip-whitelist-limit: ');
        err.code.should.equal(11);
        err.sub_code.should.equal('isv.permission-ip-whitelist-limit');
        should.not.exists(item);
        done();
      });
    });
  });
});
