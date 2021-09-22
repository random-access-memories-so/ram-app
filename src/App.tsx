import React, { FC } from 'react';
import './App.css';
import { createTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import Wallet from './components/Wallet';
import { deepPurple, grey } from '@material-ui/core/colors';
import { SnackbarProvider } from 'notistack';
import Home from './pages/Home';
import {
    HashRouter as Router,
    Route,
} from "react-router-dom";
import ARViewer from './components/ARViewer';

const theme = createTheme({
  palette: {
      type: 'dark',
      primary: {
          main: deepPurple[700],
      },
      background: {
          default: grey[900]
      }
  },
  overrides: {
      MuiButtonBase: {
          root: {
              justifyContent: 'flex-start',
          },
      },
      MuiButton: {
          root: {
              textTransform: undefined,
              padding: '12px 16px',
          },
          startIcon: {
              marginRight: 8,
          },
          endIcon: {
              marginLeft: 8,
          },
      },
  },
});

const App: FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider>
                <Router>
                    <Route path="/">
                        <Wallet>
                            <Home />
                        </Wallet>
                    </Route>
                    <Route path="/ar/:base64modelUri">
                        <ARViewer />
                    </Route>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
