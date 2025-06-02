import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import Sidebar from "./Sidebar";
import useAuth from "../hooks/useAuth";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);

  const userDataString = sessionStorage.getItem("userData");
  const userData = userDataString ? JSON.parse(userDataString) : null;
  console.log("User Data:", userData);

  const token = sessionStorage.getItem("token");
  console.log("Token:", token);

  console.log(searchResults);

  // Search for songs
  useEffect(() => {
    const spotifyApi = new SpotifyWebApi({
      clientId: userData?.client_Id,
    });

    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);

    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    setPlaylistTracks([]);

    let cancel = false;
    spotifyApi.searchTracks(search).then((res) => {
      if (cancel) return;
      setSearchResults(
        res.body.tracks.items.map((track) => {
          const smallestAlbumImage = track.album.images.reduce(
            (smallest, image) => {
              if (image.height < smallest.height) return image;
              return smallest;
            },
            track.album.images[0]
          );

          return {
            artist: track.artists[0].name,
            title: track.name,
            uri: track.uri,
            albumUrl: smallestAlbumImage.url,
          };
        })
      );
    });

    return () => (cancel = true);
  }, [search, accessToken]);

  // Choose a track
  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  // Fetch lyrics
  useEffect(() => {
    if (!playingTrack) return setLyrics("");

    const { title, artist } = playingTrack;
    const query = new URLSearchParams({ title, artist }).toString();
    fetch(`http://localhost:5000/lyrics?${query}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch lyrics");
        return res.json();
      })
      .then((data) => {
        setLyrics(data.lyrics);
      })
      .catch((err) => {
        console.error("Error fetching lyrics:", err);
        setLyrics("No lyrics found");
      });
  }, [playingTrack]);

  function handlePlaylistSelect(playlistId) {
    setSelectedPlaylist(playlistId);
    setSearch("");
    setSearchResults([]);
    setLyrics("");
    setIsPlaylistPlaying(false);

    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.items) {
          setPlaylistTracks([]);
          return;
        }

        const tracks = data.items
          .filter((item) => item.track && item.track.album)
          .map((item) => {
            const track = item.track;

            return {
              artist: track.artists?.[0]?.name || "Unknown Artist",
              title: track.name || "Untitled",
              uri: track.uri,
              albumUrl: track.album.images[2].url || "",
            };
          });

        setPlaylistTracks(tracks);
      });
  }

  function handlePlayPlaylist() {
    if (playlistTracks.length > 0) {
      setPlayingTrack(playlistTracks[0]);
      setIsPlaylistPlaying(true);
    }
  }

  // Format lyrics
  function formatLyrics(lyrics) {
    if (!lyrics || lyrics === "No lyrics found") return lyrics;

    const lines = lyrics.split("\n").filter((line) => line.trim());

    return lines.map((line, index) => (
      <p
        key={index}
        style={{ marginBottom: "4px", lineHeight: "1.5", color: "#ffffff" }}
      >
        {line}
      </p>
    ));
  }

  return (
    <div
      style={{
        maxWidth: "100vw",
        minHeight: "100vh",
        backgroundColor: "#1DB954",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Main Content Area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20vw 80vw",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            backgroundColor: "#121212",
            color: "#ffffff",
            height: "100%",
            padding: "10px",
            overflowY: "auto",
            borderRight: "1px solid #282828",
          }}
        >
          <Sidebar
            accessToken={accessToken}
            onSelectPlaylist={handlePlaylistSelect}
          />
        </div>

        {/* Main Panel */}
        <div
          style={{
            padding: "10px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            height: "85vh",
          }}
        >
          {/* Search Bar */}
          <div style={{ marginBottom: "10px" }}>
            <input
              type="search"
              placeholder="Search for a song"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "5px",
                border: "none",
                backgroundColor: "#282828",
                color: "#ffffff",
                outline: "none",
              }}
            />
          </div>

          {/* Tracks and Lyrics */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            {/* Track List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              {(searchResults.length > 0 ? searchResults : playlistTracks).map(
                (track) => (
                  <TrackSearchResult
                    track={track}
                    key={track.uri}
                    chooseTrack={chooseTrack}
                  />
                )
              )}
            </div>

            {/* Lyrics */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingLeft: "10px",
                borderLeft: "1px solid #282828",
              }}
            >
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                {formatLyrics(lyrics)}
              </div>
            </div>
          </div>

          {/* Playlist Play Button */}
          {playlistTracks.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={handlePlayPlaylist}
                style={{
                  background: "black",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 24px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Play Playlist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Player Section */}
      <div
        style={{
          height: "15vh",
          backgroundColor: "#282828",
          padding: "10px",
          borderTop: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <Player
          accessToken={accessToken}
          trackUri={playingTrack?.uri}
          trackList={isPlaylistPlaying ? playlistTracks : null}
          trackInfo={playingTrack}
        />
      </div>
    </div>
  );
}
