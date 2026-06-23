// Ambient type declarations for style side-effect imports (e.g. import "./styles.css").
// With moduleResolution: "bundler", TypeScript needs these or it reports ts(2882)
// ("Cannot find module or type declarations for side-effect import"). Next.js handles
// the actual CSS at build time - this only satisfies the editor's type checker.
declare module "*.css";
declare module "*.scss";
declare module "*.sass";
