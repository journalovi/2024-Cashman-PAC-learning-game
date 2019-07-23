const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

const size = 600;

class PacScatter extends D3Component {

  updateTime(speed) {
    if (speed === 'PAUSE') {
      return 10;
    } else if (speed === 'FASTER') {
      return 250;
    } else if (speed === 'FINISH') {
      return 10;
    } else {
      return 1500;
    }
  }

  initializeData() {
    // n_samples = {this.n_samples}
    // speed = {this.speed}
    // showGroundTruth = {this.showGroundTruth}
    // resetData = {this.resetData}

    this.xValue = (d) => { return d.x;}; // data -> value
    this.xScale = d3.scaleLinear().range([0, this.width]); // value -> display
    this.xMap = (d) => { return this.xScale(this.xValue(d));}; // data -> display
    this.xAxis = d3.axisBottom(this.xScale).ticks(0);
    // setup y
    this.yValue = (d) => { return d.y;}; // data -> value
    this.yScale = d3.scaleLinear().range([this.height, 0]); // value -> display
    this.yMap = (d) => { return this.yScale(this.yValue(d));}; // data -> display
    this.yAxis = d3.axisLeft(this.yScale).ticks(0);

    // setup fill color
    this.cValue = (d) => { return d.label ? 'green' : 'red';};

    // Generating the random data
    // First, generate the bounds.
    this.outerBounds = { x: { min: 0.0, max: 1.0 }, y: { min: 0.0, max: 1.0 } };
    this.targetDistributionType = 'rectangle';
    this.targetDistribution = this.generateRandomSquare(this.outerBounds);
    let generatedData = this.generateUniformRectData(this.targetDistribution, this.outerBounds, 500)
    this.setState({data: generatedData});
    this.xScale.domain([d3.min(generatedData, this.xValue), d3.max(generatedData, this.xValue)]);
    this.yScale.domain([d3.min(generatedData, this.yValue), d3.max(generatedData, this.yValue)]);
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);
    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)

          // this.drawAllPoints();
    this.setState((state, props) => { return { dataQueue: generatedData.slice()}},
                  () => {
                    if (this.props.speed !== 'PAUSE') {
                      this.animatePoints();
                    }
                    this.drawTargetDistribution(this.props.showGroundTruth);
                  }    
    );

  }

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      dataQueue: [],
      lastSpeed: 'PAUSE'
    }
    this.groundTruthBox = React.createRef();
    this.svg = React.createRef();

    // JAVASCRIPT IS AWFUL
    // IS THERE SOMETHING BIGGER THAN CAPS?
    this.animatePoints = this.animatePoints.bind(this);
  }

  initialize(node, props) {
    // Some code based on http://bl.ocks.org/weiglemc/6185069
    this.margin = {top: 20, right: 20, bottom: 30, left: 40};
    this.width = 960 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
        
    this.svg = d3.select(node).append('svg');
    this.svg.attr('viewBox', `0 0 ${size} ${size}`)
      .style('width', this.width + this.margin.left + this.margin.right)
      .style('height', this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.state = {
      data: [],
      dataQueue: [],
      lastSpeed: 'PAUSE',
      timerStarted: false
    }
    this.initializeData();
  }

  update(props, oldProps) {
    this.drawTargetDistribution(props.showGroundTruth);

    if ((oldProps.speed === 'PAUSE' || this.state.timerStarted == false) && props.speed !== 'PAUSE') {
      this.state.lastSpeed = props.speed;
      this.animatePoints(props.speed);
    }
  }

  componentDidUpdate(props, state) {
    // Check to see if moved from pause to other thing
    if ((state.lastSpeed === 'PAUSE' || state.timerStarted == false) && props.speed !== 'PAUSE') {
      this.state.lastSpeed = props.speed;
      this.animatePoints();
    }
  }

  animatePoints(speed='NORMAL') {
    if (this.state.dataQueue.length > 0) {
      setTimeout(
        () => {
          if (speed === 'PAUSE') {
            this.state.timerStarted = false;
          } else {
            this.state.timerStarted = true;
            this.drawNextPoint();
            this.animatePoints(this.props.speed);  
          }
        },
        this.updateTime(speed)
      )
  
    }
  }

  drawNextPoint() {
    const datum = this.state.dataQueue.pop();
    this.svg.append("circle")
      .attr("class", "dot")
      .attr("cx", this.xMap(datum))
      .attr("cy", this.yMap(datum))
      .style("fill", this.cValue(datum)) 
      .attr("r", 0.5)
      .transition()
      .duration(1000)
      .attr("r", 5.5)
      .transition()
      .duration(1000)
      .attr("r", 3.5);
  }

  drawAllPoints() {
    this.svg.selectAll(".dot")
      .data(this.state.data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", this.xMap)
      .attr("cy", this.yMap)
      .style("fill", (d) => { return this.cValue(d);}) 
  }

  drawTargetDistribution(forceDraw=false) {
    switch (this.targetDistributionType) {
      case 'rectangle':
        this.drawTargetDistributionRectangle(forceDraw);
      default:
        console.log("tried to draw target distribution for ", this.targetDistributionType);
    }
  }

  drawTargetDistributionRectangle(forceDraw=false) {
    this.svg.selectAll(".target-distribution").remove();
    if (forceDraw) {
      this.svg.append("rect")
        .attr("class", "rect target-distribution")
        .attr("x", this.xScale(this.targetDistribution.x.min))
        .attr("y", this.yScale(this.targetDistribution.y.max))
        .attr("width", this.xScale(this.targetDistribution.x.max) - this.xScale(this.targetDistribution.x.min))
        .attr("height", this.yScale(this.targetDistribution.y.min) - this.yScale(this.targetDistribution.y.max))
    }
  }

  // Generating random data
  generateUniformRectData(rectBounds, outerBounds, n=10) {
    let rectData = [];
    for (let i=0; i<n; i++) {
      rectData.push(this.generateUniformRandomPt(rectBounds, outerBounds));
    }
    return rectData;
  }

  generateUniformRandomPt(rectBounds, outerBounds) {
    const rectXMin = rectBounds.x.min, 
    rectXMax = rectBounds.x.max, 
    rectYMin = rectBounds.y.min, 
    rectYMax = rectBounds.y.max;

    const outerXMin = outerBounds.x.min, 
    outerXMax = outerBounds.x.max, 
    outerYMin = outerBounds.y.min, 
    outerYMax = outerBounds.y.max;

    const xVal = this.getRandomArbitrary(outerXMin, outerXMax);
    const yVal = this.getRandomArbitrary(outerYMin, outerYMax);

    const label = (rectXMin < xVal) && (xVal < rectXMax) &&
                  (rectYMin < yVal) && (yVal < rectYMax);

    return {x: xVal, y: yVal, label: label};
  }

  generateRandomSquare(outerBounds, minwidth=0.2, margin=0.05) {
    const outerXMin = outerBounds.x.min, 
    outerXMax = outerBounds.x.max, 
    outerYMin = outerBounds.y.min, 
    outerYMax = outerBounds.y.max,
    outerXDiff = outerXMax - outerXMin,
    outerYDiff = outerYMax - outerYMin;

    return {
      x: this.getRandomBounds(outerXMin, outerXMax, minwidth * outerXDiff, margin * outerXDiff),
      y: this.getRandomBounds(outerYMin, outerYMax, minwidth * outerYDiff, margin * outerYDiff)
    }
  }

  getRandomBounds(min=0.0, max=1.0, minwidth=0.2, margin=0.05) {
    const boundMin = this.getRandomArbitrary(min + margin, (min + max) / 2.0);
    const boundMax = this.getRandomArbitrary(Math.max(min + minwidth, (min + max) / 2.0), max - margin);
    return {min: boundMin, max: boundMax};
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
}

module.exports = PacScatter;
