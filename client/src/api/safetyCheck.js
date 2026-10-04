export function analyzeText(text) {
  if (!text) {
    return { risk: "none", flags: [] };
  }

  const lower = text.toLowerCase();

  const patterns = {
    suicide: [
      "vreau sa mor",
      "nu mai vreau sa traiesc",
      "sinucid",
      "ma omor",
      "nu mai pot",
    ],
    depression: [
      "sunt trist",
      "nu are sens",
      "ma simt gol",
      "singur",
    ],
    self_harm: [
      "ma ranesc",
      "cutting",
      "ma tai",
    ],
  };

  let flags = [];

  for (const key in patterns) {
    for (const phrase of patterns[key]) {
      if (lower.includes(phrase)) {
        flags.push(key);
        break;
      }
    }
  }

  let risk = "none";

  if (flags.includes("suicide") || flags.includes("self_harm")) {
    risk = "high";
  } else if (flags.length > 0) {
    risk = "medium";
  }

  return { risk, flags };
}