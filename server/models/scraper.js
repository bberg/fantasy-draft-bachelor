var path = require('path');
var log = require(path.join(__dirname, '../', '../', 'log'));
var dbUtils = require(path.join(__dirname, 'dbUtils'));
var https = require('https')
var http = require('http')
var request = require('request')
var cheerio = require('cheerio');
var fs = require('fs')
var lwip = require('lwip')


var scraper = {}

scraper.update = function scraper_update(req,res){
    scraper.get_cast_page(req,res,scraper.parse_cast_page)
}

scraper.get_cast_page = function get_cast_page(req,res,next){
    log.error("getting cast page")
    url = "http://abc.go.com/shows/the-bachelor/cast"
    // url = "www.w3schools.com/website/web_spa_homepage.asp"
    request(url, function(error,response,html){
        // log.error(response)
        if(error){
            log.error(error)
            return res.code(500).json(error)
        }
        else{
            return next(req,res,html,next)
        }
    })
}

scraper.parse_cast_page = function parse_cast_page(req,res,html){
    var $ = cheerio.load(html)
    people = []
    $('.tiles').children().each(function(i, elem) {
        img = $(this).find('.tablet-source').attr('srcset')
        url = $(this).find('a').attr('href')
        // log.error(url)
        if(url != undefined){
            name = url.split("/").pop()
            img = img.split(",")[1]
            img = img.split("\t").pop()
            img = img.split(" ")[0]
            log.error(name)
            log.error(img)
            
            people.push({"name":name,"img_url":img})
        }
    });
    scraper.get_images(req,res,people,0)
}

scraper.get_images = function get_images(req,res,people,i){
    if (i >= people.length){
        scraper.analyze_images_for_bw(req,res,people,0) 
        return
    }
    obj = people[i]
    var dir = path.join(__dirname, '../','img', obj.name+'.jpg')
    file = fs.createWriteStream(dir)
    var request = http.get(obj.img_url, function(response) {
        response.pipe(file);
        scraper.get_images(req,res,people,i+1)
    });
}

scraper.image_analysis_listing = function image_analysis_listing(req,res,i,people,bw_analysis_outcome_object){
    
    if (bw_analysis_outcome_object.bw_outcome == true){
        eliminated_update_val = true
    }
    else{
        eliminated_update_val = false
    }
    people[i]['eliminated'] = eliminated_update_val
    log.error('image_analysis_listing' + i + people[i])
    dbUtils.insert_or_update_by_object(people[i],'lu_contestants','name')
    scraper.analyze_images_for_bw(req,res,people,i+1)
}

scraper.analyze_images_for_bw = function analyze_images_for_bw(req,res,people,i){
    if (i  >= people.length){
        return scraper.cleanup_non_contestants(req,res,people)
    }
    obj = people[i]
    dir = path.join(__dirname, '../','img', obj.name+'.jpg')
    bw_analysis_outcome_object = scraper.check_image_bw_color(req,res,i,people,obj,dir,25,80,scraper.image_analysis_listing)
}

scraper.cleanup_non_contestants = function cleanup_non_contestants(req,res,people){
    var commands = [
        "DELETE FROM lu_contestants WHERE (name = 'chris-harrison' OR name = 'ben-higgins')",
        "SELECT * FROM lu_contestants"
    ]
    dbUtils.sequential_sql(req,res,commands,0)

}

// this is crude...
scraper.check_image_bw_color = function check_image_bw_color(req,res,index_pass_through,people,person_object,img_dir,pct_pixels_to_analyze,threshold_pct,next){
    log.error(img_dir)
    image = lwip.open(img_dir,function(err, image){
      // check err...
      // define a batch of manipulations and save to disk as JPEG:
        width = image.width()
        height = image.height()
        n_pixels_to_analyze = width*height*(pct_pixels_to_analyze/100)

        bw_pixel_analysis = []
        bw_pixel_count = 0

        i = 0
        while (i < n_pixels_to_analyze){
            pixelW = Math.floor(Math.random(0,1)*width)
            pixelH = Math.floor(Math.random(0,1)*width)
            // log.debug("analyzing pixels: "+pixelW+" "+pixelH)
            color = image.getPixel(pixelW,pixelH)
            if ((color.r == color.g) && (color.r == color.b)){
                bw_pixel_analysis.push(true)
                bw_pixel_count = bw_pixel_count+1
            }
            else{
                bw_pixel_analysis.push(false)
            }
            i = i+1
        }
        log.debug('bw_pixel_analysis: '+bw_pixel_analysis)
        pct_pixels_bw = Math.floor((bw_pixel_count/n_pixels_to_analyze)*100)
        if(pct_pixels_bw > threshold_pct){
            bw_outcome = true
        }
        else{
            bw_outcome = false
        }
        result = {"bw_outcome":bw_outcome,"threshold_pct":threshold_pct,"pct_pixels_bw":pct_pixels_bw,"bw_pixel_count":bw_pixel_count,"n_pixels_to_analyze":n_pixels_to_analyze}
        log.error(result)
        return next(req,res,index_pass_through,people,result)
    })
}


scraper.setup = function setup(req,res){
    var setupCommands = [
        "DROP TABLE IF EXISTS lu_users;"
        ,"CREATE TABLE lu_users (user_id SERIAL, time_created timestamp DEFAULT localtimestamp NOT NULL, name VARCHAR(256));"
        ,"DROP TABLE IF EXISTS lu_contestants;"
        ,"CREATE TABLE lu_contestants (contestant_id SERIAL, time_created timestamp DEFAULT localtimestamp NOT NULL, name VARCHAR(256), eliminated boolean, img_url varchar(1024));"
        ,"DROP TABLE IF EXISTS rel_users_contestants"
        ,"CREATE TABLE rel_users_contestants (did SERIAL, time_created timestamp DEFAULT localtimestamp NOT NULL, user_id INT, contestant_id INT, rank INT)"
    ]
    dbUtils.sequential_sql(req,res,setupCommands,0)
}

scraper.dummy_data = function dummy_data(req,res){
    var dummy_data_commands = [
        "INSERT INTO lu_users (name) VALUES ('ben')"
        ,"INSERT INTO lu_users (name) VALUES ('don')"
        ,"INSERT INTO lu_users (name) VALUES ('lainie')"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (1,1,1)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (1,2,2)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (1,3,3)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (2,3,1)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (2,2,2)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (2,1,3)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (3,1,1)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (3,2,2)"
        ,"INSERT INTO rel_users_contestants (user_id, contestant_id,rank) VALUES (3,3,3)"
    ]
    dbUtils.sequential_sql(req,res,dummy_data_commands,0)
}

module.exports = scraper