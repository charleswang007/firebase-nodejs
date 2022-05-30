let Product = function(data){
    this.version = "v1.0"; //this 宣告的變數或物件會曝露出去
    let new_data = data; //接收傳進來的參數
    this.demo = () => {
      console.log("這是方法", this)
    }
    this.getProduct = async () => {
        let result = await db.collection("PRODUCT")
            .orderBy("createdAt", "asc")
            .get();
        let data = [];
        result.forEach((doc)=>{ 
        //這邊可以做篩選有適合的資料才做 push
        let seconds = doc.data().createdAt.seconds
        console.log("id: ", doc.id)
        console.log("seconds: ", timestampToDate(seconds))
        data.push({
            ...doc.data(),
            id: doc.id
        })
        })
        return data    
    }
    this.getProductClassMain = async() => {
        let result = await db.collection("PAGE").doc("productClassMain").get();
        return result.data();
    }
    this.add = async (add_data) => {
        let data = new_data || add_data;
        // return {  //回傳 err 代表某些情境失敗無法新增
        //     err: true
        // } 
        return await db.collection("PRODUCT").add({
            ...Product.prototype.product,
            ...data,
            createdAt: admin.firestore.FieldValue.serverTimestamp() 
        })
    }
    this.updateList = async () => {
        let result = await db.collection("PRODUCT")
        //.where("name", "==", "我是產品2")
        .get()
        // for(let i=0;i<result.docs.length;i++){
        //     await result.docs[i].ref.update({b:111})
        // }
        var batch = db.batch();
        result.forEach((doc)=>{
            batch.update(doc.ref,{a:222});
        })
        batch_result = await batch.commit()
        return "update batch successfully"
    }
    this.update = (id, update_data) => {
        return db.collection("PRODUCT").doc(id).set({
            ...update_data,
            updateAt: admin.firestore.FieldValue.serverTimestamp()
        },{merge:true})
    }
    this.delete = (id) => {
        return db.collection("PRODUCT").doc(id).delete();
    }
}

function timestampToDate(timestamp){
    var date = new Date(timestamp * 1000);
      var mm = date.getMonth() + 1; 
      var dd = date.getDate();
      var hh = date.getHours()
      var nn = date.getMinutes();
      hh = (hh>9 ? '' : '0') + hh
      nn = (nn>9 ? '' : '0') + nn
      return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd,
           ].join('/') + " " +hh+":"+nn ;
  } 

Product.prototype  = { //使用原型屬性
    product: { //產品資料表結構
      "name":"",//產品名稱
      "productClassMain":"",//主分類 id
      "productClass":"",//次分類 id
      "img":"",//產品圖示
      "p_img":"",//產品輪播圖
      "money": 0, //訂價
      "price": 0, //目前價錢
      "star" : 5, //評價星號
      "content": "", // 產品介紹
      "keyWord": "", //產品關鍵字
      "inventory": 0, //產品庫存
      "sort":0,//排序
      "open": true, //是否上架
      "_tag":[],//產品標籤
      "updateAt": "",//產品更新時間
      "createdAt": "" //建立時間
    },
    productClassMain:{ //主分類結構
      "id":"",//分類 id
      "name" : "",//分類名稱
      "img" : "",//分類圖示
      "checked": true,//開關
    },
    productClass : { //次分類結構
        "id":"",//分類 id
        "name":"",//分類名稱
        "checked": true//開關
    }
  }

  module.exports = Product