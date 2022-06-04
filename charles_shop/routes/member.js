var express = require('express');
var router = express.Router();

var auth = require('../middleware/auth')

var Member = require("../models/member"); //Member 建構式

router.post('/login', async function(req, res, next) {
  let data = req.body;
  let member = new Member();
  try{
    let result = await member.loginMember(data.email,data.password);
    req.session.displayName = result.data.displayName || "使用者"
    req.session.uid = result.data.localId; //寫入使用者的 uid
    req.session.email = result.data.email; //寫入 email
    res.json({
      success:true,
      idToken: result.data.idToken,
      refreshToken : result.data.refreshToken,
    });
  }catch(err){
    return res.status(500).json({ err: true, message : err.response.data.error})
  }
})

router.get("/logout", async function(req, res, next) {
  req.session.destroy((err) => {
		res.redirect('/')
    //res.json({success: true}) //呼叫 api 用
  });
})

router.post("/update", auth, async function(req, res, next) {
  let data = req.body;
  let member = new Member();
  //檢查當前密碼是否為現在會員的密碼
  try{
    await member.loginMember(res.locals.session.email,data.currentPassword);
  }catch(err){
    return res.redirect('/settings?err=password_error')
  }
  
  try{
    let result = await member.update(res.locals.session.uid,data);
    if(result.err) return res.redirect('/settings?err=' + result.err)
  }catch(err){
    return res.redirect('/settings?err=1')
    console.log(err,"err")
  }
  return res.send("ok")
  return res.redirect('/settings')
})

router.post('/forgetEmail', async function(req, res, next) {
  let email = req.body.email
  let member = new Member();
  try{
    await member.forgetEmail(email); //寄送忘記密碼認證信
    res.json({success:true})
  }catch(err){
    return res.status(500).json({ err: true, message : err.response.data.error})
  }
})
  
router.post('/add', async function(req, res, next) {
  let data = req.body;
  //TODO後端驗證欄位
  if(1 == -1) return res.status(400).json({err:true,message:"欄位驗證出錯"})

  let member = new Member(data);
  try{
    let result = await member.add();
    if(result.err) { //代表有錯
      return res.status(500).json({ err: true, message: result.err})
    }
  }catch(err){
    return res.status(500).json({ err: true, message: err.toString()})
  }

  try{
    let result = await member.loginMember(data.email,data.password);//執行登入
    await member.sendVerifyEmail(result.data.idToken); //寄送會員認證信
    res.json({
      success:true,
      idToken: result.data.idToken,
      refreshToken : result.data.refreshToken,
    })
  }catch(err){
    return res.status(500).json({ err: true, message: err.toString()})
  }
});

module.exports = router;

