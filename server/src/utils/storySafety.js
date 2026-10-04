const HIGH_RISK_PATTERNS = [
  /vreau\s+s[ăa]\s+mor/i,
  /nu\s+mai\s+vreau\s+s[ăa]\s+tr[ăa]iesc/i,
  /m[ăa]\s+omor/i,
  /s[ăa]\s+m[ăa]\s+sinucid/i,
  /sinucidere/i,
  /suicid/i,
  /vreau\s+s[ăa]\s+dispar/i,
  /imi\s+pun\s+cap[ăa]t/i,
  /îmi\s+pun\s+cap[ăa]t/i,
  /o\s+s[ăa]\s+termin\s+cu\s+via[țt]a/i,
  /nu\s+mai\s+pot\s+continua/i,
];

const MEDIUM_RISK_PATTERNS = [
  /nu\s+mai\s+pot/i,
  /m[ăa]\s+simt\s+inutil/i,
  /nim[ăa]nui\s+nu\s+i-ar\s+p[ăa]sa/i,
  /nimeni\s+nu\s+m[ăa]\s+iube[șs]te/i,
  /sunt\s+o\s+povar[ăa]/i,
  /f[ăa]r[ăa]\s+speran[țt][ăa]/i,
  /nu\s+mai\s+are\s+rost/i,
  /vreau\s+s[ăa]\s+fug\s+de\s+tot/i,
];

const LOW_RISK_PATTERNS = [
  /trist/i,
  /singur/i,
  /singur[ăa]/i,
  /sup[ăa]rat/i,
  /deprimat/i,
  /anxios/i,
  /fric[ăa]/i,
];

function analyzeStorySafety({ title = "", blocks = [] }) {
  const textBlocks = Array.isArray(blocks)
    ? blocks
        .filter((block) => block.type === "text")
        .map((block) => block.content || "")
    : [];

  const text = [title, ...textBlocks].join(" ").toLowerCase();

  const flags = [];

  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("high_risk_self_harm_language");
      break;
    }
  }

  for (const pattern of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("medium_risk_distress_language");
      break;
    }
  }

  for (const pattern of LOW_RISK_PATTERNS) {
    if (pattern.test(text)) {
      flags.push("low_risk_emotional_distress");
      break;
    }
  }

  let riskLevel = "none";

  if (flags.includes("high_risk_self_harm_language")) {
    riskLevel = "high";
  } else if (flags.includes("medium_risk_distress_language")) {
    riskLevel = "medium";
  } else if (flags.includes("low_risk_emotional_distress")) {
    riskLevel = "low";
  }

return {
  riskLevel,
  flags,
  shouldBlockSubmit: riskLevel === "high",
  shouldFlagForAdmin: riskLevel === "medium" || riskLevel === "high",
  messageToUser:
    riskLevel === "high"
      ? "Îmi pare rău că treci prin asta. Siguranța ta contează. Te rog vorbește chiar acum cu un adult de încredere sau cere ajutor de urgență."
      : riskLevel === "medium"
      ? "Îmi pare rău că te simți așa. Nu trebuie să duci asta singur/ă; încearcă să vorbești cu cineva de încredere."
      : riskLevel === "low"
      ? "Mulțumim că ai împărtășit asta. Emoțiile tale sunt importante, iar faptul că le-ai pus în cuvinte contează."
      : "",
};
}

module.exports = {
  analyzeStorySafety,
};