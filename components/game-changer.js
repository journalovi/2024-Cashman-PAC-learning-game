const React = require('react');
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';
import InfoTooltip from './info-tooltip';

class GameChanger extends React.Component {

  constructor(props) {
      super(props)
      this.state ={
        scrolledPast: false,
      }
  }

  componentDidUpdate(oldProps) {
    const {progressvar} = this.props;
    const oldProgressVar = oldProps.progressvar;
    if ((oldProgressVar == 0) && (progressvar > 0) && !this.state.scrolledPast) {
      // We activate this state in the game
      this.setState( { scrolledPast: true } );
      this.forceGameState();
    }
  }

  forceGameState() {
    this.props.updateProps({
      parentcurrgamestate: this.props.gamestate,
      parentcurrgamemsg: this.props.longtext
    })
  }

  render() {
    const { hasError, idyll, updateProps, showhelp, ...props } = this.props;

    return (
      <div className="game-changer" {...props}>
        <Fab variant="extended" size="medium" color="primary" onClick={this.forceGameState.bind(this)}>
          <NavigationIcon 
            color={props.parentcurrgamestate === props.gamestate ? "secondary" : "primary"}
            className={props.parentcurrgamestate === props.gamestate ? "rotate90" : "rotate0"}
          />
          {props.shorttext}
        </Fab>
        {showhelp && <InfoTooltip tooltiptext="As you scroll through this page, each time you see a button like this one, the game will change to match where you are in the text.  After that, to go back to any previous state, either click on the buttons, or refresh the page." />}
      </div>
    );
  }
}

module.exports = GameChanger;
