const React = require('react');
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import PacScatter from './pac-scatter';
import Pause from '@material-ui/icons/Pause';
import PlayArrow from '@material-ui/icons/PlayArrow';
import SkipNext from '@material-ui/icons/SkipNext';

class PacGameContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      speed: 'NORMAL',
      showGroundTruth: false,
      resetData: false,
      n_samples: 0,
      total_samples: 100,
      testing: false
    }

  }

  initialize(node, props) {
    this.state = {
      speed: 'NORMAL',
      showGroundTruth: false,
      resetData: false,
      n_samples: 0,
      total_samples: 100,
      testing: false
    }
  }

  toggleGroundTruth() {
    this.setState({showGroundTruth: !this.state.showGroundTruth})
  }

  refresh() {
    console.log("refresh called")
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

  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;

    return (
      <div className='pac-game-container' {...props}>
        <Paper>
          <Grid container spacing={3}>
            <Grid item container xs={2}>
              <Grid item xs={12} className='pac-game-step'>Play</Grid>
              <Grid item xs={12} className='pac-game-step'>Sampling</Grid>
              <Grid item xs={12} className='pac-game-step'>Automated Models</Grid>
              <Grid item xs={12} className='pac-game-step'>PAC Learning</Grid>
              <Grid item xs={12} className='pac-game-step'>Why does ML fail?</Grid>
              <Grid item xs={12} className='pac-game-step'>How does Viz fix this?</Grid>
            </Grid>
            <Grid item xs={10}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Button onClick={this.refresh.bind(this)}>re</Button>
                  <Button onClick={this.pause.bind(this)}><Pause/></Button>
                  <Button onClick={this.play.bind(this)}><PlayArrow/></Button>
                  <Button onClick={this.faster.bind(this)}><SkipNext/></Button>
                  <Button onClick={this.toggleTesting.bind(this)}>Test!</Button>
                  <Button onClick={this.toggleGroundTruth.bind(this)}>Toggleshow</Button>
                  <div>{this.state.n_samples} samples</div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <PacScatter
                  total_samples={this.state.total_samples}
                  speed={this.state.speed}
                  showGroundTruth={this.state.showGroundTruth}
                  resetData={this.state.resetData}
                  targetTrainDistributionType="ellipse"
                  targetTestDistributionType="ellipse"
                  trainMatchTest={true}
                  testing={this.state.testing}
                />
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

module.exports = PacGameContainer;
