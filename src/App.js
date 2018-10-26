import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import queryString from 'query-string';

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
                <img alt="playlist image" src = {playlist.imageUrl} />
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
        let parsed = queryString.parse(window.location.search);
        let accessToken = parsed.access_token;

        if (!accessToken)
            return;

        fetch('https://api.spotify.com/v1/me', {
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
            .then(data => this.setState({user: {name: data.display_name}}))
        
        fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {'Authorization': 'Bearer ' + accessToken}
        }).then(response => response.json())
            .then(playlistData => {
                    let playlists = playlistData.items
                    let trackDataPromises = playlists.map(playlist => { 
                    let responsePromise = fetch(playlist.tracks.href, {
                        headers: {'Authorization': 'Bearer ' + accessToken}
                    })
                    let trackDataPromise = responsePromise
                        .then(response => response.json())
                    return trackDataPromise;
                    })

                let allTracksDataPromises = 
                    Promise.all(trackDataPromises)
                let playlistsPromise =  allTracksDataPromises.then(trackDatas => {
                    trackDatas.forEach((trackData, i) => {
                        playlists[i].trackDatas = trackData.items
                            .map(item => item.track)
                            .map(trackData => ({
                                name: trackData.name,
                                duration: trackData.duration_ms / 1000
                            }))
                    })
                    return playlists
                })
                return playlistsPromise
            })

            .then(playlists => this.setState({
                playlists: playlists.map(item => {
                  return {  
                    name: item.name,
                    imageUrl: item.images.find(image => image.height == 60).url,
                    songs: item.trackDatas.slice(0,3)
                    }
                })
            }))
    

        setTimeout(() => {
            this.setState({filterString: ''});
        }, 2000);
    }
    render() {
        let playlistToRender = 
            this.state.user && this.state.playlists 
            ? this.state.playlists.filter(playlist => {
                let matchesPlaylist = playlist.name.toLowerCase().includes(
                    this.state.filterString.toLowerCase())
                let matchesSong     = playlist.songs.find(song => song.name.toLowerCase()
                    .includes(this.state.filterString.toLowerCase()))
                return matchesPlaylist || matchesSong
            }) : []
        return (
            <div className="App">
                {this.state.user ? 
                  <div>
                    <h1 style={{...defaultStyle, 'font-size': '54px'}}>Music Switcher</h1>
                    <h2 style={{...defaultStyle}}>{this.state.user.name}</h2>
                    <PlaylistCounter playlists={playlistToRender}/> 
                    <HoursCounter playlists={playlistToRender}/>
                    <Filter onTextChange={text => this.setState({filterString: text})}/> 
                    {playlistToRender.map(playlist =>
                        <Playlist playlist={playlist} /> 
                    )}
                  </div> : <button onClick={() =>
                      window.location = window.location.href.includes('localhost')
                      ? 'http://localhost:8888/login'
                      : 'https://spotifybackenduser.herokuapp.com/login' 
                    }
                      /*location.protocol + ''/login'}*/
                    style={{'font-size': '20px', padding: '20px', 'margin-top': '20px'}}>Sign in with Spotify</button>
                }
                  </div>
        );
    }
}
export default App;
