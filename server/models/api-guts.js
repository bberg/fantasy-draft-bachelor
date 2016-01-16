var path = require('path');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var dbUtils = require(path.join(__dirname, 'dbUtils'));
var http = require('https')

var api = {}

api.get_all = function get_all(req,res,table){
    dbUtils.dump_table(req,res,table)
}

api.insert_or_update_if_exists = function insert_or_update_if_exists(req,res,table,key){
    dbUtils.insert_or_update_by_object(req.body,table,key)
}

api.insert = function insert(req,res,table){
    dbUtils.insert(req,res,table,'api')
}

api.delete_one = function delete_one(req,res,table,id_key,id){
    dbUtils.delete_by_id(req,res,table,id_key,id)
}

api.get_where = function get_where(req,res,table,id_key,id,verbosity){
    dbUtils.get_where(req,res,table,id_key,id,verbosity)
}

api.delete_where = function delete_where(req,res,table,id_key,id,verbosity){
    dbUtils.delete_where(req,res,table,id_key,id,verbosity)
}


module.exports = api