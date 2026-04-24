import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, layout, radius } from "../vars.stylex";

import { createSession, session } from "@/api/api.ts";
import { useRef } from "react";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
	},
	form: {
		display: "flex",
		flexDirection: "column",
		textAlign: "center",
		fontSize: fontSizes.xl,
	},
	input: {
		margin: "0.1rem 0rem 0.5rem 0rem",
		fontSize: fontSizes.xxl,
	},
	button: {
		fontSize: fontSizes.xxl,
		color: colors.background,
		backgroundColor: colors.primaryText,
		borderRadius: radius.sm,
		borderStyle: "solid",
		padding: "0.2rem 1.3rem",
	},
});

type LoginProps = React.HTMLAttributes<HTMLDivElement> & {};

export default function Login(props: LoginProps) {
	let input = useRef<HTMLInputElement>(null);

	return (
		<div {...stylex.props(styles.root)} {...props}>
			{props.children}
			<div {...stylex.props(styles.form)}>
				<label>Username</label>
				<input {...stylex.props(styles.input)} ref={input}></input>
				<button
					{...stylex.props(styles.button)}
					onClick={async () => {
						let username = input.current?.value;
						if (username == null) {
							return;
						}
						session.value = await createSession(username);
					}}
				>
					Login
				</button>
			</div>
		</div>
	);
}
