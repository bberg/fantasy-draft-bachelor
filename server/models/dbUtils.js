var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var http = require('https')
var connectionString = config.connectionString
var comms_utils = require(path.join(__dirname, 'comms_utils'));
var api = require(path.join(__dirname, 'api-guts'));

function inspect_objet(object){
    for (i in object){
        console.log(i)
        console.log(object[i])
    }
}

dbUtils = {}

dbUtils.sequential_sql = function sequential_sql(req,res,sqlCommandArray,index){

    // if there are no more setup commands to execute, exit

    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return log.error('could not connect to postgres', err)
        }
        sql = sqlCommandArray[index]
        // log.error(typeof(sql))
        log.debug('index: '+index.toString()+ ' sql to run: '+ sql)

        client.query(sql, function(err, result){
            if(err) {
                return log.error('error running query', err)
            }
            if (index >= sqlCommandArray.length -1) {
                return comms_utils.respond(req,res,result,200,'api')
            }
            done()
            pg.end()
            sequential_sql(req,res,sqlCommandArray,index+1)
        })
    })
}

dbUtils.dump_table = function dump_table(req,res,table,return_response,token){

    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return log.error('could not connect to postgres', err)
        }

        client.query('select * from '+table, function(err, result){
            if(err) {
                return log.error('error running query', err)
            }
            if(result){
                if(return_response =='default'){
                    comms_utils.respond(req,res,result,200,'api')
                }
                else{
                    return_response(req,res,result['rows'],token)
                }
                
                // res.status(200).json(result)
            }
            done()
            pg.end()
        })
    })
}


dbUtils.get_user_mappings = function get_user_mappings(req,res,return_response,token){
    sql = "SELECT lu_contestants.eliminated AS eliminated, rel_users_contestants.did AS did, rel_users_contestants.rank, lu_users.name AS user_name, lu_contestants.name  AS contestant_name, lu_contestants.img_url as img_url  FROM rel_users_contestants LEFT JOIN lu_users ON (rel_users_contestants.user_id = lu_users.user_id) LEFT JOIN  lu_contestants on (rel_users_contestants.contestant_id = lu_contestants.contestant_id) where lu_users.name LIKE '%' ORDER BY rank;"
    log.error("running sql: "+sql)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            log.error('could not connect to postgres', err1)
            return comms_utils.respond(req,res,err1,500,'error')
        }
        client.query(sql, function(err2, result){
            if(err2) {
                log.error('error running query', err2)
                return comms_utils.respond(req,res,err2,500,'error')
            }
            if(result){
                if(return_response =='default'){
                    comms_utils.respond(req,res,result,200,'api')
                }
                else{
                    return_response(req,res,result['rows'],token)
                }
            }
            done()
            pg.end()
        })
    })
}


// compose a list of SQL commands to send to update a list of objects according to the where key
dbUtils.insert_or_update_by_object = function insert_or_update_by_object(object,table,where_key){
    log.debug('dbUtils.update_by_object' + object)
    keys = ''
    vals = ''
    for (i in object){
        keys+= ' '+i+','
        vals+= ' \''+object[i]+'\','

    }
    keys = keys.substring(0, keys.length-1)
    vals = vals.substring(0, vals.length-1)
    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return log.error('could not connect to postgres', err)
        }
        client.query('INSERT INTO '+table+' ( ' +keys+ ' ) SELECT  '+vals+'  WHERE NOT EXISTS (SELECT 1 FROM '+table+' WHERE '+where_key+' = \''+object[where_key]+'\' )', function(SQLerror, result){
            if(SQLerror) {
                return log.error('error running query', SQLerror)
            }
            log.debug('query result',result)
            done()
            pg.end()
        })
    })

    sql = 'UPDATE '+table+' SET ( ' +keys+ ' ) = ( '+vals+' ) WHERE '+where_key+' = \''+object[where_key]+'\''
    log.debug("running sql: "+sql)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            return log.error('could not connect to postgres', err1)
        }
        client.query(sql, function(err2, result){
            if(err2) {
                return log.error('error running query', err2)
            }

            log.debug('query result',result)
            done()
            pg.end()
        })
    })
}

dbUtils.insert = function insert(req,res,table,verbosity){
    object = req.body
    console.log(object)
    log.debug('dbUtils.insert' + object)
    keys = ''
    vals = ''
    for (i in object){
        keys+= ' '+i+','
        vals+= ' \''+object[i]+'\','
    }
    keys = keys.substring(0, keys.length-1)
    vals = vals.substring(0, vals.length-1)
    sql = 'INSERT INTO '+table+' ( ' +keys+ ' ) SELECT  '+vals+ 'RETURNING *'
    console.log(sql)
    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            log.error('could not connect to postgres', err)
            return comms_utils.respond(req,res,err,500,'error')
        }
        client.query(sql, function(SQLerror, result){
            if(SQLerror) {
                log.error('error running query', SQLerror)
                return comms_utils.respond(req,res,SQLerror,500,'error')
            }
            log.debug('query result',result)
            done()
            pg.end()
            return comms_utils.respond(req,res,result,201,verbosity)
        })
    })
}

dbUtils.delete_where = function delete_where(req,res,table,id_key,id,verbosity){
    sql = 'DELETE from '+table+' WHERE ' +id_key+ ' =  $1'
    vars = [id]
    log.debug("running sql: "+sql+"with vars: "+vars)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            log.error('could not connect to postgres', err1)
            return comms_utils.respond(req,res,err1,'error')
        }
        client.query(sql,vars, function(err2, result){
            if(err2) {
                log.error('error running query', err2)
                return comms_utils.respond(req,res,err2,'error')
            }
            log.debug('query result',result['rows'])
            done()
            pg.end()
            return comms_utils.respond(req,res,result,204,'api')
        })
    })
}

dbUtils.get_where = function get_where(req,res,table,id_key,id,verbosity){
    sql = 'SELECT * from '+table+' WHERE ' +id_key+ ' =  $1'
    vars = [id]
    log.debug("running sql: "+sql+"with vars: "+vars)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            log.error('could not connect to postgres', err1)
            return comms_utils.respond(req,res,err1,500,'error')
        }
        client.query(sql,vars, function(err2, result){
            if(err2) {
                log.error('error running query', err2)
                return comms_utils.respond(req,res,err2,500,'error')
            }
            log.debug('query result',result['rows'])
            done()
            pg.end()
            return comms_utils.respond(req,res,result,200,'api')
        })
    })
}

dbUtils.get_where_join = function get_join_where(req,res,join_object,verbosity,return_response,token){
    if(join_object.where_strict == false){
        where_operator = 'LIKE'
    }
    else{
        where_operator = '='
    }
    sql = 'SELECT * from '+join_object.left_table+' '+join_object.join_type+' JOIN '+join_object.right_table+' ON ( '+join_object.left_key+' = '+join_object.right_key+' )  WHERE ' +join_object.where_key+ ' '+where_operator+'  $1'
    vars = [join_object.where_val]
    log.debug("running sql: "+sql+"with vars: "+vars)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            log.error('could not connect to postgres', err1)
            return comms_utils.respond(req,res,err1,500,'error')
        }
        client.query(sql,vars, function(err2, result){
            if(err2) {
                log.error('error running query', err2)
                return comms_utils.respond(req,res,err2,500,'error')
            }
            if(return_response =='default'){
                return comms_utils.respond(req,res,result,200,'api')
            }
            else{
                return return_response(req,res,result['rows'],token)
            }
            log.debug('query result',result['rows'])
            done()
            pg.end()
            
        })
    })
}

module.exports = dbUtils