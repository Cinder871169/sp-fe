import { useState, useEffect } from "react";
import SpotifyPlayer from "react-spotify-web-playback";

// Component phát nhạc Spotify
export default function Player({ accessToken, trackUri }) {
  const [play, setPlay] = useState(false);

  useEffect(() => setPlay(true), [trackUri]);

  if (!accessToken) return null;
  return (
    <SpotifyPlayer
      token={accessToken}
      callback={(state) => {
        if (!state.isPlaying) setPlay(false);
      }}
      initialVolume={0.2}
      play={play}
      uris={trackUri ? [trackUri] : []}
    />
  );
}
