import useAuth from "../hooks/useAuth";
import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";
import Sidebar from "./Sidebar";

// Khởi tạo Spotify API với client ID
const spotifyApi = new SpotifyWebApi({
  clientId: "86f9551bfda34e3aa2a46e8ae30c8dee",
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playingTrack, setPlayingTrack] = useState();
  const [lyrics, setLyrics] = useState("");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  console.log(searchResults);

  // Thiết lập access token cho Spotify API
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  // Tìm kiếm bài hát
  useEffect(() => {
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

  // Hàm chọn bài hát
  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  // Lấy lời bài hát
  useEffect(() => {
    if (!playingTrack) return setLyrics("");

    const { title, artist } = playingTrack;
    const query = new URLSearchParams({ title, artist }).toString();
    // API call
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

    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.items) {
          setPlaylistTracks([]);
          return;
        }

        setPlaylistTracks(
          data.items
            .filter((item) => item.track && item.track.album)
            .map((item) => {
              const track = item.track;
              const albumImages = track.album.images || [];
              const smallestAlbumImage =
                albumImages.length > 0
                  ? albumImages.reduce((smallest, image) =>
                      image.height < smallest.height ? image : smallest
                    )
                  : null;

              return {
                artist: track.artists?.[0]?.name || "Unknown Artist",
                title: track.name || "Untitled",
                uri: track.uri,
                albumUrl: smallestAlbumImage?.url || "",
              };
            })
        );
      });
  }

  // Định dang lời bài hát
  function formatLyrics(lyrics) {
    if (!lyrics || lyrics === "No lyrics found") return lyrics;

    const lines = lyrics.split("\n").filter((line) => line.trim());

    return lines.map((line, index) => (
      <p key={index} className="mb-1" style={{ lineHeight: "1.5" }}>
        {line}
      </p>
    ));
  }

  return (
    <div
      style={{
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "85vh 15vh",
      }}
    >
      <div
        className="spotify__body"
        style={{
          display: "grid",
          gridTemplateColumns: "20vw 80vw",
          height: "100%",
          width: "100%",
          background: "linear-gradient(transparent, rgba(0, 0, 0, 1))",
          backgroundColor: "rgb(32, 87, 100)",
        }}
      >
        <div
          style={{
            backgroundColor: "#121212",
            color: "white",
            height: "100%",
            padding: "10px",
            overflow: "auto",
          }}
        >
          <Sidebar
            accessToken={accessToken}
            onSelectPlaylist={handlePlaylistSelect}
          />
        </div>
        <div
          style={{
            height: "100vh",
            backgroundColor: "#1ed760",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "10px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              padding: "0 10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                flex: 1,
                paddingRight: "10px",
              }}
            >
              <input
                type="search"
                placeholder="Search for a song"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "none",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                paddingLeft: "10px",
                borderLeft: "1px solid #ccc",
              }}
            >
              <div style={{ height: "100%" }} />
            </div>
          </div>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "row",
              padding: "0 10px",
              overflow: "hidden",
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
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

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingLeft: "10px",
                borderLeft: "1px solid #ccc",
              }}
            >
              <div
                className="text-muted text-center"
                style={{ marginTop: "20px" }}
              >
                {formatLyrics(lyrics)}
              </div>
            </div>
          </div>
          <div>
            <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
          </div>
        </div>
      </div>
      <div
        style={{
          height: "15vh",
          backgroundColor: "white",
        }}
      />
    </div>
  );
}
