import React, { useState, useEffect } from "react";

export default function Playlist({ accessToken, onSelectPlaylist }) {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    const userDataString = sessionStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    console.log("User Data:", userData);

    fetch(`https://api.spotify.com/v1/users/${userData.spotify_id}/playlists`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserPlaylists(data.items || []);
      })
      .catch((err) => console.error("Error fetching playlists", err));
  }, [accessToken]);

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <div style={{ overflowY: "auto", maxHeight: "50vh", padding: "0 5px" }}>
      <div style={{ marginBottom: "20px" }}></div>
      <div
        onClick={handleToggle}
        style={{
          fontWeight: "bold",
          marginBottom: "10px",
          color: "white",
          cursor: "pointer",
        }}
      >
        {isOpen ? "▾" : "▸"} 🎵 Playlists
      </div>
      {isOpen && (
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            maxHeight: "100vh",
            overflowY: "auto",
          }}
        >
          {userPlaylists.map((playlist) => (
            <li
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              style={{
                cursor: "pointer",
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {playlist.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
