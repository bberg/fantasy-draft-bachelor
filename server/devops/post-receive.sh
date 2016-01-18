echo "stopping app!!!" >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log
/home/benashbe/webapps/fantasy_draft_bachelor/bin/forever stop fantasy_draft_bachelor_production  >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log
echo "copying updates" >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log
GIT_WORK_TREE=/home/benashbe/webapps/fantasy_draft_bachelor git checkout -f >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log
echo "starting app!!!" >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log
/home/benashbe/webapps/fantasy_draft_bachelor/bin/forever -a -l /home/benashbe/webapps/fantasy_draft_bachelor/logs/forever-log.log -e /home/benashbe/webapps/fantasy_draft_bachelor/logs/forever-error.log start --uid "fantasy_draft_bachelor_production" /home/benashbe/webapps/fantasy_draft_bachelor/app.js  >> /home/benashbe/webapps/fantasy_draft_bachelor/logs/app-management.log