var express = require('express');
var router = express.Router();
var Member = require("../models/member"); //Member 建構式

router.post('/login', async function(req, res, next) {
    let data = req.body;
    let member = new Member();
    try{
      let result = await member.loginMember(data.email,data.password);
      console.log(result,"result")
      res.json({
        success:true,
        idToken: result.data.idToken,
        refreshToken : result.data.refreshToken,
      })
    }catch(err){
      return res.status(500).json({ err: true, message : err.response.data.error})
    }
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

