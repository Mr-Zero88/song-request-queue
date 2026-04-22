import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({});

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {};

export default function Button(props: ButtonProps) {
	return <button {...props}>{props.children}</button>;
}
