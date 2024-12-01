const React = require('react');
import SkipNext from '@material-ui/icons/SkipNext';

class InlineFaster extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <SkipNext />
    );
  }
}

module.exports = InlineFaster;