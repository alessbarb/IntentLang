import React, { type JSX } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import clsx from "clsx";

import {
  featureList,
  principles,
  type FeatureItem,
} from "../data/homepageData";
import styles from "./Homepage.module.css";

/* Inline SVG for tiny icons (no deps) */
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    {...props}
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

/* ====== UI Blocks ====== */

const FeatureCard: React.FC<FeatureItem> = ({ title, description, to }) => (
  <Link to={to} className={styles.card}>
    <h3 className={styles.cardTitle}>{title}</h3>
    <p className={styles.cardDesc}>{description}</p>
  </Link>
);

const QuickDemo = () => (
  <section className={clsx("container", styles.section)}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionEyebrow}>demo</span>
      <h2 className={styles.sectionTitle}>
        Del cero al “check” en dos comandos
      </h2>
      <p style={{ margin: 0, color: "var(--ifm-color-emphasis-700)" }}>
        Instalas, inicializas y validas. Sin rituales.
      </p>
    </div>

    <div
      className={styles.demoBlock}
      role="region"
      aria-label="Demo de inicio rápido"
    >
      <div className={styles.demoHeader}>
        <p className={styles.demoTitle}>Shell</p>
        <div className={styles.kbd}>Tip: copia y pega</div>
      </div>
      <CodeBlock language="bash">{`# En el monorepo
pnpm i
pnpm intent --help

# Proyecto mínimo
intent init ./hello-il --template tests -y
intent check --strict`}</CodeBlock>
    </div>

    <div className="margin-top--sm">
      <div className={styles.hint}>
        ¿Prefieres ver IL junto a su salida en TypeScript? — Abre{" "}
        <Link to="/docs/examples/il-ts-browser">
          <code className={styles.inlineCode}>IL ⇄ TS Browser</code>
        </Link>
        .
      </div>
    </div>
  </section>
);

const Principles = () => (
  <section className={clsx("container", styles.section)}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionEyebrow}>filosofía</span>
      <h2 className={styles.sectionTitle}>
        Principios que guían decisiones de diseño
      </h2>
    </div>

    <div className={styles.principles}>
      <div>
        <ul className={styles.principleList}>
          {principles.map((p) => (
            <li key={p.title} className={styles.principleItem}>
              <CheckIcon className={styles.checkIcon} />
              <div>
                <strong>{p.title}</strong>
                {p.details ? (
                  <>
                    {" "}
                    — <code className={styles.inlineCode}>{p.details}</code>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.demoBlock}>
        <div className={styles.demoHeader}>
          <p className={styles.demoTitle}>Match exhaustivo en acción</p>
          <span className={styles.kbd}>Seguro por defecto</span>
        </div>
        <Tabs
          groupId="lang"
          queryString
          values={[
            { label: "IL", value: "il" },
            { label: "TypeScript", value: "ts" },
          ]}
        >
          <TabItem value="il">
            <CodeBlock language="rust">{`type Result = Ok(Int) | Err(Text)

func describe(r: Result): Text {
  match r {
    Ok(x)  -> "ok: " + x.toText()
    Err(e) -> "error: " + e
    // Sin default: el checker exige exhaustividad
  }
}`}</CodeBlock>
          </TabItem>
          <TabItem value="ts">
            <CodeBlock language="ts">{`type Result = { kind: "Ok"; value: number } | { kind: "Err"; error: string };

function describe(r: Result): string {
  switch (r.kind) {
    case "Ok":  return "ok: " + r.value.toString();
    case "Err": return "error: " + r.error;
    // no default -> exhaustive by construction with ts exhaustive checks
  }
}`}</CodeBlock>
          </TabItem>
        </Tabs>
      </div>
    </div>
  </section>
);

const FeatureGrid = () => (
  <section className={clsx("container", styles.section)}>
    <div className={styles.sectionHeader}>
      <span className={styles.sectionEyebrow}>explora</span>
      <h2 className={styles.sectionTitle}>
        Todo lo que necesitas, bien ordenado
      </h2>
    </div>
    <div className={styles.featureGrid}>
      {featureList.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  </section>
);

/* ====== Page ====== */

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout>
      <Head>
        <title>{`${siteConfig.title} — ${siteConfig.tagline}`}</title>
        <meta
          name="description"
          content="IntentLang: determinista, seguro y claro. Match exhaustivo, Option/Result, separación func/effect."
        />
      </Head>

      <header className={clsx("hero", styles.heroBanner)}>
        <div className={styles.heroBackdrop} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroInner}>
            <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
            <p className={styles.heroTagline}>{siteConfig.tagline}</p>
            <div className={styles.heroCTA}>
              <Link
                className="button button--primary button--lg"
                to="/docs/handbook/from-scratch"
              >
                Empezar ahora
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/handbook/what-is-intentlang"
              >
                ¿Qué es IntentLang?
              </Link>
              <Link
                className="button button--link button--lg"
                to="/docs/examples/il-ts-browser"
              >
                Ver ejemplos
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <QuickDemo />
        <Principles />
        <FeatureGrid />
      </main>
    </Layout>
  );
}
