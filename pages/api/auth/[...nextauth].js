import NextAuth from "next-auth";
import Providers from "next-auth/providers";

const scope = [
	"streaming",
	"user-read-email",
	"user-read-private",
	"user-library-read",
	"user-library-modify",
	"user-read-playback-state",
	"user-modify-playback-state",
];

const options = {
	providers: [
		Providers.Spotify({
			clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
			clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
			scope: scope,
		}),
	],
	jwt: true,
	callbacks: {
		session: async (session, user) => {
			if (session && user) {
				session.user = user;
			}
			return Promise.resolve(session);
		},
		jwt: async (token, user, account, profile, isNewUser) => {
			if (account) {
				const now = new Date();
				now.setHours(now.getHours() + 1);
				token.access_token = account.accessToken;
				token.refresh_token = account.refreshToken;
				token.accessTokenExpires = now.getTime();
				token.profile = profile;
			}
			console.log(token);

			if (Date.now() > token?.accessTokenExpires) {
				token.accessToken = await generateNewToken(token.refreshToken);
			}

			return Promise.resolve(token);
		},
	},
};

const generateNewToken = async (refresh_token) => {
	const newToken = await fetch("https://accounts.spotify.com/api/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refresh_token,
			client_id: process.env.SPOTIFY_ID,
			client_secret: process.env.SPOTIFY_SECRET,
			scope: scope.join(" "),
		}),
	}).then((res) => res.json());

	return newToken.access_token;
};

export default (req, res) => NextAuth(req, res, options);
