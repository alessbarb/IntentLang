import React from "react";
import { Redirect } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";

/\*_ Redirecta / → /docs/handbook / from - scratch respetando baseUrl y locale._ /
export default function Home(): JSX.Element {
  const to = useBaseUrl("/docs/handbook/from-scratch");
  return <Redirect to={to} />;
}
