import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

let defaultTextColor = '#fff';
let defaultStyle = {
    color: defaultTextColor
};

let fakeServerData = {
    user: {
        name: 'Brian',
        playlists: [
      {
        name: 'My favorites',
        songs: [
          {name: 'Beat It', duration: 1345}, 
          {name: 'Cannelloni Makaroni', duration: 1236},
          {name: 'Rosa helikopter', duration: 70000}
        ]
      },
      {
        name: 'Discover Weekly',
        songs: [
          {name: 'Beat It', duration: 1345}, 
          {name: 'Cannelloni Makaroni', duration: 1236},
          {name: 'Rosa helikopter', duration: 70000}
        ]
      },
      {
        name: 'Another playlist - the best!',
        songs: [
          {name: 'Beat It', duration: 1345}, 
          {name: 'Hallelujah', duration: 1236},
          {name: 'Rosa helikopter', duration: 70000}
        ]
      },
      {
        name: 'Playlist - yeah!',
        songs: [
          {name: 'Beat It', duration: 1345}, 
          {name: 'Cannelloni Makaroni', duration: 1236},
          {name: 'Hej Hej Monika', duration: 70000}
        ]
      }
    ]
    }
};

class PlaylistCounter extends Component {
    render() {
        return (
            <div style={{width: "40%", display: 'inline-block'}}>
                <h2 style={defaultStyle}>{this.props.playlists.length} Playlists</h2>
            </div>
        );
    }
}

class HoursCounter extends Component {
    render() {
        let allSongs = this.props.playlists.reduce((songs,eachPlaylist) => {
            return songs.concat(eachPlaylist.songs)
        } ,[]);
        let totalDuration = allSongs.reduce((sum, eachSong) => { 
            return sum + eachSong.duration
        }, 0)
        return (
            <div style={{width: "40%", display: 'inline-block'}}>
                <h2 style={defaultStyle}>{Math.round(totalDuration/60)} Hours</h2>
            </div>
        );
    }
}

class Filter extends Component {
    render() {
        return (
            <div>
                <img/>
                Playlist<input type="text" onKeyUp={event => 
                    this.props.onTextChange(event.target.value)}/>
            </div>
        );
    }
}

class Playlist extends Component {
    render() {
        let playlist = this.props.playlist
        return (
            <div style={{...defaultStyle,width: "25%",display: 'inline-block'}}>
                <img/>
                <h3>{playlist.name}</h3>
                <ul>
                    {playlist.songs.map(song =>
                        <li>{song.name}</li>
                )}
                </ul>
            </div>
        );
    }
}


class App extends Component {
    constructor() {
        super();
        this.state = {
            serverData: {},
            filterString: ''    
        }
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({serverData: fakeServerData});
        }, 1000);
        setTimeout(() => {
            this.setState({filterString: ''});
        }, 2000);
    }
    render() {
        let playlistToRender = this.state.serverData.user ? this.state.serverData.user.playlists
            .filter(playlist =>
            playlist.name.toLowerCase().includes(
                this.state.filterString.toLowerCase())
            ) : []
        return (
            <div className="App">
                {this.state.serverData.user ? 
                  <div>
                    <h1 style={{...defaultStyle, 'font-size': '54px'}}>Music Switcher</h1>
                    <h2 style={{...defaultStyle}}>{this.state.serverData.user.name}</h2>
                    <PlaylistCounter playlists={playlistToRender}/> 
                    <HoursCounter playlists={playlistToRender}/>
                    <Filter onTextChange={text => this.setState({filterString: text})}/>
                    {playlistToRender.map(playlist =>
                       <Playlist playlist={playlist} /> 
                    )}
                  </div> : <h1>Loading...</h1>
                }
            </div>
        );
    }
}
export default App;
