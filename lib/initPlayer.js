export const loadSDK = () => {
	const existingScript = document.getElementById("playerSDK");

	if (existingScript) return;

	const script = document.createElement("script");
	script.id = "playerSDK";
	script.type = "text/javascript";
	script.async = false;
	script.defer = true;
	script.src = "https://sdk.scdn.co/spotify-player.js";
	script.onload = () => console.log("loaded");
	script.onerror = (error) => console.error(error);

	document.head.appendChild(script);
};

export const initPlayer = (token, setPlaying, stoppedPlaying, setupOnCall) => {
	const setupPlayer = () => {
		const player = new Spotify.Player({
			name: "SANDMAN",
			getOAuthToken: (cb) => {
				cb(token);
			},
		});

		// Error handling
		player.addListener("initialization_error", ({ message }) => {
			console.error(message);
		});
		player.addListener("authentication_error", ({ message }) => {
			console.error(message);
		});
		player.addListener("account_error", ({ message }) => {
			console.error(message);
		});
		player.addListener("playback_error", ({ message }) => {
			console.error(message);
		});

		// Playback status updates
		player.addListener("player_state_changed", (state) => {
			if (!state) {
				stoppedPlaying(state);
				player.disconnect();
				return;
			}

			setPlaying({
				deviceSelected: true,
				tracks: state.track_window,
				paused: state.paused,
				disallows: state.disallows,
			});
		});

		// Ready
		player.addListener("ready", ({ device_id }) => {
			console.log("Ready with Device ID", device_id);

			setPlaying({ deviceReady: true, deviceId: device_id }, setupOnCall);
		});

		// Not Ready
		player.addListener("not_ready", ({ device_id }) => {
			console.log("Device ID has gone offline", device_id);

			setPlaying({ deviceReady: false });
		});

		// Connect to the player!
		player.connect();
		window.player = player;
	};

	if (setupOnCall) setupPlayer();

	window.onSpotifyWebPlaybackSDKReady = () => {
		setupPlayer();
	};
};

export const takeOver = async (accessToken, deviceId) => {
	await fetch(`https://api.spotify.com/v1/me/player`, {
		method: "PUT",
		body: JSON.stringify({ device_ids: [deviceId], play: true }),
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});
};