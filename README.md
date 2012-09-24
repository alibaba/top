# top

[![Build Status](https://secure.travis-ci.org/fengmk2/top.png)](http://travis-ci.org/fengmk2/top)

[Taobao Open API](http://open.taobao.com/) Client.

## Install

```bash
$ npm install top
```

## Usage

```js
var top = require('top');
var client = top.createClient({
  appkey: 'your key',
  appsecret: 'your secret'
});
// invoke 'taobao.user.get': http://api.taobao.com/apidoc/api.htm?path=cid:1-apiId:1
client.taobao_user_get({nick: 'qleelulu', fields: 'user_id,nick,seller_credit'}, function (err, user) {
  console.log(user);
});
```

## APIs

You can find all the [Taobao open APIs](http://open.taobao.com/doc/api_list.htm?id=102).

* User
 * taobao.user.buyer.get 查询买家信息API
 * taobao.user.get 获取单个用户信息
 * taobao.user.seller.get 查询卖家用户信息
 * taobao.users.get 获取多个用户信息
* Category (Working)
 * taobao.itemcats.authorize.get 查询商家被授权品牌列表和类目列表
 * taobao.itemcats.get 获取后台供卖家发布商品的标准商品类目
 * taobao.itemcats.increment.get 增量获取后台类目数据
 * taobao.itemprops.get 获取标准商品类目属性
 * taobao.itempropvalues.get 获取标准类目属性值
 * taobao.topats.itemcats.get 全量获取后台类目数据

## Running Tests

To run the test suite first invoke the following command within the repo, installing the development dependencies:

```bash
$ npm install
```

then run the tests:

```bash
$ make test
```

jscoverage: [**98%**](http://fengmk2.github.com/coverage/top.html)

## License 

(The MIT License)

Copyright (c) 2011-2012 fengmk2 &lt;fengmk2@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
