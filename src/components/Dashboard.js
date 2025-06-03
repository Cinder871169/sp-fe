import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import Sidebar from "./Sidebar";
import useAuth from "../hooks/useAuth";

const spotifyApi = new SpotifyWebApi();

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isPlaylistPlaying, setIsPlaylistPlaying] = useState(false);
  const [playlistActionTrigger, setPlaylistActionTrigger] = useState(0);

  const userData = JSON.parse(sessionStorage.getItem("userData"));

  console.log(searchResults);

  // Thiết lập Spotify API
  useEffect(() => {
    if (!accessToken) return;
    if (userData?.client_Id) {
      spotifyApi.setClientId(userData.client_Id);
    }
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken, userData]);

  // Search
  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

    setPlaylistTracks([]);

    let cancel = false;
    spotifyApi
      .searchTracks(search)
      .then((res) => {
        if (cancel) return;
        if (!res?.body?.tracks?.items) {
          setSearchResults([]);
          return;
        }
        setSearchResults(
          res.body.tracks.items
            .filter((track) => track && track.album)
            .map((track) => {
              return {
                artist: track.artists?.[0]?.name || "Unknown Artist",
                title: track.name || "Untitled",
                uri: track.uri,
                albumUrl: track.album.images?.[0]?.url || "",
              };
            })
        );
      })
      .catch((err) => {
        console.error("Error searching tracks:", err);
        setSearchResults([]);
      });

    return () => (cancel = true);
  }, [search, accessToken]);

  // Chọn 1 track
  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  // Lấy danh sách tracks của playlist
  function handlePlaylistSelect(playlistId) {
    setSelectedPlaylist(playlistId);
    setSearch("");
    setSearchResults([]);
    setLyrics("");
    setIsPlaylistPlaying(false);

    if (!accessToken) return;

    // Lấy tracks của playlist
    fetch(`http://localhost:5000/playlists/${playlistId}`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.tracks) {
          setPlaylistTracks([]);
          return;
        }
        setPlaylistTracks(data.tracks);
        console.log(playlistTracks);
      })
      .catch((err) => {
        setPlaylistTracks([]);
        console.error("Error fetching playlist tracks:", err);
      });
  }

  // Phát playlist
  function handlePlayPlaylist() {
    if (playlistTracks.length > 0) {
      setPlayingTrack(playlistTracks[0]);
      setIsPlaylistPlaying(true);
    }
  }

  // Thêm playlist
  async function handleAddPlaylist(name, playlistId) {
    const token = sessionStorage.getItem("token");
    await fetch("http://localhost:5000/playlists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, playlistId, tracks: [] }),
    });
    setPlaylistActionTrigger((t) => t + 1);
  }

  // Xóa playlist
  async function handleDeletePlaylist(playlistId) {
    const token = sessionStorage.getItem("token");
    await fetch(`http://localhost:5000/playlists/${playlistId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlaylistActionTrigger((t) => t + 1);
    if (selectedPlaylist === playlistId) {
      setSelectedPlaylist(null);
      setPlaylistTracks([]);
    }
  }

  // Thêm track playlist
  async function handleAddTrackToPlaylist(track) {
    if (!selectedPlaylist) return;
    const token = sessionStorage.getItem("token");
    await fetch(`http://localhost:5000/playlists/${selectedPlaylist}/tracks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tracks: [track] }),
    });
    // Refresh
    handlePlaylistSelect(selectedPlaylist);
  }

  // Xóa track khỏi playlist
  async function handleRemoveTrackFromPlaylist(uri) {
    if (!selectedPlaylist) return;
    const token = sessionStorage.getItem("token");
    await fetch(`http://localhost:5000/playlists/${selectedPlaylist}/tracks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ uri }),
    });
    // Refresh playlist tracks
    handlePlaylistSelect(selectedPlaylist);
  }

  // Lấy lyrics
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
            onAddPlaylist={handleAddPlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            playlistActionTrigger={playlistActionTrigger}
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
          {/* Search */}
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

          {/* Tracks + Lyrics */}
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
              {searchResults.length > 0
                ? searchResults.map((track) => (
                    <div
                      key={track.uri}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <TrackSearchResult
                        track={track}
                        chooseTrack={chooseTrack}
                      />
                      {selectedPlaylist && (
                        <button
                          style={{
                            marginLeft: 8,
                            background: "white",
                            color: "black",
                            border: "none",
                            borderRadius: "50%",
                            width: 28,
                            height: 28,
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          title="Add to playlist"
                          onClick={() => handleAddTrackToPlaylist(track)}
                        >
                          +
                        </button>
                      )}
                    </div>
                  ))
                : playlistTracks.map((track) => (
                    <div
                      key={track.uri}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <TrackSearchResult
                        track={track}
                        chooseTrack={chooseTrack}
                      />
                      <button
                        style={{
                          marginLeft: 8,
                          background: "white",
                          color: "black",
                          border: "none",
                          borderRadius: "50%",
                          width: 28,
                          height: 28,
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        title="Remove from playlist"
                        onClick={() => handleRemoveTrackFromPlaylist(track.uri)}
                      >
                        -
                      </button>
                    </div>
                  ))}
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
              <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                }}
              >
                {formatLyrics(lyrics)}
              </div>
            </div>
          </div>

          {/* Phát Playlist */}
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

      {/* Player */}
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
