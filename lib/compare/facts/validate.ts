import type { CompetitorFacts, SourcedFact } from "../types";

/** Today as `YYYY-MM-DD`, the calendar day in Paris where the facts are checked. */
export function todayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((candidate) => candidate.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Is this `YYYY-MM-DD` and a real calendar day? */
function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const blank = (value: string | undefined) => !value || value.trim() === "";

function factProblems(fact: SourcedFact, today: string): string[] {
  const problems: string[] = [];
  if (blank(fact.id)) problems.push("id is empty");
  if (blank(fact.value)) problems.push("value is empty");
  if (!isHttpsUrl(fact.sourceUrl)) problems.push("sourceUrl must be an https URL");
  if (blank(fact.sourceTitle)) problems.push("sourceTitle is empty");
  if (blank(fact.quote)) problems.push("quote is empty");
  if (!isCalendarDate(fact.checkedAt)) problems.push("checkedAt must be a real date written YYYY-MM-DD");
  else if (fact.checkedAt > today) problems.push(`checkedAt ${fact.checkedAt} is after today (${today})`);
  return problems;
}

/**
 * Everything wrong with the competitor facts, one line per problem naming the
 * competitor, market and fact. Empty means every fact is sourced, quoted and
 * dated on or before `today`, and no id repeats within a market.
 */
export function validateCompetitorFacts(
  competitors: readonly CompetitorFacts[],
  today: string = todayIso(),
): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const competitor of competitors) {
    if (seen.has(competitor.id)) problems.push(`${competitor.id}: listed twice`);
    seen.add(competitor.id);
    if (!isHttpsUrl(competitor.website)) problems.push(`${competitor.id}: website must be an https URL`);

    const markets = Object.entries(competitor.markets);
    if (markets.length === 0) problems.push(`${competitor.id}: has no market`);

    for (const [market, entry] of markets) {
      const where = `${competitor.id}/${market}`;
      if (!entry) continue;
      if (!isHttpsUrl(entry.pricingUrl)) problems.push(`${where}: pricingUrl must be an https URL`);
      if (entry.facts.length === 0) problems.push(`${where}: has no facts`);

      const ids = new Set<string>();
      for (const fact of entry.facts) {
        if (ids.has(fact.id)) problems.push(`${where}/${fact.id}: appears more than once`);
        ids.add(fact.id);
        for (const problem of factProblems(fact, today)) problems.push(`${where}/${fact.id}: ${problem}`);
      }
    }
  }

  return problems;
}
