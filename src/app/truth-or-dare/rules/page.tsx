import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { truthOrDareRuleSections } from "@/data/truthOrDareRules";
import { getAppHeaderData } from "@/lib/appHeaderData";
import { GAME_PATH, GAME_ROUND_PATH } from "@/lib/routes";

import AppHeader from "../../_components/AppHeader";
import SiteFooter from "../../_components/SiteFooter";

export const dynamic = "force-dynamic";

export default async function TruthOrDareRulesPage() {
  const { user, countdown } = await getAppHeaderData();
  const t = await getTranslations("Game");

  return (
    <>
      <AppHeader user={user} countdown={countdown} />
      <main className="profile-main">
        <article className="page-container">
          <header className="border-border mb-10 border-b pb-8">
            <Link href={GAME_PATH} className="profile-back-link mb-8">
              {t("labels.backToGame")}
            </Link>
            <p className="text-muted mb-3 text-xs font-medium tracking-[0.18em] uppercase">
              Valentine&apos;s Truth or Dare
            </p>
            <h1 className="text-text leading-1.1 font-serif text-4xl font-normal sm:text-5xl">
              {t("labels.rules")}
            </h1>
            <p className="text-subtext mt-4 max-w-2xl leading-7">
              {t("labels.rulesIntro")}
            </p>
            <div className="mt-6">
              <Link href={GAME_ROUND_PATH} className="btn">
                {t("labels.startPlaying")}
              </Link>
            </div>
          </header>

          <nav aria-label="Rule sections" className="mb-12">
            <p className="text-muted mb-4 text-xs font-medium tracking-[0.18em] uppercase">
              {t("labels.onThisPage")}
            </p>
            <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {truthOrDareRuleSections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-subtext hover:text-text text-sm underline underline-offset-4 transition-colors"
                  >
                    <span className="text-muted mr-2 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {t(section.titleKey)}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="divide-border divide-y">
            {truthOrDareRuleSections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-8 py-8 first:pt-0 last:pb-0"
              >
                <h2 className="text-text font-serif text-2xl font-normal sm:text-3xl">
                  {t(section.titleKey)}
                </h2>
                <div className="text-subtext mt-4 space-y-4 leading-7">
                  {section.paragraphKeys?.map((paragraphKey) => (
                    <p key={paragraphKey}>{t(paragraphKey)}</p>
                  ))}
                </div>
                {section.bulletKeys ? (
                  <ul className="text-subtext mt-5 list-disc space-y-2 pl-5 leading-7">
                    {section.bulletKeys.map((bulletKey) => (
                      <li key={bulletKey}>{t(bulletKey)}</li>
                    ))}
                  </ul>
                ) : null}
                {section.stepKeys ? (
                  <ol className="text-subtext marker:text-text mt-5 list-decimal space-y-3 pl-5 leading-7 marker:font-medium">
                    {section.stepKeys.map((stepKey) => (
                      <li key={stepKey} className="pl-2">
                        {t(stepKey)}
                      </li>
                    ))}
                  </ol>
                ) : null}
                {section.example ? (
                  <aside className="bg-surface border-border mt-6 rounded-sm border p-4 sm:p-5">
                    <p className="text-text mb-2 text-sm font-medium">
                      {t(section.example.titleKey)}
                    </p>
                    <p className="text-subtext leading-7">
                      {t(section.example.textKey)}
                    </p>
                  </aside>
                ) : null}
                {section.note ? (
                  <aside className="border-purple bg-purple-dim mt-6 rounded-sm border-l-4 p-4 sm:px-5">
                    <p className="text-purple mb-2 text-sm font-medium">
                      {t(section.note.titleKey)}
                    </p>
                    <p className="text-subtext leading-7">
                      {t(section.note.textKey)}
                    </p>
                  </aside>
                ) : null}
              </section>
            ))}
          </div>

          <footer className="border-border mt-12 border-t pt-8">
            <p className="text-subtext mb-4 leading-7">
              {t("labels.rulesReady")}
            </p>
            <Link href={GAME_ROUND_PATH} className="btn">
              {t("labels.startPlaying")}
            </Link>
          </footer>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
