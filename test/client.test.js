/*!
 * top - test/client.test.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var top = require('../');
var should = require('should');

var REST_URL = 'http://gw.api.tbsandbox.com/router/rest';

describe('client.test.js', function () {
  var client = top.createClient({
    appkey: '1021178166',
    appsecret: 'sandboxbc0042b2231100842349ad492',
    REST_URL: REST_URL
  });

  describe('new Client()', function () {
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

    it('should throw error when method miss', function () {
      (function () {
        client.request({});
      }).should.throw('`method` required');
    });

    it('should return error when method wrong', function (done) {
      client.request({ method: 'not_exists' }, function (err, data) {
        should.exist(err);
        err.message.should.equal('22: Invalid method');
        err.code.should.equal(22);
        err.data.should.equal('{"error_response":{"code":22,"msg":"Invalid method"}}');
        done();
      });
    });
  });

  describe('taobao_user_get()', function () {
    it('should return user', function (done) {
      client.taobao_user_get({ fields: 'seller_credit,nick', nick: 'sandbox_c_1' }, 
      function (err, user) {
        should.not.exist(err);
        user.should.have.keys(['seller_credit', 'nick']);
        user.nick.should.equal('sandbox_c_1');
        done();
      });
    });

    it('should return null when nick not exists', function (done) {
      client.taobao_user_get({ fields: 'user_id,nick', nick: 'alipublic01notexists' }, 
      function (err, user) {
        should.not.exist(err);
        should.not.exist(user);
        done();
      });
    });

    it('should throw error when nick miss', function () {
      (function () {
        client.taobao_user_get({ fields: 'user_id,nick' }, function (err, user) {});
      }).should.throw('`nick` required');
    });

  });

  describe('taobao_users_get()', function () {
    it('should return users list', function (done) {
      client.taobao_users_get({ fields: 'seller_credit,nick', nicks: 'sandbox_c_2,sandbox_c_1' },
      function (err, users) {
        should.not.exist(err);
        users.should.length(2);
        for (var i = users.length; i--; ) {
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
        for (var i = users.length; i--; ) {
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
        for (var i = users.length; i--; ) {
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
      (function () {
        client.taobao_users_get({ fields: 'user_id,nick' }, function (err, user) {});
      }).should.throw('`nicks` required');
    });
  });

  describe('tmall_selected_items_search()', function () {
    // api permission required
    xit('should return items', function (done) {
      client.tmall_selected_items_search({cid: 50016349}, function (err, items) {
        should.not.exist(err);
        client.taobao_item_get({num_iid:items[0].num_iid, fields:'item_img.url,title,price'}, 
        function (err, item){
          done();
        });
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
  });

});