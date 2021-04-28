export const audioFeaturesFromSpotify = async ( id ) => {
	try{
		const data = await fetch(
            `https://api.spotify.com/v1/audio-features/${id}`, 
            {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SPOTIFY_BEARER}`
                }
            }
        ).then(res => res.json());

        return { data, err: null };
	} catch(err){
		return { data: null, err: err.message };
	}
}

// endpoint accepts query in the form "[songName] by [artistName]"
// e.g. "Phoenix by A$AP Rocky"
export default async function spotifySearchEndpoint(req, res) {
	const { id } = req.query;

    if(!id) return res.status(400).send("'id' parameter is missing for the request.");

	const { data, err } = await audioFeaturesFromSpotify(id);

    if(err){
        return res.status(400).send({ err: err });
    }

	return res.status(200).send({ data });
}
