var path = require('path');
var log = require(path.join(__dirname, 'log'));

log.debug(process.env)
if(process.env['HOME']=='/home/benashbe'){
    // todo
    var port = -1
    var env = 'prod'
    // in prod we need to hide the secrets outside our git directory!
    var secrets = require('/home/benashbe/secrets.js')
    var connectionString = secrets.fantasy_draft_bachelor.prod_connectionString
    log.error('RUNNING ON SERVER... PORT: '+port.toString())
}
if(process.env['HOME']=='/Users/benberg'){
    var port = 3000
    var env = 'dev'
    var secrets = require(path.join(__dirname,'secrets'))
    var connectionString = secrets['fantasy_draft_bachelor']['dev_connectionString']
    log.error('RUNNING ON DEV... PORT: '+port.toString())
}


module.exports = {"connectionString":connectionString, "port":port, "env":env}