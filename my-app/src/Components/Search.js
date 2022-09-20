import React, {useState} from 'react'
import titlepicture from '../assets/images/weather/02d.svg'
import Axios from 'axios'
import './Search.css'
import RcIf from 'rc-if'
import {Tabs, Tab} from 'react-bootstrap'
import Highcharts from 'highcharts'
import more from 'highcharts/highcharts-more'
import draggable from 'highcharts/modules/draggable-points'
import HighchartsReact  from 'highcharts-react-official'
import windbarb from 'highcharts/modules/windbarb'


function Search() {
    const [state, setstate] = useState({
        street:'',
        city:'',
        state:'Select State',}
    )
    
    const [checked, setchecked] = useState(false)
    const geo_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + state.street.split(' ').join('+') + ',' + state.city.split(' ').join('+') + state.state +'&key=AIzaSyCb8YZ48nreVDsgIuhMwpudMeqmbC8nsvw'
    const ip_url = 'https://ipinfo.io/?token=1e0ade3f97e21f'

    const [resData, setresData] = useState([])

    const [submitted, setsubmitted] = useState(false)
    //const [istomorrow, setistomorrow] = useState(false)
    const [isGeo, setisGeo] = useState(true)
    const [isProgress, setisProgress] = useState(false)
    const [isPbar, setisPbar] = useState(false)
    const [key, setkey] = useState(1)
    const [latlng, setlatlng] = useState({lat:0, lng:0})

    const handleChange = event => {
        const{name, value} = event.target;
        setstate({
            ...state,
            [name] : value
        });
    }

    function handleSelect(key){
        setkey(key)
    }

    function dateToText(date){
        if(date == null){
            return ""
        }
        date = new Date(date)
        const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec"];
        var w = ["Sunday","Monday","Tuseday","Wednesday","Thursday","Friday","Saturday"];
        var mn = date.getMonth();
        var wn = date.getDay();
        var dn = (Array(2).join("0") + date.getDate()).slice(-2); 
        return w[wn] + ", "+ dn +" " +m[mn]+" "+date.getFullYear();
    }

    function codeToStr(code){
        var dict = {
            "a4201": "Heavy Rain",
            "a4001": "Rain",
            "a4200": "Light Rain",
            "a6201": "Heavy Freezing Rain",
            "a6001": "Freezing Rain",
            "a6200": "Light Freezing Rain",
            "a6000": "Freezing Drizzle",
            "a4000": "Drizzle",
            "a7101": "Heavy Ice Pellets",
            "a7000": "Ice Pellets",
            "a7102": "Light Ice Pellets",
            "a5101": "Heavy Snow",
            "a5000": "Snow",
            "a5100": "Light Snow",
            "a5001": "Flurries",
            "a8000": "Thunderstorm",
            "a2100": "Light Fog",
            "a2000": "Fog",
            "a1001": "Cloudy",
            "a1102": "Mostly Cloudy",
            "a1101": "Partly Cloudy",
            "a1100": "Mostly Clear",
            "a1000": "Clear Sunny",
          };
          return dict['a' + code];
    }

    function codeToSrc(obj){
        if(obj["weatherCode"] === 1100 || obj["weatherCode"] === 1000 || obj["weatherCode"] === 1101){
            const date1 = new Date(obj['startTime'])
            let hours = date1.getHours();
            if(hours >= 6 && hours < 18){
                return 'weather/' + obj["weatherCode"] + '_1.svg';
            }
            else{
                return 'weather/' + obj["weatherCode"] + '_2.svg';
            }     
        }
        return 'weather/' + obj["weatherCode"] + '.svg';
    }

    const check_method = event =>{
        setchecked(!checked);
    }

    const clear_method = event =>{
        event.preventDefault()
        setstate({street:'',city:'',state:'Select State'})
        setsubmitted(false)
        setisGeo(true)
        setisProgress(false)
        setisPbar(false)
        setisDetail(false)
        setkey(1)
        setchecked(false)
    }


    const onSubmit = event => {
        event.preventDefault()
        setsubmitted(true)
        setisProgress(true)
        if(!checked){
            Axios.get(geo_url,{
                street: state.street,
                city: state.city,
                state: state.state
            })
            .then(res => {
                //geocoding api return status
                //console.log(res.data.status)
                //if pass, extract the lat lng, send to the back to call tomorrow api
                if (res.data.status === 'OK'){
                    //setisGeo(true)
                    var lat = res.data.results[0].geometry.location.lat
                    var lng = res.data.results[0].geometry.location.lng
                    setlatlng({lat:lat, lng:lng})
                    //console.log(lat, lng)
                    const options ={
                        method: 'GET',
                        url: 'https://weather-app-backend-359513.wl.r.appspot.com/results',
                        params: {lat: lat, lng: lng}
                    }
                    Axios.request(options).then((response) => {
                        setisProgress(false)
                        setisPbar(true)
                        setresData(response.data.result)
                        //console.log(response.data.result) // list of dictionaries
                    })   
                }
                else{
                    setisGeo(false)
                }    
            }, error =>{
                console.log(error)
            })
        }
        else if(checked){
            Axios.get(ip_url).then(res => {   
               // setisGeo(true)  
                setstate({street:'',city:res.data.city, state:res.data.region})
                //console.log(res.data.city)
                var lat = res.data.loc.split(',')[0]
                var lng = res.data.loc.split(',')[1]
                setlatlng({lat:lat, lng:lng})
                //console.log(lat,lng)
                const options ={
                    method: 'GET',
                    url: 'https://weather-app-backend-359513.wl.r.appspot.com/results',
                    params: {lat: lat, lng: lng}
                }
                Axios.request(options).then((response) => { 
                    setisProgress(false)
                    setisPbar(true)
                    setresData(response.data.result)
                })
                
            }, error => {
                setisGeo(false)
                console.log(error)
            })
        }
        
    }
    
    // const [backendData, setbackendData] = useState([{}])
    /*useEffect(() =>{
        fetch("/api").then(
            response => response.json()
        ).then(
            data =>{
                //console.log(data)
                setbackendData(data)
            }
        )
    })*/
    //console.log(resData)

    //Highcharts Daily implementation
    if(typeof Highcharts === 'object'){
        more(Highcharts)
        draggable(Highcharts)
        windbarb(Highcharts)
    }
    const input_list = resData

    function getDailyList(input_list){
        const result_list = []
        for(let i of input_list){
            const item_list = []
            item_list[0] = Date.parse(i['startTime'])
            item_list[1] = i['temperatureMin']
            item_list[2] = i['temperatureMax']
            result_list.push(item_list)
        }
        //console.log(result_list)
        return result_list
    }

    //Highcharts meteo implementation
    const meteo_list = resData

    function getTemperatureList(input_list){
        const result_list = []
        for (let i of input_list){
            const item_dict = {}
            item_dict['x'] = Date.parse(i['startTime'])
            item_dict['y'] = i['temperature']
            result_list.push(item_dict)
        }
        return result_list
    }

    function getPressuresList(input_list){
        const result_list = []
        for (let item of input_list) {
            var item_dict = {};
            item_dict['x'] = Date.parse(item['startTime'])
            item_dict['y'] = item['pressureSeaLevel']
            result_list.push(item_dict)
        }
        return result_list
    }

    function getHumidityList(input_list){
        const result_list = []
        for (let item of input_list) {
            var item_dict = {}
            item_dict['x'] = Date.parse(item['startTime'])
            item_dict['y'] = item['humidity']
            result_list.push(item_dict)
        }
        return result_list;
    }

    function getWindList(input_list){
        const result_list = []
        for (let item of input_list) {
              var item_dict = {};
              item_dict['x'] = Date.parse(item['startTime']);
              item_dict['value'] = item['windSpeed'];
              item_dict['direction'] = item['windDirection'];
              result_list.push(item_dict);
        }
        return result_list;
    }
    //console.log(meteo_list)

    //details page
    const [isDetail, setisDetail] = useState(false)

    const to_detail = event =>{
        event.preventDefault()
        setisDetail(true)
    }

    const return_to_list = event =>{
        event.preventDefault()
        setisDetail(false)
    }
    //console.log(isDetail)
    //console.log(resData)

    //Google Map
    //console.log(latlng)
    function toGooglesrc(lat,lng){
        return 'https://www.google.com/maps/embed/v1/place?key=AIzaSyCb8YZ48nreVDsgIuhMwpudMeqmbC8nsvw&center='+lat+','+lng+'&zoom=17&q=' +lat+','+lng
    }
    //console.log(toGooglesrc(latlng.lat,latlng.lng))
    //console.log(isGeo,submitted,isPbar)
    return(
        <div>
            <div id='outerbox' className='container mt-5 mb-4' style={{backgroundColor:'#F5F5F5'}}>
                <br/>
                <div style={{width: '100%', height: '50px'}}>
                    <div style= {{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <h3 style={{fontSize: 'x-large', fontWeight: 'bolder'}}>Weather Search</h3>
                        <img src={titlepicture} alt='logo near title' style={{width: '30px', height: '30px'}}/>
                    </div>
                </div>
                <form id='searchform' className='form-horizontal' style={{width: '100%', paddingTop: '20px'}} onSubmit={onSubmit}>
                    <div className='form-group row justify-content-left align-items-baseline required'>
                        <label htmlFor='street' className='control-label col-sm-2 offset-sm-1'>Street</label>
                        <div className='col-sm-6'>
                            <input id='street' name='street' className='form-control' type='text' value={state.street} onChange={handleChange} disabled={checked} placeholder='Enter Street Please'/>
                        </div>
                    </div>
                    <div className='form-group row justify-content-left align-items-baseline required'>
                        <label htmlFor='city' className='control-label col-sm-2 offset-sm-1'>City</label>
                        <div className='col-sm-6'>
                            <input id='city' name='city' className='form-control' type='text' value={state.city} onChange={handleChange} disabled={checked} placeholder='Enter City Please'/>
                        </div>
                    </div>
                    <div className='form-group row justify-content-left align-items-baseline required'>
                        <label htmlFor='State' className='control-label col-sm-2 offset-sm-1'>State</label>
                        <div className='col-sm-3'>
                            <select id='state' name='state' className='form-control' value={state.state} disabled={checked} onChange={handleChange} required>
                                <option disabled value="Select State">Select State</option>
                                <option value="AL">Alabama</option>
                                <option value="AK">Alaska</option>
                                <option value="AZ">Arizona</option>
                                <option value="AR">Arkansas</option>
                                <option value="CA">California</option>
                                <option value="CO">Colorado</option>
                                <option value="CT">Connecticut</option>
                                <option value="DE">Delaware</option>
                                <option value="DC">District Of Columbia</option>
                                <option value="FL">Florida</option>
                                <option value="GA">Georgia</option>
                                <option value="HI">Hawaii</option>
                                <option value="ID">Idaho</option>
                                <option value="IL">Illinois</option>
                                <option value="IN">Indiana</option>
                                <option value="IA">Iowa</option>
                                <option value="KS">Kansas</option>
                                <option value="KY">Kentucky</option>
                                <option value="LA">Louisiana</option>
                                <option value="ME">Maine</option>
                                <option value="MD">Maryland</option>
                                <option value="MA">Massachusetts</option>
                                <option value="MI">Michigan</option>
                                <option value="MN">Minnesota</option>
                                <option value="MS">Mississippi</option>
                                <option value="MO">Missouri</option>
                                <option value="MT">Montana</option>
                                <option value="NE">Nebraska</option>
                                <option value="NV">Nevada</option>
                                <option value="NH">New Hampshire</option>
                                <option value="NJ">New Jersey</option>
                                <option value="NM">New Mexico</option>
                                <option value="NY">New York</option>
                                <option value="NC">North Carolina</option>
                                <option value="ND">North Dakota</option>
                                <option value="OH">Ohio</option>
                                <option value="OK">Oklahoma</option>
                                <option value="OR">Oregon</option>
                                <option value="PA">Pennsylvania</option>
                                <option value="RI">Rhode Island</option>
                                <option value="SC">South Carolina</option>
                                <option value="SD">South Dakota</option>
                                <option value="TN">Tennessee</option>
                                <option value="TX">Texas</option>
                                <option value="UT">Utah</option>
                                <option value="VT">Vermont</option>
                                <option value="VA">Virginia</option>
                                <option value="WA">Washington</option>
                                <option value="WV">West Virginia</option>
                                <option value="WI">Wisconsin</option>
                                <option value="WY">Wyoming</option>
                            </select>
                        </div>
                    </div>

                    <div className='form-group row justify-content-left align-items-baseline'>
                        <hr className='col-sm-7 offset-sm-2 control-label' style={{border:'none',borderTop:'2px solid #c6cacc'}}></hr>
                    </div>

                    <div className="form-group row justify-content-left align-items-center">
                        <label className="col-sm-2 offset-sm-2 mb-4 control-label">Auto-detect location</label>
                        <div className="col-sm-6 row" style={{marginTop:'8px'}}>
                            <input type="checkbox" className="form-control mb-4" checked={checked} onChange={check_method} style={{width:'15px',height:'15px',marginLeft:'5%'}}/>
                            <span style={{marginTop:'2px'}}>&nbsp;&nbsp;Current Location</span>
                        </div>
                    </div>
                    <div className="form-group row justify-content-left align-items-center">
                        <div className="control-label col-sm-4 mb-4">
                            <button type="submit" className="btn btn-primary">
                            <i className="glyphicon glyphicon-search"></i> Search</button>
                            &nbsp;&nbsp;&nbsp;
                            <button className="btn" onClick={clear_method} style={{backgroundColor: 'white', color: 'rgb(113, 113, 113)', border: '1px solid', borderColor: 'black'}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list-nested" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4.5 11.5A.5.5 0 0 1 5 11h10a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm-2-4A.5.5 0 0 1 1 3h10a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5z"/>
                                </svg> Clear</button>
                        </div>
                    </div>
                </form>
            </div>

            
            {/* <div>
                <p>123</p>
                {(typeof backendData.users == 'undefined') ? (
                    <p>Loading...</p>
                ):(
                    backendData.users.map((user, i) =>(
                        <p key={i}>{user}</p>
                    ))
                )}
            </div> */}
            
            {/* {submitted && isGeo && <div class="d-flex" style="justify-content:center;">
                <button type="submit" class="btn" [ngStyle]="{'color': IsResults ? '#FFFFFF' : '#428bca'}" [ngClass]="{'btn-primary':IsResults}" (click)="Result()">Results</button>
                <div style="width: 3%;"></div>
                <div class="progress" style="margin-left: 25%; margin-top: 40px; margin-right: 25%;"  *ngIf="IsSelect && IsResults && ISProgress && ISHProgress">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100" style="width: 35%"></div>
                </div>} */}
            <RcIf if={submitted && isGeo && isProgress}>
                    <div className="progress" style={{marginLeft: '25%', marginTop: '40px', marginRight: '25%'}}>
                        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100" style={{width: '35%'}}></div>
                    </div>
            </RcIf>
            <RcIf if={submitted && !isGeo}>
                    <div style={{justifyContent:'center', marginLeft:'40px', marginRight:'45px', marginTop:'40px'}}>
                        <div className="alert alert-danger">An error occured please try again later</div>
                    </div>
            </RcIf>
            <RcIf if={submitted && isGeo && isPbar && !isDetail}>
                {/* <div className="d-flex" style={{justifyContent: 'center'}}>
                    <button type="submit" className="btn btn-primary" style={{color: 'white',fontFamily:'Roboto'}}>Results</button>
                    <div style={{width: '3%'}}></div>
                </div> */}
                <div style={{textAlign:'center', marginTop: '40px', marginBottom: '10px',marginRight:'50px'}}>
                    <h1 style={{fontWeight:'700',fontFamily:'Lato',fontSize:'28px'}}>Forecast at {state.city}, {state.state}</h1>
                </div>
                <div className="d-flex" style={{justifyContent: 'flex-end', marginRight:'5%'}}>
                    <a className="btn" href="# " onClick={to_detail} style={{width: '70px', height: '30px', paddingRight: '112px', color: 'darkgrey', fontFamily:'Lato',fontSize:'15px',fontWeight:'600'}}>Today's Details ＞</a>
                </div>
                <br></br>
                <div className="d-flex" style={{justifyContent: 'flex-end', paddingTop: '5px', marginRight:'5%'}}>
                <Tabs activeKey={key} onSelect={handleSelect} id="controlled-tab" style={{fontFamily:'Lato',fontSize:'15px',fontWeight:'600',color: '#2596be'}}>
                    <Tab eventKey={1} title="Day View"></Tab>
                    <Tab eventKey={2} title="Daily Temp. Chart"></Tab>
                    <Tab eventKey={3} title="Meteogram"></Tab>
                </Tabs>
                </div> 
                <RcIf if={key == 1}>
                    <br></br>
                    <div style={{paddingLeft: '5%', paddingRight: '5%'}}>
                        <table className='table' style={{fontFamily:'Lato', fontSize:'15px',fontWeight:'500'}}>
                            <thead>
                            <tr>
                                <th style={{width: '100px'}}>#</th>
                                <th style={{width: '200px'}}>Date</th>
                                <th>Status</th>
                                <th>Temp.High(°F)</th>
                                <th>Temp.Low(°F)</th>
                                <th>Wind Speed(mph)</th>
                            </tr>
                            </thead>
                            {
                            resData.map((val,index) => 
                            <tbody key={index}>
                                <tr>
                                    <td>{index+1}</td>
                                    <td>{dateToText(val.startTime)}</td>
                                    <td><img alt='something' src={codeToSrc(val)} style={{width: '30px',height: '30px'}}></img>{codeToStr(val.weatherCode)}</td>
                                    <td>{val.temperatureMin}</td>
                                    <td>{val.temperatureMax}</td>
                                    <td>{val.windSpeed}</td>
                                </tr>
                            </tbody>
                            )}
                            
                        </table>
                    </div>
                </RcIf>
                <RcIf if={key == 3}>
                    <div id='container_meteogram'>
                    <HighchartsReact
                        highcharts = {Highcharts}
                        constructorType ={'chart'}
                        options={{
                            chart: {
                                marginBottom: 70,
                                marginRight: 80,
                                marginLeft: 80,
                                marginTop: 50,
                                height: 500,
                                plotBorderWidth: 1,
                                alignTicks: false,
                                scrollablePlotArea: {
                                  minWidth: 900,
                                  scrollPositionX: 1
                                }
                              },
                              title: {
                                text: 'Daily Weather Details (Wind Speed, Humidity, Temperature)',
                                align: 'center',
                            },
                            accessibility:{
                                enabled: false
                            },
                            credits: {
                                text: 'Forecast',
                                position: {
                                    x: -90
                                }
                            },
                      
                            tooltip: {
                                shared: true,
                                useHTML: true,
                                headerFormat:
                                    '<small>{point.x:%A, %b %e}</small><br>' +
                                    '<b>{point.point.symbolName}</b><br>'
                            },
                      
                            xAxis: [{
                                type: 'datetime',
                                tickInterval: 0* 36e5, // two hours
                                minorTickInterval: 0* 36e5, // one hour
                                tickLength: 0,
                                gridLineWidth: 0,
                                gridLineColor: 'rgba(128, 128, 128, 0.1)',
                                startOnTick: false,
                                endOnTick: false,
                                minPadding: 0,
                                maxPadding: 0,
                                offset: 0,
                                showLastLabel: true,
                                labels: {
                                     enabled: false
                                },
                                crosshair: true
                            }, { // Top X axis
                                linkedTo: 0,
                                type: 'datetime',
                                tickInterval: 0,
                                labels: {
                                    format: '{value:<span style="font-size: 14px; font-weight: bold">%a</span> %b %e}',
                                    align: 'left',
                                    x: -10,
                                    y: -5,
                                    enabled:false
                                },
                                opposite: true,
                                tickLength: 0,
                                gridLineWidth: 0
                            }],
                      
                            yAxis: [{ // temperature axis
                                title: {
                                    text: null
                                },
                                labels: {
                                    format: '{value}°',
                                    style: {
                                        fontSize: '10px'
                                    },
                                    x: -3
                                },
                                plotLines: [{ // zero plane
                                    value: 0,
                                    color: '#BBBBBB',
                                    width: 1,
                                    zIndex: 2
                                }],
                                maxPadding: 0.3,
                                minRange: 8,
                                tickInterval: 1,
                                gridLineColor: 'rgba(128, 128, 128, 0.1)'
                            }, { // precipitation axis
                                title: {
                                    text: null
                                },
                                labels: {
                                    enabled: false
                                },
                                gridLineWidth: 0,
                                tickLength: 0,
                                minRange: 10,
                                min: 0
                            }, { // Air pressure
                                allowDecimals: false,
                                title: { // Title on top of axis
                                    text: 'hPa',
                                    offset: 0,
                                    align: 'high',
                                    rotation: 0,
                                    style: {
                                        fontSize: '10px',
                                        color: Highcharts.getOptions().colors[3]
                                    },
                                    textAlign: 'left',
                                    x: 3
                                },
                                labels: {
                                    style: {
                                        fontSize: '8px',
                                        color: Highcharts.getOptions().colors[3]
                                    },
                                    y: 2,
                                    x: 3
                                },
                                gridLineWidth: 0,
                                opposite: true,
                                showLastLabel: false
                            }],
                      
                            legend: {
                                enabled: false
                            },
                      
                            plotOptions: {
                                series: {
                                    pointPlacement: 'between'
                                }
                            },
                      
                            series: [{
                                name: 'Temperature',
                                data: getTemperatureList(meteo_list),
                                type: 'spline',
                                marker: {
                                    enabled: false,
                                    states: {
                                        hover: {
                                            enabled: true
                                        }
                                    }
                                },
                                tooltip: {
                                    pointFormat: '<span style="color:{point.color}">\u25CF</span> ' +
                                        '{series.name}: <b>{point.y}°F</b><br/>'
                                },
                                zIndex: 1,
                                color: '#FF3333',
                                negativeColor: '#48AFE8'
                            },  {
                                name: 'Humidity',
                                data: getHumidityList(meteo_list),
                                type: 'column',
                                color: 'LightSkyBlue',
                                yAxis: 1,
                                groupPadding: 0,
                                pointPadding: 0,
                                grouping: false,
                                dataLabels: {
                                    enabled: true,
                                    filter: {
                                        operator: '>',
                                        property: 'y',
                                        value: 0
                                    },
                                    style: {
                                        fontSize: '10px',
                                        color: 'black'
                                    }
                                },
                                tooltip: {
                                    valueSuffix: ' %'
                                }
                            }, {
                                name: 'Air pressure',
                                color: Highcharts.getOptions().colors[3],
                                data: getPressuresList(meteo_list),
                                marker: {
                                    enabled: false
                                },
                                shadow: false,
                                tooltip: {
                                    valueSuffix: ' inHg'
                                },
                                dashStyle: 'shortdot',
                                yAxis: 2
                            }, {
                                name: 'Wind',
                                type: 'windbarb',
                                id: 'windbarbs',
                                color: '#FF3333',
                                lineWidth: 1.5,
                                data: getWindList(meteo_list),
                                vectorLength: 18,
                                yOffset: -15,
                                tooltip: {
                                    valueSuffix: ' mph'
                                }
                            }]
                        }}
                        />
                    </div>
                    <br></br><br></br><br></br><br></br><br></br><br></br>
                </RcIf>
                <RcIf if={key == 2}>
                <div id='container_daily'>
                    <HighchartsReact
                        highcharts = {Highcharts}
                        constructorType ={'chart'}
                        options={{
                            chart: {
                                marginRight: 90,
                                marginLeft: 90,
                                marginTop: 40,
                                height: 600,
                                type: 'arearange',
                                zoomType: 'x',
                                scrollablePlotArea: {
                                    minWidth: 600,
                                    scrollPositionX: 1
                                }
                            },
                            title:{
                                text:'Daily Temperature Ranges (Min,Max)'
                            },
                            legend:{
                                enabled: false
                            },
                            xAxis:{
                                title:{
                                    text:'Date'
                                },
                                type: 'datetime'
                            },
                            credits: {
                                position: {
                                    x: -90
                                }
                            },
                            yAxis:{
                                title:{
                                    text: 'Temperature'
                                },
                                min:35
                            },
                            tooltip: {
                                crosshairs: true,
                                shared: true,
                                valueSuffix: '°F',
                                xDateFormat: '%A, %b %e'
                            },
                            accessibility:{
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                  fillColor: {
                                    linearGradient: [0, 0, 0, 450],
                                    stops: [
                                      [0, 'orange'],
                                      [1, Highcharts.color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                                    ]
                                  }
                                }
                              },
                            series:[
                                {
                                    name:'Temperatures',
                                    data:getDailyList(input_list),
                                    type:'arearange',
                                    // dragDrop: {
                                    //     draggableY: true,
                                    //     draggableHigh: true,
                                    //     draggableLow: true
                                    //   },
                                    //lineWidth: 0,
                                    linkedTo: ":previous",
                                    //color: "lightBlue",
                                    ///fillOpacity: 0.3,
                                    //zIndex: 0,
                                    marker: {
                                       enabled: false
                                    }
                                } 
                            ]
                        }}
                        />
                    </div>
                    <br></br><br></br><br></br><br></br><br></br><br></br>
                </RcIf>
            </RcIf>
            <RcIf if={submitted && isGeo && isPbar && isDetail}>
                <div className="d-flex" style={{textAlign: 'center', width: '100%'}}>
                    <div className="d-flex flex-row" style={{justifyContent:'center', width: '100%'}}>
                        <h3 style={{fontWeight:'700',fontFamily:'Lato',fontSize:'28px'}}>{dateToText(resData[0] ? resData[0].startTime : [])}</h3>
                    </div>
                </div>
                <div className="d-flex" style={{justifyContent: 'flex-start', paddingTop: '5px', marginLeft:'5%'}}>
                        <a className="btn" href="# " onClick={return_to_list} style={{width: '70px', height: '30px',paddingRight: '112px', color: 'darkgrey', fontFamily:'Lato',fontSize:'15px',fontWeight:'600'}}>＜ Back to Weather List</a>
                    </div>
                <br></br>
                <div style={{marginLeft:'5.8%',marginRight:'5.8%'}}>
                    <table className="table table-striped" style={{fontSize: '16px',fontFamily:'Roboto'}}>
                        <tbody>
                            <tr>
                                <th>Status</th>
                                <th style={{fontWeight:'400'}}>{codeToStr(resData[0] ? resData[0].weatherCode : [])}</th>
                            </tr>
                            <tr>
                                <th>Max Temperature</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].temperatureMax : []}°F</th>
                            </tr>
                            <tr>
                                <th>Min Temperature</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].temperatureMin : []}°F</th>
                            </tr>
                            <tr>
                                <th>Apparent Temperature</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].temperatureApparent : []}°F</th>
                            </tr>
                            <tr>
                                <th>Sun Rise Time</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].sunriseTime.substr(11,8) : []}</th>
                            </tr>
                            <tr>
                                <th>Sun Set Time</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].sunsetTime.substr(11,8) : []}</th>
                            </tr>
                            <tr>
                                <th>Humidity</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].humidity : []} %</th>
                            </tr>
                            <tr>
                                <th>WindSpeed</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].windSpeed : []} mph</th>
                            </tr>
                            <tr>
                                <th>Visibility</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].visibility : []} mi</th>
                            </tr>
                            <tr>
                                <th>CloudCover</th>
                                <th style={{fontWeight:'400'}}>{resData[0] ? resData[0].cloudCover : []} %</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{marginLeft:'5.8%',marginRight:'5.8%'}}>
                    <iframe title='myframe' style={{width:'100%', height:'800px'}} src={toGooglesrc(latlng.lat,latlng.lng)}></iframe>   
                </div>
                <br></br><br></br><br></br><br></br><br></br><br></br>
            </RcIf>
        </div>
    )
}

export default Search