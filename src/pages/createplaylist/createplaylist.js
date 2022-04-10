import { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../component/card/card.jsx";
import FormSubmission from "../../component/form/form.jsx";
import { url } from "../login/login.js";
import { useSelector } from 'react-redux';

const CreatePlaylist = ()=> {
   const accessToken = useSelector(state => state.dataAccessToken.value); 
   const [tracksData, setTracksData] = useState([]);
   const [query, setQuery] = useState();
   const [selectedTracks, setSelectedTracks] = useState([]);
   const [mergedTracks, setMergedTracks] = useState([]);
   
   useEffect (() =>{
    const mergedTracksWithSelectedTracks = tracksData.map((track) =>({
      ...track,
        isSelected: !!selectedTracks.find((selectedTrack) => selectedTrack === track.uri),
      }));
      setMergedTracks(mergedTracksWithSelectedTracks);
  },[selectedTracks,tracksData]);

   
   ///select handler///
   const handleSelectTrack = (uri)=>{
    const alreadySelected = selectedTracks.find(selectedTrack => selectedTrack === uri)
      if (alreadySelected){
        setSelectedTracks(selectedTracks.filter(selectedTrack => selectedTrack !== uri))
      }
      else {
        setSelectedTracks((selectedTracks)=>[...selectedTracks,uri])
      }
      console.log(selectedTracks);
  };
  ///select handler///
   

  ///search tracks aka card///
   const handleInput = (e) => { 
    setQuery(e.target.value)
    }

   const searchCard = async () =>{
    try {
      const cards = await axios
      .get(
        `http://api.spotify.com/v1/search?q=${query}&type=track&access_token=${accessToken}`
      )
      setTracksData(cards.data.tracks.items);
     console.log(cards);
    } catch (error) {
      console.log('error');
    } 
   }
   ///search tracks aka card///

  ///render tracks/// 

  const renderTracks =() =>{
    return (
      <div className="container">
        {mergedTracks.map((card) => {
          const {uri} = card;
          return(
            <Card onSelectTrack={handleSelectTrack} key={uri} item={card}/>
          )
        })}
      </div>
    );
  };
  ///render tracks///



   ///user handler///
   const [user, setUser] = useState({
    displayName: '',
    imagesUrl: '',
    user_id: undefined
   })

   const getUserData = async () => {
    try {
      const data = await axios
        .get(
            `https://api.spotify.com/v1/me?access_token=${accessToken}`
        )
        setUser({ ...user, displayName: data.data.display_name, imagesUrl: data.data.images[0].url, user_id: data.data.id })
        console.log(data);
    } catch (error) {
      console.log('get user data error');
    }
   }
   ///user handler///


   /// form handler ///
   const [addPlaylist, setAddPlaylist] = useState({
    name: '',
    description: '',
   })

   const [playlistID, setPlaylistID] = useState(url);
   const bodyParams = {
    name: addPlaylist.name,
    description: addPlaylist.description,
    collaborative: false,
    public: false
   }

   const header = {
    Authorization: `Bearer ${accessToken}`
   }

   const handleAddPlaylistChange = e => {
    const { name, value } = e.target;
    setAddPlaylist({ ...addPlaylist, [name]: value })
   }

   const handleAddPlaylistSubmit = async e => {
    e.preventDefault();
    console.log(addPlaylist);
    await axios
        .post(
            `https://api.spotify.com/v1/users/${user.user_id}/playlists`, bodyParams,
            {
                headers: header
            }
        )
        .then((response) => (
            handleAddItemToPlaylist(response.data.id)))
        .catch((error) => error)
   }

   ///add songs to playlist///
   const itemParams = {
    uris: selectedTracks
   }

  const handleAddItemToPlaylist = async (id) => {
    setPlaylistID(id);
    const data = await axios
        .post(
            `https://api.spotify.com/v1/playlists/${id}/tracks`, itemParams,
            {
                headers: header
            }
        )
        .catch((error) => error)
    console.log(data);
   }
   ///add songs to playlist///

  ///form handler///

    return (
        <>
            <div className="search-section">
                <div className="header-page">
                  <div className="header-search">
                    <h1>Search Song</h1>
                    <input placeholder="Artists, songs, or podcasts" onChange={handleInput}/>
                    <button onClick={searchCard}>Search</button>
                  </div>
                  <div className="log-user">
                    <h2>Logged in as: {user.displayName}</h2>
                    <button onClick={getUserData}>Connect Your Spotify</button>
                  </div>
                </div>
                <FormSubmission
                    handleAddPlaylistChange={handleAddPlaylistChange}
                    handleAddPlaylistSubmit={handleAddPlaylistSubmit}
                    addPlaylist={addPlaylist}
                    playlistID={playlistID}
                    selectedTracks={selectedTracks}/>
                <>{renderTracks()}</>
            </div>
        </>
      );
  };
  export default CreatePlaylist;