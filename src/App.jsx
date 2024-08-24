import { useEffect, useRef, useState } from 'react'
import './App.css'
import * as d3 from "d3";
import * as topojson from 'topojson'

function ChloropethMap( {countiesDataset, educationDataset} ){
  const chloropethMapContainer = useRef(null)

  const colorPallete = ['#caf0f8', '#ade8f4', '#90e0ef', '#48cae4','#00b4d8', '#0077b6', '#03045e']

  useEffect(() => {
    if(!countiesDataset) return;
    if(!educationDataset) return;

    d3.select(chloropethMapContainer.current).selectAll('*').remove();

    const svg = d3.select(chloropethMapContainer.current)
    .append('svg')
    .attr('width', 1000)
    .attr('height', 1000);

    //tooltip
    const tooltip = d3.select('.chloropethMapContainer')
    .append('div')
    .attr('id','tooltip')

    //legend
    const xScale = d3.scaleLinear()
    .domain([d3.min(educationDataset, d => d.bachelorsOrHigher),d3.max(educationDataset, d => d.bachelorsOrHigher)])
    .range([0,100])

    const xAxis = d3.axisBottom(xScale)
    .ticks(8, 's')


    svg.append('g')
    .attr('transform',`translate(700,100)`)
    .call(xAxis);


    //state outlines
    svg.append('path')
    .datum(
      topojson.mesh(countiesDataset, countiesDataset.objects.states, function(a, b) {return a !== b;})
    )
    .attr('class','states')
    .attr('d', d3.geoPath())
    .attr('stroke', 'blue')
    .attr('fill', 'none')

    //counties
    svg.append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(topojson.feature(countiesDataset, countiesDataset.objects.counties).features)
    .enter()
    .append('path')
    .attr('class','county')
    .attr('data-fips', d => d.id)
    .attr('data-education', d => educationDataset.filter((county) => county.fips === d.id)[0].bachelorsOrHigher)
    .attr('d', d3.geoPath())
    .attr('fill', d => {
      const countyData = educationDataset.filter((county) => county.fips === d.id)[0]

      if(countyData.bachelorsOrHigher < 3){
        return colorPallete[0];
      }
      else if(countyData.bachelorsOrHigher < 12){
        return colorPallete[1];
      }
      else if(countyData.bachelorsOrHigher < 21){
        return colorPallete[2];
      }
      else if(countyData.bachelorsOrHigher < 30){
        return colorPallete[3];
      }
      else if(countyData.bachelorsOrHigher < 39){
        return colorPallete[4];
      }
      else if(countyData.bachelorsOrHigher < 48){
        return colorPallete[5];
      }
      else if(countyData.bachelorsOrHigher < 57){
        return colorPallete[6];
      }
      else {
        return colorPallete[7];
      }
    })
    .attr('stroke','none')
    .on('mouseover', (event, d) => {
      const countyData = educationDataset.filter((county) => county.fips === d.id)[0]


      tooltip
      .attr('data-education', countyData.bachelorsOrHigher)
      .style('left', event.pageX - 20 + 'px')
      .style('top', event.pageY - 500 + 'px')
      .style('opacity', 0.8)
      .html(`${countyData.area_name}, ${countyData.state}: ${countyData.bachelorsOrHigher}%`)
    })
    .on('mouseout', () => {
      tooltip
      .style('opacity', 0)
      .html('')
    })

  }, [countiesDataset])

  return(
    <>
      <h1 id='title'>United States Educational Attainment</h1>
      <h2 id='description'>Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)</h2>
      <div className='chloropethMapContainer' ref={chloropethMapContainer}></div>
    </>

  )
}

function App() {
  const countiesDatasetURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
  const [countiesDataset, setCountiesDataset] = useState()

  const educationDatasetURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
  const [educationDataset, setEducationDataset] = useState()


  useEffect(() => {
    Promise.all([
      fetch(countiesDatasetURL),
      fetch(educationDatasetURL)
    ])
    .then(response => 
      Promise.all(response.map(res => res.json()))
    )
    .then(data => {
      setCountiesDataset(data[0]);
      setEducationDataset(data[1]);
    })
  },[])

  return (
    <ChloropethMap countiesDataset={countiesDataset} educationDataset={ educationDataset }/>
  )
}

export default App
