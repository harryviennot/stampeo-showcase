"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "../ui/Container";
import { CTAButton } from "../ui/CTAButton";
import { CheckIcon } from "../icons";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import {
  PICKER_QUESTIONS,
  recommendEngine,
  type Answer,
  type Engine,
} from "@/lib/loyalty-picker";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";

// How long a chosen option stays highlighted before the next question slides
// in. Long enough to feel acknowledged, short enough to feel snappy.
const SELECT_FLASH_MS = 300;

function SampleCard({ engine }: { engine: Exclude<Engine, "either"> }) {
  if (engine === "stamps") {
    const s = STAMP_SAMPLES[0];
    return (
      <div className="w-[200px]">
        <ScaledCardWrapper baseWidth={280} targetWidth={200}>
          <WalletCard design={s.design} stamps={s.stamps} showQR={false} interactive3D />
        </ScaledCardWrapper>
      </div>
    );
  }
  const p = POINTS_SAMPLES[0];
  return (
    <div className="w-[200px]">
      <ScaledCardWrapper baseWidth={280} targetWidth={200}>
        <WalletCard
          design={p.design}
          pointsBalance={p.pointsBalance}
          pointsRewards={p.pointsRewards}
          showQR={false}
          interactive3D
        />
      </ScaledCardWrapper>
    </div>
  );
}

export function EnginePicker() {
  const t = useTranslations("loyalty.picker");
  const questions = t.raw("questions") as Array<{
    question: string;
    options: { label: string }[];
  }>;

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const step = answers.length;
  const done = step >= PICKER_QUESTIONS.length;
  const rec = done ? recommendEngine(answers) : null;

  const choose = (optionIndex: number) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    const answer = PICKER_QUESTIONS[step].options[optionIndex].answer;
    window.setTimeout(() => {
      setAnswers((prev) => [...prev, answer]);
      setSelected(null);
    }, SELECT_FLASH_MS);
  };

  const restart = () => {
    setAnswers([]);
    setSelected(null);
  };

  return (
    <section id="picker" className="py-20 sm:py-28">
      <Container className="max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </div>

        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="paper-card rounded-3xl bg-white p-6 sm:p-10 overflow-hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {!done ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <p className="text-sm font-semibold text-[var(--accent)] mb-3">
                  {t("progress", { current: step + 1, total: questions.length })}
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-6">
                  {questions[step].question}
                </h3>
                <div className="flex flex-col gap-3">
                  {questions[step].options.map((opt, i) => {
                    const isSelected = selected === i;
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        onClick={() => choose(i)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 + i * 0.06, duration: 0.25 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex w-full items-center justify-between gap-3 text-left rounded-xl border px-5 py-4 font-medium transition-colors ${
                          isSelected
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                            : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
                        }`}
                      >
                        <span>{opt.label}</span>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 24 }}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white"
                            >
                              <CheckIcon className="w-3.5 h-3.5" weight="bold" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              rec && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="text-center flex flex-col items-center gap-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
                    className="flex flex-wrap items-center justify-center gap-5"
                  >
                    {rec.engine === "either" ? (
                      <>
                        <SampleCard engine="stamps" />
                        <SampleCard engine="points" />
                      </>
                    ) : (
                      <SampleCard engine={rec.engine} />
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.35, ease: "easeOut" }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                      {t("resultHeading")}
                    </p>
                    <h3 className="text-2xl font-extrabold text-[var(--foreground)] mb-3">
                      {t(`results.${rec.engine}.title`)}
                    </h3>
                    <p className="text-[var(--muted-foreground)] leading-relaxed max-w-md mx-auto">
                      {t(`results.${rec.engine}.body`)}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32, duration: 0.35, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row items-center gap-3 pt-2"
                  >
                    <CTAButton label={t("cta")} trackAs="loyalty_picker" />
                    <button
                      type="button"
                      onClick={restart}
                      className="text-sm font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-4"
                    >
                      {t("restart")}
                    </button>
                  </motion.div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}
