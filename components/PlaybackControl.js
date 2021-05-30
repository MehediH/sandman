import { takeOver } from "../lib/initPlayer";

export default function PlaybackControl({ access_token, playing, uri }) {
	const handleClick = () => {
		if (!playing?.tracks || playing.tracks.uri != uri)
			takeOver(access_token, playing.deviceId, uri);
		window.player.togglePlay();
	};

	return (
		<div>
			<button
				className="font-bold ml-5 hover:opacity-50 focus:outline-none"
				onClick={handleClick}
			>
				Play song
			</button>
			<input
				type="range"
				min={0}
				max={1}
				step={0.02}
				onChange={(event) => {
					window.player.setVolume(event.target.valueAsNumber);
				}}
			/>
		</div>
	);
}
