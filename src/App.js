import React, { Component } from 'react';
import axios, { post } from 'axios';
import './App.css';
import 'reset-css/reset.css';
import queryString from 'query-string';

let defaultTextColor = '#fff';
let counterStyle = {
    width: "40%", 
    display: 'inline-block',
    'marginBottom': '10px', 
    'fontSize': '20px', 
    'lineHeight': '30px'
}
let defaultStyle = {
    color: defaultTextColor
};

class PlaylistCounter extends Component {
    render() {
        return (
            <div style={counterStyle}>
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
            <div style={counterStyle}>
                <h2 style={defaultStyle}>{Math.round(totalDuration/60)} Hours</h2>
            </div>
        );
    }
}

class Filter extends Component {
    render() {
        return (
            <div style={{'fontSize': '20px'}}>
                Playlist <input type="text" onKeyUp={event => 
                    this.props.onTextChange(event.target.value)}
                    style={{'fontSize': '20px', padding: '10px'}}/>
            </div>
        );
    }
}

class Playlist extends Component {
    render() {
        let playlist = this.props.playlist
        return (
            <div style={{...defaultStyle,width: "25%",display: 'inline-block', padding: '10px'}}>
                <h3 style={{'fontSize': '18px', 'fontWeight': '900', padding: '5px'}}>{playlist.name}</h3>
                <img alt="playlist" src = {playlist.imageUrl} />
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
            filterString: '',
            file: null 

        }
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fileUpload = this.fileUpload.bind(this);

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
                    if ((item.images.length === 0) || !(item.images.find(image => image.height === 60))) {
                        console.log(item)
                        return {  
                        name: item.name,
                        songs: item.trackDatas.slice(0,3)
                        }
                    }
                        return {  
                        name: item.name,
                        imageUrl: item.images.find(image => image.height === 60).url,
                        songs: item.trackDatas.slice(0,3)
                        
                    }
                })
            }))
    

        setTimeout(() => {
            this.setState({filterString: ''});
        }, 2000);
    }


    fileUpload(file) {
        const formData = new FormData();
        formData.append('file',file)
        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }
        
    }
    handleChange(event) {
        this.setState({file: event.target.files[0]});
    }
    handleSubmit(event) {
        event.preventDefault();
        this.fileUpload(this.state.file).then((response)=>{
            console.log(response.data);
        })
    }

    render() {


        let playlistToRender = 
            this.state.user && this.state.playlists 
            ? this.state.playlists.filter(playlist => {

                if (playlist === undefined || playlist === null) {
            
                    return
                }

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
                    <h1 style={{...defaultStyle, 'fontSize': '54px', 'marginTop':'5px'}}>Music Switcher</h1>
                    <h2 style={{...defaultStyle, 'fontSize': '28px'}}>{this.state.user.name}</h2>
                    <br></br>

                    <PlaylistCounter playlists={playlistToRender}/> 
                    <HoursCounter playlists={playlistToRender}/>
                    <Filter onTextChange={text => this.setState({filterString: text})}/> 
                    {playlistToRender.map(playlist =>
                        <Playlist playlist={playlist} /> 
                    )}
                  </div> : <React.Fragment>
                    {/*
                    <h1 style ={{'fontSize': '24px'}}>Convert Apple Music Playlists to Spotify Playlists</h1>
                    <h1 style ={{'fontSize': '22px'}}>Upload iTunes Library XML file</h1>
                    <h1>File > Library > Export Library</h1>
                    <form onSubmit={this.handleSubmit}>
                        <input onChange={this.handleChange} id="file" value={this.state.value} type="file" name="file" accept=".xml"/>
                        <input type="submit" value="Submit"/>
                    </form>
                    */}

                    <br></br>
                    <button onClick={() =>
                      window.location = window.location.href.includes('localhost')
                      ? 'http://localhost:8888/login'
                      : 'https://spotifybackenduser.herokuapp.com/login' 
                    }
                    style={{'fontSize': '28px', padding: '20px', 'marginTop': '20px'}}>Sign in with Spotify</button>

                </React.Fragment>
                }
                  </div>
        );
    }
}
export default App;
