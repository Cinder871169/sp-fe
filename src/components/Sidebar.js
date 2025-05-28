import React from "react";
import Playlist from "./Playlist";
import AddPlaylist from "./AddPlaylist";

export default function Sidebar({ accessToken, onSelectPlaylist }) {
  const spotifyLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg";

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "white",
        height: "100%",
        padding: "20px",
        overflowY: "auto",
        marginTop: "10px",
      }}
    >
      <img
        src={spotifyLogoUrl}
        alt="Spotify Logo"
        style={{
          width: "40px",
          height: "40px",
        }}
      />
      <Playlist accessToken={accessToken} onSelectPlaylist={onSelectPlaylist} />
    </div>
  );
}
