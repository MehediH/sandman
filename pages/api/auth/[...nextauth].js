import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import {
  spotifyAuthScopes,
  generateNewAccessToken,
} from "../../../lib/spotifyAuth";

const options = {
  providers: [
    Providers.Spotify({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_ID,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_SECRET,
      scope: spotifyAuthScopes.join(" "),
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
    jwt: async (token, user, account, profile) => {
      if (account && user) {
        token.access_token = account.accessToken;
        token.refresh_token = account.refreshToken;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
        token.profile = profile;
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      return await generateNewAccessToken(token);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
