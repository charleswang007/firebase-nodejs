const env = function(NODE_ENV, source){
    let env = {  //環境變數 (dev)
        source: source, //綠界1 藍新2
        web_url: "http://localhost:6886",//目前網址
        firebase_functions: "https://asia-east1-專案名稱.cloudfunctions.net/payReturnSuccessNeweb",//付款回傳程式網址(使用 firebase functions)
        _MerchantID : "MS1612463889",//藍新
        _HashKey : "3MlXTh0EAYNy2ow1tfRkffAi1MUXzNqR",//藍新
        _HashIV : "P2DPWF0I3TBKdd4C",//藍新
        action: "https://ccore.newebpay.com/MPG/mpg_gateway",//藍新串接網址
        MerchantID : "",//綠界
        HashKey : "",//綠界
        HashIV : "",//綠界
        OperationMode : "Test",//綠界
    }
    if(NODE_ENV !== "dev"){
        env = {
            action: "https://ccore.newebpay.com/MPG/mpg_gateway",
            OperationMode: "Production",
        }
    }
	return env
}
module.exports = env