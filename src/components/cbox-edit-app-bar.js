import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { isEmptyObj } from '../utils/obj-functions';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { CboxTextField } from './cbox-text-field';

const styles = theme => ({
  appbar: {
    position: 'fixed',
    backgroundColor: 'whitesmoke',
    color: 'rgb(0,152,210)',
  },
  appIconLeft: {
    color: 'rgb(0,152,210)',
  },
  textField: {
    marginTop: 0,
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  logo: {
    top: 10,
    height: 40,
  },
  title: {
    cursor: 'pointer',
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
});

const CBoxEditAppBar = (props) =>  {
  const { classes, channel, verifyLength } = props;
  const onUpdate = (value) => {
    console.log('value', value);
  }
  const tmpOrgTitle = !isEmptyObj(channel)? channel.title : null;
  return (
    <AppBar
      className={classes.appbar}
    >
      <Toolbar>
        <IconButton
          className={classes.menuButton}
          color="primary"
          disabled
          aria-label="Menu"
        >
          <MenuIcon />
        </IconButton>
        <CboxTextField
          label="Channel name"
          verifyLength={verifyLength}
          onUpdate={onUpdate}
          onChannelUpdate={props.onChannelUpdate}
          defaultValue={tmpOrgTitle}
          autoFocus
        />
        <div className={classes.filler}></div>
      </Toolbar>
    </AppBar>
  );
}

CBoxEditAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CBoxEditAppBar);
