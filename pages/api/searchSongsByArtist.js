import { searchSong } from "genius-lyrics-api";

export const searchSongsByArtist = async (artist) => {
  const options = {
    apiKey: process.env.NEXT_PUBLIC_GENIUS_KEY,
    title: "",
    artist: artist,
    optimizeQuery: true,
  };

  try {
    return { data: await searchSong(options), err: null };
  } catch (err) {
    return { data: null, err: err.message };
  }
};

export default async function searchSongsEndpoint(req, res) {
  const { artist } = req.query;

  if (!artist)
    return res
      .status(400)
      .send("'artist' parameter is missing for the request.");

  const { data: searchResults, err } = await searchSongsByArtist(artist);

  if (err) {
    return res.status(400).send(err);
  }

  return res.status(200).send(searchResults);
}
