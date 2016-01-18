var path = require('path');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var dbUtils = require(path.join(__dirname, 'dbUtils'));
var http = require('https')

var api = {}

api.get_user_mappings = function get_user_mappings(req,res,left_table,join_type,right_table,left_key,right_key,where_key,where_strict,where_val){
    join_object = {
        "left_table" : left_table
        ,"join_type" : join_type
        ,"right_table" : right_table
        ,"left_key" : left_key
        ,"right_key" : right_key
        ,"where_key" : where_key
        ,"where_val" : where_val
        ,"where_strict" : where_strict
    }
    dbUtils.get_where_join(req,res,join_object,'api')
}

api.get_users_with_mappings = function get_users_with_mappings(req,res){
    dbUtils.get_user_mappings(req,res,api.process_users_with_mappings,'get_user_mapping')
}

api.process_users_with_mappings = function process_users_with_mappings(req,res,data,caller){
    temp = {}
    for(i in data){
        if(temp[data[i]['user_name']] == undefined){
            temp[data[i]['user_name']] = {'user':data[i]['user_name'],'data':[]}
        }
        temp[data[i]['user_name']]['data'].push(data[i])
        console.log(data[i])
    }
    outVals = []
    for(i in temp){
        outVals.push(temp[i])
    }
    // console.log(caller)
    // users_with_mappings[caller] = data
    // console.log(users_with_mappings)
    comms_utils.respond(req,res,outVals,200,'api')      
}

api.get_all = function get_all(req,res,table){
    dbUtils.dump_table(req,res,table,'default')
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