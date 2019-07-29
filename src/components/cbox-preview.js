import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { withTranslation } from 'react-i18next';

const styles = {
  info:{
    float: 'left',
    color: 'lightgrey',
    top: 15,
    left: 15,
    position: 'relative',
  }
};

class CboxPreview extends React.Component {
  state = {
    location: undefined,
    curResources: [],
  }


  componentDidMount = () => {
    if (this.props.location != null){
      this.setState({location: this.props.location})
    }
  }

  componentDidUpdate = (nextProps) => {
    if (this.props.location !== nextProps.location){
      this.setState({location: nextProps.location})
    }
  }

  onRendition = obj => {
    if ((obj!=null)
        &&(obj.book!=null)
        &&(obj.book.resources!=null)
        &&(obj.book.resources.resources!=null)){
      this.setState(
        {
          curResources: obj.book.resources.resources
        }
      )
    }
  }

  onLocationChanged = checkLoc => {
    const {curResources} = this.state;
    if ((curResources!=null)&&(curResources.length>0)) {
      const curObj = curResources.find(obj => {
        const pos = obj.href.lastIndexOf(checkLoc);
        return (pos>=0)&&(obj.href.length===pos+checkLoc.length);
      }) // Checking if suitable resource is available
      let location=checkLoc; // use initial checkLoc as default
      if (curObj!=null){ // Found resource - use the full href
        location = curObj.href
      }
      this.setState({location})
    }
  }
/*
<iframe
  title="Preview"
  src={url}
  frameBorder="0"
  overflow="hidden"
  width="100%"
  height={height}
/>
*/

  render() {
    const { t  } = this.props;
    return (
      <div>
        <Typography
          type="title"
          style={styles.info}
        >{t("previewInSecondWindow")}</Typography>
      </div>
    )
  }
};


CboxPreview.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withTranslation()(CboxPreview));
