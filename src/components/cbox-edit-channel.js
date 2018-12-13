import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { isEmptyObj } from '../utils/obj-functions';
import { CboxTextField } from './cbox-text-field';
import { withNamespaces } from 'react-i18next';

const styles = theme => ({
  textFieldWrap: {
    paddingTop: 90,
  },
  title: {
    cursor: 'pointer',
  },
});

const CBoxEditChannel = (props) =>  {
  const { t, classes, channel, verifyLength } = props;
  const onUpdate = (value) => {
  }
  const tmpOrgTitle = !isEmptyObj(channel)? channel.title : null;
  return (
    <div className={classes.textFieldWrap}>
      <CboxTextField
        label={t("channelName")}
        verifyLength={verifyLength}
        onUpdate={onUpdate}
        onChannelUpdate={props.onChannelUpdate}
        defaultValue={tmpOrgTitle}
        autoFocus
      />
    </div>
  );
}

CBoxEditChannel.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withNamespaces()(CBoxEditChannel));
