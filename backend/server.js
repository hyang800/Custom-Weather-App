const express = require('express');
const cors = require("cors");
const axios = require('axios');
const app = express();
app.use(cors());

//app.use(express.static(__dirname + '/public'));
//app.get('/public/favicon.ico', (req, res) => res.status(204).end());
app.get('/', (req, res) => {
    res.send('Hello from App Engine!');
  });
app.get('/results', (req, res) => {
    const lat_lng_dict = {'lat':req.query.lat, 'lng':req.query.lng}
    const options = {
        method: 'GET',
        url:'https://api.tomorrow.io/v4/timelines?location='+ req.query.lat +','+ req.query.lng +'&fields=weatherCode,temperatureMin,temperatureMax,windSpeed,temperature,temperatureApparent,sunriseTime,sunsetTime,humidity,visibility,cloudCover&timesteps=1d&units=imperial&timezone=America/Los_Angeles&apikey=xxxxxxxxxxxxxxxx'
    }
    axios.request(options).then((response) => {
        var result_list = [];
        var body = response.data.data.timelines[0].intervals;
        for (let item of body){
            var item_json = item['values'];
            item_json['startTime'] = item['startTime'];
            item_json['temperatureMin'] = Math.round(item_json['temperatureMin'] * 100) / 100;
            item_json['temperatureMax'] = Math.round(item_json['temperatureMax'] * 100) / 100;
            item_json['temperature'] = Math.round(item_json['temperature']);
            item_json['windSpeed'] = Math.round(item_json['windSpeed'] * 100) / 100;
            item_json['temperatureApparent'] = Math.round(item_json['temperatureApparent'] * 100) / 100;
            item_json['sunriseTime'] = item_json['sunriseTime'];
            item_json['sunsetTime'] = item_json['sunsetTime'];
            item_json['humidity'] = Math.round(item_json['humidity'] * 100) / 100;
            item_json['visibility'] = Math.round(item_json['visibility'] * 100) / 100;
            item_json['cloudCover'] = Math.round(item_json['cloudCover'] * 100) / 100;
            result_list.push(item_json);
        }
        res.json({'result':result_list, 'lat_lng': lat_lng_dict})
    }).catch((error) => {
        console.error(error)
    })
    ///res.json(req.query.lat)
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, function(){
    console.log(`Server listening on port ${PORT}...`);
});

module.exports = app;
