import * as stylex from "@stylexjs/stylex";

// Shared media-query conditions. defineConsts is StyleX's mechanism for values
// that have to be literals at build time, which plain exported strings are not
// — a normal import fails with "Invalid pseudo or at-rule".
export const media = stylex.defineConsts({
	narrow: "@media (max-width: 639px)",
	tiny: "@media (max-width: 479px)",
	// Where two queue tables fit beside each other on the DJ console.
	console: "@media (min-width: 1280px)",
	reducedMotion: "@media (prefers-reduced-motion: reduce)",
});
