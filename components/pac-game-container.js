const React = require('react');
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Refresh from '@material-ui/icons/Refresh';
import Pause from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import SkipNext from '@material-ui/icons/SkipNext';

import PacScatter from './pac-scatter';

class PacGameContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      speed: 'NORMAL',
      showGroundTruth: false,
      showCandidate: false,
      resetData: false,
      n_samples: 0,
      total_samples: 100,
      testing: false,
      xAxisName: 'Weight (lbs)',
      yAxisName: 'Height (feet)',
      sampleStatistics: {
        'accuracy': 0.0,
        'error': 0.0,
        'tp': 0,
        'tn': 0,
        'fp': 0,
        'fn': 0
      },
      testStatistics: {
        'accuracy': 0.0,
        'error': 0.0,
        'tp': 0,
        'tn': 0,
        'fp': 0,
        'fn': 0
      },
      sampleError: "N/A",
      testError: "N/A",
      title: "Welcome to Blumer's Game!"
    }

  }

  initialize(node, props) {
    this.resetState();
  }

  resetState() {
    this.state = {
      speed: 'PAUSE',
      showGroundTruth: false,
      showCandidate: false,
      resetData: false,
      n_samples: 0,
      total_samples: 100,
      testing: false,
      sampleError: "N/A",
      testError: "N/A",
      xAxisName: null,
      yAxisName: null,
      sampleStatistics: {
        'accuracy': 0.0,
        'tp': 0,
        'tn': 0,
        'fp': 0,
        'fn': 0
      },
      testStatistics: {
        'accuracy': 0.0,
        'tp': 0,
        'tn': 0,
        'fp': 0,
        'fn': 0
      }
    }
  }

  toggleGroundTruth() {
    this.setState({showGroundTruth: !this.state.showGroundTruth})
  }

  toggleCandidate() {
    this.setState({showCandidate: !this.state.showCandidate})
  }

  refresh() {
    this.resetState();
    this.setState({setRefresh: true})
  }

  pause() {
    this.setState({speed: 'PAUSE'});
  }

  play() {
    this.setState({speed: 'NORMAL'});
  }

  faster() {
    this.setState({speed: 'FASTER'});
  }

  toggleTesting() {
    this.setState({testing: true});
  }

  incrementSamples() {
    this.setState((state, props) => {
      return {n_samples: state.n_samples += 1}
    });
  }

  resetSamples() {
    this.setState((state, props) => {
      return {n_samples: 0}
    });
  }

  resetRefresh() {
    this.setState((state, props) => {
      return {setRefresh: false, testing: false}
    });
  }

  updateSampleError(sampleStatistics) {
    this.setState((state, props) => {
      console.log("updating SampleError with sampleStatistics", sampleStatistics)
      return {sampleStatistics: sampleStatistics}
    });
  }

  updateTestError(testStatistics) {
    this.setState((state, props) => {
      return {testStatistics: testStatistics}
    });
  }

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;

    return (
      <div className='pac-game-container' {...props}>
        <Paper>
          <Paper elevation={3} >
            <div className='pac-game-message'>{this.state.title}</div>
          </Paper>
          <Grid container spacing={3}>
            {/* <Grid item container xs={2}>
              <Grid item xs={12} className='pac-game-step'>Play</Grid>
              <Grid item xs={12} className='pac-game-step'>Sampling</Grid>
              <Grid item xs={12} className='pac-game-step'>Automated Models</Grid>
              <Grid item xs={12} className='pac-game-step'>PAC Learning</Grid>
              <Grid item xs={12} className='pac-game-step'>Why does ML fail?</Grid>
              <Grid item xs={12} className='pac-game-step'>How does Viz fix this?</Grid>
            </Grid>
            <Grid item xs={10}> */}
            <Grid item xs={1}/>
            <Grid item xs={11}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Button onClick={this.refresh.bind(this)}><Refresh/></Button>
                  <Button className={this.state.speed === 'PAUSE' ? 'selectedButton' : null} onClick={this.pause.bind(this)}><Pause/></Button>
                  <Button className={this.state.speed === 'NORMAL' ? 'selectedButton' : null} onClick={this.play.bind(this)}><PlayArrow/></Button>
                  <Button className={this.state.speed === 'FASTER' ? 'selectedButton' : null} onClick={this.faster.bind(this)}><SkipNext/></Button>
                  <Button onClick={this.toggleTesting.bind(this)}>Test!</Button>
                  {/* <Button onClick={this.toggleGroundTruth.bind(this)}>Toggleshow</Button> */}
                  {/* <Button onClick={this.toggleCandidate.bind(this)}>cand</Button> */}
                  {/* <Button onClick={this.toggleCandidate.bind(this)}>cand</Button> */}
                  {/* <Button onClick={this.toggleCandidate.bind(this)}>cand</Button> */}
                  {/* <Button onClick={this.toggleCandidate.bind(this)}>cand</Button> */}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PacScatter
                  total_samples={this.state.total_samples}
                  speed={this.state.speed}
                  showGroundTruth={this.state.showGroundTruth}
                  showCandidate={this.state.showCandidate}
                  resetData={this.state.resetData}
                  targetTrainDistributionType="rectangle"
                  targetTestDistributionType="rectangle"
                  trainMatchTest={true}
                  testing={this.state.testing}
                  updateSampleError={this.updateSampleError.bind(this)}
                  updateTestError={this.updateTestError.bind(this)}
                  incrementSamples={this.incrementSamples.bind(this)}
                  resetSamples={this.resetSamples.bind(this)}
                  resetRefresh={this.resetRefresh.bind(this)}
                  setRefresh={this.state.setRefresh}
                  xAxisName={this.state.xAxisName}
                  yAxisName={this.state.yAxisName}
                />
              </Grid>
              <Grid container space={2}>
                <Grid item xs={6}>
                  <div className='evaluation-statistics evaluation-statistics-training'>
                    <Grid container space={2}>
                      <Grid item xs={12}>
                        <div className='evaluation-accuracy'>
                          <span className='accuracy-span'>Total Training Error: {this.state.sampleStatistics.error.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item true-positive'>
                          <span className='tooltip'>TP %:   <span className="tooltiptext">The percent of the samples seen in training that are correctly enclosed by the dragged square.</span></span><span className='cm-value'> {this.state.sampleStatistics.tp.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item false-positive'>
                          <span className='tooltip'>FP %:   <span className="tooltiptext">The percent of the samples seen in training that are in the dragged square, but shouldn't be.</span></span><span className='cm-value'> {this.state.sampleStatistics.fp.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item false-negative'>
                          <span className='tooltip'>FN %:   <span className="tooltiptext">The percent of the samples seen in training that are not in the dragged square, but should be.</span></span><span className='cm-value'> {this.state.sampleStatistics.fn.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item true-negative'>
                          <span className='tooltip'>TN %:   <span className="tooltiptext">The percent of the samples seen in training that are correctly not in the dragged square.</span></span><span className='cm-value'> {this.state.sampleStatistics.tn.toFixed(2)}%</span>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
                <Grid item xs={6}>
                  <div className='evaluation-statistics evaluation-statistics-testing'>
                    <Grid container space={2}>
                      <Grid item xs={12}>
                        <div className='evaluation-accuracy'>
                          <span className='accuracy-span'>Total Testing Error: {this.state.testStatistics.error.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item true-positive'>
                          <span className='tooltip'>TP %:   <span className="tooltiptext">The percent of the full space that is true positives (the dark green area).</span></span><span className='cm-value'> {this.state.testStatistics.tp.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item false-positive'>
                          <span className='tooltip'>FP %:   <span className="tooltiptext">The percent of the full space that is false positives (the gray area).</span></span><span className='cm-value'> {this.state.testStatistics.fp.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item false-negative'>
                          <span className='tooltip'>FN %:   <span className="tooltiptext">The percent of the full space that is false negatives (the light green area).</span></span><span className='cm-value'> {this.state.testStatistics.fn.toFixed(2)}%</span>
                        </div>
                      </Grid>
                      <Grid item xs={6}>
                        <div className='evaluation-cm-item true-negative'>
                          <span className='tooltip'>TN %:   <span className="tooltiptext">The percent of the full space that is true negatives (the area out of either squar).</span></span><span className='cm-value'> {this.state.testStatistics.tn.toFixed(2)}%</span>
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

module.exports = PacGameContainer;
