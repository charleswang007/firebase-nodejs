var axios = require('axios');
let firebase_api_key = "";

let Member = function(data){
    this.version = "v1.0"; //this 宣告的變數或物件會曝露出去
    let new_data = data; //接收傳進來的參數
    this.demo = () => {
      console.log("這是方法", this)
    }
    this.getMember = async () => { 
    }
    this.sendVerifyEmail = async (idToken) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          requestType: "VERIFY_EMAIL",
          idToken
        }
      })
    }
    this.loginMember = (email,password) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          email: email,
          password: password,
          returnSecureToken:true
        }
      })
    }
    this.forgetEmail = async (email) => {
      return axios({
        method: "post",
        url: 'https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=' + firebase_api_key,
        headers: {
          'Content-Type': 'application/json' 
        },
        data: {
          requestType: "PASSWORD_RESET",
          email
        }
      })
    }
    this.add = async (add_data) => {
      let data = new_data || add_data;
      let uid = "";
      //新增用戶 https://firebase.google.com/docs/auth/admin/manage-users#create_a_user
      try{
        let userRecord = await admin.auth().createUser({
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          displayName: data.displayName,
          photoURL: data.photoURL
        })
        uid = userRecord.uid;//回傳 uid
      }catch(err){
        return {err: err.errorInfo} //回傳 code (https://firebase.google.com/docs/auth/admin/errors)
      }
      if(!uid) return { err: "新增失敗"}

      //delete data.password //密碼刪掉
      return db.collection("MEMBER").doc(uid).set({
          ...Member.prototype.member,
          ...data,
          createdAt : admin.firestore.FieldValue.serverTimestamp(),
          uid,
          password: null
      })
    } 
    this.update = (id, update_data) => {
        return db.collection("MEMBER").doc(id).set({
            ...update_data,
            updateAt: admin.firestore.FieldValue.serverTimestamp()
        },{merge:true})
    }
    this.delete = (id) => {
        return db.collection("MEMBER").doc(id).delete();
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

  Member.prototype  = { //使用原型屬性
    member: { //會員資料表結構
      "uid":"", //會員 uid
      "email": "",//會員 email
      "displayName":"",//會員姓名
      "photoURL":"",//會員照片
      "emailNotification": false, //email 是否驗證
      "updateAt": "",//更新時間
      "createdAt": "" //建立時間
    }
  }  

  module.exports = Member