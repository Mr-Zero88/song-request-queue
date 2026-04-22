import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({});

type QueueProps = React.HTMLAttributes<HTMLDivElement> & {
	children: React.ReactNode;
};

export default function List(props: QueueProps) {
	return <div {...props}>{props.children}</div>;
}
