const React = require('react');
import Pause from '@material-ui/icons/Pause';

class InlinePause extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <Pause />
    );
  }
}

module.exports = InlinePause;