import { Container } from "react-bootstrap";

// Component đăng nhập
export default function Login() {
  const handleClick = async () => {
    const api_uri = "https://accounts.spotify.com/authorize";
    const client_id = "86f9551bfda34e3aa2a46e8ae30c8dee";
    const redirect_uri = "http://127.0.0.1:3000/callback";
    const scope = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-library-read",
      "user-library-modify",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-private",
    ];
    window.location.href = `${api_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope.join(
      " "
    )}&response_type=code`;
  };
  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        maxWidth: "100%",
      }}
    >
      <h2 className="text-white mb-3">Simple Music Web App With Spotify API</h2>
      <br />
      <div className="text-center">
        <img
          src="/assets/images/spotify-logo-green.png"
          alt="Spotify Logo"
          style={{ width: "250px", marginBottom: "50px" }}
        />
        <div>
          <button
            className="btn btn-light btn-lg rounded-pill"
            onClick={handleClick}
          >
            Login With Spotify
          </button>
        </div>
      </div>
    </Container>
  );
}
