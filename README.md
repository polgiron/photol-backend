# photol-backend

mongodb backup

mongodbdump

scp -r xxx:/home/pol/dump .

mongorestore --drop  ./mongodump

npx babel-node src/migrations/darkroom-settings-migration.js


###Restore mongo dump on docker

copy dump folder into the docker
docker cp ./mongodump photol-apipaulgironcom_photoldb_1:/mongodump

open docker bash
docker exec -it photol-apipaulgironcom_photoldb_1 bash

inside docker bash restore the db
mongorestore --drop  ./mongodump
