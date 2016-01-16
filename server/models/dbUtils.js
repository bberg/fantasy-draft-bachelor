var path = require('path');
var pg = require('pg');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var http = require('https')
var connectionString = config.connectionString
var comms_utils = require(path.join(__dirname, 'comms_utils'));

function inspect_objet(object){
    for (i in object){
        console.log(i)
        console.log(object[i])
    }
}

dbUtils = {}

dbUtils.sequential_sql = function sequential_sql(req,res,sqlCommandArray,index){

    // if there are no more setup commands to execute, exit
    if (index >= sqlCommandArray.length){
        return res.status(201).json({"status":"created"})
    }

    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return log.error('could not connect to postgres', err)
        }
        sql = sqlCommandArray[index]
        // log.error(typeof(sql))
        log.error('index: '+index.toString()+ ' sql to run: '+ sql)

        client.query(sql, function(err, result){
            if(err) {
                return log.error('error running query', err)
            }
            done()
            pg.end()
            sequential_sql(req,res,sqlCommandArray,index+1)
        })
    })
}

dbUtils.dump_table = function dump_table(req,res,table){

    pg.connect(connectionString, function(err, client, done) {
        if(err) {
            return log.error('could not connect to postgres', err)
        }

        client.query('select * from '+table, function(err, result){
            if(err) {
                return log.error('error running query', err)
            }
            if(result){
                comms_utils.respond(req,res,result,200,'api')
                // res.status(200).json(result)
            }
            done()
            pg.end()
        })
    })
}

// compose a list of SQL commands to send to update a list of objects according to the where key
dbUtils.insert_or_update_by_object = function insert_or_update_by_object(object,table,where_key){
    log.error('dbUtils.update_by_object' + object)
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
            log.error('query result',result)
            done()
            pg.end()
        })
    })

    sql = 'UPDATE '+table+' SET ( ' +keys+ ' ) = ( '+vals+' ) WHERE '+where_key+' = \''+object[where_key]+'\''
    log.error("running sql: "+sql)
    pg.connect(connectionString, function(err1, client, done) {
        if(err1) {
            return log.error('could not connect to postgres', err1)
        }
        client.query(sql, function(err2, result){
            if(err2) {
                return log.error('error running query', err2)
            }

            log.error('query result',result)
            done()
            pg.end()
        })
    })
}

dbUtils.insert = function insert(req,res,table,verbosity){
    object = req.body
    console.log(object)
    log.error('dbUtils.insert' + object)
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
            log.error('query result',result)
            done()
            pg.end()
            return comms_utils.respond(req,res,result,201,verbosity)
        })
    })
}

dbUtils.delete_where = function delete_where(req,res,table,id_key,id,verbosity){
    sql = 'DELETE from '+table+' WHERE ' +id_key+ ' =  $1'
    vars = [id]
    log.error("running sql: "+sql+"with vars: "+vars)
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
            log.error('query result',result['rows'])
            done()
            pg.end()
            return comms_utils.respond(req,res,result,204,'api')
        })
    })
}

dbUtils.get_where = function get_where(req,res,table,id_key,id,verbosity){
    sql = 'SELECT * from '+table+' WHERE ' +id_key+ ' =  $1'
    vars = [id]
    log.error("running sql: "+sql+"with vars: "+vars)
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
            log.error('query result',result['rows'])
            done()
            pg.end()
            return comms_utils.respond(req,res,result,200,'api')
        })
    })
}

module.exports = dbUtils