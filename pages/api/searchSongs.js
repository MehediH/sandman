import { searchSong } from 'genius-lyrics-api';

const searchSongsOnGenius = async ( songName ) => {
	const options = {
		apiKey: process.env.NEXT_PUBLIC_GENIUS_KEY,
		title: songName ? songName : "",
		artist: "",
		optimizeQuery: true
	};

	try{
		return { data: await searchSong(options), err: null };
	} catch(err){
		return { data: null, err: err.message };
	}
}

export default async function searchSongsEndpoint(req, res) {
	const { songName } = req.query;

    if(!songName) return res.status(400).send("'songName' parameter is missing for the request.");

	const { data: searchResults, err } = await searchSongsOnGenius(songName);

    if(err){
        return res.status(400).send(err);
    }

	return res.status(200).send(searchResults);
}
