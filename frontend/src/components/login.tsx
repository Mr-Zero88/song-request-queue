import * as stylex from "@stylexjs/stylex";
import { colors, fontSizes, fontWeights, layout, space } from "../vars.stylex";

import { createSession, session } from "@/api/api.ts";
import Button from "@/components/ui/button.tsx";
import Input from "@/components/ui/input.tsx";
import Footer from "@/components/footer.tsx";
import { useSignal } from "@preact/signals-react";
import { Disc3, LogIn } from "lucide-react";

const styles = stylex.create({
	root: {
		maxWidth: layout.contentMaxWidth,
		margin: "auto",
		display: "flex",
		flexDirection: "column",
	},
	panel: {
		padding: space.md,
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
		fontSize: fontSizes.xxl,
		fontWeight: fontWeights.bold,
		margin: 0,
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

const FUN_NAME_ADJECTIVES = [
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

const FUN_NAME_NOUNS = [
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

function generateFunName(): string {
	const adjective =
		FUN_NAME_ADJECTIVES[Math.floor(Math.random() * FUN_NAME_ADJECTIVES.length)];
	const noun = FUN_NAME_NOUNS[Math.floor(Math.random() * FUN_NAME_NOUNS.length)];
	return `${adjective} ${noun}`;
}

type LoginProps = {
	mode?: "user" | "admin";
};

export default function Login({ mode = "user" }: LoginProps) {
	const isAdmin = mode === "admin";

	const value = useSignal("");
	const randomName = useSignal(generateFunName());
	const isLoading = useSignal(false);
	const error = useSignal<string | null>(null);

	const isValid = isAdmin ? value.value.length > 0 : true;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid || isLoading.value) return;

		isLoading.value = true;
		error.value = null;

		const result = isAdmin
			? await createSession(`admin-${Math.random().toString(36).slice(2, 8)}`, value.value)
			: await createSession(value.value.trim() || randomName.value);

		isLoading.value = false;

		if (!result.session) {
			error.value = result.error;
			return;
		}
		if (isAdmin && result.session.role !== "admin") {
			error.value = "Incorrect PIN";
			return;
		}
		session.value = result.session;
	};

	return (
		<div {...stylex.props(styles.root)}>
			<div {...stylex.props(styles.panel)}>
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
					{isAdmin ? (
						<Input
							id="admin-pin"
							label="PIN"
							type="password"
							autoFocus
							value={value.value}
							onChange={(e) => (value.value = e.target.value)}
							error={error.value ?? undefined}
						/>
					) : (
						<Input
							id="username"
							label="Name"
							placeholder={randomName.value}
							autoFocus
							value={value.value}
							onChange={(e) => (value.value = e.target.value)}
							error={error.value ?? undefined}
						/>
					)}
					<Button type="submit" disabled={isLoading.value || !isValid}>
						<LogIn size={16} />
						{isLoading.value ? "Logging in..." : "Login"}
					</Button>
				</form>
			</div>

			<Footer />
		</div>
	);
}
