import { Container, Button, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function Login() {
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ login_name: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const savedUserData = sessionStorage.getItem("userData");
    if (token && savedUserData) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(savedUserData));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("userData", JSON.stringify(data.user));
        setIsLoggedIn(true);
        setUserData(data.user);
        setShowLogin(false);
        setError("");
        setLoginMessage("");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserData(null);
    setLoginMessage("");
    window.location.href = "/";
  };

  console.log("User Data:", userData);

  const handleSpotifyAuth = async () => {
    const token = sessionStorage.getItem("token");
    const storedUserData = sessionStorage.getItem("userData");

    if (!isLoggedIn) {
      setLoginMessage("Please login first");
      return;
    }

    const userData = JSON.parse(storedUserData);
    const api_uri = "https://accounts.spotify.com/authorize";
    const client_id = userData.client_id;
    const redirect_uri = "http://127.0.0.1:3000/callback";
    const scope = [
      "streaming",
      "user-read-email",
      "user-read-private",
      "user-library-read",
      "user-library-modify",
      "user-read-playback-state",
      "user-read-currently-playing",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-modify-public",
      "playlist-modify-private",
      "playlist-read-collaborative",
    ];

    window.location.href = `${api_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope.join(
      " "
    )}&response_type=code`;
  };

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center position-relative"
      style={{
        minHeight: "100vh",
        backgroundColor: "#121212",
        maxWidth: "100%",
      }}
    >
      <div className="position-absolute top-0 end-0 m-3 d-flex align-items-center">
        {isLoggedIn ? (
          <>
            <span className="text-white me-3" style={{ marginRight: "20px" }}>
              Hi, {userData?.first_name} {userData?.last_name}
            </span>
            <Button
              variant="outline-danger"
              onClick={handleLogout}
              className="rounded-pill"
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            variant="outline-light"
            onClick={() => setShowLogin(true)}
            className="rounded-pill"
          >
            Login
          </Button>
        )}
      </div>

      <h2 className="text-white mb-3">Simple Music Web App With Spotify API</h2>
      <div className="text-center">
        <img
          src="/assets/images/spotify-logo-green.png"
          alt="Spotify Logo"
          style={{ width: "250px", marginBottom: "50px" }}
        />
        <div>
          <button
            className="btn btn-light btn-lg rounded-pill"
            onClick={handleSpotifyAuth}
          >
            Open
          </button>
          {loginMessage && (
            <div className="text-danger mt-2">{loginMessage}</div>
          )}
        </div>
      </div>

      <Modal
        show={showLogin}
        onHide={() => {
          setShowLogin(false);
          setLoginMessage("");
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={loginData.login_name}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    login_name: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
              />
            </Form.Group>
            <Button variant="success" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
