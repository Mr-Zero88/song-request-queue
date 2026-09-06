import * as stylex from "@stylexjs/stylex";
import { useSignal } from "@preact/signals-react";
import { Disc3, LogIn } from "lucide-react";

import { createSession, session } from "@/api/api.ts";
import Button from "@/components/ui/button.tsx";
import Input from "@/components/ui/input.tsx";
import Footer from "@/components/footer.tsx";
import { notify } from "@/components/ui/toast.tsx";

import { media } from "../breakpoints.stylex.ts";
import { colors, fontSizes, fontWeights, layout, space } from "../vars.stylex.ts";

const styles = stylex.create({
	root: {
		width: "100%",
		maxWidth: layout.contentMaxWidth,
		padding: space.md,
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
	},
	header: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: space.sm,
		marginBottom: space.lg,
	},
	logo: {
		color: colors.accent,
	},
	title: {
		color: colors.primaryText,
		fontSize: { default: fontSizes.xxl, [media.narrow]: fontSizes.xl },
		fontWeight: fontWeights.bold,
		margin: 0,
		textAlign: "center",
	},
	subtitle: {
		color: colors.secondaryText,
		fontSize: fontSizes.md,
		margin: 0,
		textAlign: "center",
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: space.md,
	},
});

const adjectives = [
	"Dancing",
	"Grooving",
	"Funky",
	"Disco",
	"Rhythmic",
	"Boogie",
	"Jamming",
	"Electric",
	"Smooth",
	"Sneaky",
];

const nouns = [
	"Llama",
	"Panda",
	"Penguin",
	"Yeti",
	"Ninja",
	"Wizard",
	"Goblin",
	"Raccoon",
	"Flamingo",
	"Otter",
];

function pick(words: string[]): string {
	return words[Math.floor(Math.random() * words.length)];
}

function randomName(): string {
	return `${pick(adjectives)} ${pick(nouns)}`;
}

type LoginProps = {
	mode?: "user" | "admin";
};

export default function Login({ mode = "user" }: LoginProps) {
	const isAdmin = mode === "admin";

	const value = useSignal("");
	const suggestedName = useSignal(randomName());
	const isLoading = useSignal(false);

	// A guest may leave the field empty and take the suggested name.
	const isValid = isAdmin ? value.value.length > 0 : true;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid || isLoading.value) return;

		isLoading.value = true;

		const result = isAdmin
			? await createSession(
					`admin-${Math.random().toString(36).slice(2, 8)}`,
					value.value,
				)
			: await createSession(value.value.trim() || suggestedName.value);

		isLoading.value = false;

		if (!result.session) {
			notify(result.error);
			return;
		}
		if (isAdmin && result.session.role !== "admin") {
			notify("Incorrect PIN.");
			return;
		}
		session.value = result.session;
	};

	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.header)}>
				<Disc3 size={40} {...stylex.props(styles.logo)} />
				<h1 {...stylex.props(styles.title)}>Song Request Queue</h1>
				<p {...stylex.props(styles.subtitle)}>
					{isAdmin
						? "Enter the PIN to open the DJ Console."
						: "Enter a name to request and vote on songs."}
				</p>
			</div>

			<form {...stylex.props(styles.form)} onSubmit={(e) => void handleSubmit(e)}>
				<Input
					id={isAdmin ? "admin-pin" : "username"}
					label={isAdmin ? "PIN" : "Name"}
					type={isAdmin ? "password" : "text"}
					placeholder={isAdmin ? undefined : suggestedName.value}
					autoFocus
					value={value.value}
					onChange={(e) => (value.value = e.target.value)}
				/>
				<Button type="submit" disabled={isLoading.value || !isValid}>
					<LogIn size={16} />
					{isLoading.value ? "Logging in..." : "Login"}
				</Button>
			</form>

			<Footer />
		</div>
	);
}
