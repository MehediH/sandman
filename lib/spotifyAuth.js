// Client credentials flow
// Details: https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow

const basic = Buffer.from(
  `${process.env.NEXT_PUBLIC_SPOTIFY_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_SECRET}`
).toString("base64");

export const getSpotifyAccessToken = async () => {
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
