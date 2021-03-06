import { getSpotifyAccessToken } from "../../lib/spotifyAuth";

export const searchSpotify = async (q, access_token) => {
  try {
    const songName = encodeURIComponent(q.split("by")[0]);
    let artistName = q.split("by")[1].substr(1);

    if (artistName.indexOf("(") !== -1) {
      artistName = artistName.substr(0, artistName.indexOf("(")); // need to filter out features like (ft. 2 Chainz)
    }

    artistName = encodeURIComponent(artistName);

    const data = await fetch(
      `https://api.spotify.com/v1/search?q=${
        songName + `%20artist:${artistName}`
      }&type=track`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    ).then((res) => res.json());
    if (data.error) {
      return { data: null, err: data.error.message };
    }

    return { data: data.tracks.items, err: null };
  } catch (err) {
    return { data: null, err: err.message };
  }
};

// endpoint accepts query in the form "[songName] by [artistName]"
// e.g. "Phoenix by A$AP Rocky"
export default async function spotifySearchEndpoint(req, res) {
  const { q } = req.query;
  const access_token = await getSpotifyAccessToken(req);

  if (!q)
    return res.status(400).send("'q' parameter is missing for the request.");

  if (!access_token)
    return res.status(401).send("Could not authenticate with Spotify API.");

  const { data, err } = await searchSpotify(q, access_token);

  if (err) {
    return res.status(400).send({ err });
  }

  return res.status(200).send({ data });
}
