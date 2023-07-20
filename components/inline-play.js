const React = require('react');
import PlayArrow from '@material-ui/icons/PlayArrow';

class InlinePlay extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <PlayArrow />
    );
  }
}

module.exports = InlinePlay;