const React = require('react');
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';

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
    const { hasError, idyll, updateProps, ...props } = this.props;

    // Initialize
    // const scrolledPast = false;

    // React.useEffect(() => {
    //   console.log("progressvar has changed", props.progressvar)
    // }, [props.progressvar])

  

    return (
      <div className="game-changer" {...props}>
        <Fab variant="extended" size="medium" color="primary" onClick={this.forceGameState.bind(this)}>
          <NavigationIcon 
            color={props.parentcurrgamestate === props.gamestate ? "secondary" : "primary"}
            className={props.parentcurrgamestate === props.gamestate ? "rotate90" : "rotate0"}
          />
          {props.shorttext}
        </Fab>
      </div>
    );
  }

  // Need to add a callback that changes the global props to the gamestate when... when it is scrolled over I guess?  Or if it is clicked?
}

module.exports = GameChanger;
