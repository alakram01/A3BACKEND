Readme 
Starting Sever

node add nodemon
npm start
Few things to check if there is an issue while connecting backend with frontend
check CORS: npm i cors
check for express installation :npm install express
Make sure you install knex if there is an issue with database connection
check :https://knexjs.org/guide/#node-js
npm install knex --save
and then install postgres database query builder : npm install pg
Remember: I am using psql for my database: so install form EDB and use pgadmin to manage it.
Testing
Check in package.json for test: "jest --coverage"
For unit testing: npm test


