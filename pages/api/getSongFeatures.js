import { getSpotifyAccessToken } from "../../lib/spotifyAuth";

export const audioFeaturesFromSpotify = async (id, bearer) => {
  try {
    const data = await fetch(
      `https://api.spotify.com/v1/audio-features/${id}`,
      {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      }
    ).then((res) => res.json());

    return { data, err: null };
  } catch (err) {
    return { data: null, err: err.message };
  }
};

// endpoint accepts query in the form "[songName] by [artistName]"
// e.g. "Phoenix by A$AP Rocky"
export default async function getSpotifyFeaturesEndpoint(req, res) {
  const { id } = req.query;
  const access_token = await getSpotifyAccessToken(req);

  if (!id)
    return res.status(400).send("'id' parameter is missing for the request.");

  if (!access_token)
    return res.status(401).send("Could not authenticate with Spotify API.");

  const { data, err } = await audioFeaturesFromSpotify(id, access_token);

  if (err) {
    return res.status(400).send({ err });
  }

  return res.status(200).send({ data });
}
