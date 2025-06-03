import React from "react";
import Playlist from "./Playlist";

export default function Sidebar({
  accessToken,
  onSelectPlaylist,
  onAddPlaylist,
  onDeletePlaylist,
  playlistActionTrigger,
}) {
  const spotifyLogoUrl =
    "https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg";

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    window.location.href = "/";
  };

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
      <Playlist
        accessToken={accessToken}
        onSelectPlaylist={onSelectPlaylist}
        onAddPlaylist={onAddPlaylist}
        onDeletePlaylist={onDeletePlaylist}
      />
      <button
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#1db954",
          color: "white",
          border: "none",
          borderRadius: "20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
