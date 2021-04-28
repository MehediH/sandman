import { getLyrics } from 'genius-lyrics-api';

export const getLyricsFromGenius = async ( songName, artistName ) => {
	const options = {
		apiKey: process.env.NEXT_PUBLIC_GENIUS_KEY,
		title: songName ? songName : "",
		artist: artistName ? artistName : "",
		optimizeQuery: true
	};

	try{
		return { data: await getLyrics(options), err: null };
	} catch(err){
		return { data: null, err: err.message };
	}
}

export default async function getLyricsEndpoint(req, res) {
	const { songName, artistName } = req.query;

	if(!songName) return res.status(400).send("'songName' parameter is missing for the request.");

	const { data: songLyrics, err } = await getLyricsFromGenius(songName, artistName);

	if(err){
        return res.status(400).send(err);
    }

	res.status(200).send(songLyrics);
}
