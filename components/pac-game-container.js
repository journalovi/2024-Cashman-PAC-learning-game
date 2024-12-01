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
    this.state = {...this.initialState(), ...this.initialStory()}

    this.parseGameState();
  }

  componentDidUpdate(oldProps) {
    if (oldProps.gamestate != this.props.gamestate) {
      // We activate this state in the game
      this.parseGameState();
    }
  }

  initialize(node, props) {
    this.resetState();
  }

  resetState() {
    this.setState(this.initialState());
  } 

  initialState() {
    return {
      speed: 'NORMAL',
      showGroundTruth: false,
      showCandidate: false,
      resetData: false,
      n_samples: 0,
      training_samples: 0,
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
      setRefresh: false
    }
  }

  initialStory() {
    return {
      staticDataset: false,
      story: {
        targetTrainDistributionType: 'rectangle',
        targetTestDistributionType: 'rectangle',
        resetButtonActive: true,
        pauseButtonActive: true,
        playButtonActive: true,
        testButtonActive: true,
        generatePoints: true,
        drawAllPoints: false,
        showTopStrip: false,
        showAllStrips: false,
        temporalDrift: false,
        trainTestMismatch: false,
        trainDist: 'rectangle',
        testDist: 'rectangle',
        toggledClosestBounds: false,
      }
    }
  }

  parseGameState() {
    // Here, we unwrap the game state.  Each game state has some specific rules.
    switch (this.props.gamestate) {
      case 'beginning': 
        // this.refresh();
        this.setState(this.initialStory());
      break;
      case 'no_free_lunch':
        // We turn everything off, and disable all buttons except test.
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: true,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: true,
            generatePoints: false,
            drawAllPoints: false,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'ten_samples':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        this.refresh(true);
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'tightest_fit':
      case 'pac_learning_1':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the tightest fit rectangle
        this.refresh(true);
        this.setState({
          showCandidate: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: true,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'loosest_fit':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the loosest fit rectangle
        this.refresh(true);
        this.setState({
          showCandidate: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: true,
            toggledMaxMarginBounds: false

          }
        })
        break;
      case 'max_margin':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the rectangle that maximizes the margin
        this.refresh(true);
        this.setState({
          showCandidate: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: true
          }
        })
        break;
      case 'pause_definitions':
        // We should hide the game completely
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            hidePlayer: true
          }
        })
        break;
      case 'pac_learning_2':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the tightest fit rectangle
        // We also show the target rectangle
        this.refresh(true);
        this.setState({
          showCandidate: true,
          showGroundTruth: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: true,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'pac_learning_3':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the tightest fit rectangle
        // We also show the target rectangle
        // We also highlight the top strip, and hide the other strips
        this.refresh(true);
        this.setState({
          showCandidate: true,
          showGroundTruth: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showTopStrip: true,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: true,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'pac_learning_4':
        // We show a static dataset of ten samples.  We disable all buttons including test.
        // We also show the tightest fit rectangle
        // We also show the target rectangle
        // We highlight all four strips
        this.refresh(true);
        this.setState({
          showCandidate: true,
          showGroundTruth: true,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: false,
            pauseButtonActive: false,
            playButtonActive: false,
            testButtonActive: false,
            generatePoints: false,
            drawAllPoints: true,
            showAllStrips: true,
            showTopStrip: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: true,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        })
        break;
      case 'iid':
        // All buttons active.  The source distribution has a temporal drift in 
        // a random direction.
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: true,
            pauseButtonActive: true,
            playButtonActive: true,
            testButtonActive: true,
            generatePoints: true,
            temporalDrift: true,
            drawAllPoints: false,
            showTopStrip: false,
            showAllStrips: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        }, () => { this.refresh() })
        break;
      case 'train_test_mismatch':
        // All buttons active.  The train distribution and test distribtion are 
        // different random regions
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'rectangle',
            resetButtonActive: true,
            pauseButtonActive: true,
            playButtonActive: true,
            testButtonActive: true,
            generatePoints: true,
            trainTestMismatch: true,
            drawAllPoints: false,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        }, () => { this.refresh() })
        break;
      case 'incorrect_model_class':
        // All buttons active.  The train distribution is rectangles and the 
        // test distribution is rings.
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            targetTrainDistributionType: 'rectangle',
            targetTestDistributionType: 'ellipse',
            resetButtonActive: true,
            pauseButtonActive: true,
            playButtonActive: true,
            testButtonActive: true,
            generatePoints: true,
            trainDist: 'rectangle',
            testDist: 'ring',
            drawAllPoints: false,
            showTopStrip: false,
            showAllStrips: false,
            temporalDrift: false,
            trainTestMismatch: false,
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false
          }
        }, () => { this.refresh() })
        break;
      case 'free_play':
        // All hidden configs are active.
        this.refresh();
        this.setState({
          showCandidate: false,
          story: {
            resetButtonActive: true,
            pauseButtonActive: true,
            playButtonActive: true,
            testButtonActive: true,
            generatePoints: true,
            drawAllPoints: false,
            temporalDrift: false,
            trainTestMismatch: false,
            trainDist: 'rectangle',
            testDist: 'rectangle',
            toggledClosestBounds: false,
            toggledFurthestBounds: false,
            toggledMaxMarginBounds: false

          }
        })
        break;
    }
  }

  toggleGroundTruth() {
    this.setState({showGroundTruth: !this.state.showGroundTruth})
  }

  toggleCandidate() {
    this.setState({showCandidate: !this.state.showCandidate})
  }

  refreshClicked() {
    this.refresh(false);
  }

  refresh(isStatic=false) {
    this.resetState();
    this.setState({setRefresh: true, staticDataset: isStatic})
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
    if (this.state.testing) {
      this.setState((state, props) => {
        return {n_samples: state.n_samples += 1}
      });
    } else {
      this.setState((state, props) => {
        return {n_samples: state.n_samples += 1, training_samples: state.training_samples += 1}
      });
    }
  }

  resetSamples() {
    if (this.state.testing) {
      this.setState((state, props) => {
        return {n_samples: 0, training_samples: state.n_samples}
      });
    } else {
      this.setState((state, props) => {
        return {n_samples: 0, training_samples: 0}
      });
    }
  }

  resetRefresh() {
    this.setState((state, props) => {
      return {setRefresh: false, testing: false}
    });
  }

  updateSampleError(sampleStatistics) {
    this.setState((state, props) => {
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
        <Paper >
          <Paper elevation={3} >
            <div className='pac-game-message'>{this.props.parentcurrgamemsg}</div>
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
                  <Button disabled={!this.state.story.resetButtonActive} onClick={this.refreshClicked.bind(this)}><Refresh/></Button>
                  <Button disabled={!this.state.story.pauseButtonActive} className={this.state.speed === 'PAUSE' ? 'selectedButton' : null} onClick={this.pause.bind(this)}><Pause/></Button>
                  <Button disabled={!this.state.story.playButtonActive} className={this.state.speed === 'NORMAL' ? 'selectedButton' : null} onClick={this.play.bind(this)}><PlayArrow/></Button>
                  <Button disabled={!this.state.story.playButtonActive} className={this.state.speed === 'FASTER' ? 'selectedButton' : null} onClick={this.faster.bind(this)}><SkipNext/></Button>
                  <Button disabled={!this.state.story.testButtonActive} onClick={this.toggleTesting.bind(this)}>Test!</Button>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PacScatter
                  total_samples={this.state.total_samples}
                  speed={this.state.speed}
                  showGroundTruth={this.state.showGroundTruth}
                  showCandidate={this.state.showCandidate}
                  resetData={this.state.resetData}
                  targetTrainDistributionType={this.state.story.targetTrainDistributionType}
                  targetTestDistributionType={this.state.story.targetTestDistributionType}
                  trainMatchTest={!this.state.story.trainTestMismatch}
                  testing={this.state.testing}
                  updateSampleError={this.updateSampleError.bind(this)}
                  updateTestError={this.updateTestError.bind(this)}
                  incrementSamples={this.incrementSamples.bind(this)}
                  resetSamples={this.resetSamples.bind(this)}
                  resetRefresh={this.resetRefresh.bind(this)}
                  setRefresh={this.state.setRefresh}
                  xAxisName={this.state.xAxisName}
                  yAxisName={this.state.yAxisName}
                  generatePoints={this.state.story.generatePoints}
                  staticDataset={this.state.staticDataset}
                  drawAllPoints={this.state.story.drawAllPoints}
                  toggledClosestBounds={this.state.story.toggledClosestBounds}
                  toggledFurthestBounds={this.state.story.toggledFurthestBounds}
                  toggledMaxMarginBounds={this.state.story.toggledMaxMarginBounds}
                  showTopStrip={this.state.story.showTopStrip}
                  showAllStrips={this.state.story.showAllStrips}
                  temporalDrift={this.state.story.temporalDrift}
                />
              </Grid>
              <Grid container space={2}>
                <Grid item xs={6}>
                  <div className='evaluation-statistics evaluation-statistics-training'>
                    <Grid container space={2}>
                      <Grid item xs={12}>
                        <div className='evaluation-accuracy'>
                          <span className='accuracy-span'>Seen <b>{this.state.training_samples}</b> out of {this.state.total_samples} total training samples.</span>
                        </div>
                      </Grid>
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
                          <span className='accuracy-span'>Seen <b>{this.state.testing ? this.state.total_samples : 0}</b> out of {this.state.total_samples} total testing samples.</span>
                        </div>
                      </Grid>
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
