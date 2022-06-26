var express = require('express');
var router = express.Router();
var Order = require("../models/order"); // Order 建構式

const crypto = require('crypto');

const pay_env = require('../firebase/functions/pay.env');
const env = {
  ...pay_env(process.env.NODE_ENV, 2)
}

if(process.env.NODE_ENV != "dev"){ //填寫正式環境的env
  env = {
    action: "https://core.newebpay.com/MPG/mpg_gateway"
  };
}

router.post('/', async function(req, res, next) {
  let data = JSON.parse(req.body.data);//產品資料

  var idno = data.idno || "";
  var total = data.total || 0;
  var itemName = data.itemName || "沒有名稱";//目前沒有
  var discount_money = data.discount_money || 0
  var discount = data.discount || ""
  var email = data.people.email || "";
  var Remark = "" //交易備註
  if(discount) Remark = discount + "_" + discount_money;//折扣碼寫入交易備註
 
  //TODO 簡查訂單的正確性 (例如：金額是否有造假)
  // 使用產品id 去資料庫比對該產品的單價，是否和傳過來的一樣
  // 如果有折扣碼、運費、含稅要在檢查一次

  let uid = req.session.uid || ""; //使用 session 找 uid
  let order = new Order();
  await order.add(uid,{
    ...data
  });

  // 4000-2211-1111-1111 信用卡測試卡號
  var aes256 = create_mpg_aes_encrypt({
    MerchantID: env._MerchantID, // 商店代號
    RespondType: "JSON", // 回傳格式
    TimeStamp: Date.now(), // 時間戳記
    Version: 1.6, // 串接程式版本
    MerchantOrderNo: idno, // 商店訂單編號
    LoginType: 0, // 不須登入藍新金流會員
    OrderComment: Remark, // 商店備註
    Amt: Number(total), // 訂單金額
    ItemDesc: itemName, // 產品名稱
    Email: email, // 付款人電子信箱
    ReturnURL: env.web_url + "/returnNeweb?pay=1", // 支付完成返回商店網址(post)
    NotifyURL: env.firebase_functions, // 支付通知網址/每期授權結果通知
    ClientBackURL: env.web_url + "/home?pay=2" // 支付取消返回商店網址
  });
  var parameter = `HashKey=${env._HashKey}&${aes256}&HashIV=${env._HashIV}`;
  var sha = crypto.createHash("sha256")
            .update(parameter)
            .digest("hex") //16進位的編碼
            .toUpperCase(); //轉大寫
  
  var htm = `
    <form id="_form_aiochk" action="${env.action}" method="post">
      <input type="hidden" name="MerchantID" value="${env._MerchantID}" />
      <input type="hidden" name="TradeInfo" value="${aes256}" />
      <input type="hidden" name="TradeSha" value="${sha}" />
      <input type="hidden" name="Version" value="1.6" />
      <input type="hidden" name="TokenTerm" value="${email}" />
      <input type="hidden" name="TokenTermDemand" value="1" />
      <script type="text/javascript">
        document.getElementById("_form_aiochk").submit();
      </script>
    </form>
  `
res.json({
  htm: htm
})
      
      

  res.send('ok');
});

//取得一個訂單編號
router.get('/getOrderId', async (req, res) => {
  var secret = req.query.secret || "default"
  const orderid = require('order-id')(secret);
  let id = orderid.generate();
  
  id = id.replace("-","").replace("-",""); //訂單編號的格式
  res.send(id)
})

function create_mpg_aes_encrypt(TradeInfo) {
  let encrypt = crypto.createCipheriv("aes256", env._HashKey, env._HashIV);//初始化加密
  let enc = encrypt.update(genDataChain(TradeInfo), "utf8", "hex"); //開始加密/輸入/輸出(update)
  enc += encrypt.final("hex"); //停止加密(final)
  return enc;
}


function genDataChain(TradeInfo) {
  //將資料輸出成&的格式
  let results = [];
  for (let kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`);
  }
  return results.join("&");
}

module.exports = router;
