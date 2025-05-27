export default function TrackSearchResult({ track, chooseTrack }) {
  // Xử lý sự kiện chọn bài hát
  function handlePlay() {
    chooseTrack(track);
  }
  if (!track.uri) return null;

  return (
    <div
      className="d-flex m-2 align-items-center"
      style={{ cursor: "pointer" }}
      onClick={handlePlay}
    >
      <img
        src={track.albumUrl}
        style={{ height: "64px", width: "64px" }}
        alt={track.title}
      />
      <div className="ml-3">
        <div className="fw-bold ps-2">{track.title}</div>
        <div className="text-muted ps-2">{track.artist}</div>
      </div>
    </div>
  );
}
