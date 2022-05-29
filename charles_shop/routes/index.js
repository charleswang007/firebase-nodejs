var express = require('express');
var router = express.Router();

/* GET home page. */

 router.get(['/','index'], function(req, res, next) {
  res.render('index', { title: '韋恩購物網' });
 });
 router.get('/demo', function(req, res, next) {
  res.render('demo', { title: 'demo' });
 });
 router.get('/news', function(req, res, next) {
  res.render('news', { title: '最新消息' });
 });
 router.get('/about', function(req, res, next) {
  res.render('about', { title: '關於我們' });
 });
 router.get('/account', function(req, res, next) {
  res.render('account', { title: '帳號設定' });
 });
 router.get('/articlse', function(req, res, next) {
  res.render('article', { title: '文章' });
 });
 router.get('/blog', function(req, res, next) {
  res.render('blog', { title: '部落格' });
 });
 router.get('/brands', function(req, res, next) {
  res.render('brands', { title: '品牌' });
 });
 router.get('/cart', function(req, res, next) {
  res.render('cart', { title: '購物車' });
 });
 router.get('/catalog', function(req, res, next) {
  res.render('catalog', { title: '產品目錄' });
 });
 router.get('/category', function(req, res, next) {
  res.render('category', { title: '產品分類' });
 });
 router.get('/subcategory', function(req, res, next) {
  res.render('subcategory', { title: '產品子分類' });
 });
 router.get('/checkout', function(req, res, next) {
  res.render('checkout', { title: '結帳' });
 });
 router.get('/compare', function(req, res, next) {
  res.render('compare', { title: '產品比較' });
 });
 router.get('/contacts', function(req, res, next) {
  res.render('contacts', { title: '聯絡我們' });
 });
 router.get('/delivery', function(req, res, next) {
  res.render('delivery', { title: 'delivery' });
 });
 router.get('/faq', function(req, res, next) {
  res.render('faq', { title: ' faq' });
 });
 router.get('/favorites', function(req, res, next) {
  res.render('favorites', { title: '我的最愛' });
 });
 router.get('/news', function(req, res, next) {
  res.render('news', { title: '最新消息' });
 });
 router.get('/personal', function(req, res, next) {
  res.render('personal', { title: '個人資訊' });
 });
 router.get('/product', function(req, res, next) {
  res.render('product', { title: '產品頁' });
 });
 router.get('/settings', function(req, res, next) {
  res.render('settings', { title: '設定' });
 });
 router.get('/article', function(req, res, next) {
    res.render('article', { title: '文章' });
 });

module.exports = router;
