const React = require('react');
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// TODOS
// - Bind number of scattered points to form field
// - Add icons

class CustomComponent extends React.Component {
  render() {
    const { hasError, idyll, updateProps, ...props } = this.props;
    return (
      <div {...props}>
        <Paper>
          <Grid container spacing={3}>
            <Grid item xs={2}>
              <Grid container wrap="nowrap" spacing={4}>
                <Grid item>Play</Grid>
                <Grid item>Sampling</Grid>
                <Grid item>Automated Models</Grid>
                <Grid item>PAC Learning</Grid>
                <Grid item>Why does ML fail?</Grid>
                <Grid item>How does Viz fix this?</Grid>
              </Grid>
            </Grid>
            <Grid item xs={10}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Button>O</Button>
                  <Button>II</Button>
                  <Button>I></Button>
                  <Button>II></Button>
                  <Button>Test!</Button>
                  <div>{4} samples</div>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <svg width={300} height={50} style={{ display: 'block', margin: '20px auto', background: 'white'}}>
                  <rect width={50} height={50} y={0} x={25} fill={'#ddd'} />
                  <circle cx={50} cy={25} r={15} x={25} fill={'#000'} />
                  <rect width={50} height={50} y={0} x={125} fill={'#ddd'} />
                  <circle cx={150} cy={25} r={15} x={25} fill={'#000'} />
                  <rect width={50} height={50} y={0} x={225} fill={'#ddd'} />
                  <circle cx={250} cy={25} r={15} x={25} fill={'#000'} />
                </svg>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

      </div>
    );
  }
}

module.exports = CustomComponent;
