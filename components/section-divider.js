const React = require('react');
import ArrowDownward from '@material-ui/icons/ArrowDownward';

class SectionDivider extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div className={props.extraspace ? "extraspace" : ""}>
        <div className="section-divider">
          <ArrowDownward fontSize="large" className="section-divider-arrow"/>
        </div>
        <hr></hr>
      </div>
    );
  }
}

module.exports = SectionDivider;