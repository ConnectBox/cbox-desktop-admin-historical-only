import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { LanguageSelect } from './language-select';
import MetadataConfigDialog from './metadata-config-dialog';
import {iso639Langs} from '../iso639-1-full.js'
import { menuList } from './cbox-menu-list';
import { withNamespaces } from 'react-i18next';

const styles = theme => ({
  menuTitle: {
    margin: '15px 0px 4px 0px',
  },
  dialogPaper: {
    overflowY: 'visible',
  },
  dialogContent: {
    width: 300,
    minWidth: 300,
    zIndex: 2000,
    overflowY: 'visible',
  },
  title: {
    cursor: 'pointer',
  },
});

class TypeLangSelect extends React.Component {
  state = {
    curLang: undefined,
    filter: "aud", // Default
    value: "/audio", // Default
    configOk: false,
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.filter !== nextProps.filter) {
      if (nextProps.filter==="vid") {
        this.setState({
          filter: "vid",
          value: "/video",
        })
      } else if (nextProps.filter==="epub") {
        this.setState({
          filter: "epub",
          value: "/books",
        })
      } else if (nextProps.filter==="html") {
        this.setState({
          filter: "html",
          value: "/training",
        })
      }
    }
    if (this.props.defaultLang !== nextProps.defaultLang){
      this.setState({ curLang: nextProps.defaultLang});
    }
  }

  componentWillMount = () => {
    const {defaultLang, filter} = this.props;
    if (filter==="vid") {
      this.setState({
        filter,
        value: "/video",
      })
    } else if (filter==="epub") {
      this.setState({
        filter,
        value: "/books",
      })
    } else if (filter==="html") {
      this.setState({
        filter,
        value: "/training",
      })
    }
    if (defaultLang != null){
      this.setState({ curLang: defaultLang});
    }
  }

  handleLangUpdate = (lang) => {
    this.setState({curLang: lang.value})
  }

  handleContinue = () => {
    this.setState({configOk: true})
  }

  handleChange = (event) => {
    let filter = "aud";
    if (event.target.value==="/video"){
      filter = "vid"
    } else if (event.target.value==="/books"){
      filter = "epub"
    }
    this.setState({
      value: event.target.value,
      filter,
    })
  }

  render() {
    const { classes, t } = this.props;
    const { filter, curLang } = this.state;
    if (!this.state.configOk){
      return (
        <Dialog
          open={true}
          disableBackdropClick
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          classes={{
            paper: classes.dialogPaper,
          }}
        >
          <DialogTitle id="form-dialog-title">{t("newTitle")}</DialogTitle>
          <DialogContent
            className={classes.dialogContent}
          >
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">
                {t("mediaType")}
              </FormLabel>
              <RadioGroup
                aria-label="mediaType"
                name="mediaType"
                className={classes.group}
                value={this.state.value}
                onChange={this.handleChange}
              >
                {menuList.filter(choice => choice.enabled && choice.path!=="/").map(choice => {
                  const {titleId, path} = choice;
                  const labelStr = t(titleId);
                  return (
                    <FormControlLabel
                      key={path}
                      value={path}
                      control={<Radio color="primary"/>}
                      label={labelStr} />
                  )
                })}
              </RadioGroup>
            </FormControl>
            <Divider />
            <Typography
              type="title"
              color="inherit"
              className={classes.menuTitle}
            >{t("language")}:</Typography>
            <LanguageSelect
              languages={Object.keys(iso639Langs)}
              selLang={curLang}
              onLanguageUpdate={this.handleLangUpdate}
            />
          </DialogContent>
          <DialogActions>
            <Button
              color="primary"
              variant="contained"
              onClick={this.props.onClose}>
              {t("cancel")}
            </Button>
            <Button
                color="primary"
                variant="contained"
                onClick={this.handleContinue}>
                {t("continue")}
            </Button>
          </DialogActions>
        </Dialog>
      )
    } else {
      return (
        <MetadataConfigDialog
          usbPath={this.props.usbPath}
          usbHash={this.props.usbHash}
          open={true}
          createNew={true}
          filter={filter}
          lang={curLang}
          isSelectedSerie={true}
          item={null}
          onClose={this.props.onClose}
          onAddTitle={this.props.onAddTitle}
          onDelete={this.props.onDelete}
        />
      )
    }
  }
}

TypeLangSelect.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(withNamespaces()(TypeLangSelect));
