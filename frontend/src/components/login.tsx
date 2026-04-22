import * as stylex from "@stylexjs/stylex";
import { colors } from "../vars.stylex";
import Button from "./primitives/button";

import { createSession, session } from "@/api/api.ts";
import { useSignals } from "@preact/signals-react/runtime";
import { useRef } from "react";

const styles = stylex.create({
	root: {
		color: colors.accent,
	},
});

type LoginProps = React.HTMLAttributes<HTMLDivElement> & {};

export default function Login(props: LoginProps) {
	useSignals();
	let input = useRef<HTMLInputElement>(null);

	return (
		<div {...stylex.props(styles.root)} {...props}>
			{props.children}
			<input ref={input}></input>
			<Button
				onClick={async () => {
					let username = input.current?.value;
					if (username == null) {
						return;
					}
					session.value = await createSession(username);
				}}
			></Button>
		</div>
	);
}
