import { getLyrics } from "genius-lyrics-api";

export const getLyricsFromGenius = async (songName, artistName, songUrl) => {
  const options = {
    apiKey: process.env.NEXT_PUBLIC_GENIUS_KEY,
    title: songName || "",
    artist: artistName || "",
    optimizeQuery: true,
  };

  try {
    return {
      data: await getLyrics(songName || artistName ? options : songUrl),
      err: null,
    };
  } catch (err) {
    return { data: null, err: err.message };
  }
};

export default async function getLyricsEndpoint(req, res) {
  const { songName, artistName, songUrl } = req.query;

  if ((!songName || !artistName) && !songUrl)
    return res
      .status(400)
      .send(
        "Required parameters `songName`, `artistName`, or `songUrl` is missing for the request."
      );

  const { data: songLyrics, err } = await getLyricsFromGenius(
    songName,
    artistName,
    songUrl
  );

  if (err) {
    return res.status(400).send(err);
  }

  res.status(200).send(songLyrics);
}
