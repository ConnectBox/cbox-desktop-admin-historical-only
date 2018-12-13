import React, { Component } from 'react';
import './App.css';
import CboxAppContainer from './containers/cbox-app-container'
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

class App extends Component {
  render() {
    return (
      <I18nextProvider i18n={ i18n }>
        <CboxAppContainer/>
      </I18nextProvider>
    );
  }
}

export default App;
