import { getLyrics, getSong } from 'genius-lyrics-api';


export default async function helloAPI(req, res) {
	const { songName, artistName } = req.query;

	const options = {
		apiKey: process.env.NEXT_PUBLIC_GENIUS_KEY,
		title: songName ? songName : "STARGAZING",
		artist: artistName ? artistName : "Travis Scott",
		optimizeQuery: true
	};

  const lyrics = await getLyrics(options);

  res.status(200).send(lyrics)
}
