export type CheckInIntent = "buy" | "sell";

export type CheckInQuestion = {
  key: string;
  options: string[];
};

// Qualification questions per branch. Keys are shared where the concept is
// the same (propertyType, timeline, hasAgent, area) so i18n only needs to
// namespace by intent, not duplicate unrelated keys.
export const checkInQuestions: Record<CheckInIntent, CheckInQuestion[]> = {
  buy: [
    { key: "budget", options: ["under200k", "200to300k", "300to400k", "400to500k", "over500k"] },
    { key: "timeline", options: ["immediately", "1to3months", "3to6months", "6to12months"] },
    // El financiamiento es la segunda dimensión de fit con más peso del modelo y
    // este formulario no la preguntaba, así que ese puntaje se perdía entero.
    { key: "financing", options: ["cash", "preapproved", "inProcess", "notStarted"] },
    { key: "propertyType", options: ["singleFamily", "townhouseCondo", "multiFamily", "land"] },
    { key: "hasAgent", options: ["yesExclusive", "yesOpen", "no"] },
    // Las zonas espejan las que la agencia declaró en el CRM: ofrecer otras no
    // es neutral, cada una cuenta como fuera de zona y le resta puntos al lead.
    { key: "area", options: ["virginiaBeach", "northCarolina", "notSure"] },
  ],
  sell: [
    { key: "propertyType", options: ["singleFamily", "townhouseCondo", "multiFamily", "land"] },
    { key: "timeline", options: ["immediately", "1to3months", "3to6months", "6to12months", "exploring"] },
    { key: "value", options: ["under200k", "200to300k", "300to400k", "400to500k", "over500k"] },
    { key: "hasAgent", options: ["yesExclusive", "yesOpen", "no"] },
    { key: "area", options: ["virginiaBeach", "northCarolina", "other"] },
  ],
};
