import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let defaultTextColor = '#fff';
let defaultStyle = {
    color: defaultTextColor
};

class Aggregate extends Component {
    render() {
        return (
            <div style={{width: "40%", display: 'inline-block'}}>
                <h2 style={defaultStyle}>Number Text</h2>
            </div>
        );
    }
}

class Filter extends Component {
    render() {
        return (
            <div>
                <img/>
                Playlist<input type="text"/>
            </div>
        );
    }
}

class Playlist extends Component {
    render() {
        return (
            <div style={{...defaultStyle,width: "25%",display: 'inline-block'}}>
                <img/>
                <h3>Playlist Name</h3>
                <ul><li>Song 1</li>
                    <li>Song 2</li>
                </ul>
            </div>
        );
    }
}


class App extends Component {
  render() {
    return (
            <div className="App">
                <h1>Music Switcher</h1>
                <Aggregate/>
                <Aggregate/>
                <Filter/>
                <Playlist/>
                <Playlist/>
                <Playlist/>
                <Playlist/>
            </div>
    );
  }
}
export default App;
