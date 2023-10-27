const React = require('react');
import Help from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';

class InfoTooltip extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <Tooltip title={props.tooltiptext} placement="right">
        <IconButton>
          <Help />
        </IconButton>
      </Tooltip>      
    );
  }
}

module.exports = InfoTooltip;