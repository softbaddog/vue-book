var express = require('express');
var router = express.Router();

var Goods = require('../models/goods');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/dumall', {
  useMongoClient: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("MongoDB connected success.")
});

// 查询商品数据
router.get('/', (req, res, next) => {
  let page = parseInt(req.query.page);
  let pageSize = parseInt(req.query.pageSize);
  let priceLevel = req.query.priceLevel || 'all';
  let sort = parseInt(req.query.sort) || 1;
  let skip = (page - 1) * pageSize;
  let priceGt = 0,
    priceLte = 0;
  let params = {};
  if (priceLevel != 'all') {
    switch (priceLevel) {
      case '0':
        priceGt = 0;
        priceLte = 100;
        break;
      case '1':
        priceGt = 100;
        priceLte = 500;
        break;
      case '2':
        priceGt = 500;
        priceLte = 1000;
        break;
      case '3':
        priceGt = 1000;
        priceLte = 5000;
        break;
    }
    params = {
      salePrice: {
        $gt: priceGt,
        $lte: priceLte
      }
    };
  }
  let query = Goods.find(params).skip(skip).limit(pageSize);
  query.sort({
    'salePrice': sort
  });
  // query.exec((err, docs) => {
  let promise = query.exec();
  promise.addBack((err, docs) => {
    if (err) {
      res.json({
        status: '1',
        msg: err.mssage
      });
    } else {
      res.json({
        status: '0',
        msg: '',
        result: {
          count: docs.length,
          list: docs
        }
      })
    }
  })
});

// 加入购物车
router.post('/addCart', (req, res, next) => {
  var userId = '100000077',
    productId = req.body.productId;
  var User = require('../models/user');

  User.findOne({
    userId: userId
  }, (err, userDoc) => {
    if (err) {
      res.json({
        status: "1",
        msg: err.message
      })
    } else {
      if (userDoc) {
        let goodsItem = '';
        userDoc.cartList.forEach((item) => {
          if (item.productId == productId) {
            goodsItem = item;
            item.productNum++;
            item.checked = 1;
          }
        });
        if (goodsItem) {
          userDoc.save((err2, doc2) => {
            if (err) {
              res.json({
                status: '1',
                msg: err.message
              })
            } else {
              res.json({
                status: '0',
                msg: '',
                result: 'ok'
              })
            }
          })
        } else {
          Goods.findOne({
            productId: productId
          }, (err, doc) => {
            if (err) {
              res.json({
                status: '1',
                msg: err.message
              })
            } else {
              if (doc) {
                doc.productNum = 1;
                doc.checked = 1;
                userDoc.cartList.push(doc);
                userDoc.save(function (err2, doc2) {
                  if (err) {
                    res.json({
                      status: '1',
                      msg: err.message
                    })
                  } else {
                    res.json({
                      status: '0',
                      msg: '',
                      result: 'ok'
                    })
                  }
                })
              }
            }
          })
        }
      }
    }
  })

});

module.exports = router;
