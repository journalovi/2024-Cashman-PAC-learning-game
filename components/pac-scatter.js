const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

import conf from './pac-conf';

class PacScatter extends D3Component {

  updateTime(speed) {
    if (speed === 'PAUSE') {
      return 10;
    } else if (speed === 'FASTER') {
      return conf.FAST_SPEED;
    } else if (speed === 'FINISH') {
      return conf.FINISH_SPEED;
    } else {
      return conf.DEFAULT_SPEED;
    }
  }

  initializeData() {
    this.xValue = (d) => { return d.x;}; // data -> value
    this.xScale = d3.scaleLinear().range([0, this.width]); // value -> display
    this.xMap = (d) => { return this.xScale(this.xValue(d));}; // data -> display
    this.xAxis = d3.axisBottom(this.xScale).ticks(0);
    this.yValue = (d) => { return d.y;}; // data -> value
    this.yScale = d3.scaleLinear().range([this.height, 0]); // value -> display
    this.yMap = (d) => { return this.yScale(this.yValue(d));}; // data -> display
    this.yAxis = d3.axisLeft(this.yScale).ticks(0);

    // setup fill color
    this.cValue = (d) => { return d.label ? 'green' : 'red';};

    // Generating the random data
    // First, generate the bounds.
    this.outerBounds = { x: { min: 0.0, max: 1.0 }, y: { min: 0.0, max: 1.0 } };
    this.initializeDistributions.bind(this)();
  }

  initializeDistributions() {
    if (this.props.targetTrainDistribution) {
      this.targetTrainDistribution = this.props.targetTrainDistribution;
    } else {
      this.targetTrainDistribution = this.generateRandomRect(this.outerBounds);
    }

    if (this.props.trainMatchTest) {
      this.targetTestDistribution = this.targetTrainDistribution;
    } else {
      if (this.props.targetTestDistribution) {
        this.targetTestDistribution = this.props.targetTestDistribution;
      } else {
        this.targetTestDistribution = this.generateRandomRect(this.outerBounds);
      }
    }

    if (this.props.targetTrainDistributionType === 'ellipse') {
      this.generatedTrainData = this.generateUniformEllipseData(this.targetTrainDistribution, this.outerBounds, this.props.total_samples)
    } else {
      this.generatedTrainData = this.generateUniformRectData(this.targetTrainDistribution, this.outerBounds, this.props.total_samples)  
    }

    if (this.props.targetTestDistributionType === 'ellipse') {
      this.generatedTestData = this.generateUniformEllipseData(this.targetTestDistribution, this.outerBounds, this.props.total_samples)
    } else {
      this.generatedTestData = this.generateUniformRectData(this.targetTestDistribution, this.outerBounds, this.props.total_samples)  
    }

    this.setState({data: this.generatedTrainData});
    this.xScale.domain([this.outerBounds.x.min, this.outerBounds.x.max]);
    this.yScale.domain([this.outerBounds.y.min, this.outerBounds.y.max]);
    this.svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);
    this.svg.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)

    this.brush = d3.brush()
    .extent([[0, 0], [this.width, this.height]])
    .on("brush end", this.brushed.bind(this)) 
    if (this.props.brushable) {
      this.brushG = this.svg.append("g")
      this.brushG.attr("class", "brush")
        .call(this.brush);
    }

    this.setState((state, props) => { return { dataQueue: this.generatedTrainData.slice(),
                    candidateDistribution: null
                  }},
                  () => {
                    if (this.props.drawAllPoints) {
                      this.drawAllPoints();
                    } else if (this.props.speed !== 'PAUSE') {
                      this.animatePoints();
                    }
                
                    this.drawTargetDistribution(this.props.testing);
                    this.drawCandidateDistribution(this.props.showCandidate);
                  }    
    );

  }

  constructor(props) {
    super(props)
    this.state = {
      data: [],
      dataQueue: [],
      drawnPoints: [],
      lastSpeed: 'PAUSE',
      candidateDistribution: null
      // candidateDistribution: { x: { min: 0.0, max: 1.0 }, y: { min: 0.0, max: 1.0 } }
    }
    this.groundTruthBox = React.createRef();
    this.svg = React.createRef();
    this.brushG = React.createRef();

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
    this.svg
      .style('width', this.width + this.margin.left + this.margin.right)
      .style('height', this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.state = {
      data: [],
      dataQueue: [],
      drawnPoints: [],
      lastSpeed: 'PAUSE',
      timerStarted: false
    }
    this.initializeData();
  }

  clearBrush() {
    this.brushG.call(this.brush.move, null);
  }

  update(props, oldProps) {
    // console.log("update called, props.setRefresh is ", props.setRefresh)
    if (props.setRefresh) {
      // console.log("this.targetTrainDistribution is ", this.targetTrainDistribution)
      this.clearBrush.bind(this)()
      this.initializeDistributions.bind(this)();
      // console.log("after initialze, this.targetTrainDistribution is ", this.targetTrainDistribution)
      this.eraseAllPoints.bind(this)()
      this.props.updateSampleError('N/A');
      this.props.resetRefresh();
    }
    this.drawTargetDistribution(props.testing);
    this.drawCandidateDistribution(props.showCandidate);
    if (this.props.toggledClosestBounds) {
      this.setClosestBounds.bind(this)();
    }
    if (this.props.toggledFurthestBounds) {
      this.setFurthestBounds.bind(this)();
    }
    if (this.props.toggledMaxMarginBounds) {
      this.setMaxMarginBounds.bind(this)();
    }

    if (!oldProps.testing && props.testing) {
      // We've switched from training to testing
      this.setState((state, props) => { return { dataQueue: this.generatedTestData.slice()}},
        () => {
          // First, remove all circles
          this.eraseAllPoints();

          this.animatePoints('FINISH');
          this.drawTargetDistribution(this.props.testing);
          this.drawCandidateDistribution(this.props.showCandidate);
        }
      )    
    }

    if ((oldProps.speed === 'PAUSE' || this.state.timerStarted == false) && props.speed !== 'PAUSE') {
      this.state.lastSpeed = props.speed;
      this.animatePoints(props.speed);
    }
  }

  // componentDidUpdate(props, state) {
  //   // Check to see if moved from pause to other thing
  //   if ((state.lastSpeed === 'PAUSE' || state.timerStarted == false) && props.speed !== 'PAUSE') {
  //     this.state.lastSpeed = props.speed;
  //     this.animatePoints();
  //   }
  // }

  brushed() {
    console.log("brushed called, and d3.event.type is ", d3.event.type)
    if (d3.event.type === 'end' && d3.event.selection) {
      const [[x0, y0], [x1, y1]] = d3.event.selection;
      // Set candidate rectangle to this boundary.
      console.log("this is ", this)
      console.log("this.state is ", this.state)
      const newBoundingBox = {
        x: {
          min: this.xScale.invert(x0),
          max: this.xScale.invert(x1),
        },
        y: {
          min: this.yScale.invert(y1),
          max: this.yScale.invert(y0)
        }
      }
      console.log("newBoundingBox is ", newBoundingBox);
      this.setState({ candidateDistribution: newBoundingBox });
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
            if (speed === 'FINISH') {
              this.animatePoints('FINISH');
            } else {
              this.animatePoints(this.props.speed);
            }
          }
        },
        this.updateTime(speed)
      )
  
    }
  }

  eraseAllPoints() {
    this.svg.selectAll('circle')
      .attr("r", 3.5)
      .transition()
      .duration(500)
      .attr("r", 0.5)
      .remove();

    this.setState({drawnPoints: []});
    this.props.resetSamples();
  }

  drawNextPoint() {
    const datum = this.state.dataQueue.pop();
    this.setState((state, props) => { return { drawnPoints: state.drawnPoints.concat([datum]) } },
      () => { 
        this.props.incrementSamples();
        if (this.props.testing) {
          this.props.updateTestError(this.calculateTestError())
        } else {
          this.props.updateSampleError(this.calculateSampleError())
        }
      }
    );

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

  calculateSampleError() {
    // Here, we're going to actually calculate the full confusion matrix:
    // TP, TN, FP, TN, Accuracy
    accuracy = 0.0
    tp = 0
    tn = 0
    fp = 0
    fn = 0
    if (totalSamples > 0 && boundingBox) {
      for (let i = 0; i < totalSamples; i++) {
        let datum = this.state.drawnPoints[i];
        let predictedLabel = this.ptInRect(datum.x, datum.y, boundingBox);
        console.log("datum is ", datum, ", boundingBox is ", boundingBox, " and predictedLabel is ", predictedLabel);
        if (predictedLabel == datum.label) {
          if (predictedLabel) {
            tp++;
          } else {
            tn++;
          }
        } else {
          if (predictedLabel) {
            fp++;
          } else {
            fn++;
          }
        }
      }
      accuracy = (tp + tn) / (tp + tn + fp + fn)
    }
  }

  calculateTestError() {
    // Here, we're going to calculate the areas of the confusion matrix:
    // TP, TN, FP, TN, Accuracy
    // Where the confusion matrix is percentages

    if (this.props.targetTestDistributionType === 'rectangle') {
      return this.calculateErrorRectangle(this.state.candidateDistribution, this.targetTestDistribution);
    } else if (this.props.targetTestDistributionType === 'ellipse') {
      return this.calculateErrorEllipse(this.state.candidateDistribution, this.targetTestDistribution);
    }

  }

  calculateSampleErrorRectangle(boundingBox) {
    const totalSamples = this.state.drawnPoints.length * 1.0;
    console.log("boundingBox is ", boundingBox, ", and this.targetTrainDistribution is ", this.targetTrainDistribution);

    if (totalSamples > 0 && boundingBox) {
      let incorrectSamples = 0.0;
      for (let i = 0; i < totalSamples; i++) {
        let datum = this.state.drawnPoints[i];
        let predictedLabel = this.ptInRect(datum.x, datum.y, boundingBox);
        // console.log("datum is ", datum, ", boundingBox is ", boundingBox, " and predictedLabel is ", predictedLabel);
        if (predictedLabel !== datum.label) {
          incorrectSamples++;
        }
      }
      // console.log("incorrectSamples is ", incorrectSamples, " and totalSamples is ", totalSamples);
      // return incorrectSamples / totalSamples;
      return `${incorrectSamples} out of ${totalSamples} : ${(incorrectSamples / totalSamples).toPrecision(2)}`
    } else {
      // return 0.0;
      return 'N/A'
    }
  }

  calculateSampleErrorEllipse(boundingBox) {
    const totalSamples = this.state.drawnPoints.length * 1.0;

    if (totalSamples > 0 && boundingBox) {
      let incorrectSamples = 0.0;
      for (let i = 0; i < totalSamples; i++) {
        let datum = this.state.drawnPoints[i];
        let predictedLabel = this.ptInEllipse(datum.x, datum.y, boundingBox);
        if (predictedLabel !== datum.label) {
          incorrectSamples++;
        }
      }
      return incorrectSamples / totalSamples;
    } else {
      return 0.0;
    }
  }

  calculateErrorRectangle(candidateDistribution, targetBoundingBox) {
    // error = area of both rectangles minus 2 * overlap.
    const intersectionRectArea = this.calculateIntersectionRectArea(targetBoundingBox, candidateDistribution);
    const candidateBoxArea = (candidateDistribution.x.max - candidateDistribution.x.min) * (candidateDistribution.y.max - candidateDistribution.y.min);
    const targetBoxArea = (targetBoundingBox.x.max - targetBoundingBox.x.min) * (targetBoundingBox.y.max - targetBoundingBox.y.min);

    return (candidateBoxArea + targetBoxArea - (2.0 * intersectionRectArea)).toPrecision(2);
  }

  calculateErrorEllipse() {
    return 0.4;
  }

  calculateIntersectionRectArea(boxA, boxB) {
    let x_overlap = Math.max(0, Math.min(boxA.x.max, boxB.x.max) - Math.max(boxA.x.min, boxB.x.min));
    let y_overlap = Math.max(0, Math.min(boxA.y.max, boxB.y.max) - Math.max(boxA.y.min, boxB.y.min));
    let overlapArea = x_overlap * y_overlap;

    return overlapArea
  }

  drawTargetDistribution(forceDraw=false) {
    if (this.props.targetTrainDistributionType === 'rectangle') {
      this.drawTargetDistributionRectangle(forceDraw);
    } else if (this.props.targetTrainDistributionType === 'ellipse') {
      this.drawTargetDistributionEllipse(forceDraw);
    }
  }

  drawCandidateDistribution(forceDraw=false) {
    this.svg.selectAll(".candidate-distribution").remove();
    if (forceDraw && this.state.candidateDistribution) {
      this.svg.append("rect")
        .attr("class", "rect candidate-distribution")
        .attr("x", this.xScale(this.state.candidateDistribution.x.min))
        .attr("y", this.yScale(this.state.candidateDistribution.y.max))
        .attr("width", this.xScale(this.state.candidateDistribution.x.max) - this.xScale(this.state.candidateDistribution.x.min))
        .attr("height", this.yScale(this.state.candidateDistribution.y.min) - this.yScale(this.state.candidateDistribution.y.max))
    }
  }

  drawTargetDistributionRectangle(forceDraw=false) {
    this.svg.selectAll(".target-distribution").remove();
    if (forceDraw) {
      this.svg.append("rect")
        .attr("class", "rect target-distribution")
        .attr("x", this.xScale(this.targetTrainDistribution.x.min))
        .attr("y", this.yScale(this.targetTrainDistribution.y.max))
        .attr("width", this.xScale(this.targetTrainDistribution.x.max) - this.xScale(this.targetTrainDistribution.x.min))
        .attr("height", this.yScale(this.targetTrainDistribution.y.min) - this.yScale(this.targetTrainDistribution.y.max))
        // .attr("fill-opacity", 0)
        // .transition()
        // .duration(1000)
        // .attr("fill-opacity", 0.5)
    }
  }

  drawTargetDistributionEllipse(forceDraw=false) {
    this.svg.selectAll(".target-distribution").remove();
    if (forceDraw) {
      this.svg.append("ellipse")
        .attr("class", "ellipse target-distribution")
        .attr("cx", this.xScale((this.targetTrainDistribution.x.min + this.targetTrainDistribution.x.max) / 2.0))
        .attr("cy", this.yScale((this.targetTrainDistribution.y.min + this.targetTrainDistribution.y.max) / 2.0))
        .attr("rx", (this.xScale(this.targetTrainDistribution.x.max) - this.xScale(this.targetTrainDistribution.x.min)) / 2.0)
        .attr("ry", (this.yScale(this.targetTrainDistribution.y.min) - this.yScale(this.targetTrainDistribution.y.max)) / 2.0)
    }
  }

  setClosestBounds() {
    const x0 = d3.min(this.drawnPoints.select((d) => d.label), (d) => d.x)
    const x1 = d3.max(this.drawnPoints.select((d) => d.label), (d) => d.x)
    const y0 = d3.max(this.drawnPoints.select((d) => d.label), (d) => d.y)
    const y1 = d3.min(this.drawnPoints.select((d) => d.label), (d) => d.y)
    const boundingBox = {
      x: {
        min: x0,
        max: x1
      },
      y: {
        min: y0,
        max: y1
      }
    }

    this.setState({candidateDistribution: boundingBox});
  }

  setFurthestBounds() {
    const x0 = d3.max(this.drawnPoints.select((d) => !d.label), (d) => d.x)
    const x1 = d3.min(this.drawnPoints.select((d) => !d.label), (d) => d.x)
    const y0 = d3.min(this.drawnPoints.select((d) => !d.label), (d) => d.y)
    const y1 = d3.max(this.drawnPoints.select((d) => !d.label), (d) => d.y)
    const boundingBox = {
      x: {
        min: x0,
        max: x1
      },
      y: {
        min: y0,
        max: y1
      }
    }

    this.setState({candidateDistribution: boundingBox});
  }

  setMaxMarginBounds() {
    const x0 = (d3.min(this.drawnPoints.select((d) => d.label), (d) => d.x) + d3.max(this.drawnPoints.select((d) => !d.label), (d) => d.x)) / 2.0
    const x1 = (d3.max(this.drawnPoints.select((d) => d.label), (d) => d.x) + d3.min(this.drawnPoints.select((d) => !d.label), (d) => d.x)) / 2.0
    const y0 = (d3.max(this.drawnPoints.select((d) => d.label), (d) => d.y) + d3.min(this.drawnPoints.select((d) => !d.label), (d) => d.y)) / 2.0
    const y1 = (d3.min(this.drawnPoints.select((d) => d.label), (d) => d.y) + d3.max(this.drawnPoints.select((d) => !d.label), (d) => d.y)) / 2.0
    const boundingBox = {
      x: {
        min: x0,
        max: x1
      },
      y: {
        min: y0,
        max: y1
      }
    }

    this.setState({candidateDistribution: boundingBox});
  }

  // Generating random data
  generateUniformRectData(rectBounds, outerBounds, n=10) {
    let rectData = [];
    for (let i=0; i<n; i++) {
      rectData.push(this.generateUniformRandomPt(rectBounds, outerBounds));
    }
    return rectData;
  }

  generateUniformEllipseData(ellipseBounds, outerBounds, n=10) {
    let ellipseData = [];
    for (let i=0; i<n; i++) {
      ellipseData.push(this.generateUniformRandomPt(ellipseBounds, outerBounds, 'ellipse'));
    }
    return ellipseData;
  }

  generateUniformRandomPt(shapeBounds, outerBounds, region='rectangle') {
    const outerXMin = outerBounds.x.min,
    outerXMax = outerBounds.x.max,
    outerYMin = outerBounds.y.min,
    outerYMax = outerBounds.y.max;

    const xVal = this.getRandomArbitrary(outerXMin, outerXMax);
    const yVal = this.getRandomArbitrary(outerYMin, outerYMax);

    let label = false;
    if (region === 'ellipse') {
      label = this.ptInEllipse(xVal, yVal, shapeBounds);
    } else { // rectangle
      label = this.ptInRect(xVal, yVal, shapeBounds);
    }

    return {x: xVal, y: yVal, label: label};
  }

  ptInRect(x, y, boundingBox) {
    return (boundingBox.x.min < x) && (x < boundingBox.x.max) &&
              (boundingBox.y.min < y) && (y < boundingBox.y.max);
  }

  ptInEllipse(x, y, boundingBox) {
    // ((x-h)^2)/(r_x)^2 + ((y-k)^2)/(r_y)^2 <= 1
    const ellipseCX = (boundingBox.x.min + boundingBox.x.max) / 2.0,
    ellipseCY = (boundingBox.y.min + boundingBox.y.max) / 2.0,
    ellipseRX = (boundingBox.x.max - boundingBox.x.min) / 2.0, 
    ellipseRY = (boundingBox.y.max - boundingBox.y.min) / 2.0;

    return (((x - ellipseCX)*(x - ellipseCX))/(ellipseRX*ellipseRX)
          + ((y - ellipseCY)*(y - ellipseCY))/(ellipseRY*ellipseRY))
          < 1.0;

  }

  generateRandomRect(outerBounds, minwidth=0.2, margin=0.05) {
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

PacScatter.defaultProps = {
  brushable: true
}

module.exports = PacScatter;
