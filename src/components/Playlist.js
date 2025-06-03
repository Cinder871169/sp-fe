import { useState, useEffect } from "react";

export default function Playlist({
  accessToken,
  onSelectPlaylist,
  onAddPlaylist,
  onDeletePlaylist,
}) {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  // Lấy danh sách playlist của người dùng
  useEffect(() => {
    if (!accessToken) return;

    fetch("http://localhost:5000/playlists", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserPlaylists(data || []);
      })
      .catch((err) => console.error("Error fetching playlists", err));
  }, [accessToken, onAddPlaylist, onDeletePlaylist]);

  const handleToggle = () => setIsOpen(!isOpen);

  // Thêm playlist mới
  const handleAddPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const playlistId = newPlaylistName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
    await onAddPlaylist(newPlaylistName, playlistId);
    setNewPlaylistName("");
    setShowAddInput(false);
  };

  return (
    <div>
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
            maxHeight: "40vh",
            overflowY: "auto",
            marginBottom: 10,
          }}
        >
          {userPlaylists.map((playlist) => (
            <li
              key={playlist.playlistId}
              style={{
                cursor: "pointer",
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span onClick={() => onSelectPlaylist(playlist.playlistId)}>
                {playlist.name}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff4d4f",
                  cursor: "pointer",
                  marginLeft: 8,
                }}
                title="Delete playlist"
                onClick={() => onDeletePlaylist(playlist.playlistId)}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
      {!showAddInput && (
        <button
          style={{
            background: "#1db954",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "6px 12px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
            marginBottom: 10,
          }}
          onClick={() => setShowAddInput(true)}
        >
          + Add Playlist
        </button>
      )}
      {showAddInput && (
        <div
          style={{ display: "flex", flexDirection: "column", marginBottom: 10 }}
        >
          <input
            type="text"
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            style={{
              padding: "4px",
              borderRadius: "4px",
              border: "1px solid #333",
              marginBottom: "8px",
            }}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAddPlaylist}
              style={{
                background: "#1db954",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontWeight: "bold",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddInput(false);
                setNewPlaylistName("");
              }}
              style={{
                background: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "4px 10px",
                fontWeight: "bold",
                cursor: "pointer",
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
