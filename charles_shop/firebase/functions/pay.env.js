const env = function(NODE_ENV, source){
    let env = {  //環境變數 (dev)
        source: source, //綠界1 藍新2
        web_url: "http://localhost:6886",//目前網址
        firebase_functions: "https://asia-east1-charles007-shop.cloudfunctions.net/payReturnSuccessNeweb",//付款回傳程式網址(使用 firebase functions)
        _MerchantID : "MS1612463889",//藍新
        _HashKey : "3MlXTh0EAYNy2ow1tfRkffAi1MUXzNqR",//藍新
        _HashIV : "P2DPWF0I3TBKdd4C",//藍新
        action: "https://ccore.newebpay.com/MPG/mpg_gateway",//藍新串接網址
        MerchantID : "",//綠界
        HashKey : "",//綠界
        HashIV : "",//綠界
        OperationMode : "Test",//綠界
        adminlogin : "test7489", //firebase管理者識別用(類似密碼，無外流)
        adminEmail : "test@gmail.com",//最高管理者的 email
        firebase_api_key : "AIzaSyCqCrz7lO1HMwVSDNLwgDNBK17gDU9y9t0"
    }
    if(NODE_ENV == "prod"){ //填寫正式環境的env
        env = require('./env')(source);
      }

	return env
}
module.exports = env