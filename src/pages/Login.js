import { Container } from "react-bootstrap";

// URL xác thực Spotify
const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=86f9551bfda34e3aa2a46e8ae30c8dee&response_type=code&redirect_uri=http://127.0.0.1:3000/callback&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state";

// Component đăng nhập
export default function Login() {
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
          <a className="btn btn-light btn-lg rounded-pill" href={AUTH_URL}>
            Login With Spotify
          </a>
        </div>
      </div>
    </Container>
  );
}
