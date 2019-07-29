import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { withTranslation } from 'react-i18next';

const styles = {
  appbar: {
    position: 'fixed',
    backgroundColor: 'whitesmoke',
    color: 'rgb(0,152,210)',
  },
  appIconLeft: {
    color: 'rgb(0,152,210)',
  },
  logo: {
    height: 54,
  },
  title: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 30,
    textDecoration: 'none',
    width: '100%',
  },
  version: {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: 16,
    textDecoration: 'none',
    paddingLeft: 34,
  },
  root: {
    width: '100%',
  },
  filler: {
    flexBasis: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -22,
  },
};

const CBoxAppBar = (props) =>  {
  const { t, classes, displayMenu, versionStr } = props;
  let useVersionStr
  if (versionStr) useVersionStr = t("version") + " " +versionStr
  return (
  <AppBar
    className={classes.appbar}
  >
    <Toolbar>
      {displayMenu && (<IconButton
        className={classes.menuButton}
        color="primary"
        aria-label="Menu"
        onClick={props.onLeftIconButtonClick}
      >
        <MenuIcon />
      </IconButton>)}
      <Typography
        className={classes.title}
        type="title"
        color="inherit"
      >
        <img src={process.env.PUBLIC_URL + '/icon/ConnectBox.png'} alt="" style={styles.logo} />
      </Typography>
    </Toolbar>
    {versionStr && (<Typography
      className={classes.version}
      type="title"
      color="inherit"
    >{useVersionStr}
    </Typography>)}
  </AppBar>
  );
}

CBoxAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withTranslation()(CBoxAppBar));
