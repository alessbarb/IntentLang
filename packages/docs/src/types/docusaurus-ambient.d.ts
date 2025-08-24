// Fallbacks suaves para el editor; Docusaurus resuelve en build.
declare module "@theme/Tabs" { const C: any; export default C; }
declare module "@theme/TabItem" { const C: any; export default C; }
declare module "@theme/CodeBlock" { const C: any; export default C; }
declare module "@docusaurus/router" { export const Redirect: any; }
declare module "@docusaurus/useBaseUrl" {
  export default function useBaseUrl(p: string): string;
}
