import { useState, useEffect, useRef } from "react";
import {
  BsFillPlayCircleFill,
  BsFillPauseCircleFill,
  BsVolumeUp,
  BsVolumeDown,
  BsVolumeMute,
} from "react-icons/bs";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";

const Player = ({ accessToken, trackUri, trackList, trackInfo }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(20);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef(null);

  // Khởi tạo Spotify Web Playback
  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "My Web Player",
        getOAuthToken: (cb) => cb(accessToken),
        volume: volume / 100,
      });

      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Web app registered as device:", device_id);
        setDeviceId(device_id);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    return () => {
      window.onSpotifyWebPlaybackSDKReady = null;
      document.body.removeChild(script);
    };
  }, [accessToken]);

  //Cập nhật vị trí và thời lượng bài hát mỗi giây
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (state) {
          setPosition(state.position);
          setDuration(state.duration);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  // Volume
  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(volume / 100);
    }
  }, [volume, player]);

  // Cập nhật index
  useEffect(() => {
    if (!trackList || trackList.length === 0 || !trackUri) return;

    const index = trackList.findIndex((track) => track.uri === trackUri);
    if (index !== -1 && index !== currentTrackIndex) {
      setCurrentTrackIndex(index);
    }
  }, [trackUri, trackList]);

  // Khi trackUri hoặc accessToken thay đổi, phát bài hát mới
  useEffect(() => {
    if (!deviceId || !trackUri || !accessToken) return;

    const playTrack = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: [trackUri],
              position_ms: 0,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setError(null);
        setIsPlaying(true);
      } catch (err) {
        console.error("Error playing track:", err);
        setError("Failed to play track: " + err.message);
        setIsPlaying(false);
      }
    };

    playTrack();
  }, [deviceId, trackUri, accessToken]);

  // Resume/Pause
  const togglePlay = async () => {
    if (!player) {
      setError("Player not initialized");
      return;
    }
    try {
      if (isPlaying) {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setIsPlaying(false);
      } else {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setIsPlaying(true);
      }
      setError(null);
    } catch (err) {
      console.error("Error toggling play/pause:", err);
      setError("Failed to toggle play/pause: " + err.message);
    }
  };

  // Next
  const nextTrack = async () => {
    if (!player) {
      setError("Player not initialized");
      return;
    }
    if (!trackList || currentTrackIndex >= trackList.length - 1) {
      setError("No next track available");
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    const nextTrackUri = trackList[nextIndex].uri;

    setCurrentTrackIndex(nextIndex); // Update index immediately

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [nextTrackUri],
            position_ms: 0,
          }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error("Error skipping to next track:", err);
      setError("Failed to skip to next track: " + err.message);
    }
  };

  // Prev
  const prevTrack = async () => {
    if (!player) {
      setError("Player not initialized");
      return;
    }
    if (!trackList || currentTrackIndex <= 0) {
      setError("No previous track available");
      return;
    }

    const prevIndex = currentTrackIndex - 1;
    const prevTrackUri = trackList[prevIndex].uri;

    setCurrentTrackIndex(prevIndex); // Update index immediately

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [prevTrackUri],
            position_ms: 0,
          }),
        }
      );
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      setIsPlaying(true);
      setError(null);
    } catch (err) {
      console.error("Error skipping to previous track:", err);
      setError("Failed to skip to previous track: " + err.message);
    }
  };

  // Xử lý thay đổi âm lượng
  const handleVolumeChange = (e) => {
    setVolume(Number(e.target.value));
  };

  // Seek handler
  const handleSeek = async (e) => {
    const seekTo = Number(e.target.value);
    setPosition(seekTo);
    await player.seek(seekTo);
  };

  const formatTime = (ms) => {
    if (!ms && ms !== 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#282828",
        color: "white",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {error && (
        <div style={{ color: "#ff0000", marginBottom: "5px" }}>
          Error: {error}
        </div>
      )}
      {/* Thông tin track và ảnh */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
        }}
      >
        <img
          src={
            trackList && trackList.length > 0
              ? trackList[currentTrackIndex]?.albumUrl
              : trackInfo?.albumUrl
          }
          alt="Album Cover"
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "4px",
            objectFit: "cover",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
            marginRight: "12px",
            flexShrink: 0,
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span style={{ fontWeight: "bold", color: "#fff" }}>
            {trackList && trackList.length > 0
              ? trackList[currentTrackIndex]?.title
              : trackInfo?.title || "Unknown Title"}
          </span>
          <span style={{ color: "#b3b3b3" }}>
            {trackList && trackList.length > 0
              ? trackList[currentTrackIndex]?.artist
              : trackInfo?.artist || "Unknown Artist"}
          </span>
        </div>
      </div>
      {/* Nút điều khiển */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            width: "100%",
          }}
        >
          <CgPlayTrackPrev
            style={
              !player || error || currentTrackIndex <= 0
                ? { ...iconStyle, cursor: "not-allowed", opacity: 0.4 }
                : iconStyle
            }
            onClick={prevTrack}
            title="Previous"
          />
          {isPlaying ? (
            <BsFillPauseCircleFill
              style={activeIconStyle}
              onClick={togglePlay}
              title="Pause"
            />
          ) : (
            <BsFillPlayCircleFill
              style={activeIconStyle}
              onClick={togglePlay}
              title="Play"
            />
          )}
          <CgPlayTrackNext
            style={
              !player ||
              error ||
              !trackList ||
              currentTrackIndex >= trackList.length - 1
                ? { ...iconStyle, cursor: "not-allowed", opacity: 0.4 }
                : iconStyle
            }
            onClick={nextTrack}
            title="Next"
          />
        </div>
        {/* Thanh tiến trình */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
            width: "100%",
            minWidth: 200,
            maxWidth: 400,
          }}
        >
          <span
            style={{
              color: "#b3b3b3",
              fontSize: 12,
              minWidth: 40,
              textAlign: "right",
            }}
          >
            {formatTime(position)}
          </span>
          <input
            ref={progressRef}
            type="range"
            min={0}
            max={duration || 1}
            value={position}
            onChange={handleSeek}
            style={{
              margin: "0 8px",
              width: "100%",
              accentColor: "#1db954",
              height: 4,
            }}
          />
          <span
            style={{
              color: "#b3b3b3",
              fontSize: 12,
              minWidth: 40,
              textAlign: "left",
            }}
          >
            {formatTime(duration)}
          </span>
        </div>
      </div>
      {/* Thanh âm lượng */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {volume === 0 ? (
          <BsVolumeMute
            style={{ color: "#b3b3b3", fontSize: "1.5rem", marginRight: 8 }}
          />
        ) : volume < 50 ? (
          <BsVolumeDown
            style={{ color: "#b3b3b3", fontSize: "1.5rem", marginRight: 8 }}
          />
        ) : (
          <BsVolumeUp
            style={{ color: "#b3b3b3", fontSize: "1.5rem", marginRight: 8 }}
          />
        )}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={handleVolumeChange}
          style={{ width: 100 }}
        />
        <span
          style={{
            marginLeft: 8,
            color: "#b3b3b3",
            width: 30,
            textAlign: "right",
          }}
        >
          {volume}
        </span>
      </div>
    </div>
  );
};

const iconStyle = {
  color: "#b3b3b3",
  cursor: "pointer",
  transition: "color 0.2s ease-in-out",
  fontSize: "2rem",
  margin: "0 12px",
};

const activeIconStyle = {
  ...iconStyle,
  color: "white",
  fontSize: "2.5rem",
};

export default Player;
