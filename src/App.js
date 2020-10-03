import React,{useState,useEffect} from 'react';
import {FormControl,Select,MenuItem, Card,CardContent} from '@material-ui/core';
import InfoBox from './InfoBox';
import Table from './Table';
import Map from './Map';
import Linegraph from './LineGraph';
import {sortData,prettyPrintStat} from './util.js';
import './App.css';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries,setCountries]= useState([]);
  const [country,setCountry]= useState(['WorldWide']);
  const [countryInfo,setCountryInfo]=useState([]);
  const [tableData,setTableData]=useState([]);
  const [mapCenter,setMapCenter]=useState({lat:23.473324,lng:77.947998});
  const [mapZoom,setMapZoom]=useState([3]);
  const [mapCountries,setMapCountries]=useState([]);
  const [casesType,setCasesType]=useState(['cases']);
  const [countryName,setCountryName]=useState(['WorldWide']);


  useEffect(() => {
     fetch("https://disease.sh/v3/covid-19/all")
      .then((response)=>response.json())
      .then((data)=>{
        console.log("Datya check",data)
        setCountryInfo(data);
      }
      )
  }, [])

  useEffect(() => {

    const getCountriesData =async()=>{      
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=>response.json())
      .then((data)=>{
            const countries=data.map((country)=>(
                  {
                    name:country.country,
                    value:country.countryInfo.iso2
                  }
              )
            )
            console.log("countries",countries);
            const sortedData=sortData(data);
            setTableData(sortedData);
            setCountries(countries);
            setMapCountries(data);
      }
      )
    }

    getCountriesData();
    
  }, [])


  const getCountryInfo = async(event) =>{
    const countryCode=event.target.value;
    console.log("Yooo",countryCode);
    
    
    const URL=countryCode==='WorldWide'?'https://disease.sh/v3/covid-19/all':`https://disease.sh/v3/covid-19/countries/${countryCode}`

    console.log("URL",URL);
    await fetch(URL)
      .then((response)=>response.json())
      .then((data)=>{
            setCountryInfo(data);
            setCountry(countryCode);          
            
            if(!(countryCode==='WorldWide')){
              setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
              setMapZoom([4])
              setCountryName(data.country)
            }else{
              setMapCenter({lat:23.473324,lng:77.947998});              
              setMapZoom([0])
              setCountryName('WorldWide')
              
            }
            
      })
  }

  return (
    <div className="App">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid Tracker</h1>
          <FormControl className='app__dropdown' >
            <Select variant="outlined" value={country} onChange={getCountryInfo}>
            <MenuItem value="WorldWide">WorldWide
                  </MenuItem>
              {
                countries.map((country)=>(
                  <MenuItem value=
                  {country.value}>{country.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app_stats">
                <InfoBox onClick={e=>setCasesType('cases')} active={casesType=='cases'} isRed
                 title='CoronaVirus Casses' cases={prettyPrintStat(countryInfo.cases)} total={countryInfo.todayCases}/>
                <InfoBox onClick={e=>setCasesType('recovered')} active={casesType=='recovered'}
                title='Recoverd' cases={prettyPrintStat(countryInfo.recovered)} total={countryInfo.todayRecovered}/>
                <InfoBox onClick={e=>setCasesType('deaths')} active={casesType=='deaths'} isRed
                title='Death' cases={prettyPrintStat(countryInfo.deaths)} total={countryInfo.todayDeaths}/>
        </div>  

        <div className="app_map">
          <Map casesType={casesType}  countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
        </div>  
      </div>
      
      <Card className="app__right">
          <CardContent className='app__rtight_cardContent'>
              <h3>Live Case by Country</h3>
              <Table countries={tableData} />              
              <h3 className='app__graphtitle'>{countryName} {casesType}</h3>
              <Linegraph casesType={casesType} className='app__graph' />
          </CardContent>
      </Card>
    </div>
    
  );
}

export default App;
