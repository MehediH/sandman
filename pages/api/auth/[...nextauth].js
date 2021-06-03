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
    jwt: async (token, user, account, profile, isNewUser) => {
      if (account) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        token.access_token = account.accessToken;
        token.refresh_token = account.refreshToken;
        token.accessTokenExpires = now.getTime();
        token.profile = profile;
      }
      if (Date.now() > token?.accessTokenExpires) {
        token.accessToken = await generateNewAccessToken(token.refreshToken);
      }

      return Promise.resolve(token);
    },
  },
};

export default (req, res) => NextAuth(req, res, options);
