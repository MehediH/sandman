import { getSession } from "next-auth/client";

export const spotifyAuthScopes = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "user-library-modify",
  "user-read-playback-state",
  "user-modify-playback-state",
];

const basic = Buffer.from(
  `${process.env.NEXT_PUBLIC_SPOTIFY_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_SECRET}`
).toString("base64");

// Given a API req, we attempt to get the user access token for the Spotify API
// from the current user session
// Otherwise, if a user is not logged in, we go through the client credentials flow
export const getSpotifyAccessToken = async (req) => {
  // Attempt to get the user access token from their current session
  const session = await getSession({ req });
  let access_token = session?.user?.access_token;

  if (access_token) return access_token;

  // Client credentials flow
  // Details: https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow
  const response = await fetch(`https://accounts.spotify.com/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  }).then((res) => res.json());

  if (response.access_token) return response.access_token;

  return null;
};

export const generateNewAccessToken = async (token) => {
  const newToken = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    }),
  }).then((res) => res.json());

  return {
    ...token,
    access_token: newToken.access_token,
    accessTokenExpires: Date.now() + newToken.expires_in * 1000,
    refresh_token: token.refresh_token, // Fall back to old refresh token
  };
};
