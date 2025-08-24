import React, { type JSX } from "react";
import { Redirect } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";

/** Redirige "/" -> "/docs/handbook/from-scratch" respetando baseUrl y locale. */
export default function Home(): JSX.Element {
  const to = useBaseUrl("/docs/handbook/from-scratch");
  return <Redirect to={to} />;
}
