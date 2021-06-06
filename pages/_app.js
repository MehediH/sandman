import "../styles/global.css";
import { Provider } from "next-auth/client";
import Head from "next/head";
import { useEffect, useState } from "react";


function MyApp({ Component, pageProps }) {
	const [dark, setDark] = useState(false)
	useEffect(() => {
		setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
			setDark(e.matches ? "dark" : "light");
		});
	}, [])

	return (
		<Provider session={pageProps.session} options={{ clientMaxAge: 3600 }}>
			<Head>
				{dark ? <link rel="shortcut icon" href="/sandman.svg" /> : <link rel="shortcut icon" href="/sandmanlight.svg" />}
			</Head>
			<Component {...pageProps} />
		</Provider>
	);
}

export default MyApp;
