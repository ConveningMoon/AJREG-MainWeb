// Traducción de las respuestas del formulario al contrato del CRM.
//
// Las preguntas de este sitio se escribieron con su propio vocabulario
// (`budget: "under200k"`, `timeline: "immediately"`, `hasAgent: "yesExclusive"`),
// que no coincide con el del modelo de scoring. El resultado: el CRM guardaba
// las respuestas para mostrarlas, pero NO puntuaban. En el caso de `timeline`
// era peor — la clave sí coincidía y el valor no, así que el perfil del lead
// quedaba con un dato que no casaba ninguna regla.
//
// La traducción vive aquí y no en `data/checkIn.ts` a propósito: las etiquetas
// que ve el visitante son cosa del sitio, y los códigos son cosa del CRM. Lo
// único que tienen que compartir es esta tabla.
//
// Los mapas son EXHAUSTIVOS por tipo: añadir una opción en checkIn.ts sin
// mapearla aquí es un error de compilación, no un lead mal puntuado.

export interface CrmAnswer {
  key:      string
  question: string
  value:    string
  label:    string
}

// ── Compra ────────────────────────────────────────────────────────────────────

type BuyBudget = 'under200k' | '200to300k' | '300to400k' | '400to500k' | 'over500k'
type BuyTimeline = 'immediately' | '1to3months' | '3to6months' | '6to12months'
type HasAgent = 'yesExclusive' | 'yesOpen' | 'no'
type Area = 'virginiaBeach' | 'northCarolina' | 'notSure' | 'other'
type Financing = 'cash' | 'preapproved' | 'inProcess' | 'notStarted'

// El MONTO, no el nivel: el CRM lo clasifica contra los rangos que la agencia
// tenga configurados. Rango cerrado → punto medio; abierto → el límite declarado.
const BUDGET_AMOUNT: Record<BuyBudget, string> = {
  under200k:  '200000',
  '200to300k': '200000-300000',
  '300to400k': '300000-400000',
  '400to500k': '400000-500000',
  over500k:   '500000',
}

const TIMELINE: Record<BuyTimeline, string> = {
  immediately: 'under_3_months',
  '1to3months': 'under_3_months',
  '3to6months': '3_6_months',
  '6to12months': '6_12_months',
}

// "Sí, pero sin exclusiva" cuenta como que ya trabaja con alguien: sigue siendo
// un comprador más difícil de convertir, que es lo que mide esta dimensión.
const AGENT_STATUS: Record<HasAgent, string> = {
  yesExclusive: 'con_agente',
  yesOpen:      'con_agente',
  no:           'sin_agente',
}

// La zona EN PALABRAS, igual que las declaradas por la agencia en el CRM.
// `notSure` no se manda: "no lo sé" no es "fuera de zona", y fuera de zona resta.
const AREA: Record<Area, string | null> = {
  virginiaBeach:  'Virginia Beach',
  northCarolina:  'North Carolina',
  other:          'Otra',
  notSure:        null,
}

const FINANCING: Record<Financing, string> = {
  cash:        'cash',
  preapproved: 'preapproved',
  inProcess:   'in_process',
  notStarted:  'not_started',
}

// ── Venta ─────────────────────────────────────────────────────────────────────

type SellTimeline = BuyTimeline | 'exploring'

const SELL_TIMELINE: Record<SellTimeline, string> = {
  ...TIMELINE,
  exploring: 'over_12_explorando',
}

// Para un vendedor, "¿ya tienes agente?" es el estado del listado.
const LISTING_STATUS: Record<HasAgent, string> = {
  yesExclusive: 'ya_listado_con_agente',
  yesOpen:      'ya_listado_con_agente',
  no:           'no_listado_sin_agente',
}

// ── Traducción ────────────────────────────────────────────────────────────────

/** Clave del CRM y valor traducido, o null si esta respuesta no alimenta el modelo. */
function toCrm(intent: 'buy' | 'sell', key: string, value: string): { key: string; value: string } | null {
  if (intent === 'buy') {
    if (key === 'budget')    return inMap(BUDGET_AMOUNT, value, 'budget_amount')
    if (key === 'timeline')  return inMap(TIMELINE, value, 'timeline')
    if (key === 'hasAgent')  return inMap(AGENT_STATUS, value, 'agent_status')
    if (key === 'financing') return inMap(FINANCING, value, 'financing')
  } else {
    if (key === 'timeline')  return inMap(SELL_TIMELINE, value, 'timeline')
    if (key === 'hasAgent')  return inMap(LISTING_STATUS, value, 'listing_status')
    // El valor de la propiedad no puntúa en el camino de venta, pero sí da la
    // comisión potencial del lead en el CRM.
    if (key === 'value')     return inMap(BUDGET_AMOUNT, value, 'budget_amount')
  }
  if (key === 'area') {
    const zona = AREA[value as Area]
    return zona ? { key: 'area', value: zona } : null
  }
  return null
}

function inMap(map: Record<string, string>, value: string, key: string) {
  const v = map[value]
  return v ? { key, value: v } : null
}

/**
 * Convierte las respuestas del formulario en `form_answers` para el CRM.
 *
 * Cada respuesta se manda DOS veces cuando hace falta: con la clave del CRM (que
 * puntúa) y, si no se pudo traducir, con la del sitio (que al menos se guarda y
 * se muestra). Nunca se pierde una respuesta por no saber traducirla.
 */
export function toCrmAnswers(
  intent: 'buy' | 'sell',
  answers: Record<string, string>,
  texto: (key: string) => string,
  etiqueta: (key: string, value: string) => string,
): CrmAnswer[] {
  const out: CrmAnswer[] = []
  for (const [key, value] of Object.entries(answers)) {
    if (!value) continue
    const question = texto(key)
    const label    = etiqueta(key, value)
    const crm      = toCrm(intent, key, value)
    out.push({ key: crm?.key ?? key, question, value: crm?.value ?? value, label })
  }
  return out
}
