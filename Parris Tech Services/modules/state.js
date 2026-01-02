import { loadState, saveState } from "./storage.js";
import { uid } from "./utils.js";
import { getDemoData } from "./sampleData.js";

const baseState = {
  clients: [],
  appointments: [],
  invoices: [],
  templates: [],
  quickLinks: [],
  invoicePresets: [],
  settings: {
    businessName: "Parris Tech Services",
    phone: "",
    email: "",
    abn: "",
    pricingModel: "time-block",
    pricing: { blockMinutes: 30, blockRate: 0, hourlyRate: 0 },
    pricingNotes: "",
    invoiceFooter: "Thank you for your business.",
    brand: { primary: "#38bdf8", accent: "#a855f7", logoDataUrl: "" },
  },
  version: 1,
};

let appState = loadState(baseState);
appState = normalize(appState);

function persist() {
  saveState(appState);
}

function normalize(state) {
  const pricing = state.settings?.pricing || {};
  return {
    ...state,
    clients: state.clients || [],
    appointments: state.appointments || [],
    invoices: state.invoices || [],
    templates: state.templates || [],
    invoicePresets: state.invoicePresets || [],
    quickLinks: state.quickLinks || [],
    settings: {
      ...baseState.settings,
      ...(state.settings || {}),
      pricing: { ...baseState.settings.pricing, ...pricing },
    },
  };
}

export function getState() {
  return appState;
}

export function resetToDemo() {
  appState = normalize(getDemoData());
  persist();
  return appState;
}

export function upsertClient(input) {
  if (input.id) {
    const idx = appState.clients.findIndex((c) => c.id === input.id);
    if (idx >= 0) {
      appState.clients[idx] = { ...appState.clients[idx], ...input };
    }
  } else {
    const newClient = { ...input, id: uid() };
    appState.clients.push(newClient);
    input.id = newClient.id;
  }
  persist();
  return input.id;
}

export function upsertAppointment(input) {
  if (input.id) {
    const idx = appState.appointments.findIndex((a) => a.id === input.id);
    if (idx >= 0) {
      appState.appointments[idx] = { ...appState.appointments[idx], ...input };
    }
  } else {
    const newAppointment = { ...input, id: uid() };
    appState.appointments.push(newAppointment);
    input.id = newAppointment.id;
  }
  persist();
  return input.id;
}

export function upsertInvoice(input) {
  const calculatedTotal = calculateInvoiceTotal(input);
  const normalized = {
    lineItems: [],
    timeBlocks: [],
    travel: 0,
    discount: 0,
    status: "unpaid",
    dueDate: "",
    reference: "",
    taxIncluded: false,
    ...input,
    total: calculatedTotal,
  };

  if (normalized.id) {
    const idx = appState.invoices.findIndex((i) => i.id === normalized.id);
    if (idx >= 0) appState.invoices[idx] = { ...appState.invoices[idx], ...normalized };
  } else {
    normalized.id = uid();
    appState.invoices.push(normalized);
  }
  persist();
  return normalized.id;
}

export function upsertTemplate(input) {
  if (input.id) {
    const idx = appState.templates.findIndex((t) => t.id === input.id);
    if (idx >= 0) appState.templates[idx] = { ...appState.templates[idx], ...input };
  } else {
    const newTemplate = { ...input, id: uid() };
    appState.templates.push(newTemplate);
    input.id = newTemplate.id;
  }
  persist();
  return input.id;
}

export function upsertInvoicePreset(input){
  if (input.id) {
    const idx = appState.invoicePresets.findIndex(p=>p.id===input.id);
    if (idx>=0) appState.invoicePresets[idx] = { ...appState.invoicePresets[idx], ...input };
  } else {
    const newP = { ...input, id: uid() };
    appState.invoicePresets.push(newP);
    input.id = newP.id;
  }
  persist();
  return input.id;
}

export function deleteInvoicePreset(id){
  appState.invoicePresets = appState.invoicePresets.filter(p=>p.id!==id);
  persist();
}

export function upsertLink(input) {
  if (input.id) {
    const idx = appState.quickLinks.findIndex((l) => l.id === input.id);
    if (idx >= 0) appState.quickLinks[idx] = { ...appState.quickLinks[idx], ...input };
  } else {
    const newLink = { ...input, id: uid() };
    appState.quickLinks.push(newLink);
    input.id = newLink.id;
  }
  persist();
  return input.id;
}

export function setSettings(settings) {
  appState.settings = { ...appState.settings, ...settings };
  persist();
}

export function markInvoiceStatus(id, status) {
  const invoice = appState.invoices.find((i) => i.id === id);
  if (invoice) {
    invoice.status = status;
    persist();
  }
}

export function deleteItem(type, id) {
  if (!Array.isArray(appState[type])) return;
  appState[type] = appState[type].filter((item) => item.id !== id);
  persist();
}

export function calculateInvoiceTotal(invoice) {
  const lineTotal = (invoice.lineItems || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const labour = (invoice.timeBlocks || []).reduce((sum, block) => {
    const minutes = Number(block.minutes || 0);
    const rate = Number(block.rate || 0);
    return sum + (minutes / 60) * rate;
  }, 0);
  const travel = Number(invoice.travel || 0);
  const discount = Number(invoice.discount || 0);
  const total = lineTotal + labour + travel - discount;
  return Math.max(0, Number.isFinite(total) ? total : 0);
}

export function importData(data) {
  appState = normalize({
    ...JSON.parse(JSON.stringify(baseState)),
    ...data,
  });
  persist();
  return appState;
}

export function exportData() {
  return appState;
}
