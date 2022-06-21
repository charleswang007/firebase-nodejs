const functions = require("firebase-functions");
const admin = require('firebase-admin');
const crypto = require('crypto');
const pay_env = require('./pay-env');
admin.initializeApp();
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest(async (req, res) => {
  let data = await db.collection("PRODUCT").doc("3CeuByGGxqvycrE5hjgF").get();
  console.log(data.data(), "data.data()");
  //functions.logger.info("Hello logs!", {structuredData: true});
  res.send("Hello from Firebase!");
});

exports.payReturnSuccessNeweb = functions.https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("prod", 2)
  }
  payReturnSuccess(req, res, env);
  return payReturnSuccess(req, res, env);
});

exports.payReturnSuccessNewebDev = functions.https.onRequest(async (req, res) => {
  const env = {
    ...pay_env("dev", 2)
  }
  return payReturnSuccess(req, res, env);
});

function payReturnSuccess(req,res,env){
  const data = JSON.parse(create_mpg_aes_decrypt(req.body.TradeInfo,env._HashKey,env._HashIV));
  var MerchantOrderNo = data["Result"]["MerchantOrderNo"];
  var PayTime = data["Result"]["PayTime"] || "";
  var PaymentType = data["Result"]["PaymentType"] || "";
  var TradeNo = data["Result"]["TradeNo"] || "";
  if (req.body.Status === 'SUCCESS') {
    //寫回訂單資料或開通產品
    return res.send("OK");
  }
  return res.send("error")
}

function create_mpg_aes_decrypt(TradeInfo,_hashKey, _hashIV) {
  let decrypt = crypto.createDecipheriv("aes256", _hashKey, _hashIV);
  decrypt.setAutoPadding(false); //取消自動填充加密資訊
  let text = decrypt.update(TradeInfo, "hex", "utf8");
  let plainText = text + decrypt.final("utf8");
  let result = plainText.replace(/[\x00-\x20]+/g, "");//把會判斷錯誤的空字符，濾掉
  return result;
}
