fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json') // URL of the API
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); 
  })
  .then(data => {
    createScatterPlot(data);})
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  })

function createScatterPlot(data) {
  const width = 600;
  const height = 400;
  const margin = { top: 80, right: 30, bottom: 50, left: 40 }; 

  const svg = d3.select('body').append("svg")
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom) 
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg.append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('id', 'title')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .text('Cyclist Performance Over the Years'); 

  const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)])
      .range([0, width]);

      const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d3.format("d")); // Use d3.format to format as an integer
  
  svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', 'white');
  

    const timeData = data.map(d => {
        const [minutes, seconds] = d.Time.split(':').map(Number);
        return minutes * 60 + seconds; // Convert to total seconds
      });

  const yScale = d3.scaleLinear()
    .domain([d3.max(timeData), d3.min(timeData)])
    .range([0, height]);

    const yAxis = d3.axisLeft(yScale)
    .ticks(10)
    .tickFormat(d => {
        const totalSeconds = Math.floor(d); // Get the total seconds
        const minutes = Math.floor(totalSeconds / 60); // Calculate minutes
        const seconds = totalSeconds % 60; // Calculate remaining seconds
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Format as M:SS without spaces
    });
  
  svg.append('g')
    .attr('id', 'y-axis')
    .call(yAxis)
    .selectAll('text')
    .style('fill', 'white');
  

    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.Year))
        .attr('cy', d => yScale(d.Time.split(':').reduce((acc, time) => 60 * acc + +time)))
        .attr('r', 5)
        .attr('class', 'dot')
        .attr('data-xvalue', d => d.Year)
        .attr('data-yvalue', d => {
            const totalSeconds = d.Time.split(':').reduce((acc, time) => 60 * acc + +time, 0);
            return new Date(totalSeconds * 1000);
        })
        .style('fill', 'white')
        .style('opacity', 0.7)
        .on('mouseover', function(event, d){
            d3.select(this)
              .style('fill', 'orange')
              .style('r', 8);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', 1)
            tooltip.html(`Year: ${d.Year}<br>Time: ${d.Time}`)
            .style('left', (event.pageX + 30) + 'px') 
            .style('top', (event.pageY - 28) + 'px')
            .attr('data-year', d.Year);
        }).on('mouseout', function(){
            d3.select(this)
                .style('fill', 'white')
                .style('r', 5);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        })

    svg.append('legend')
        .attr('id', 'legend');
    
    const tooltip = d3.select('body').append('div')
        .attr('id', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'gray')
        .style('color', 'white')
        .style('padding', '5px')
        .style('border-radius', '5px')
}
