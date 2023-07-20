const React = require('react');
import Fab from '@material-ui/core/Fab';
import NavigationIcon from '@material-ui/icons/Navigation';

class GameChanger extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    
    // Initialize
    const size = "medium";
    const color = "secondary";
    
    return (
      <div {...props}>
        <Fab variant="extended" size="{{size}}">
          <NavigationIcon color="{{color}}" />
          {props.shortText}
        </Fab>
      </div>
    );
  }
}

module.exports = GameChanger;
