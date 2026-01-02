import {
  calculateInvoiceTotal,
  deleteItem,
  exportData,
  getState,
  importData,
  markInvoiceStatus,
  resetToDemo,
  setSettings,
  upsertAppointment,
  upsertClient,
  upsertInvoice,
  upsertLink,
  upsertTemplate,
  deleteItem,
} from "./modules/state.js";
import { formatCurrency, isToday, uid, renderTemplate } from "./modules/utils.js";
import { upsertInvoicePreset, deleteInvoicePreset } from "./modules/state.js";

let state = getState();
let selectedInvoiceId = null;

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-nav]");

const todayAppointmentsEl = document.getElementById("todayAppointments");
const unpaidCountEl = document.getElementById("unpaidCount");
const quickExportBtn = document.getElementById("quickExport");
const bookCalendlyBtn = document.getElementById("bookCalendly");

const clientForm = document.getElementById("clientForm");
const clientListEl = document.getElementById("clientList");
const clientSearch = document.getElementById("clientSearch");
const concessionOnly = document.getElementById("concessionOnly");
const businessOnly = document.getElementById("businessOnly");
const importClientsCsv = document.getElementById("importClientsCsv");
const findDuplicatesBtn = document.getElementById("findDuplicatesBtn");

const appointmentForm = document.getElementById("appointmentForm");
const appointmentListEl = document.getElementById("appointmentList");
const appointmentClient = document.getElementById("appointmentClient");
const appointmentFollowUp = document.getElementById("appointmentFollowUp");
const appointmentRecurring = document.getElementById("appointmentRecurring");
const appointmentChecklist = document.getElementById("appointmentChecklist");
const sessionSummaryInput = document.getElementById("sessionSummary");
const saveSessionSummaryBtn = document.getElementById("saveSessionSummary");

const invoiceForm = document.getElementById("invoiceForm");
const invoiceListEl = document.getElementById("invoiceList");
const invoiceAppointment = document.getElementById("invoiceAppointment");
const lineItemsContainer = document.getElementById("lineItems");
const timeBlocksContainer = document.getElementById("timeBlocks");
const invoiceTotalEl = document.getElementById("invoiceTotal");

const templateForm = document.getElementById("templateForm");
const templateListEl = document.getElementById("templateList");
const linkForm = document.getElementById("linkForm");
const quickLinksEl = document.getElementById("quickLinks");
const templateVarSelect = document.getElementById("templateVarSelect");

const pricingForm = document.getElementById("pricingForm");
const invoiceFooterInput = document.getElementById("invoiceFooter");
const loadDemoBtn = document.getElementById("loadDemoBtn");
const exportDataBtn = document.getElementById("exportDataBtn");
const importDataInput = document.getElementById("importDataInput");
const importEncryptedInput = document.getElementById("importEncryptedInput");
const printInvoiceBtn = document.getElementById("printInvoiceBtn");
const encryptExportBtn = document.getElementById("encryptExportBtn");
const encryptExportBtnSettings = document.getElementById("encryptExportBtnSettings");
const seedSelector = document.getElementById("seedSelector");
const brandPrimaryInput = document.getElementById("brandPrimary");
const brandAccentInput = document.getElementById("brandAccent");
const brandLogoInput = document.getElementById("brandLogoInput");
const brandLogoPreview = document.getElementById("brandLogoPreview");

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initButtons();
  seedInvoiceForm();
  renderAll();
});

function initNav() {
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-nav");
      if (!target) return;
      showView(target);
    });
  });
}

function initButtons() {
  document.getElementById("saveClientBtn").addEventListener("click", saveClient);
  clientSearch.addEventListener("input", renderClients);
  concessionOnly.addEventListener("change", renderClients);
  businessOnly.addEventListener("change", renderClients);
  importClientsCsv.addEventListener("change", handleClientsCsv);
  findDuplicatesBtn.addEventListener("click", findDuplicates);

  document.getElementById("saveAppointmentBtn").addEventListener("click", saveAppointment);

  document.getElementById("addLineItem").addEventListener("click", () => addLineItemRow());
  document.getElementById("addTimeBlock").addEventListener("click", () => addTimeBlockRow());
  document.getElementById("saveInvoiceBtn").addEventListener("click", saveInvoice);
  const stripeBtn = document.getElementById('stripeTemplateBtn'); if (stripeBtn) stripeBtn.addEventListener('click', ()=> applyPaymentTemplate('stripe'));
  const paypalBtn = document.getElementById('paypalTemplateBtn'); if (paypalBtn) paypalBtn.addEventListener('click', ()=> applyPaymentTemplate('paypal'));
  const savePresetBtn = document.getElementById('saveInvoicePreset'); if (savePresetBtn) savePresetBtn.addEventListener('click', saveInvoicePreset);
  const applyPresetBtn = document.getElementById('applyInvoicePreset'); if (applyPresetBtn) applyPresetBtn.addEventListener('click', applyInvoicePreset);
  const deletePresetBtn = document.getElementById('deleteInvoicePreset'); if (deletePresetBtn) deletePresetBtn.addEventListener('click', deleteInvoicePresetHandler);
  const presetsSelect = document.getElementById('invoicePresetsSelect'); if (presetsSelect) presetsSelect.addEventListener('change', ()=>{});

  document.getElementById("saveTemplateBtn").addEventListener("click", saveTemplate);
  document.getElementById("insertVarBtn").addEventListener("click", insertTemplateVar);
  document.getElementById("previewTemplateBtn").addEventListener("click", previewTemplate);
    const sendTplBtn = document.getElementById('sendTemplateBtn');
    if (sendTplBtn) sendTplBtn.addEventListener('click', sendTemplate);
    document.getElementById("saveLinkBtn").addEventListener("click", saveLink);

  document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);
  loadDemoBtn.addEventListener("click", () => {
    resetToDemo();
    state = getState();
    renderAll();
  });
  exportDataBtn.addEventListener("click", handleExport);
  quickExportBtn.addEventListener("click", handleExport);
  bookCalendlyBtn.addEventListener("click", () => openExternal("https://calendly.com/parristechservices1/computer-consultation"));
  importDataInput.addEventListener("change", handleImport);
  if (importEncryptedInput) importEncryptedInput.addEventListener('change', handleEncryptedImport);
  if (encryptExportBtn) encryptExportBtn.addEventListener("click", handleEncryptedExport);
  if (encryptExportBtnSettings) encryptExportBtnSettings.addEventListener("click", handleEncryptedExport);
  seedSelector.addEventListener("change", loadSeed);
  brandPrimaryInput.addEventListener("change", applyBrand);
  brandAccentInput.addEventListener("change", applyBrand);
  brandLogoInput.addEventListener("change", handleLogoUpload);
  saveSessionSummaryBtn.addEventListener("click", saveSessionSummary);

  invoiceAppointment.addEventListener("change", () => {
    if (invoiceAppointment.value) {
      const appt = state.appointments.find((a) => a.id === invoiceAppointment.value);
      if (appt) {
        const foundClient = state.clients.find((c) => c.id === appt.clientId);
        document.getElementById("invoiceStatus").focus({ preventScroll: true });
        document.getElementById("invoiceStatus").blur();
        if (foundClient) document.getElementById("invoiceForm").dataset.clientName = foundClient.name;
      }
    }
    updateInvoiceTotal();
  });

  invoiceForm.addEventListener("input", updateInvoiceTotal);

  printInvoiceBtn.addEventListener("click", () => {
    if (!selectedInvoiceId) { showToast("Select an invoice to print from the list.", 'warn'); return; }
    const invoice = state.invoices.find((i) => i.id === selectedInvoiceId);
    if (invoice) openPrintableInvoice(invoice);
  });
}

function showView(id) {
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-nav") === id));
}

  // compute tax breakdown (GST 10%)
  const subtotal = Number(invoice.total || 0);
  let gst = 0;
  let displayTotal = subtotal;
  let excludingGst = subtotal;
  if (invoice.taxIncluded) {
    // subtotal already includes GST
    excludingGst = +(subtotal / 1.1).toFixed(2);
    gst = +(subtotal - excludingGst).toFixed(2);
    displayTotal = subtotal;
  } else {
    gst = +(subtotal * 0.1).toFixed(2);
    displayTotal = +(subtotal + gst).toFixed(2);
  }

  win.document.write(`
  state = getState();
  populateClientSelects();
  renderDashboard();
  renderClients();
  renderAppointments();
  renderInvoices();
  renderTemplates();
  renderQuickLinks();
  loadSettingsForm();
}

function renderDashboard() {
  todayAppointmentsEl.innerHTML = "";
  const todays = state.appointments.filter((a) => isToday(a.datetime));
  if (!todays.length) {
    todayAppointmentsEl.innerHTML = "<li>No appointments today.</li>";
  } else {
    todays
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
      .forEach((appt) => {
        const client = state.clients.find((c) => c.id === appt.clientId);
        const li = document.createElement("li");
        li.innerHTML = `
          <div><strong>${client?.name || "Unassigned"}</strong> • ${new Date(appt.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          <div class="muted">${invoice.taxIncluded ? 'Tax included (GST 10%)' : 'GST not included'}</div>
          <small>${appt.notes || ""}</small>
        `;
        todayAppointmentsEl.appendChild(li);
      });
  }
  const unpaid = state.invoices.filter((i) => i.status === "unpaid").length;
  unpaidCountEl.textContent = unpaid;
}

function saveClient(event) {
  event?.preventDefault();
  const client = {
    id: document.getElementById("clientId").value || null,
    name: document.getElementById("clientName").value.trim(),
    phone: document.getElementById("clientPhone").value.trim(),
    email: document.getElementById("clientEmail").value.trim(),
    address: document.getElementById("clientAddress").value.trim(),
    preferredContact: document.getElementById("clientContact").value,
    concession: document.getElementById("clientConcession").checked,
    notes: document.getElementById("clientNotes").value.trim(),
    devices: Array.from(document.querySelectorAll('#clientForm .client-device:checked')).map(i=>i.value),
    type: document.getElementById("clientType").value,
    consent: document.getElementById("clientConsent").checked,
    lastContact: document.getElementById("clientLastContact").value,
    tags: (document.getElementById("clientTags").value || "").split(',').map(s=>s.trim()).filter(Boolean),
  };
  if (!client.name) { showToast("Client name is required","warn"); return }
  upsertClient(client);
  clientForm.reset();
      <p>Travel/Call-out: ${formatCurrency(invoice.travel || 0)}<br>
      Discount: ${formatCurrency(invoice.discount || 0)}</p>
      <table style="width:300px;margin-top:8px">
        <tbody>
          <tr><td>Subtotal</td><td style="text-align:right">${formatCurrency(excludingGst)}</td></tr>
          <tr><td>GST (10%)</td><td style="text-align:right">${formatCurrency(gst)}</td></tr>
          <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${formatCurrency(displayTotal)}</strong></td></tr>
        </tbody>
      </table>
}
      <div style="margin-top:12px">
        <button onclick="window.print()">Print / Save PDF</button>
      </div>
  const filtered = state.clients.filter((c) => {
    const matches =
      c.name.toLowerCase().includes(term) ||
      c.phone?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term);
    const concessionPass = !concessionOnly.checked || c.concession;

function openPrintableReceipt(invoice){
  const paidAt = new Date().toLocaleString();
  const client = state.clients.find(c=>c.id===invoice.clientId) || {};
  const win = window.open('','_blank');
  win.document.write(`
    <html><head><title>Receipt</title><style>body{font-family:Arial;padding:20px}.muted{color:#555}</style></head><body>
      <h2>Receipt</h2>
      <div><strong>${state.settings.businessName || 'Parris Tech Services'}</strong><br>${state.settings.abn?`ABN: ${state.settings.abn}<br>`:''}${state.settings.email||''}</div>
      <p>Paid by: <strong>${client.name || 'Client'}</strong><br>Amount: <strong>${formatCurrency(invoice.total)}</strong><br>Paid at: ${paidAt}</p>
      <p>Reference: ${invoice.reference || '—'}</p>
      <button onclick="window.print()">Print / Save PDF</button>
    </body></html>
  `);
  win.document.close(); win.focus();
}
    const businessPass = !businessOnly.checked || c.type === "business";
    return matches && concessionPass && businessPass;
  });
  clientListEl.innerHTML = "";
  if (!filtered.length) {
    clientListEl.innerHTML = "<li>No clients yet.</li>";
    return;
  }
  filtered.forEach((client) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${client.name}</strong> ${client.concession ? "<span class='status booked'>Concession</span>" : ""}</div>
      <div>${client.phone || ""} · ${client.email || ""}</div>
      <div class="help">${client.type || "individual"} ${client.consent ? "• consent" : ""} ${client.lastContact ? `• last contact ${new Date(client.lastContact).toLocaleString()}` : ""} ${client.tags && client.tags.length ? `• tags: ${client.tags.join(', ')}` : ''}</div>
      <small>${client.notes || ""}</small>
      <button class="ghost small" data-id="${client.id}">Edit</button>
    `;
    li.querySelector("button").addEventListener("click", () => loadClientIntoForm(client.id));
    clientListEl.appendChild(li);
  });
}

function loadClientIntoForm(id) {
  const client = state.clients.find((c) => c.id === id);
  if (!client) return;
  document.getElementById("clientId").value = client.id;
  document.getElementById("clientName").value = client.name;
  document.getElementById("clientPhone").value = client.phone || "";
  document.getElementById("clientEmail").value = client.email || "";
  document.getElementById("clientAddress").value = client.address || "";
  document.getElementById("clientContact").value = client.preferredContact || "";
  document.getElementById("clientConcession").checked = !!client.concession;
  document.getElementById("clientNotes").value = client.notes || "";
  document.getElementById("clientType").value = client.type || "";
  document.getElementById("clientConsent").checked = !!client.consent;
  document.getElementById("clientLastContact").value = client.lastContact || "";
  document.getElementById("clientTags").value = Array.isArray(client.tags) ? client.tags.join(', ') : (client.tags || '');
  // restore device checkboxes
  Array.from(document.querySelectorAll('#clientForm .client-device')).forEach(cb => {
    cb.checked = Array.isArray(client.devices) && client.devices.includes(cb.value);
  });
}

function saveAppointment(event) {
  event?.preventDefault();
  const appointment = {
    id: document.getElementById("appointmentId").value || null,
    clientId: appointmentClient.value,
    datetime: document.getElementById("appointmentDate").value,
    location: document.getElementById("appointmentLocation").value,
    duration: Number(document.getElementById("appointmentDuration").value),
    status: document.getElementById("appointmentStatus").value,
    followUp: appointmentFollowUp.value,
    recurring: appointmentRecurring.checked,
    checklist: appointmentChecklist.value.trim(),
    notes: document.getElementById("appointmentNotes").value.trim(),
  };
  if (!appointment.clientId) { showToast("Select a client","warn"); return }
  if (!appointment.datetime) { showToast("Select date and time","warn"); return }
  upsertAppointment(appointment);
  // If this appointment is recurring and has a followUp datetime, auto-create the next occurrence when completed
  try {
    if (appointment.recurring && appointment.followUp && appointment.status === 'completed') {
      const nextAppt = {
        id: null,
        clientId: appointment.clientId,
        datetime: appointment.followUp,
        location: appointment.location,
        duration: appointment.duration,
        status: 'booked',
        notes: `Auto-created follow-up from appointment on ${new Date(appointment.datetime).toLocaleString()}`,
        recurring: true,
        followUp: ''
      };
      upsertAppointment(nextAppt);
      showToast('Next recurring appointment scheduled', 'success');
    }
  } catch (err) {
    console.error('Error creating recurring appointment', err);
  }
  appointmentForm.reset();
  document.getElementById("appointmentDuration").value = 60;
  document.getElementById("appointmentId").value = "";
  renderAll();
}

function saveSessionSummary(){
  const summary = (sessionSummaryInput?.value || '').trim();
  if (!summary) { showToast('No session summary to save','warn'); return; }
  // prefer explicit appointment id from the form
  const apptId = document.getElementById('appointmentId')?.value;
  let appt = null;
  if (apptId) appt = state.appointments.find(a=>a.id===apptId);
  if (!appt) {
    const clientId = appointmentClient?.value;
    if (clientId) {
      const candidates = state.appointments.filter(a=>a.clientId===clientId).sort((a,b)=> new Date(b.datetime)-new Date(a.datetime));
      appt = candidates[0];
    }
  }
  if (!appt) { showToast('No appointment found to attach summary to','warn'); return; }
  const timestamp = new Date().toLocaleString();
  appt.notes = `${appt.notes || ''}\n\n[Session ${timestamp}]\n${summary}`.trim();
  upsertAppointment(appt);
  renderAppointments();
  showToast('Session summary saved to appointment notes','success');
  sessionSummaryInput.value = '';
}

function renderAppointments() {
  appointmentListEl.innerHTML = "";
  const sorted = [...state.appointments].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  if (!sorted.length) {
    appointmentListEl.innerHTML = "<li>No appointments logged.</li>";
    return;
  }
  sorted.forEach((appt) => {
    const client = state.clients.find((c) => c.id === appt.clientId);
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${client?.name || "Unassigned"}</strong> • ${new Date(appt.datetime).toLocaleString()}</div>
      <div class="status ${appt.status}">${appt.status.replace("-", " ")}</div>
      <small>${appt.location} · ${appt.duration || 0} mins ${appt.recurring ? "• Recurring" : ""}</small>
      ${appt.followUp ? `<div class="help">Follow-up: ${new Date(appt.followUp).toLocaleString()}</div>` : ""}
      <div class="chip-row">
        <button class="ghost small" data-action="arrived">Mark arrived</button>
        <button class="ghost small" data-action="launch">Launch Session</button>
        <button class="ghost small" data-action="edit">Edit</button>
        <button class="ghost small" data-action="export-ics">Export .ics</button>
      </div>
    `;
    li.querySelector('[data-action="arrived"]').addEventListener("click", () => {
      showToast("Marked arrived — launch session from appointment list", 'info');
      appt.status = "arrived";
      upsertAppointment(appt);
      renderAppointments();
      renderDashboard();
    });
    li.querySelector('[data-action="launch"]').addEventListener("click", () => {
      // Build query params: client name and devices if present
      const clientName = encodeURIComponent(client?.name || "Client");
      const devices = (client?.devices && client.devices.length) ? encodeURIComponent(client.devices.join(',')) : '';
      const url = `../ParrisTechApp/index.html?client=${clientName}${devices?`&devices=${devices}`:''}`;
      // mark arrived and persist
      appt.status = "arrived";
      upsertAppointment(appt);
      renderAppointments();
      renderDashboard();
      window.open(url, '_blank');
    });
    li.querySelector('[data-action="edit"]').addEventListener("click", () => loadAppointmentIntoForm(appt.id));
    li.querySelector('[data-action="export-ics"]').addEventListener('click', ()=> exportAppointmentIcs(appt));
    appointmentListEl.appendChild(li);
  });
}

function exportAppointmentIcs(appt){
  const client = state.clients.find(c=>c.id===appt.clientId) || {};
  const start = new Date(appt.datetime);
  const end = new Date(start.getTime() + (Number(appt.duration||60)*60000));
  function formatDate(d){
    return d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  }
  const uidStr = `appt-${appt.id}@parristech.local`;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ParrisTechServicesApp//EN',
    'BEGIN:VEVENT',
    `UID:${uidStr}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:Parris Tech Appointment — ${client.name || 'Client'}`,
    `DESCRIPTION:${appt.notes || ''}`,
    `LOCATION:${appt.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([body], {type: 'text/calendar'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `parristech-appointment-${appt.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast('Appointment .ics exported', 'success');
}

// ------------------ Toast helper ------------------
function showToast(msg, type='info', timeout=3500){
  const container = document.getElementById('toastContainer');
  if (!container) { alert(msg); return; }
  const div = document.createElement('div'); div.className = `toast ${type}`; div.textContent = msg;
  container.appendChild(div);
  setTimeout(()=>{ div.classList.add('hide'); div.remove(); }, timeout);
}

// ------------------ Confirm modal helper ------------------
function showConfirm(message){
  return new Promise((resolve)=>{
    const modal = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    if (!modal || !msgEl || !okBtn || !cancelBtn) {
      const proceed = window.confirm(message);
      resolve(proceed);
      return;
    }
    msgEl.textContent = message;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    const cleanup = ()=>{ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); okBtn.removeEventListener('click', onOk); cancelBtn.removeEventListener('click', onCancel); document.removeEventListener('keydown', onKey); };
    const onOk = ()=>{ cleanup(); resolve(true); };
    const onCancel = ()=>{ cleanup(); resolve(false); };
    const onKey = (e)=>{ if (e.key === 'Escape') { onCancel(); } };
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKey);
    // focus OK button
    okBtn.focus();
  });
}

function loadAppointmentIntoForm(id) {
  const appt = state.appointments.find((a) => a.id === id);
  if (!appt) return;
  document.getElementById("appointmentId").value = appt.id;
  appointmentClient.value = appt.clientId;
  document.getElementById("appointmentDate").value = appt.datetime;
  document.getElementById("appointmentLocation").value = appt.location;
  document.getElementById("appointmentDuration").value = appt.duration || 60;
  document.getElementById("appointmentStatus").value = appt.status;
  document.getElementById("appointmentNotes").value = appt.notes || "";
}

function seedInvoiceForm() {
  lineItemsContainer.innerHTML = "";
  timeBlocksContainer.innerHTML = "";
  addLineItemRow({ description: "Service", amount: 0 });
  addTimeBlockRow({ label: "Time block", minutes: state.settings.pricing.blockMinutes || 60 });
  updateInvoiceTotal();
}

function addLineItemRow(data = {}) {
  const row = document.createElement("div");
  row.className = "line-item inline-grid";
  row.innerHTML = `
    <input type="text" placeholder="Description" value="${data.description || ""}">
    <input type="number" min="0" step="1" placeholder="Amount" value="${data.amount || 0}">
    <button type="button" class="ghost small">Remove</button>
  `;
  row.querySelector("button").addEventListener("click", () => {
    row.remove();
    updateInvoiceTotal();
  });
  row.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateInvoiceTotal));
  lineItemsContainer.appendChild(row);
}

function addTimeBlockRow(data = {}) {
  const row = document.createElement("div");
  row.className = "time-block inline-grid";
  row.innerHTML = `
    <input type="text" placeholder="Label" value="${data.label || ""}">
    <input type="number" min="0" step="15" placeholder="Minutes" value="${data.minutes || 0}">
    <input type="number" min="0" step="1" placeholder="Rate" value="${data.rate ?? getDefaultRate()}">
    <button type="button" class="ghost small">Remove</button>
  `;
  row.querySelector("button").addEventListener("click", () => {
    row.remove();
    updateInvoiceTotal();
  });
  row.querySelectorAll("input").forEach((input) => input.addEventListener("input", updateInvoiceTotal));
  timeBlocksContainer.appendChild(row);
}

function getDefaultRate() {
  const pricing = state.settings.pricing || {};
  if (state.settings.pricingModel === "time-block" && pricing.blockMinutes) {
    return (pricing.blockRate * 60) / pricing.blockMinutes;
  }
  return pricing.hourlyRate || 0;
}

function collectLineItems() {
  return Array.from(lineItemsContainer.querySelectorAll(".line-item")).map((row) => {
    const [descInput, amountInput] = row.querySelectorAll("input");
    return { id: uid(), description: descInput.value.trim(), amount: Number(amountInput.value) || 0 };
  });
}

function collectTimeBlocks() {
  return Array.from(timeBlocksContainer.querySelectorAll(".time-block")).map((row) => {
    const [labelInput, minutesInput, rateInput] = row.querySelectorAll("input");
    return {
      id: uid(),
      label: labelInput.value.trim(),
      minutes: Number(minutesInput.value) || 0,
      rate: Number(rateInput.value) || 0,
    };
  });
}

function updateInvoiceTotal() {
  const invoice = {
    lineItems: collectLineItems(),
    timeBlocks: collectTimeBlocks(),
    travel: Number(document.getElementById("invoiceTravel").value) || 0,
    discount: Number(document.getElementById("invoiceDiscount").value) || 0,
  };
  invoiceTotalEl.textContent = formatCurrency(calculateInvoiceTotal(invoice));
}

function saveInvoice(event) {
  event?.preventDefault();
  const appointmentId = invoiceAppointment.value || null;
  const appointment = state.appointments.find((a) => a.id === appointmentId);
  const invoice = {
    id: document.getElementById("invoiceId").value || null,
    appointmentId,
    clientId: appointment?.clientId || null,
    lineItems: collectLineItems(),
    timeBlocks: collectTimeBlocks(),
    travel: Number(document.getElementById("invoiceTravel").value) || 0,
    discount: Number(document.getElementById("invoiceDiscount").value) || 0,
    dueDate: document.getElementById("invoiceDueDate")?.value || "",
    reference: document.getElementById("invoiceReference")?.value.trim() || "",
    paymentUrl: document.getElementById("invoicePaymentUrl")?.value.trim() || "",
    taxIncluded: document.getElementById("invoiceTaxIncluded")?.checked || false,
    status: document.getElementById("invoiceStatus").value,
  };
  const newId = upsertInvoice(invoice);
  selectedInvoiceId = newId;
  invoiceForm.reset();
  document.getElementById("invoiceId").value = "";
  seedInvoiceForm();
  renderInvoices();
  renderDashboard();
  // If invoice was marked paid on save, open printable receipt
  if (invoice.status === 'paid'){
    const updated = state.invoices.find(i => i.id === newId) || invoice;
    openPrintableReceipt(updated);
  }
}

function renderInvoices() {
  invoiceListEl.innerHTML = "";
  const sorted = [...state.invoices].sort((a, b) => b.total - a.total);
  if (!sorted.length) {
    invoiceListEl.innerHTML = "<li>No invoices yet.</li>";
    return;
  }
  sorted.forEach((invoice) => {
    const appointment = state.appointments.find((a) => a.id === invoice.appointmentId);
    const client = state.clients.find((c) => c.id === (invoice.clientId || appointment?.clientId));
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${client?.name || "Invoice"}</strong> · ${formatCurrency(invoice.total)}</div>
      <div>${appointment ? new Date(appointment.datetime).toLocaleString() : "No appointment linked"}</div>
      <div class="help">Due ${invoice.dueDate || "N/A"} ${invoice.reference ? `• Ref ${invoice.reference}` : ""} ${invoice.taxIncluded ? "• Tax incl." : ""}</div>
      <div class="status ${invoice.status}">${invoice.status}</div>
      <div class="chip-row">
        <button class="ghost small" data-action="edit">Load</button>
        <button class="ghost small" data-action="mark">${invoice.status === "paid" ? "Mark unpaid" : "Mark paid"}</button>
        ${invoice.paymentUrl ? `<button class="ghost small" data-action="pay">Pay</button>` : ''}
        <button class="ghost small" data-action="zoho">Create in Zoho</button>
        <button class="ghost small" data-action="print">Print</button>
      </div>
    `;
    li.querySelector('[data-action="edit"]').addEventListener("click", () => loadInvoiceIntoForm(invoice.id));
    li.querySelector('[data-action="mark"]').addEventListener("click", () => {
      const newStatus = invoice.status === "paid" ? "unpaid" : "paid";
      markInvoiceStatus(invoice.id, newStatus);
      renderInvoices();
      renderDashboard();
      if (newStatus === 'paid'){
        // open a printable receipt
        const updated = state.invoices.find(i=>i.id===invoice.id) || invoice;
        openPrintableReceipt(updated);
      }
    });
    li.querySelector('[data-action="print"]').addEventListener("click", () => openPrintableInvoice(invoice));
    const payBtn = li.querySelector('[data-action="pay"]');
    if (payBtn) payBtn.addEventListener('click', ()=>{ window.open(invoice.paymentUrl,'_blank'); });
    const zohoBtn = li.querySelector('[data-action="zoho"]');
    if (zohoBtn) zohoBtn.addEventListener('click', ()=>{
      const base = (state.settings && state.settings.zohoBooksUrl) ? state.settings.zohoBooksUrl : 'https://books.zoho.com.au/app/7006266190#/invoices/new';
      const ref = invoice.reference ? invoice.reference : '';
      let target = base;
      try{
        if (ref) {
          // insert query param before hash if present
          const hashIdx = base.indexOf('#');
          if (hashIdx !== -1) {
            const before = base.slice(0, hashIdx);
            const after = base.slice(hashIdx);
            const sep = before.includes('?') ? '&' : '?';
            target = `${before}${sep}reference=${encodeURIComponent(ref)}${after}`;
          } else {
            const sep = base.includes('?') ? '&' : '?';
            target = `${base}${sep}reference=${encodeURIComponent(ref)}`;
          }
        }
      } catch (err) { target = base; }
      window.open(target, '_blank');
    });
    invoiceListEl.appendChild(li);
  });
}

function saveInvoicePreset(){
  const name = (document.getElementById('presetName')?.value || '').trim();
  if (!name) { showToast('Enter a preset name', 'warn'); return; }
  const preset = {
    name,
    data: {
      lineItems: collectLineItems(),
      timeBlocks: collectTimeBlocks(),
      travel: Number(document.getElementById('invoiceTravel').value) || 0,
      discount: Number(document.getElementById('invoiceDiscount').value) || 0,
      taxIncluded: document.getElementById('invoiceTaxIncluded')?.checked || false
    }
  };
  upsertInvoicePreset(preset);
  state = getState();
  renderInvoicePresets();
  showToast('Preset saved', 'success');
}

function renderInvoicePresets(){
  const select = document.getElementById('invoicePresetsSelect');
  if (!select) return;
  const opts = ['<option value="">Load preset...</option>', ...(state.invoicePresets||[]).map(p=>`<option value="${p.id}">${p.name}</option>`)];
  select.innerHTML = opts.join('');
}

function applyInvoicePreset(){
  const sel = document.getElementById('invoicePresetsSelect');
  if (!sel) return; const id = sel.value; if (!id) { showToast('Select a preset', 'warn'); return; }
  const preset = (state.invoicePresets||[]).find(p=>p.id===id);
  if (!preset) { showToast('Preset not found', 'warn'); return; }
  // apply preset fields
  const d = preset.data || {};
  // replace line/time blocks
  lineItemsContainer.innerHTML = '';
  (d.lineItems||[]).forEach(li=> addLineItemRow(li));
  timeBlocksContainer.innerHTML = '';
  (d.timeBlocks||[]).forEach(tb=> addTimeBlockRow(tb));
  document.getElementById('invoiceTravel').value = d.travel || 0;
  document.getElementById('invoiceDiscount').value = d.discount || 0;
  document.getElementById('invoiceTaxIncluded').checked = !!d.taxIncluded;
  updateInvoiceTotal();
  showToast('Preset applied', 'success');
}

function deleteInvoicePresetHandler(){
  const sel = document.getElementById('invoicePresetsSelect'); if (!sel) return; const id = sel.value; if (!id) { showToast('Select a preset to delete','warn'); return; }
  deleteInvoicePreset(id);
  state = getState();
  renderInvoicePresets();
  showToast('Preset deleted','success');
}

function loadInvoiceIntoForm(id) {
  const invoice = state.invoices.find((i) => i.id === id);
  if (!invoice) return;
  selectedInvoiceId = id;
  document.getElementById("invoiceId").value = invoice.id;
  invoiceAppointment.value = invoice.appointmentId || "";
  document.getElementById("invoiceTravel").value = invoice.travel || 0;
  document.getElementById("invoiceDiscount").value = invoice.discount || 0;
  document.getElementById("invoicePaymentUrl").value = invoice.paymentUrl || "";
  document.getElementById("invoiceStatus").value = invoice.status || "unpaid";
  document.getElementById("invoiceDueDate").value = invoice.dueDate || "";
  document.getElementById("invoiceReference").value = invoice.reference || "";
  document.getElementById("invoiceTaxIncluded").checked = !!invoice.taxIncluded;
  lineItemsContainer.innerHTML = "";
  timeBlocksContainer.innerHTML = "";
  (invoice.lineItems || []).forEach((item) => addLineItemRow(item));
  (invoice.timeBlocks || []).forEach((block) => addTimeBlockRow(block));
  updateInvoiceTotal();
  showView("invoices");
}

function openPrintableInvoice(invoice) {
  const appointment = state.appointments.find((a) => a.id === invoice.appointmentId);
  const client = state.clients.find((c) => c.id === (invoice.clientId || appointment?.clientId));
  const win = window.open("", "_blank");
  const settings = state.settings;
  const brand = state.settings.brand || { primary:'#38bdf8', accent:'#a855f7', logoDataUrl: '' };
  win.document.write(`
    <html>
    <head>
      <title>Invoice</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color:#111 }
        .header { display: flex; justify-content: space-between; align-items:center; margin-bottom: 20px; }
        .brand { display:flex; align-items:center; gap:12px }
        .brand-mark { width:64px; height:64px; border-radius:8px; background:${brand.primary}; display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700 }
        .total { font-size: 22px; color:${brand.accent} }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #eee; padding: 8px; text-align: left; }
        .muted { color: #555; }
        .invoice-meta { text-align:right }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">
          ${brand.logoDataUrl ? `<img src="${brand.logoDataUrl}" alt="logo" style="height:64px;object-fit:contain">` : `<div class="brand-mark">${(settings.businessName||'PTS').slice(0,3).toUpperCase()}</div>`}
          <div>
            <strong>${settings.businessName || "Parris Tech Services"}</strong><br>
            ${settings.phone ? settings.phone + '<br>' : ''}
            ${settings.email ? settings.email + '<br>' : ''}
            ${settings.abn ? `ABN: ${settings.abn}` : ''}
          </div>
        </div>
        <div class="invoice-meta">
          <div class="total">${formatCurrency(invoice.total)}</div>
          <div class="muted">${invoice.status.toUpperCase()}</div>
          ${invoice.dueDate ? `<div class="muted">Due: ${invoice.dueDate}</div>` : ""}
          ${invoice.reference ? `<div class="muted">Ref: ${invoice.reference}</div>` : ""}
          <div class="muted">${invoice.taxIncluded ? 'Tax included (GST 10%)' : 'GST not included'}</div>
        </div>
      </div>
      <div>
        <strong>Bill to:</strong><br>
        ${client?.name || "Client"}<br>
        ${client?.email || ""} ${client?.phone || ""}
      </div>
      <h3>Line items</h3>
      <table>
        <thead><tr><th>Description</th><th style="width:120px">Amount</th></tr></thead>
        <tbody>
          ${(invoice.lineItems || [])
            .map((item) => `<tr><td>${item.description}</td><td style="text-align:right">${formatCurrency(item.amount)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
      <h3>Time blocks</h3>
      <table>
        <thead><tr><th>Label</th><th>Minutes</th><th>Rate</th></tr></thead>
        <tbody>
          ${(invoice.timeBlocks || [])
            .map(
              (block) =>
                `<tr><td>${block.label}</td><td>${block.minutes}</td><td style="text-align:right">${formatCurrency(block.rate)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p>Travel/Call-out: ${formatCurrency(invoice.travel || 0)}<br>
      Discount: ${formatCurrency(invoice.discount || 0)}</p>
      ${state.settings.invoiceFooter ? `<p>${state.settings.invoiceFooter}</p>` : ""}
      ${invoice.paymentUrl ? `<div style="margin-top:8px"><a href="${invoice.paymentUrl}" target="_blank" rel="noopener" style="background:${brand.primary};color:#fff;padding:8px 12px;border-radius:4px;text-decoration:none">Pay online</a></div>` : ''}
      <div style="margin-top:8px">
        <a id="zohoCreateLink" href="#" target="_blank" rel="noopener" style="background:#333;color:#fff;padding:8px 12px;border-radius:4px;text-decoration:none">Create in Zoho Books</a>
      </div>
      <div style="margin-top:12px">
        <button onclick="window.print()">Print / Save PDF</button>
      </div>
    </body>
    </html>
  `);
  win.document.close();
  win.focus();
}

function saveTemplate(event) {
  event?.preventDefault();
  const template = {
    id: document.getElementById("templateId").value || null,
    title: document.getElementById("templateTitle").value.trim(),
    category: document.getElementById("templateCategory").value.trim(),
    content: document.getElementById("templateContent").value.trim(),
  };
  if (!template.title) { showToast("Template title required","warn"); return }
  upsertTemplate(template);
  templateForm.reset();
  document.getElementById("templateId").value = "";
  renderTemplates();
}

function renderTemplates() {
  templateListEl.innerHTML = "";
  if (!state.templates.length) {
    templateListEl.innerHTML = "<li>No templates yet.</li>";
    return;
  }
  state.templates.forEach((tpl) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${tpl.title}</strong> ${tpl.category ? `· ${tpl.category}` : ""}</div>
      <small>${tpl.content.slice(0, 140)}${tpl.content.length > 140 ? "..." : ""}</small>
      <div class="chip-row">
        <button class="ghost small" data-action="edit">Edit</button>
        <button class="ghost small" data-action="copy">Copy</button>
        <button class="ghost small" data-action="email">Email</button>
        <button class="ghost small" data-action="sms">SMS</button>
      </div>
    `;
    li.querySelector('[data-action="edit"]').addEventListener("click", () => loadTemplateIntoForm(tpl.id));
    li.querySelector('[data-action="copy"]').addEventListener("click", () => copyText(renderTemplate(tpl.content, sampleTemplateContext())));
    li.querySelector('[data-action="email"]').addEventListener("click", () => openEmailWithTemplate(tpl));
    li.querySelector('[data-action="sms"]').addEventListener("click", () => openSmsWithTemplate(tpl));
    templateListEl.appendChild(li);
  });
}

function loadTemplateIntoForm(id) {
  const tpl = state.templates.find((t) => t.id === id);
  if (!tpl) return;
  document.getElementById("templateId").value = tpl.id;
  document.getElementById("templateTitle").value = tpl.title;
  document.getElementById("templateCategory").value = tpl.category || "";
  document.getElementById("templateContent").value = tpl.content || "";
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast("Template copied", "success"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast("Template copied", "success");
  }
}

function openEmailWithTemplate(tpl) {
  const subject = encodeURIComponent(tpl.title || "Parris Tech Services");
  const body = encodeURIComponent(renderTemplate(tpl.content || "", sampleTemplateContext()));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function openSmsWithTemplate(tpl) {
  const body = encodeURIComponent(renderTemplate(tpl.content || "", sampleTemplateContext()));
  window.location.href = `sms:?&body=${body}`;
}

function sampleTemplateContext() {
  const appt = state.appointments[0];
  const client = appt ? state.clients.find((c) => c.id === appt.clientId) : state.clients[0];
  return {
    name: client?.name || "Client",
    datetime: appt ? new Date(appt.datetime).toLocaleString() : new Date().toLocaleString(),
    location: appt?.location || "Onsite",
    summary: "Completed performance and security checkup.",
    next_steps: "Monitor startup time for 3 days; book follow-up if slow.",
  };
}

function saveLink(event) {
  event?.preventDefault();
  const link = {
    id: document.getElementById("linkId").value || null,
    label: document.getElementById("linkLabel").value.trim(),
    url: document.getElementById("linkUrl").value.trim(),
  };
  if (!link.label || !link.url) { showToast("Link label and URL required","warn"); return }
  upsertLink(link);
  linkForm.reset();
  document.getElementById("linkId").value = "";
  renderQuickLinks();
}

function renderQuickLinks() {
  quickLinksEl.innerHTML = "";
  if (!state.quickLinks.length) {
    quickLinksEl.innerHTML = "<span class='muted'>No quick links yet.</span>";
    return;
  }
  state.quickLinks.forEach((link) => {
    const btn = document.createElement("a");
    btn.href = link.url;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.className = "chip";
    btn.textContent = link.label;
    quickLinksEl.appendChild(btn);
  });
}

function loadSettingsForm() {
  document.getElementById("businessName").value = state.settings.businessName || "";
  document.getElementById("businessPhone").value = state.settings.phone || "";
  document.getElementById("businessEmail").value = state.settings.email || "";
  document.getElementById("businessAbn").value = state.settings.abn || "";
  const zohoEl = document.getElementById('zohoBooksUrl');
  const defaultZoho = 'https://books.zoho.com.au/app/7006266190#/invoices/new';
  if (!state.settings.zohoBooksUrl) {
    // prefill and persist a sensible default on first run
    try { setSettings({ zohoBooksUrl: defaultZoho }); state = getState(); } catch (err) { /* ignore */ }
  }
  if (zohoEl) zohoEl.value = state.settings.zohoBooksUrl || '';
  const pricingModel = state.settings.pricingModel || "time-block";
  pricingForm.querySelectorAll('input[name="pricingModel"]').forEach((radio) => {
    radio.checked = radio.value === pricingModel;
  });
  document.getElementById("blockMinutes").value = state.settings.pricing.blockMinutes || 30;
  document.getElementById("blockRate").value = state.settings.pricing.blockRate || 0;
  document.getElementById("hourlyRate").value = state.settings.pricing.hourlyRate || 0;
  document.getElementById("pricingNotes").value = state.settings.pricingNotes || "";
  if (invoiceFooterInput) invoiceFooterInput.value = state.settings.invoiceFooter || "";
  // render invoice presets select
  renderInvoicePresets();
}

function saveSettings(event) {
  event?.preventDefault();
  const model = pricingForm.querySelector('input[name="pricingModel"]:checked')?.value || "time-block";
  const settings = {
    businessName: document.getElementById("businessName").value.trim(),
    phone: document.getElementById("businessPhone").value.trim(),
    email: document.getElementById("businessEmail").value.trim(),
    abn: document.getElementById("businessAbn").value.trim(),
    pricingModel: model,
    pricing: {
      blockMinutes: Number(document.getElementById("blockMinutes").value) || 30,
      blockRate: Number(document.getElementById("blockRate").value) || 0,
      hourlyRate: Number(document.getElementById("hourlyRate").value) || 0,
    },
    pricingNotes: document.getElementById("pricingNotes").value.trim(),
    invoiceFooter: invoiceFooterInput?.value.trim() || "",
    zohoBooksUrl: (document.getElementById('zohoBooksUrl')?.value || '').trim(),
  };
  setSettings(settings);
  state = getState();
  showToast("Settings saved","success");
}

function handleExport() {
  const dataStr = JSON.stringify(exportData(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "parris-tech-services-data.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

// ------- Encrypted export/import (AES-GCM with PBKDF2) -------
function bufToBase64(buffer){
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i=0;i<bytes.length;i+=chunkSize){
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i+chunkSize));
  }
  return btoa(binary);
}
function base64ToBuf(b64){
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i=0;i<len;i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getKeyFromPassword(pass, saltBuffer){
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuffer, iterations: 100000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt','decrypt']
  );
  return key;
}

async function handleEncryptedExport(){
  const pass = prompt('Enter passphrase to encrypt export');
  if (!pass) return;
  try{
    const dataStr = JSON.stringify(exportData());
    const enc = new TextEncoder();
    const plain = enc.encode(dataStr);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKeyFromPassword(pass, salt.buffer);
    const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, plain);
    const payload = { salt: bufToBase64(salt), iv: bufToBase64(iv), data: bufToBase64(ct) };
    const blob = new Blob([JSON.stringify(payload)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `parris-tech-backup-${new Date().toISOString().slice(0,10)}.enc.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('Encrypted export ready', 'success');
  } catch (err){ console.error(err); showToast('Export failed','error'); }
}

function handleEncryptedImport(e){
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev)=>{
    try{
      const text = ev.target.result;
      const payload = JSON.parse(text);
      const pass = prompt('Enter passphrase to decrypt import');
      if (!pass) return;
      const salt = base64ToBuf(payload.salt);
      const iv = new Uint8Array(base64ToBuf(payload.iv));
      const ct = base64ToBuf(payload.data);
      const key = await getKeyFromPassword(pass, salt);
      const plainBuf = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, key, ct);
      const dec = new TextDecoder().decode(plainBuf);
      const parsed = JSON.parse(dec);
      importData(parsed);
      state = getState();
      renderAll();
      showToast('Encrypted import complete', 'success');
    } catch(err){ console.error(err); showToast('Failed to decrypt import - wrong passphrase or invalid file', 'error'); }
    // reset input
    e.target.value = '';
  };
  reader.readAsText(file);
}

function handleImport(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      importData(data);
      state = getState();
      renderAll();
      showToast("Data imported","success");
    } catch (err) {
      console.error(err);
      showToast("Invalid JSON file","warn");
    }
  };
  reader.readAsText(file);
}

function populateClientSelects() {
  const options = ['<option value="">Select client</option>', ...state.clients.map((c) => `<option value="${c.id}">${c.name}</option>`)].join("");
  appointmentClient.innerHTML = options;
  invoiceAppointment.innerHTML = ['<option value="">No appointment</option>', ...state.appointments.map((a) => {
    const client = state.clients.find((c) => c.id === a.clientId);
    return `<option value="${a.id}">${client?.name || "Client"} • ${new Date(a.datetime).toLocaleString()}</option>`;
  })].join("");
}

// ------------------ CSV import & duplicate helpers ------------------
// Robust CSV parser: supports quoted fields, escaped quotes, and newlines inside quoted fields.
function parseCsv(text, delimiter = ','){
  if (!text) return [];
  // remove BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i+1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; continue; }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF
      if (ch === '\r' && next === '\n') { /* skip, handled below */ }
      row.push(cur);
      rows.push(row.map(c=>c.trim()));
      row = [];
      cur = '';
      if (ch === '\r' && next === '\n') i++; // skip LF of CRLF
      continue;
    }
    cur += ch;
  }
  // push last field/row
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row.map(c=>c.trim()));
  }
  // remove any empty trailing rows
  while (rows.length && rows[rows.length-1].length === 1 && rows[rows.length-1][0] === '') rows.pop();
  return rows;
}

function handleClientsCsv(event){
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    const text = e.target.result || '';
    const parsed = parseCsv(text);
    if (!parsed.length) { showToast('Empty CSV', 'warn'); return; }
    const headers = parsed[0];
    // open mapping UI
    showCsvMapping(headers, parsed);
  };
  reader.readAsText(file);
}

function showCsvMapping(headers, parsedRows){
  const modal = document.getElementById('csvMapModal');
  const container = document.getElementById('csvMapContainer');
  container.innerHTML = '';
  const targetFields = [
    {k:'', label:'(skip)'},
    {k:'name', label:'Name'},
    {k:'email', label:'Email'},
    {k:'phone', label:'Phone'},
    {k:'address', label:'Address'},
    {k:'tags', label:'Tags (comma-separated)'},
    {k:'devices', label:'Devices (comma-separated)'},
    {k:'consent', label:'Consent (yes/no)'},
    {k:'concession', label:'Concession (yes/no)'},
    {k:'lastContact', label:'Last contact (ISO/datetime)'},
    {k:'notes', label:'Notes'}
  ];
  headers.forEach((h,idx)=>{
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.alignItems='center'; row.style.marginBottom='6px';
    const label = document.createElement('div'); label.style.minWidth='220px'; label.textContent = h;
    const sel = document.createElement('select'); sel.dataset.col = idx;
    targetFields.forEach(tf=>{ const opt = document.createElement('option'); opt.value = tf.k; opt.textContent = tf.label; sel.appendChild(opt); });
    // attempt sensible defaults
    const low = h.trim().toLowerCase();
    if (['name','fullname','display','title'].includes(low)) sel.value='name';
    if (['email','e-mail'].includes(low)) sel.value='email';
    if (['phone','mobile','tel','phone number'].includes(low)) sel.value='phone';
    if (['address','addr'].includes(low)) sel.value='address';
    if (['tags','labels'].includes(low)) sel.value='tags';
    if (['devices'].includes(low)) sel.value='devices';
    container.appendChild(row);
    row.appendChild(label); row.appendChild(sel);
  });
    // open modal and manage focus/aria
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    const prevActive = document.activeElement?.id || '';
    modal.dataset.prevActive = prevActive;
    const firstSelect = container.querySelector('select'); if (firstSelect) firstSelect.focus();
    const keyHandler = (e)=>{ if (e.key === 'Escape') { onClose(); } };
    modal.addEventListener('keydown', keyHandler);

  const cancel = document.getElementById('csvMapCancel');
  const apply = document.getElementById('csvMapApply');
  const onClose = ()=>{ modal.style.display='none'; container.innerHTML=''; };
  cancel.onclick = ()=>{ onClose(); modal.setAttribute('aria-hidden','true'); if (modal.dataset.prevActive) { const el = document.getElementById(modal.dataset.prevActive); if (el) el.focus(); } };
  apply.onclick = ()=>{
    // build mapping
    const selects = container.querySelectorAll('select');
    const mapping = {};
    selects.forEach(s=>{ const col = Number(s.dataset.col); const val = s.value; if (val) mapping[col]=val; });
    // import rows
    const created = [];
    for (let i=1;i<parsedRows.length;i++){
      const row = parsedRows[i]; if (row.every(c=>c==='')) continue;
      const obj = {};
      Object.keys(mapping).forEach(colIdx=> obj[mapping[colIdx]] = (row[colIdx]||'').trim());
      const bool = v=> ['1','true','yes','y'].includes(String(v||'').trim().toLowerCase());
      const client = {
        id: null,
        name: obj.name || '',
        phone: obj.phone || '',
        email: obj.email || '',
        address: obj.address || '',
        preferredContact: '',
        concession: bool(obj.concession),
        type: '',
        consent: bool(obj.consent),
        lastContact: obj.lastContact || '',
        notes: obj.notes || '',
        tags: obj.tags ? obj.tags.split(/[,;|]/).map(s=>s.trim()).filter(Boolean) : [],
        devices: obj.devices ? obj.devices.split(/[,;|]/).map(s=>s.trim()).filter(Boolean) : [],
      };
      upsertClient(client);
      created.push(client.name || client.email);
    }
    renderAll();
    showToast(`Imported ${created.length} clients`, 'success');
    onClose();
    modal.setAttribute('aria-hidden','true');
    modal.removeEventListener('keydown', keyHandler);
  };
}

function applyPaymentTemplate(type){
  const ref = (document.getElementById('invoiceReference')?.value || uid()).trim();
  const invoiceData = {
    lineItems: collectLineItems(),
    timeBlocks: collectTimeBlocks(),
    travel: Number(document.getElementById('invoiceTravel')?.value) || 0,
    discount: Number(document.getElementById('invoiceDiscount')?.value) || 0,
  };
  const total = calculateInvoiceTotal(invoiceData);
  const amount = total.toFixed(2);
  let url = '';
  if (type === 'stripe') {
    // Placeholder template, replace with your Stripe Checkout/Payment Link
    url = `https://checkout.stripe.com/pay/cs_test_${encodeURIComponent(ref)}`;
  } else if (type === 'paypal') {
    // PayPal.me quick-link template using amount
    url = `https://www.paypal.me/YourBusiness/${encodeURIComponent(amount)}`;
  }
  const input = document.getElementById('invoicePaymentUrl'); if (input) input.value = url;
  showToast(`${type.charAt(0).toUpperCase()+type.slice(1)} template inserted`, 'success');
}

function findDuplicates(){
  // find by email or phone
  const byEmail = {};
  const byPhone = {};
  state.clients.forEach(c=>{
    if (c.email) {
      const key = c.email.trim().toLowerCase();
      byEmail[key] = byEmail[key] || [];
      byEmail[key].push(c.id);
    }
    if (c.phone) {
      const key = c.phone.replace(/\D/g,'');
      if (key) { byPhone[key] = byPhone[key] || []; byPhone[key].push(c.id); }
    }
  });
  const groups = [];
  Object.values(byEmail).forEach(arr=>{ if (arr.length>1) groups.push(arr); });
  Object.values(byPhone).forEach(arr=>{ if (arr.length>1) groups.push(arr); });
  if (!groups.length) { showToast('No duplicate groups found by email or phone','info'); return }
  // render simple merge UI in clientListEl
  const container = document.createElement('div'); container.id='duplicateList';
  container.innerHTML = '<h4>Duplicate groups</h4>';
  groups.forEach((g,idx)=>{
    const div = document.createElement('div');
    const names = g.map(id=> (state.clients.find(c=>c.id===id)?.name || id)).join(' / ');
    div.innerHTML = `<div><strong>Group ${idx+1}:</strong> ${names} <button data-ids='${g.join(',')}' class='ghost small merge-btn'>Merge</button></div>`;
    container.appendChild(div);
  });
  const cancel = document.createElement('button'); cancel.textContent='Close'; cancel.className='ghost small'; cancel.addEventListener('click',()=>{ container.remove(); });
  container.appendChild(cancel);
  clientListEl.prepend(container);
  container.querySelectorAll('.merge-btn').forEach(btn=> btn.addEventListener('click', (ev)=>{
    (async ()=>{
      const ids = ev.currentTarget.dataset.ids.split(',');
      const ok = await showConfirm('Merge this group into a single client?');
      if (!ok) return;
      mergeClients(ids);
      container.remove();
    })();
  }));
}

function mergeClients(ids){
  if (!ids.length) return;
  const primaryId = ids[0];
  const primary = state.clients.find(c=>c.id===primaryId);
  if (!primary) return;
  const rest = ids.slice(1);
  rest.forEach(id=>{
    const other = state.clients.find(c=>c.id===id);
    if (!other) return;
    // merge fields: prefer primary non-empty, otherwise take other
    primary.name = primary.name || other.name || '';
    primary.phone = primary.phone || other.phone || '';
    primary.email = primary.email || other.email || '';
    primary.address = primary.address || other.address || '';
    primary.preferredContact = primary.preferredContact || other.preferredContact || '';
    primary.concession = primary.concession || other.concession;
    primary.notes = [primary.notes||'', other.notes||''].filter(Boolean).join('\n');
    primary.devices = Array.from(new Set([...(primary.devices||[]), ...(other.devices||[])]));
    // remove other
    deleteItem('clients', id);
  });
  upsertClient(primary);
  state = getState();
  renderClients();
  showToast('Merged group — review the primary client record','success');
}

// insert variable into template textarea
function insertTemplateVar(){
  const sel = document.getElementById('templateVarSelect');
  const textarea = document.getElementById('templateContent');
  if (!sel || !textarea) return;
  const val = sel.value;
  const token = `{{${val}}}`;
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const before = textarea.value.slice(0,start);
  const after = textarea.value.slice(end);
  textarea.value = before + token + after;
  textarea.focus();
  textarea.selectionStart = textarea.selectionEnd = start + token.length;
}

function renderTemplate(tpl, ctx){
  return tpl.replace(/{{\s*(\w+)\s*}}/g, (_, key)=> ctx[key] || '');
}

function previewTemplate(){
  const tpl = document.getElementById('templateContent')?.value || '';
  const previewEl = document.getElementById('templatePreview');
  if (!previewEl) return;
  previewEl.textContent = renderTemplate(tpl, sampleTemplateContext());
}

function openExternal(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

// (duplicate template helper block removed)
