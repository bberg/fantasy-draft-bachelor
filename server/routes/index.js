var express = require('express');
var router = express.Router();
var path = require('path');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var http = require('https')
var multer = require('multer')
var upload = multer() // for parsing multipart/form-data

var api = require(path.join(__dirname, '../', 'models', 'api-guts'))
var scraper = require(path.join(__dirname, '../', 'models', 'scraper'))
var dbUtils = require(path.join(__dirname, '../', 'models', 'dbUtils'))


//////////////// API ROUTES ////////////////
router.get('/api/v1/users', function(req,res,next){                            api.get_all(req,res,'lu_users')})
router.get('/api/v1/contestants', function(req,res,next){                      api.get_all(req,res,'lu_contestants')})
router.get('/api/v1/mappings', function(req,res,next){                         api.get_all(req,res,'rel_users_contestants')})

router.get('/api/v1/usersWithMappings', function(req,res,next){                         api.get_users_with_mappings(req,res)})

router.get('/api/v1/users/:user_id', function(req,res,next){                   api.get_where(req,res,'lu_users','user_id',req.params.user_id,'api')})
router.get('/api/v1/contestants/:contestant_id', function(req,res,next){       api.get_where(req,res,'lu_contestants','contestant_id',req.params.contestant_id,'api')})
router.get('/api/v1/mappings/:did', function(req,res,next){                    api.get_where(req,res,'rel_users_contestants','did',req.params.did,'api')})

router.get('/api/v1/contestants/eliminated/:elim_status', function(req,res,next){api.get_where(req,res,'lu_contestants','eliminated',req.params.elim_status,'api')})

router.get('/api/v1/users/:user_id/mappings', function(req,res,next){          api.get_where(req,res,'rel_users_contestants','user_id',req.params.user_id,'api')})
router.get('/api/v1/contestants/:contestant_id/mappings', function(req,res,next){api.get_where(req,res,'rel_users_contestants','contestant_id',req.params.contestant_id,'api')})

router.post('/api/v1/users', function(req,res,next){                           api.insert(req,res,'lu_users')})
router.post('/api/v1/contestants', function(req,res,next){                     api.insert(req,res,'lu_contestants')})
router.post('/api/v1/mappings', function(req,res,next){                        api.insert(req,res,'rel_users_contestants')})

router.delete('/api/v1/users/:user_id', function(req,res,next){                api.delete_where(req,res,'lu_users','user_id',req.params.user_id,'api')})
router.delete('/api/v1/contestants/:contestant_id', function(req,res,next){    api.delete_where(req,res,'lu_contestants','contestant_id',req.params.contestant_id,'api')})
router.delete('/api/v1/mappings/:did', function(req,res,next){                 api.delete_where(req,res,'rel_users_contestants','did',req.params.did,'api')})

router.get('/api/v1/users/mappings', function(req,res,next){                     
    api.get_user_mappings(
    req,
    res,
    'lu_users',
    'INNER',
    'rel_users_contestants',
    'lu_users.user_id',
    'rel_users_contestants.user_id',
    'lu_users.name',
    false,
    '%'
           )})

//////////////// API SCRAPER FUNCTIONS ////////////////
router.get('/update',function(req,res){
    updateVals = scraper.update(req,res)
})


//////////////// API HELPER FUNCTIONS ////////////////
router.get('/setup',function(req,res){
    scraper.setup(req,res)
})

router.get('/dummyData',function(req,res){
    scraper.dummy_data(req,res)
})


//////////////// FRONTEND ////////////////
router.get('/', function(req,res){
    res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'dashboard.html'))
})

router.get('/edit', function(req,res){
    res.sendFile(path.join(__dirname, '../', '../', 'client', 'views', 'edit.html'))
})


module.exports = router;