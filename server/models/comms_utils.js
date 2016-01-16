var path = require('path');
var config = require(path.join(__dirname, '../', '../', 'config'));
var log = require(path.join(__dirname, '../', '../', 'log'));
var http = require('https')

comms_utils = {}

comms_utils.respond =function respond(req,res,sqlOutput,code,format){
    log.error('respond NOW: '+ sqlOutput)
    if(code == 200 || code == 201){
        if(sqlOutput != undefined){
            if (sqlOutput['rows'].length == 1){
                retVal = sqlOutput['rows'][0]
            }
            else{
                retVal = sqlOutput['rows']   
            }
            return res.status(code).json(retVal)
            // if('format' == 'api'){                  
            // if('format' == 'verbose'){              return res.status(200).json(sqlOutput)}
            // if('format' == 'error'){                return res.status(500).json(sqlOutput)}
        }
        else{
            return res.status(code).json({'status':'unknown'})
        }
    }
    if (code == 204){
        return res.status(code).end()
    }
}
module.exports = comms_utils