import { useState, useEffect } from "react";

export default function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  // Lấy access token từ server khi có mã code
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token:", token);
    fetch("http://localhost:5000/authenticate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setExpiresIn(data.expiresIn);
      })
      .catch((err) => {
        console.error("Error during authentication:", err);
      });
  }, [code]);

  return accessToken;
}
