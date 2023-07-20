const React = require('react');
import Refresh from '@material-ui/icons/Refresh';

class InlineRefresh extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <Refresh />
    );
  }
}

module.exports = InlineRefresh;