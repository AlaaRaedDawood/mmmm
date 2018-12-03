const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()
var pg = require("pg");
var connectionString = "postgres://root:123@db:5432/myapp";

const apiKey = '013d2d7c9d47f4a5b3b3221c0d541b34';

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
})


app.get('/sp', function (req, res, next) {
  pg.connect(connectionString,function(err,client,done) {
     if(err){
         console.log("not able to get connection "+ err);
         res.status(400).send(err);
     } 
     client.query('SELECT * FROM Weather',function(err,result) {
         done(); // closing the connection;
         if(err){
        //  res.render('history', {weather: null, error: 'Error, please try again'});
             console.log(err);
             res.status(400).send(err);
         }
         res.status(200).send(result.rows);
        // else{
         
         
           
        //   let data =(result.rows);
        //   let datatext=`It's ${data.city} degrees in ${data.weather}!`;
        //   res.render('history',data);

         
         
         
         
        // }
     });
  });
});



app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = JSON.parse(body)
      if(weather.main == undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        pg.connect(connectionString,function(err,client,done) {
         
          client.query( ' INSERT into weather ( city, weather) VALUES($1, $2)',
          [weather.name, weather.main.temp] , 
          function(err,result) {
              done(); // closing the connection;
              if(err){
                  console.log(err);
                  res.status(400).send(err);
              }
           
          });
          

         

          client.query( 'select * from weather',
         
          function(err,result) {
              done(); // closing the connection;
              if(err){
                  console.log(err);
                  res.status(400).send(err);
              }
              
                
              var data=result.rows;
                console.log(result.rows[2]);
            
              
                 
           
          });




       });




        res.render('index', {weather: weatherText, error: null});




      }
    }
  });
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
