import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import Button from "@/components/primitives/button.tsx";

//const styles = stylex.create({
//	header: {
//		color: "red",
//	},
//});

import { session } from "@/api/api.ts";
import Login from "./components/login";
import { useSignals, useComputed } from "@preact/signals-react/runtime";

function App() {
	const isLoggedIn = useComputed(() => session.value != null);

	console.log(isLoggedIn.value, session.value);
	return (
		<div>
			{isLoggedIn.value ? (
				<Button>Hello</Button>
			) : (
				<>
					<Login />
				</>
			)}
		</div>
	);
}

export default App;
