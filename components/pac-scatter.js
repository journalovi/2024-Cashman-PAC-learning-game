const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

import conf from './pac-conf';
import tenSamplesData from './ten-samples-data';

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

  initializeDistributions(isStatic=false) {

    if (this.props.targetTrainDistribution) {
      this.targetTrainDistribution = this.props.targetTrainDistribution;
    } else {
      this.targetTrainDistribution = this.generateRandomRect(this.outerBounds);
    }

    if (this.props.trainMatchTest) {
      this.targetTestDistribution = this.targetTrainDistribution;
      this.driftDirectionX = Math.floor(Math.random() * 5) + 1; // an int from 1 to 5
      this.driftDirectionY = Math.floor(Math.random() * 5) + 1; // an int from 1 to 5
      this.driftStepSize = 0.0005; // it should move between 0.05 and 0.25 in both x and y direction
    } else {
      if (this.props.targetTestDistribution) {
        this.targetTestDistribution = this.props.targetTestDistribution;
      } else {
        this.targetTestDistribution = this.generateRandomRect(this.outerBounds);
      }
    }
    if (isStatic) {
      this.generatedTrainData = tenSamplesData.samples;
    } else {
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
    this.animatePoints = this.animatePoints.bind(this);
  }

  initialize(node, props) {
    // Some code based on http://bl.ocks.org/weiglemc/6185069
    this.margin = conf.margin;
    this.width = conf.width - this.margin.left - this.margin.right;
    this.height = conf.height - this.margin.top - this.margin.bottom;
        
    this.svg = d3.select(node).append('svg');
    this.svg
      .style('width', this.width + this.margin.left + this.margin.right + 'px')
      .style('height', this.height + this.margin.top + this.margin.bottom + 'px')
      .style('display', 'block')
      .style('margin', 'auto')
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
    if (props.setRefresh) {
      this.clearBrush.bind(this)()
      if (!(props.staticDataset && oldProps.staticDataset)) {
        // We don't want to reset the dataset if its just going from static to static
        this.initializeDistributions.bind(this)(props.staticDataset);
        this.eraseAllPoints.bind(this)()        
      }
      this.props.resetRefresh();
    }
    this.svg.selectAll(".candidate-distribution").remove();

    setTimeout(function() {
      // Ugh.  I have async leaking all over this code.  Sometimes it tries
      // to render the box before the data is ready, and it just doesn't draw it.
      // Maybe setTimeout will make it wait.
      let boundingBox = null;
      let targetBoundingBox = null;
      if (this.props.toggledClosestBounds) {
        // console.log("before calculating the bounding box, the drawn points are ", this.state.drawnPoints)
        boundingBox = this.getClosestBounds.bind(this)();
        // we only need this for the proof so I'll hard code it here
        targetBoundingBox = { x: {}, y: {}};
        targetBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        targetBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        targetBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        targetBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.setState({candidateDistribution: boundingBox})
        // console.log("IN HERE, boundingBox is ", boundingBox)
        // console.log("IN HERE, targetBoundingBox is ", targetBoundingBox)
      }
      if (this.props.toggledFurthestBounds) {
        boundingBox = this.getFurthestBounds.bind(this)();
        this.setState({candidateDistribution: boundingBox})
      }
      if (this.props.toggledMaxMarginBounds) {
        boundingBox = this.getMaxMarginBounds.bind(this)();
        this.setState({candidateDistribution: boundingBox})
      }

      this.drawTargetDistribution.bind(this)(props.testing || props.showGroundTruth, targetBoundingBox);
      this.drawCandidateDistribution(props.showCandidate, boundingBox);


      if (this.props.showTopStrip || this.props.showAllStrips) {
        const topStripBoundingBox = { x: {}, y: {}};
        topStripBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        topStripBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        topStripBoundingBox['y']['min'] = boundingBox['y']['max'];
        topStripBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showTopStrip || this.props.showAllStrips, topStripBoundingBox, true, false, true)

        const topPrimeBoundingBox = { x: {}, y: {}};
        topPrimeBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        topPrimeBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        topPrimeBoundingBox['y']['min'] = boundingBox['y']['max'] - 0.05;
        topPrimeBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showTopStrip || this.props.showAllStrips, topPrimeBoundingBox, false, true, true)
      }

      if (this.props.showAllStrips) {
        const rightStripBoundingBox = { x: {}, y: {}};
        rightStripBoundingBox['x']['min'] = boundingBox['x']['max'];
        rightStripBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        rightStripBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        rightStripBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showAllStrips, rightStripBoundingBox, true, false)

        const rightPrimeBoundingBox = { x: {}, y: {}};
        rightPrimeBoundingBox['x']['min'] = boundingBox['x']['max'] - 0.05;
        rightPrimeBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        rightPrimeBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        rightPrimeBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showAllStrips, rightPrimeBoundingBox, false, true)

        const bottomStripBoundingBox = { x: {}, y: {}};
        bottomStripBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        bottomStripBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        bottomStripBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        bottomStripBoundingBox['y']['max'] = boundingBox['y']['min'];
        this.drawCandidateDistribution(this.props.showAllStrips, bottomStripBoundingBox, true, false)

        const bottomPrimeBoundingBox = { x: {}, y: {}};
        bottomPrimeBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        bottomPrimeBoundingBox['x']['max'] = boundingBox['x']['max'] + 0.1;
        bottomPrimeBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        bottomPrimeBoundingBox['y']['max'] = boundingBox['y']['min'] + 0.05;
        this.drawCandidateDistribution(this.props.showAllStrips, bottomPrimeBoundingBox, false, true)

        const leftStripBoundingBox = { x: {}, y: {}};
        leftStripBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        leftStripBoundingBox['x']['max'] = boundingBox['x']['min'];
        leftStripBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        leftStripBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showAllStrips, leftStripBoundingBox, true, false)

        const leftPrimeBoundingBox = { x: {}, y: {}};
        leftPrimeBoundingBox['x']['min'] = boundingBox['x']['min'] - 0.1;
        leftPrimeBoundingBox['x']['max'] = boundingBox['x']['min'] + 0.05;
        leftPrimeBoundingBox['y']['min'] = boundingBox['y']['min'] - 0.1;
        leftPrimeBoundingBox['y']['max'] = boundingBox['y']['max'] + 0.1;
        this.drawCandidateDistribution(this.props.showAllStrips, leftPrimeBoundingBox, false, true)
      }
    }.bind(this), 200);


    // if (this.props.showAllStrips) {
    //   this.drawCandidateDistribution(this.props.showAllStrips, topStripBoundingBox, true, true)
    //   this.drawCandidateDistribution(this.props.showAllStrips, topStripBoundingBox, true, true)
    //   this.drawCandidateDistribution(this.props.showAllStrips, topStripBoundingBox, true, true)
    // }

    if (!oldProps.testing && props.testing) {
      // We've switched from training to testing
      this.setState((state, props) => { return { dataQueue: this.generatedTestData.slice()}},
        () => {
          // First, remove all circles
          this.eraseAllPoints();

          this.animatePoints('FINISH');
          this.drawTargetDistribution.bind(this)(props.testing || props.showGroundTruth);
          this.drawCandidateDistribution(props.showCandidate);
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
    if (d3.event.type === 'end' && d3.event.selection) {
      const [[x0, y0], [x1, y1]] = d3.event.selection;
      // Set candidate rectangle to this boundary.
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
      this.setState({ candidateDistribution: newBoundingBox });
      this.props.updateSampleError(this.calculateSampleError());
    }
 }

  animatePoints(speed='NORMAL') {
    if (this.state.dataQueue.length > 0) {
      setTimeout(
        function() {
          if (speed === 'PAUSE') {
            this.state.timerStarted = false;
          } else {
            this.state.timerStarted = true;
            this.drawNextPoint.bind(this)();
            if (speed === 'FINISH') {
              this.animatePoints('FINISH');
            } else {
              this.animatePoints(this.props.speed);
            }
          }
        }.bind(this),
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
    // console.log("test distribution is ", this.targetTestDistribution)
    if (this.props.generatePoints) {
      if (this.props.temporalDrift) {
        // Increment everything in the dataQueue, as well as the testing distribution.
        const xStep = this.driftDirectionX * this.driftStepSize;
        const yStep = this.driftDirectionY * this.driftStepSize;
        this.setState({
          dataQueue: this.state.dataQueue.map((d) => {
            let newDatum = {};
            newDatum['label'] = d.label;
            newDatum['x'] = d.x + xStep
            newDatum['y'] = d.y + yStep
            return newDatum;
          })
        })
        let newBounds = { x: {}, y: {}}
        newBounds['x']['min'] = this.targetTestDistribution['x']['min'] + xStep
        newBounds['x']['max'] = this.targetTestDistribution['x']['max'] + xStep
        newBounds['y']['min'] = this.targetTestDistribution['y']['min'] + yStep
        newBounds['y']['max'] = this.targetTestDistribution['y']['max'] + yStep
        // console.log("xstep is ", xStep, " and yStep is ", yStep, "and newBounds is ", newBounds, " and this is ", this)
        this.targetTestDistribution = newBounds;
        // console.log("and after, this is ", this)
      }
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
  }

  drawAllPoints() {
    // const totalDataLength = this.state.data.length;
    // const totalDrawnLength = this.state.drawnPoints.length;
    // const numPoints = totalDataLength - totalDrawnLength;
    // console.log("we are in drawAllPoints()")
    // for (let i = 0; i < numPoints; i++) {
    //   console.log("drawing the next point!")
    //   this.drawNextPoint();
    // }
    this.setState({drawnPoints: this.state.data})

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
    const boundingBox = this.state.candidateDistribution;
    const totalSamples = this.state.drawnPoints.length * 1.0;
    let accuracy = 0.0
    let error = 0.0
    let tp = 0
    let tn = 0
    let fp = 0
    let fn = 0
    if (totalSamples > 0 && boundingBox) {
      for (let i = 0; i < totalSamples; i++) {
        let datum = this.state.drawnPoints[i];
        let predictedLabel = this.ptInRect(datum.x, datum.y, boundingBox);
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
      // We divide all the tp, etc. by the number of samples so we get rates, so it is comparable with true samples
      tp = (100 * tp) / totalSamples
      tn = (100 * tn) / totalSamples
      fp = (100 * fp) / totalSamples
      fn = (100 * fn) / totalSamples
      accuracy = (100 * (tp + tn)) / (tp + tn + fp + fn)
      error = 100 - accuracy
    }
    return { tp, tn, fp, fn, accuracy, error }
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

  calculateErrorRectangle(candidateDistribution, targetBoundingBox) {
    // error = area of both rectangles minus 2 * overlap.
    const intersectionRectArea = this.calculateIntersectionRectArea(targetBoundingBox, candidateDistribution);
    const candidateBoxArea = (candidateDistribution.x.max - candidateDistribution.x.min) * (candidateDistribution.y.max - candidateDistribution.y.min);
    const targetBoxArea = (targetBoundingBox.x.max - targetBoundingBox.x.min) * (targetBoundingBox.y.max - targetBoundingBox.y.min);
    // TP = area of intersection of areas inside boxes
    // FP = area outside ground truth and inside candidate box = candidateBoxArea - intersection
    // FN = area inside ground truth but outside candidate box = targetBoxArea - intersection
    // TN = area of intersection of areas outside boxes = Total Area - (TP + FN + FP)

    let stats = {
      'tp': intersectionRectArea * 100,
      'fp': (candidateBoxArea - intersectionRectArea) * 100,
      'fn': (targetBoxArea - intersectionRectArea) * 100
    }
    stats['tn'] = 100.0 - (stats['tp'] + stats['fp'] + stats['fn']) // assumes full area is 1.0
    stats['accuracy'] = stats['tp'] + stats['tn'] // assumes full area is 1.0
    stats['error'] = 100.0 - stats['accuracy']

    return stats
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

  drawTargetDistribution(forceDraw=false, targetDistribution=null) {
    // console.log("in drawTargetDistribution, forceDraw is ", forceDraw, "and targetDistribution is ", targetDistribution, " also, this.props.targetTrainDistributionType is ", this.props.targetTrainDistributionType, "and this is ", this)
    if (this.props.targetTrainDistributionType === 'rectangle') {
      this.drawTargetDistributionRectangle(forceDraw, targetDistribution);
    } else if (this.props.targetTrainDistributionType === 'ellipse') {
      this.drawTargetDistributionEllipse(forceDraw);
    }
  }

  drawCandidateDistribution(forceDraw=false, candidateDistribution=null, tstrip=false, tprimestrip=false, annotate=false) {
    const dist = candidateDistribution || this.state.candidateDistribution;
    // console.log("forceDraw is ", forceDraw, " tstrip is ", tstrip, " tprimestrip is ", tprimestrip, "candidate dist is ", dist)
    if (forceDraw && dist) {
      const x = this.xScale(dist.x.min);
      const y = this.yScale(dist.y.max);
      const width = this.xScale(dist.x.max) - this.xScale(dist.x.min);
      const height = Math.abs(this.yScale(dist.y.min) - this.yScale(dist.y.max));
      let className = "rect candidate-distribution";
      if (tstrip) {
        className = className + " candidate-distribution-t";
        if (annotate) {
          this.svg.append("text")
            .attr("class", "candidate-distribution candidate-distribution-t-text")
            .attr("x", x + width + 5)
            .attr("y", y)
            .html("T'")
        }
      } else if (tprimestrip) {
        className = className + " candidate-distribution-tprime";
        if (annotate) {
          this.svg.append("text")
            .attr("class", "candidate-distribution candidate-distribution-tprime-text")
            .attr("x", x + width + 5)
            .attr("y", y + height)
            .html("T")
        }
      }
      // console.log("about to draw a rect at (", x, ",", y, ")  with width ", width, "and height ", height, " and class", className)
      this.svg.append("rect")
        .attr("class", className)
        .attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
    }
  }

  drawTargetDistributionRectangle(forceDraw=false, targetDistribution=null) {
    this.svg.selectAll(".target-distribution").remove();
    const dist = targetDistribution || this.targetTestDistribution;
    if (forceDraw) {
      this.svg.append("rect")
        .attr("class", "rect target-distribution")
        .attr("x", this.xScale(dist.x.min))
        .attr("y", this.yScale(dist.y.max))
        .attr("width", this.xScale(dist.x.max) - this.xScale(dist.x.min))
        .attr("height", this.yScale(dist.y.min) - this.yScale(dist.y.max))
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

  getClosestBounds() {
    // console.log("in closest bounds, this.state.drawnPoints is ", this.state.drawnPoints)
    const x0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const x1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const y0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)
    const y1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)
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
    return boundingBox;
  }

  getFurthestBounds() {
    const groundx0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const groundx1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const groundy0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)
    const groundy1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)

    const x0 = d3.max(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.x <= groundx0)), (d) => d.x)
    const x1 = d3.min(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.x >= groundx1)), (d) => d.x)
    const y0 = d3.max(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.y <= groundy0)), (d) => d.y)
    const y1 = d3.min(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.y >= groundy1)), (d) => d.y)
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

    return boundingBox;
  }

  getMaxMarginBounds() {
    const groundx0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const groundx1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.x)
    const groundy0 = d3.min(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)
    const groundy1 = d3.max(this.state.drawnPoints.filter((d) => d.label), (d) => d.y)

    const loosex0 = d3.max(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.x <= groundx0)), (d) => d.x)
    const loosex1 = d3.min(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.x >= groundx1)), (d) => d.x)
    const loosey0 = d3.max(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.y <= groundy0)), (d) => d.y)
    const loosey1 = d3.min(this.state.drawnPoints.filter((d) => !d.label).filter((d) => (d.y >= groundy1)), (d) => d.y)

    const x0 = (groundx0 + loosex0) / 2.0;
    const x1 = (groundx1 + loosex1) / 2.0;
    const y0 = (groundy0 + loosey0) / 2.0;
    const y1 = (groundy1 + loosey1) / 2.0;

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

    return boundingBox;
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

  getRandomBounds(min=0.0, max=1.0, minwidth=0.2, margin=0.05, padding=0.1) {
    const boundMin = this.getRandomArbitrary(min + margin, ((min + max) / 2.0) - padding);
    const boundMax = this.getRandomArbitrary(Math.max(min + minwidth, ((min + max) / 2.0 + padding)), max - margin);
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
