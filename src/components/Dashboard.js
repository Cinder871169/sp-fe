import useAuth from "../hooks/useAuth";
import { Container, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import TrackSearchResult from "./TrackSearchResult";
import Player from "./Player";

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

  console.log(searchResults);

  // Hàm chọn bài hát
  function chooseTrack(track) {
    setPlayingTrack(track);
    setSearch("");
    setLyrics("");
  }

  // Thiết lập access token cho Spotify API
  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
  }, [accessToken]);

  // Tìm kiếm bài hát
  useEffect(() => {
    if (!search) return setSearchResults([]);
    if (!accessToken) return;

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
        setLyrics(data.lyrics || "No lyrics found");
      })
      .catch((err) => {
        console.error("Error fetching lyrics:", err);
        setLyrics("No lyrics found");
      });
  }, [playingTrack]);

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
    <Container className="d-flex flex-column py-2" style={{ height: "100vh" }}>
      <Form.Control
        type="search"
        placeholder="Search for a song"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div
        className="flex-grow-1 py-2"
        style={{
          overflowY: "auto",
        }}
      >
        {searchResults.map((track) => (
          <TrackSearchResult
            track={track}
            key={track.uri}
            chooseTrack={chooseTrack}
          />
        ))}
        {searchResults.length === 0 && (
          <div className="text-muted text-center" style={{ marginTop: "20px" }}>
            {formatLyrics(lyrics)}
          </div>
        )}
      </div>
      <div>
        <Player accessToken={accessToken} trackUri={playingTrack?.uri} />
      </div>
    </Container>
  );
}
