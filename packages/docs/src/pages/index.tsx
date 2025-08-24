import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const Card: React.FC<{ title: string; description: string; to: string }> = ({
  title,
  description,
  to,
}) => (
  <Link
    to={to}
    className="card padding--lg"
    style={{
      borderRadius: 16,
      textDecoration: "none",
      border: "1px solid var(--ifm-toc-border-color, #e6e6e6)",
      boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
      background: "var(--ifm-background-surface-color)",
    }}
  >
    <h3 style={{ marginTop: 0 }}>{title}</h3>
    <p style={{ marginBottom: 0, color: "var(--ifm-color-emphasis-700)" }}>
      {description}
    </p>
  </Link>
);

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const title = siteConfig?.title ?? "IntentLang";
  const tagline = siteConfig?.tagline ?? "Deterministic. Safe. Intentful.";

  return (
    <Layout>
      <Head>
        <meta property="og:title" content={`${title} — ${tagline}`} />
        <meta
          name="description"
          content="IntentLang: lenguaje con determinismo, match exhaustivo y separación func/effect."
        />
      </Head>

      {/* Hero */}
      <header
        style={{
          padding: "64px 0 24px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(0,0,0,0.03) 0%, transparent 100%)",
        }}
      >
        <div className="container">
          <h1 style={{ fontSize: 48, margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 18, marginTop: 8, color: "var(--ifm-color-emphasis-700)" }}>
            {tagline}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            <Link className="button button--primary button--lg" to="/docs/handbook/from-scratch">
              Empezar desde cero
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/examples/il-ts-browser">
              Explorar ejemplos IL ⇄ TS/PY
            </Link>
          </div>
        </div>
      </header>

      {/* Quick start */}
      <main className="container" style={{ padding: "24px 0 56px" }}>
        <section style={{ marginBottom: 32 }}>
          <div className="row">
            <div className="col col--6">
              <h2>Instalación rápida</h2>
              <CodeBlock language="bash">{`# En el monorepo
pnpm i
pnpm intent --help`}</CodeBlock>
              <p style={{ marginTop: 8 }}>
                O inicia un proyecto:
              </p>
              <CodeBlock language="bash">{`intent init ./hello-il --template tests -y
intent check --strict
intent build src -t ts -o dist`}</CodeBlock>
            </div>
            <div className="col col--6">
              <h2>Principios del lenguaje</h2>
              <ul>
                <li>✔️ Determinismo: <code>--seed-rng</code> y <code>--seed-clock</code></li>
                <li>✔️ <code>match</code> exhaustivo</li>
                <li>✔️ <code>Option</code>/<code>Result</code> (sin null/undefined)</li>
                <li>✔️ <em>Brands</em> para tipos seguros</li>
                <li>✔️ Separación <code>func</code> (puro) vs <code>effect</code> (con <code>uses</code>)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature links */}
        <section>
          <h2>Explora la documentación</h2>
          <div className="row" style={{ gap: 16 }}>
            <div className="col col--4">
              <Card
                title="From Scratch"
                description="Guía de inicio rápido: instalación, primer proyecto, tests y build."
                to="/docs/handbook/from-scratch"
              />
            </div>
            <div className="col col--4">
              <Card
                title="IL ⇄ TS/PY Browser"
                description="Explora los ejemplos reales y sus goldens generados."
                to="/docs/examples/il-ts-browser"
              />
            </div>
            <div className="col col--4">
              <Card
                title="Golden Diffs"
                description="Compara lado a lado IL con TS/PY para entender el mapping."
                to="/docs/examples/golden-diffs"
              />
            </div>
            <div className="col col--4">
              <Card
                title="CLI Playground"
                description="Construye comandos de intent a partir de SPEC, sin memorizar flags."
                to="/docs/reference/cli-playground"
              />
            </div>
            <div className="col col--4">
              <Card
                title="Compiler Options"
                description="Listado generado automáticamente desde SPEC."
                to="/docs/reference/compiler-options/"
              />
            </div>
            <div className="col col--4">
              <Card
                title="Grammar (EBNF)"
                description="Navega la gramática con índice de reglas."
                to="/docs/reference/grammar"
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
