import "../styles/global.css";
import { Provider } from "next-auth/client";

function MyApp({ Component, pageProps }) {
	return (
		<Provider session={pageProps.session} options={{ clientMaxAge: 3600 }}>
			<Component {...pageProps} />
		</Provider>
	);
}

export default MyApp;
