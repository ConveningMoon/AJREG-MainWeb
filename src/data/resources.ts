export type ResourceQuestion = {
  key: string;
  type: "text" | "email" | "tel" | "select" | "radio";
  options?: string[];
};

export type AgentResource = {
  agentSlug: string;
  slug: string;
  titleKey: string;
  descriptionKey: string;
  questions: ResourceQuestion[];
  itmanoChannelEnv: string;
};

export const agentResources: AgentResource[] = [
  {
    agentSlug: "adriana-melendez",
    slug: "guia-familias-hispanas",
    titleKey: "resources.adriana.title",
    descriptionKey: "resources.adriana.description",
    itmanoChannelEnv: "ITMANO_ADRIANA_RESOURCE_CHANNEL_ID",
    questions: [
      { key: "barrier",  type: "radio",  options: ["creditScore", "downPayment", "language", "process"] },
      { key: "timeline", type: "radio",  options: ["immediately", "3months", "6months", "1year"] },
      { key: "preApproved", type: "radio", options: ["yes", "no", "notSure"] },
    ],
  },
  {
    agentSlug: "john-leonard",
    slug: "military-relocation-guide",
    titleKey: "resources.john.title",
    descriptionKey: "resources.john.description",
    itmanoChannelEnv: "ITMANO_JOHN_RESOURCE_CHANNEL_ID",
    questions: [
      { key: "status",   type: "radio", options: ["activeDuty", "veteran", "dependent", "civilian"] },
      { key: "pcsDate",  type: "radio", options: ["within3months", "3to6months", "6to12months", "over1year"] },
      { key: "vaBenefit", type: "radio", options: ["yes", "no", "notSure"] },
    ],
  },
  {
    agentSlug: "viviane-chiu",
    slug: "property-investment-guide",
    titleKey: "resources.viviane.title",
    descriptionKey: "resources.viviane.description",
    itmanoChannelEnv: "ITMANO_VIVIANE_RESOURCE_CHANNEL_ID",
    questions: [
      { key: "purpose",  type: "radio", options: ["invest", "primaryHome", "both"] },
      { key: "budget",   type: "radio", options: ["under200k", "200to350k", "350to500k", "over500k"] },
      { key: "existing", type: "radio", options: ["yes", "no"] },
    ],
  },
  {
    agentSlug: "melany-valencia",
    slug: "first-time-buyer-checklist",
    titleKey: "resources.melany.title",
    descriptionKey: "resources.melany.description",
    itmanoChannelEnv: "ITMANO_MELANY_RESOURCE_CHANNEL_ID",
    questions: [
      { key: "firstTime",  type: "radio", options: ["yes", "no"] },
      { key: "familySize", type: "radio", options: ["1to2", "3to4", "5plus"] },
      { key: "area",       type: "radio", options: ["norfolk", "virginiaBeach", "suffolk", "other"] },
    ],
  },
];

export function getResourceByAgent(agentSlug: string): AgentResource | undefined {
  return agentResources.find((r) => r.agentSlug === agentSlug);
}

export function getResourceBySlug(slug: string): AgentResource | undefined {
  return agentResources.find((r) => r.slug === slug);
}
