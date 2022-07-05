var express = require('express');
const axios = require('axios');
const {sleep} = require('./modules/tool');
const {verify} = require('./modules/verify');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.redirect("/admin/dashboard");
});

router.get('/login', function(req, res, next) {
   res.render('login', {});
});
router.post('/login', async (req, res, next) => {
  var email= req.body.email.replace(/^\s*|\s*$/g, '') + "";
  var global_email = global.adminlogin + "." + email;
  var password = req.body.password.replace(/^\s*|\s*$/g, '');

  try{
    //使用 rest api 做登入後端驗證  
    let response = await axios({
      method: "post",
      url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${global.firebase_api_key}`,
      headers: {
        'Content-Type': 'application/json' 
      },
      data: {
        email: global_email,
        password: password,
        returnSecureToken: true
      }
    })

    let customToken = await admin.auth().createCustomToken(global_email);

    if(email == global.adminEmail){
      req.session._name = "root"
      req.session._uid = email;
      req.session._root = "最高管理者"; //權限
      req.session._email = email;
      await sleep(5);
      return res.end(customToken);
    }
    let data = await db.collection("ADMIN").doc(email).get();
    if(data.data()){
      var _data= data.data();
      req.session._email = email;
      req.session._name = _data.name;
      req.session._picture = _data.picture || "";
      req.session._uid = email;
      req.session._root = _data.root.toString();
      await sleep(5); 
      return res.end(customToken);
    }
    
    return res.end("error");
    
  }catch(error){
    const code = parseInt(error.response &&error.response.status)  //取得status code
    console.log(code)
    console.log(error.response.data) //取得資料
    return res.end("error");
  }

});

router.get('/dashboard', function(req, res, next) {
  res.render('dashboard', { title: '管理主頁'});
});
router.post('/dashboardPassword', async function(req, res, next) {
  var password = req.body.password || ""
  var uid = req.session._uid;

  if(uid == global.adminEmail){
    return res.send("root 管理者無法更改密碼");
  }

  var ref = db.collection("ADMIN").doc(uid);

  try {
    await admin.auth().updateUser(global.adminlogin + "." + uid, {
      password: password
    })
    await ref.set({
      password
    },{
      merge: true
    })

  } catch(err) {
    return res.send("修改密碼失敗");
  }

  req.session._password = password;
  res.send("ok");
})
router.post('/dashboardPicture', async function(req, res, next) {
  var uid = req.session._uid;
  var picture = req.body.picture || ""
   if(uid == global.adminEmail){
    req.session._picture = req.body.picture;
    return res.send("ok");
    
  }
  
  var ref = db.collection("ADMIN").doc(uid);
   try {
      
      await ref.set({
        picture
      },{
        merge: true
      })
      
    } catch(err) {
      return res.send("上傳失敗");
    }
  req.session._picture=req.body.picture;
  res.send("ok");

})

router.get('/memberManage', verify("管理成員"), function(req, res, next) {
  var c_name = req.query.c_name || "";
  res.render('memberManage', { title: '管理成員',message: '',c_name: c_name });
});
router.post("/memberManage", async function(req, res, next){
  var post  = req.body;

  var name =  post.name.replace(/^\s*|\s*$/g, '') || "";
  var note = post.note.replace(/^\s*|\s*$/g, '') || "";
//  var link = post.link.replace(/^\s*|\s*$/g, '') || "";
  
  var uidType = post.uidType || "";

  var uid = post.uid.replace(/^\s*|\s*$/g, '') || "";
  var root = post.root || "最高管理者";

  var password =  post.password.replace(/^\s*|\s*$/g, '') || "";
  var member_edit = post.member_edit.replace(/^\s*|\s*$/g, '') || "";
  
  //https://firebase.google.com/docs/auth/admin/manage-users#node.js_5
  
  if(member_edit == uid){ //代表相同的帳號做編輯
    var ref_member = await db.collection("ADMIN").doc(uid).get();
    //先檢查他的帳號有沒有被異動
    
    //有輸入密碼，強制更新密碼
    if(password !=""){
      try {
        admin.auth().updateUser(global.adminlogin + "." + uid, {
            password: password
        })
        //強制更新密碼，這會讓使用者重新登出
      } catch(err) {
        return res.send("新增帳號失敗");
      }
    }
  }
  if(member_edit != uid){ //代表編輯成不同 uid 或是新增
    try {
      await admin.auth().createUser({
        uid: global.adminlogin + "." + uid,
        email: global.adminlogin + "." + uid,
        password: password
      })

    } catch(err) {
      if (err.errorInfo.code == 'auth/uid-already-exists') return res.send("帳號已存在");
      return res.send("新增帳號失敗");
    }
  }
  
  if(member_edit != "" && member_edit != uid){//代表帳號有變，要把舊的刪掉
    var ref = db.collection("ADMIN").doc(member_edit);
    await ref.delete();
    await admin.auth().deleteUser(member_edit);
  }

  var ref = db.collection("ADMIN").doc(uid);

  await ref.set({
    uid,
    root,
    name,
    note,
    updateAt: admin.firestore.FieldValue.serverTimestamp(),
  },{
    merge: true
  })

  res.send("ok");

})

router.post('/memberManageDelete', async function(req, res, next) {
try {
  var uid = req.query.uid;
  var ref = db.collection("ADMIN").doc(uid);
  await ref.delete();
  await admin.auth().deleteUser(global.adminlogin + "." + uid);
  
  res.send("ok");
} catch (e) {
  console.log(e)
  res.send("error");
}
  
});

router.get('/indexInfo', async function(req, res, next) {
  let data = { //資料模型
    "addr": "",
    "email": "",
    "facebook": "",
    "instagram": "",
    "phone": "",
    "youtube": ""
  }
  var ref = db.collection("PAGE").doc("indexInfo");

  let result = await ref.get();
  if(result.data()) data = result.data();
  
  res.render('indexInfo', {
    title: '網站管理 - 網站資訊', data : JSON.stringify(data)
  });

});
router.post('/indexInfo', async function(req, res, next) {
 let data = JSON.parse(req.body.data)
 await db.collection("PAGE").doc("indexInfo").set(data);
 res.send("ok");
});

router.get('/parameter', async function(req, res, next) {
  var ref = db.collection("PAGE").doc("parameter");
  let data = { //資料模型
    "title": "",
    "description": "",
    "keyword": "",
    "resumeEmail": ""
  }
  
  let result = await ref.get();
  if(result.data()) data = result.data();
  
  res.render('parameter', { 
    title: '網站管理 - 網站設定', data:  JSON.stringify(data) 
  });
  
});
router.post('/parameter', async function(req, res, next) {
  
  let data = JSON.parse(req.body.data);
  await db.collection("PAGE").doc("parameter").set(data);
  
  res.send("ok")
})

router.post('/about', async function(req, res, next) {
  let data = JSON.parse(req.body.data);
  await db.collection("PAGE").doc("about").set(data);
  
  //這兩個從資料庫抓
  delete data.title_inner;
  delete data.content_inner;

  res.send("ok");
});

router.get('/about', async function(req, res, next) {
  let data = {}//資料模型

  let result = await db.collection("PAGE").doc("about").get();
  if(result.data()) data = result.data();
    
  res.render('about', { 
    title: '網站管理 - 關於我們' ,  data:  JSON.stringify(data)
  });

});

router.post('/faq', async function(req, res, next) {
  let data = JSON.parse(req.body.data);
  await db.collection("PAGE").doc("faq").set(data);

  res.send("ok");
});
router.get('/faq', async function(req, res, next) {
   let data = { //資料模型
    "content": [{
      "text": "",
      "name": "",
      "sort": 1,
      "link": "",
      "img": ""
    }]
  }

  let result = await db.collection("PAGE").doc("faq").get();
  if(result.data()) data = result.data();

   res.render('faq', { 
     title: '網站管理 - FAQ' , data :JSON.stringify(data)
   })
});

router.get('/member', async function(req, res, next) {
  var id = req.query.id || "";
  res.render('member', { title: '課程學生管理 - 網站會員管理'});
});
router.post('/member', async function(req, res, next) {
  let data = JSON.parse(req.body.data);
  
  var ref = db.collection("MEMBER").doc(data.uid);
  
  await ref.set({
    ...data,
    updateAt: admin.firestore.FieldValue.serverTimestamp()
  },{
      merge: true
  })
  res.send("ok")

});

router.post('/indexManage', async function(req, res, next) {
  let data = {
    content: JSON.parse(req.body.data) 
  };
  await db.collection("PAGE").doc("indexManage").set(data);

  res.send("ok");
});
router.get('/indexManage', async function(req, res, next) {
  let data = {
    content:[{ //資料模型
      "img": "",
      "title": "",
      "sort": 1,
      "checked": true,
      "titleSub": ""
    }]
  }

  let result = await db.collection("PAGE").doc("indexManage").get();
  if(result.data()) data = result.data();
  
  res.render('indexManage', { 
    title: '網站管理 - 首頁圖片', data: JSON.stringify(data.content)
  });
});

router.post('/newsClass', async function(req, res, next) {
  
  let data = {
    content: JSON.parse(req.body.data) 
  };
  await db.collection("PAGE").doc("newsClass").set(data);
  
  res.send("ok");
});
router.get('/newsClass', async function(req, res, next) {
  let data = {
     content:[]
  }
  
  let result = await db.collection("PAGE").doc("newsClass").get();
  if(result.data()) data = result.data();

   res.render('newsClass', { 
     title: '文章管理 - 分類管理', data: JSON.stringify(data.content)
   });
});
router.get('/news', async function(req, res, next) {
  var id = req.query.id || "";
  
  let newsClass = []
  let result = await db.collection("PAGE").doc("newsClass").get();
  if(result.data()) newsClass = result.data().content;

  if(!newsClass.length){//沒有主分類
    return res.redirect("/admin/newsClass");
  }
  if(id == ""){
    var docRef = db.collection("NEWS").where("newsClass", "!=", "")
  }else{
    var docRef = db.collection("NEWS").where("newsClass","==",id);
  }
  
   var news = [];
   await docRef.get().then(function(querySnapshot) {

    querySnapshot.forEach(function(doc){
      var _data = doc.data();
          var open = _data.open;
          var top = _data.top;
          var name = _data.name || "";
          var img = _data.img || "";
          var number = _data.number;
          var _newsClass = _data.newsClass;
          var newsClassName = "";
          var updateAt = _data.updateAt

          newsClass.forEach((j)=>{
            if(j.id == _newsClass) newsClassName = j.name
          })

          var time = _data.updateAt.seconds;

          news.push({
            id: doc.id,
            number: number,
            name,
            time,
            img,
            open,
            top,
            newsClass:_newsClass,
            newsClassName
          });
      
      
          })

     })

    news.sort(function(x, y){
        return y.time - x.time;
    })

   res.render('news', { title: '文章管理 - 內容管理', newsClass, id, news });

  
  });


module.exports = router;
