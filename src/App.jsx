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
    d3.select('.main').select('#tooltip').remove();

    const svg = d3.select(chloropethMapContainer.current)
    .append('svg')
    .attr('width', 1000)
    .attr('height', 1000);

    //tooltip
    const tooltip = d3.select('.main')
    .append('div')
    .attr('id','tooltip')

    //legend
    var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

var color = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(d3.schemeBlues[9]);

var g = svg
  .append('g')
  .attr('class', 'key')
  .attr('id', 'legend')
  .attr('transform', 'translate(0,40)');

g.selectAll('rect')
  .data(
    color.range().map(function (d) {
      d = color.invertExtent(d);
      if (d[0] === null) {
        d[0] = x.domain()[0];
      }
      if (d[1] === null) {
        d[1] = x.domain()[1];
      }
      return d;
    })
  )
  .enter()
  .append('rect')
  .attr('height', 8)
  .attr('x', function (d) {
    return x(d[0]);
  })
  .attr('width', function (d) {
    return d[0] && d[1] ? x(d[1]) - x(d[0]) : x(null);
  })
  .attr('fill', function (d) {
    return color(d[0]);
  });

g.append('text')
  .attr('class', 'caption')
  .attr('x', x.range()[0])
  .attr('y', -6)
  .attr('fill', '#000')
  .attr('text-anchor', 'start')
  .attr('font-weight', 'bold');

g.call(
  d3
    .axisBottom(x)
    .tickSize(13)
    .tickFormat(function (x) {
      return Math.round(x) + '%';
    })
    .tickValues(color.domain())
)
  .select('.domain')
  .remove();


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
    .attr('stroke','white')
    .attr('fill', d => {
      const countyData = educationDataset.filter((county) => county.fips === d.id)[0]

      return color(countyData.bachelorsOrHigher)
    })
    .attr('stroke','none')
    .on('mouseover', (event, d) => {
      const countyData = educationDataset.filter((county) => county.fips === d.id)[0]


      tooltip
      .attr('data-education', countyData.bachelorsOrHigher)
      .style('left', event.pageX + 20 + 'px')
      .style('top', event.pageY - 40 + 'px')
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
    <div className="main">
      <ChloropethMap countiesDataset={countiesDataset} educationDataset={ educationDataset }/>
    </div>

  )
}

export default App
