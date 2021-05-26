import { getSession } from "next-auth/client";

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
  const session = await getSession({ req });

  if (!id)
    return res.status(400).send("'id' parameter is missing for the request.");

  if (session) {
    // Signed in
    const { data, err } = await audioFeaturesFromSpotify(
      id,
      session.user.access_token
    );
    if (err) {
      return res.status(400).send({ err: err });
    }
    return res.status(200).send({ data });
  } else {
    // Not Signed in
    return res.status(401);
  }
}
