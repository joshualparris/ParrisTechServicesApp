// Bundled script to work over file:// without CORS issues. Source modules remain in /modules for editing.
(() => {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const STORAGE_KEY = "parrisTechServicesApp";

  const storage = {
    load(defaultState) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return clone(defaultState);
        const parsed = JSON.parse(raw);
        return { ...clone(defaultState), ...parsed };
      } catch (err) {
        console.error("Failed to load state", err);
        return clone(defaultState);
      }
    },
    save(state) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("Failed to save state", err);
      }
    },
  };

  const utils = {
    uid() {
      if (crypto.randomUUID) return crypto.randomUUID();
      return "id-" + Math.random().toString(36).slice(2, 10);
    },
    formatCurrency(value) {
      const number = Number(value) || 0;
      return `$${number.toFixed(2)}`;
    },
    isToday(dateString) {
      const d = new Date(dateString);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    },
  };

  const baseState = {
    clients: [],
    appointments: [],
    invoices: [],
    templates: [],
    quickLinks: [],
    version: 1,
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
  };

  function normalize(state) {
    const pricing = state.settings?.pricing || {};
    return {
      ...state,
      clients: state.clients || [],
      appointments: state.appointments || [],
      invoices: state.invoices || [],
      templates: state.templates || [],
      quickLinks: state.quickLinks || [],
      settings: {
        ...baseState.settings,
        ...(state.settings || {}),
        pricing: { ...baseState.settings.pricing, ...pricing },
      },
    };
  }

  const sampleData = () => {
    const uid = utils.uid;
    const aliceId = uid();
    const benId = uid();
    const today = new Date();
    const isoDate = (hours) => {
      const d = new Date(today);
      d.setHours(hours, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    };
    const appointments = [
      { id: uid(), clientId: aliceId, datetime: isoDate(15), location: "onsite", duration: 90, status: "booked", notes: "Checkup + storage cleanup" },
      { id: uid(), clientId: benId, datetime: isoDate(18), location: "remote", duration: 60, status: "arrived", notes: "Email security + Wi-Fi review" },
    ];
    const invoices = [
      {
        id: uid(),
        appointmentId: appointments[0].id,
        clientId: aliceId,
        lineItems: [{ id: uid(), description: "Tech checkup service", amount: 120 }],
        timeBlocks: [{ id: uid(), label: "First block", minutes: 90, rate: 80 }],
        travel: 0,
        discount: 10,
        status: "unpaid",
        total: 190,
      },
    ];
    const templates = [
      {
        id: uid(),
        title: "Booking confirmation",
        category: "booking",
        content: "Hi {{name}}, your appointment is booked for {{datetime}}. Location: {{location}}. Reply to confirm or adjust.",
      },
      {
        id: uid(),
        title: "What to expect",
        category: "pre-visit",
        content: "I’ll run a performance and security checkup. Please have your chargers handy and back up anything sensitive.",
      },
    ];
    const quickLinks = [
      { id: uid(), label: "Square site", url: "https://parristechservices.square.site/" },
      { id: uid(), label: "Wix site", url: "https://parristechservices.wixsite.com/parris-tech-services" },
      { id: uid(), label: "About", url: "https://parristechservices.square.site/about" },
      { id: uid(), label: "Book via Calendly", url: "https://calendly.com/parristechservices1/computer-consultation" },
      { id: uid(), label: "Calendly Jan 2026", url: "https://calendly.com/parristechservices1/computer-consultation?month=2026-01" },
      { id: uid(), label: "Email", url: "mailto:parristechservices@gmail.com" },
      { id: uid(), label: "Facebook", url: "https://www.facebook.com/parristechservices/" },
      { id: uid(), label: "LinkedIn", url: "https://au.linkedin.com/in/joshua-parris-b31444260" },
      { id: uid(), label: "ABN lookup", url: "https://abr.business.gov.au/ABN/View?id=19911769423" },
    ];
    return {
      clients: [
        {
          id: aliceId,
          name: "Alice Martin",
          phone: "0457 111 222",
          email: "alice@example.com",
        address: "Bendigo VIC",
        preferredContact: "phone",
        concession: false,
        notes: "Prefers Wednesday afternoons.",
        type: "individual",
        consent: true,
        lastContact: new Date().toISOString().slice(0,16)
      },
      {
        id: benId,
        name: "Ben Carter",
        phone: "0457 333 444",
        email: "ben@example.com",
        address: "Castlemaine VIC",
        preferredContact: "email",
        concession: true,
        notes: "On NDIS, please send follow-up notes.",
        type: "business",
        consent: true,
        lastContact: new Date().toISOString().slice(0,16)
      },
    ],
      appointments,
      invoices,
      templates,
      quickLinks,
      settings: {
        businessName: "Parris Tech Services",
        phone: "0457 633 371",
        email: "parristechservices@gmail.com",
        abn: "19 911 769 423",
        pricingModel: "time-block",
        pricing: { blockMinutes: 30, blockRate: 60, hourlyRate: 90 },
        pricingNotes: "First 30 minutes free for new clients.",
        invoiceFooter: "Payment via bank transfer. ABN 19 911 769 423.",
      },
    };
  };

  const stateApi = (() => {
    let appState = normalize(storage.load(baseState));
    const persist = () => storage.save(appState);

    function calculateInvoiceTotal(invoice) {
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

    function upsertCollectionItem(collection, input) {
      if (input.id) {
        const idx = appState[collection].findIndex((c) => c.id === input.id);
        if (idx >= 0) appState[collection][idx] = { ...appState[collection][idx], ...input };
      } else {
        const newItem = { ...input, id: utils.uid() };
        appState[collection].push(newItem);
        input.id = newItem.id;
      }
      persist();
      return input.id;
    }

    return {
      getState: () => appState,
      resetToDemo: () => {
        appState = normalize(sampleData());
        persist();
        return appState;
      },
      upsertClient: (client) => upsertCollectionItem("clients", client),
      upsertAppointment: (appt) => upsertCollectionItem("appointments", appt),
      upsertTemplate: (tpl) => upsertCollectionItem("templates", tpl),
      upsertLink: (link) => upsertCollectionItem("quickLinks", link),
      upsertInvoice: (input) => {
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
        };
        normalized.total = calculateInvoiceTotal(normalized);
        if (normalized.id) {
          const idx = appState.invoices.findIndex((i) => i.id === normalized.id);
          if (idx >= 0) appState.invoices[idx] = { ...appState.invoices[idx], ...normalized };
        } else {
          normalized.id = utils.uid();
          appState.invoices.push(normalized);
        }
        persist();
        return normalized.id;
      },
      markInvoiceStatus: (id, status) => {
        const invoice = appState.invoices.find((i) => i.id === id);
        if (invoice) {
          invoice.status = status;
          persist();
        }
      },
      deleteItem: (type, id) => {
        if (!Array.isArray(appState[type])) return;
        appState[type] = appState[type].filter((item) => item.id !== id);
        persist();
      },
      setSettings: (settings) => {
        appState.settings = { ...appState.settings, ...settings };
        persist();
      },
      exportData: () => appState,
      importData: (data) => {
        appState = normalize({ ...clone(baseState), ...data });
        persist();
        return appState;
      },
      calculateInvoiceTotal,
    };
  })();

  // UI logic (from app.js)
  let state = stateApi.getState();
  let selectedInvoiceId = null;

  const views = document.querySelectorAll(".view");
  const navButtons = document.querySelectorAll("[data-nav]");

  const todayAppointmentsEl = document.getElementById("todayAppointments");
  const unpaidCountEl = document.getElementById("unpaidCount");
  const analyticsList = document.getElementById("analyticsList");
  const quickExportBtn = document.getElementById("quickExport");
  const bookCalendlyBtn = document.getElementById("bookCalendly");
  const downloadCalendarFeedBtn = document.getElementById("downloadCalendarFeed");

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
  const presetCalloutBtn = document.getElementById("presetCallout");
  const presetFirstVisitBtn = document.getElementById("presetFirstVisit");
  const presetBusinessRateBtn = document.getElementById("presetBusinessRate");
  const presetIndividualRateBtn = document.getElementById("presetIndividualRate");
  const exportDailyWorksheetBtn = document.getElementById("exportDailyWorksheet");
  const exportInvoiceCsvQuickBtn = document.getElementById("exportInvoiceCsvQuick");
  const invoicePaymentMethod = document.getElementById("invoicePaymentMethod");
  const invoicePaymentNotes = document.getElementById("invoicePaymentNotes");

  const templateForm = document.getElementById("templateForm");
  const templateListEl = document.getElementById("templateList");
  const linkForm = document.getElementById("linkForm");
  const quickLinksEl = document.getElementById("quickLinks");

  const pricingForm = document.getElementById("pricingForm");
  const invoiceFooterInput = document.getElementById("invoiceFooter");
  const loadDemoBtn = document.getElementById("loadDemoBtn");
  const exportDataBtn = document.getElementById("exportDataBtn");
  const importDataInput = document.getElementById("importDataInput");
  const importDataInputSettings = document.getElementById("importDataInputSettings");
  const printInvoiceBtn = document.getElementById("printInvoiceBtn");
  const encryptExportBtn = document.getElementById("encryptExportBtn");
  const encryptExportBtnSettings = document.getElementById("encryptExportBtnSettings");
  const seedSelector = document.getElementById("seedSelector");
  const brandPrimaryInput = document.getElementById("brandPrimary");
  const brandAccentInput = document.getElementById("brandAccent");
  const brandLogoInput = document.getElementById("brandLogoInput");
  const brandLogoPreview = document.getElementById("brandLogoPreview");
  const brandLogoHeader = document.getElementById("brandLogoHeader");
  const brandThemeSelect = document.getElementById("brandTheme");
  const defaultLogo = "docs/Logo - Parris Tech Services - Purple Modern Software Company Logo.png";
  const DRAFT_KEY = "parrisTechDrafts";
  const dryRunImportInput = document.getElementById("dryRunImportInput");
  const showCleanupBtn = document.getElementById("showCleanup");
  const cleanupTextEl = document.getElementById("cleanupText");
  const showChangelogBtn = document.getElementById("showChangelog");
  const changelogEntries = document.getElementById("changelogEntries");
  const onboardingModal = document.getElementById("onboardingModal");
  const showOnboardingBtn = document.getElementById("showOnboarding");
  const closeOnboardingBtn = document.getElementById("closeOnboarding");
  const dismissOnboardingChk = document.getElementById("dismissOnboarding");

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initButtons();
    seedInvoiceForm();
    renderAll();
    initShortcuts();
    ingestSessionSummaryFromUrl();
  });

  function initShortcuts(){
    window.addEventListener('keydown', (e)=>{
      const isSave = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
      if (!isSave) return;
      const activeView = Array.from(views).find(v=>v.classList.contains('active'))?.id;
      if (activeView === 'clients') saveClient(e);
      else if (activeView === 'appointments') saveAppointment(e);
      else if (activeView === 'invoices') saveInvoice(e);
      else if (activeView === 'templates') saveTemplate(e);
      e.preventDefault();
      showToast('Saved via shortcut','info');
    });
    window.addEventListener('keydown', (e)=>{
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        clientSearch?.focus();
        e.preventDefault();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '1') { showView('dashboard'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '2') { showView('clients'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '3') { showView('appointments'); }
      if ((e.metaKey || e.ctrlKey) && e.key === '4') { showView('invoices'); }
    });
  }

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

    document.getElementById("saveTemplateBtn").addEventListener("click", saveTemplate);
    document.getElementById("insertVarBtn").addEventListener("click", insertTemplateVar);
    document.getElementById("previewTemplateBtn").addEventListener("click", previewTemplate);
    document.getElementById("saveLinkBtn").addEventListener("click", saveLink);
    if (saveSessionSummaryBtn) saveSessionSummaryBtn.addEventListener("click", saveSessionSummary);
    presetCalloutBtn?.addEventListener("click", ()=>applyPreset('callout'));
    presetFirstVisitBtn?.addEventListener("click", ()=>applyPreset('first'));
    presetBusinessRateBtn?.addEventListener("click", ()=>applyPreset('business'));
    presetIndividualRateBtn?.addEventListener("click", ()=>applyPreset('individual'));
    exportDailyWorksheetBtn?.addEventListener("click", exportDailyWorksheet);
    exportInvoiceCsvQuickBtn?.addEventListener("click", exportInvoiceCsvQuick);
    setupDraftAutosave();

    document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);
    loadDemoBtn.addEventListener("click", () => {
      stateApi.resetToDemo();
      state = stateApi.getState();
      renderAll();
    });
    exportDataBtn.addEventListener("click", handleExport);
    quickExportBtn.addEventListener("click", handleExport);
    bookCalendlyBtn?.addEventListener("click", () => openExternal("https://calendly.com/parristechservices1/computer-consultation"));
    downloadCalendarFeedBtn?.addEventListener("click", downloadCalendarFeed);
    importDataInput?.addEventListener("change", handleImport);
    importDataInputSettings?.addEventListener("change", handleImport);
    encryptExportBtn?.addEventListener("click", handleEncryptedExport);
    encryptExportBtnSettings?.addEventListener("click", handleEncryptedExport);
    dryRunImportInput?.addEventListener("change", handleImportDryRun);
    seedSelector?.addEventListener("change", loadSeed);
    brandPrimaryInput?.addEventListener("change", applyBrand);
    brandAccentInput?.addEventListener("change", applyBrand);
    brandThemeSelect?.addEventListener("change", applyBrand);
    brandLogoInput?.addEventListener("change", handleLogoUpload);
    showCleanupBtn?.addEventListener("click", toggleCleanup);
    showChangelogBtn?.addEventListener("click", renderChangelog);
    showOnboardingBtn?.addEventListener("click", openOnboarding);
    closeOnboardingBtn?.addEventListener("click", closeOnboarding);
    invoiceSearch?.addEventListener("input", renderReconcile);
    invoiceStatusFilter?.addEventListener("change", renderReconcile);
    invoiceDueFrom?.addEventListener("change", renderReconcile);
    invoiceDueTo?.addEventListener("change", renderReconcile);
    exportInvoicesCsvBtn?.addEventListener("click", exportInvoicesCsv);
    bulkMarkPaidBtn?.addEventListener("click", bulkMarkPaid);
    monthFilter?.addEventListener("change", renderReconcile);
    exportMonthlyCsvBtn?.addEventListener("click", exportMonthlyCsv);
    window.addEventListener("load", maybeShowOnboarding);

    invoiceAppointment.addEventListener("change", () => {
      if (invoiceAppointment.value) {
        const appt = state.appointments.find((a) => a.id === invoiceAppointment.value);
        if (appt) {
          const foundClient = state.clients.find((c) => c.id === appt.clientId);
          if (foundClient) document.getElementById("invoiceForm").dataset.clientName = foundClient.name;
        }
      }
      updateInvoiceTotal();
    });
    appointmentClient.addEventListener("change", updateAppointmentChecklistFromClient);

    invoiceForm.addEventListener("input", updateInvoiceTotal);

    printInvoiceBtn.addEventListener("click", () => {
      if (!selectedInvoiceId) return alert("Select an invoice to print from the list.");
      const invoice = state.invoices.find((i) => i.id === selectedInvoiceId);
      if (invoice) openPrintableInvoice(invoice);
    });
  }

  function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openOnboarding(){
    if (onboardingModal) onboardingModal.style.display = 'flex';
  }
  function closeOnboarding(){
    if (onboardingModal) onboardingModal.style.display = 'none';
    if (dismissOnboardingChk?.checked) localStorage.setItem('ptsHideOnboarding','1');
  }
  function maybeShowOnboarding(){
    if (localStorage.getItem('ptsHideOnboarding') === '1') return;
    setTimeout(()=>openOnboarding(), 600);
  }

  function setupDraftAutosave(){
    const drafts = loadDrafts();
    restoreDraft(clientForm, drafts.clients);
    restoreDraft(appointmentForm, drafts.appointments);
    restoreDraft(invoiceForm, drafts.invoices);
    restoreDraft(templateForm, drafts.templates);

    clientForm?.addEventListener('input', ()=> saveDraft('clients', formToObject(clientForm)));
    appointmentForm?.addEventListener('input', ()=> saveDraft('appointments', formToObject(appointmentForm)));
    invoiceForm?.addEventListener('input', ()=> saveDraft('invoices', formToObject(invoiceForm)));
    templateForm?.addEventListener('input', ()=> saveDraft('templates', formToObject(templateForm)));
  }

  function formToObject(form){
    const obj = {};
    form.querySelectorAll('input,textarea,select').forEach(el=>{
      if (el.type === 'checkbox') obj[el.id] = el.checked;
      else obj[el.id] = el.value;
    });
    return obj;
  }

  function restoreDraft(form, draft){
    if (!form || !draft) return;
    form.querySelectorAll('input,textarea,select').forEach(el=>{
      if (draft[el.id] === undefined) return;
      if (el.type === 'checkbox') el.checked = !!draft[el.id];
      else el.value = draft[el.id];
    });
  }

  function loadDrafts(){
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
    } catch { return {}; }
  }

  function saveDraft(key, data){
    try {
      const drafts = loadDrafts();
      drafts[key] = data;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
    } catch {}
  }

  function showView(id) {
    views.forEach((view) => view.classList.toggle("active", view.id === id));
    navButtons.forEach((btn) => btn.classList.toggle("active", btn.getAttribute("data-nav") === id));
  }

  function renderAll() {
    state = stateApi.getState();
    populateClientSelects();
    renderDashboard();
    renderClients();
    renderAppointments();
    renderInvoices();
    renderReconcile();
    renderTemplates();
    renderQuickLinks();
    loadSettingsForm();
  }

  function renderDashboard() {
    todayAppointmentsEl.innerHTML = "";
    const todays = state.appointments.filter((a) => utils.isToday(a.datetime));
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
            <div class="status ${appt.status}">${appt.status.replace("-", " ")}</div>
            <small>${appt.notes || ""}</small>
          `;
          todayAppointmentsEl.appendChild(li);
        });
    }
    const unpaid = state.invoices.filter((i) => i.status === "unpaid").length;
    unpaidCountEl.textContent = unpaid;
    renderAnalytics();
  }

  function renderAnalytics(){
    if (!analyticsList) return;
    const now = new Date();
    const completed = state.appointments.filter(a=>a.status==='completed').length;
    const upcoming = state.appointments.filter(a=> new Date(a.datetime) > now).length;
    const unpaidTotal = state.invoices.filter(i=>i.status==='unpaid').reduce((sum,i)=>sum+(i.total||0),0);
    const avgDuration = state.appointments.length ? Math.round(state.appointments.reduce((s,a)=>s+(Number(a.duration)||0),0)/state.appointments.length) : 0;
    analyticsList.innerHTML = `
      <li><strong>Completed</strong>: ${completed}</li>
      <li><strong>Upcoming</strong>: ${upcoming}</li>
      <li><strong>Unpaid total</strong>: ${utils.formatCurrency(unpaidTotal)}</li>
      <li><strong>Avg duration</strong>: ${avgDuration} mins</li>
    `;
  }

  function exportDailyWorksheet(){
    const todays = state.appointments.filter((a) => utils.isToday(a.datetime));
    const win = window.open("", "_blank");
    const rows = todays.map(appt=>{
      const client = state.clients.find(c=>c.id===appt.clientId);
      return `<tr><td>${client?.name || "Client"}</td><td>${new Date(appt.datetime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td><td>${appt.location}</td><td>${appt.checklist || ''}</td><td>${appt.notes || ''}</td></tr>`;
    }).join("");
    win.document.write(`
      <html><head><title>Daily Worksheet</title><style>body{font-family:Arial;padding:16px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;text-align:left;}</style></head>
      <body><h2>Daily Worksheet</h2>
      <table>
        <thead><tr><th>Client</th><th>Time</th><th>Location</th><th>Checklist</th><th>Notes</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">No appointments today.</td></tr>'}</tbody>
      </table>
      <button onclick="window.print()">Print</button>
      </body></html>
    `);
    win.document.close(); win.focus();
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
      tags: (document.getElementById("clientTags").value || "").split(',').map(t=>t.trim()).filter(Boolean),
    };
    if (!client.name) return showToast("Client name is required","warn");
    stateApi.upsertClient(client);
    clientForm.reset();
    document.getElementById("clientId").value = "";
    renderAll();
    saveDraft('clients', null);
  }

  function renderClients() {
    const term = clientSearch.value.toLowerCase();
    const filtered = state.clients.filter((c) => {
      const matches =
        c.name.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term);
      const concessionPass = !concessionOnly.checked || c.concession;
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
        <div class="help">${client.type || "individual"} ${client.consent ? "• consent" : ""} ${client.lastContact ? `• last contact ${new Date(client.lastContact).toLocaleString()}` : ""}</div>
        <small>${client.notes || ""}</small>
        ${client.tags?.length ? `<div>${client.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>` : ""}
        <div class="chip-row">
          <button class="ghost small" data-action="edit">Edit</button>
          ${client.email ? `<a class="chip small" href="mailto:${client.email}">Email</a>` : ""}
          ${client.phone ? `<a class="chip small" href="tel:${client.phone}">Call</a>` : ""}
        </div>
      `;
      li.querySelector('[data-action="edit"]').addEventListener("click", () => loadClientIntoForm(client.id));
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
    document.getElementById("clientTags").value = (client.tags || []).join(', ');
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
    if (!appointment.clientId) return showToast("Select a client","warn");
    if (!appointment.datetime) return showToast("Select date and time","warn");
    stateApi.upsertAppointment(appointment);
    appointmentForm.reset();
    document.getElementById("appointmentDuration").value = 60;
    document.getElementById("appointmentId").value = "";
    renderAll();
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
        ${appt.checklist ? `<div class="help">Checklist: ${appt.checklist}</div>` : ""}
        <div class="chip-row">
          <button class="ghost small" data-action="arrived">Client arrived</button>
          <button class="ghost small" data-action="launch">Launch Session</button>
          <button class="ghost small" data-action="complete">Session finished</button>
          <button class="ghost small" data-action="edit">Edit</button>
          <button class="ghost small" data-action="export-ics">Export .ics</button>
        ${appt.followUp ? `<button class="ghost small" data-action="remind-email">Email follow-up</button>` : ""}
        ${appt.followUp ? `<button class="ghost small" data-action="remind-sms">SMS follow-up</button>` : ""}
        </div>
    `;
      li.querySelector('[data-action="arrived"]').addEventListener("click", () => {
        appt.status = "arrived";
        stateApi.upsertAppointment(appt);
        renderAppointments();
        renderDashboard();
      });
      li.querySelector('[data-action="complete"]').addEventListener("click", () => {
        appt.status = "completed";
        stateApi.upsertAppointment(appt);
        renderAppointments();
        renderDashboard();
      });
      li.querySelector('[data-action="launch"]').addEventListener("click", () => {
        const clientName = encodeURIComponent(client?.name || "Client");
        const devices = (client?.devices && client.devices.length) ? encodeURIComponent(client.devices.join(',')) : '';
        const apptId = encodeURIComponent(appt.id);
        const url = `../ParrisTechApp/index.html?client=${clientName}${devices?`&devices=${devices}`:''}&appt=${apptId}`;
        appt.status = "arrived";
        stateApi.upsertAppointment(appt);
        renderAppointments();
        renderDashboard();
        window.open(url, '_blank');
      });
      li.querySelector('[data-action="edit"]').addEventListener("click", () => loadAppointmentIntoForm(appt.id));
      li.querySelector('[data-action="export-ics"]').addEventListener("click", () => exportAppointmentIcs(appt));
      if (appt.followUp) {
        li.querySelector('[data-action="remind-email"]').addEventListener("click", ()=>sendFollowUp(appt,'email'));
        li.querySelector('[data-action="remind-sms"]').addEventListener("click", ()=>sendFollowUp(appt,'sms'));
      }
      appointmentListEl.appendChild(li);
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
    appointmentFollowUp.value = appt.followUp || "";
    appointmentRecurring.checked = !!appt.recurring;
    appointmentChecklist.value = appt.checklist || "";
    document.getElementById("appointmentNotes").value = appt.notes || "";
    updateAppointmentChecklistFromClient();
  }

  function exportAppointmentIcs(appt){
    const client = state.clients.find(c=>c.id===appt.clientId) || {};
    const start = new Date(appt.datetime);
    const end = new Date(start.getTime() + (Number(appt.duration||60)*60000));
    function formatDate(d){
      return d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    }
    const uidStr = `appt-${appt.id}@parristech.local`;
    const description = [appt.notes||'', appt.checklist?`Checklist: ${appt.checklist}`:'', appt.followUp?`Follow-up: ${new Date(appt.followUp).toLocaleString()}`:''].filter(Boolean).join('\\n');
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
      `DESCRIPTION:${description}`,
      `LOCATION:${appt.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\\r\\n');
    const blob = new Blob([body], {type: 'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `parristech-appointment-${appt.id}.ics`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast('Appointment .ics exported', 'success');
  }

  function downloadCalendarFeed(){
    const events = state.appointments.map((appt)=>{
      const client = state.clients.find(c=>c.id===appt.clientId) || {};
      const start = new Date(appt.datetime);
      const end = new Date(start.getTime() + (Number(appt.duration||60)*60000));
      const fmt = (d)=> d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const desc = [appt.notes||'', appt.checklist?`Checklist: ${appt.checklist}`:'', appt.followUp?`Follow-up: ${new Date(appt.followUp).toLocaleString()}`:''].filter(Boolean).join('\\n');
      return [
        'BEGIN:VEVENT',
        `UID:feed-${appt.id}@parristech.local`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${client.name ? `${client.name} — ` : ''}Parris Tech Appointment`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${appt.location || ''}`,
        'END:VEVENT'
      ].join('\\r\\n');
    }).join('\\r\\n');
    const body = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ParrisTechServicesApp//EN',events,'END:VCALENDAR'].join('\\r\\n');
    const blob = new Blob([body], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'parristech-calendar.ics';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    showToast('Calendar feed downloaded','success');
  }

  function saveSessionSummary(){
    const apptId = document.getElementById("appointmentId").value || (state.appointments[0]?.id || "");
    if (!apptId) { showToast('No appointment selected','warn'); return; }
    const appt = state.appointments.find(a=>a.id===apptId);
    if (!appt) { showToast('Appointment not found','warn'); return; }
    const summary = (sessionSummaryInput?.value || "").trim();
    if (!summary) { showToast('Nothing to save','warn'); return; }
    appt.notes = [appt.notes||'', `Session summary: ${summary}`].filter(Boolean).join('\\n');
    stateApi.upsertAppointment(appt);
    sessionSummaryInput.value = "";
    renderAppointments();
    showToast('Session summary saved to notes','success');
  }

  function updateAppointmentChecklistFromClient(){
    const clientId = appointmentClient.value;
    if (!clientId) return;
    const client = state.clients.find(c=>c.id===clientId);
    if (!client || !client.devices || !client.devices.length) return;
    const suggestions = [];
    if (client.devices.includes('Windows')) suggestions.push("Windows: startup apps, updates, AV scan, storage clean");
    if (client.devices.includes('Mac')) suggestions.push("Mac: login items, storage optimize, updates, First Aid");
    if (client.devices.includes('iPhone')) suggestions.push("iPhone: iCloud backup, storage, updates, scam education");
    if (client.devices.includes('Android')) suggestions.push("Android: backups/photos, updates, storage clean");
    const existing = appointmentChecklist.value.trim();
    const combined = suggestions.join("\n");
    if (!existing) {
      appointmentChecklist.value = combined;
    } else {
      appointmentChecklist.value = existing + "\n" + combined;
    }
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

  function setTimeBlocks(blocks){
    timeBlocksContainer.innerHTML = "";
    (blocks || []).forEach(block=> addTimeBlockRow(block));
  }

  function setLineItems(items){
    lineItemsContainer.innerHTML = "";
    (items || []).forEach(item=> addLineItemRow(item));
  }

  function applyPreset(type){
    const pricing = state.settings.pricing || {};
    if (type === 'callout') {
      setLineItems([{ description:"Call-out / Travel", amount: 50 }]);
      setTimeBlocks([{ label:"Onsite block", minutes: pricing.blockMinutes || 60, rate: pricing.blockRate || pricing.hourlyRate || 90 }]);
      document.getElementById("invoiceTravel").value = 50;
      document.getElementById("invoiceDiscount").value = 0;
    }
    if (type === 'first') {
      setLineItems([{ description:"Service", amount: 0 }]);
      setTimeBlocks([{ label:"First visit", minutes: pricing.blockMinutes || 60, rate: pricing.blockRate || pricing.hourlyRate || 90 }]);
      document.getElementById("invoiceDiscount").value = 30;
    }
    if (type === 'business') {
      setTimeBlocks([{ label:"Business rate", minutes: pricing.blockMinutes || 60, rate: pricing.blockRate || (pricing.hourlyRate*1.2) || 120 }]);
      document.getElementById("invoiceDiscount").value = 0;
    }
    if (type === 'individual') {
      setTimeBlocks([{ label:"Individual rate", minutes: pricing.blockMinutes || 60, rate: pricing.hourlyRate || pricing.blockRate || 90 }]);
      document.getElementById("invoiceDiscount").value = 0;
    }
    updateInvoiceTotal();
    showToast("Preset applied","info");
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
      return { id: utils.uid(), description: descInput.value.trim(), amount: Number(amountInput.value) || 0 };
    });
  }

  function collectTimeBlocks() {
    return Array.from(timeBlocksContainer.querySelectorAll(".time-block")).map((row) => {
      const [labelInput, minutesInput, rateInput] = row.querySelectorAll("input");
      return {
        id: utils.uid(),
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
      taxIncluded: document.getElementById("invoiceTaxIncluded")?.checked || false,
    };
    invoiceTotalEl.textContent = utils.formatCurrency(stateApi.calculateInvoiceTotal(invoice));
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
      paymentMethod: invoicePaymentMethod?.value || "",
      paymentNotes: invoicePaymentNotes?.value.trim() || "",
      taxIncluded: document.getElementById("invoiceTaxIncluded")?.checked || false,
      status: document.getElementById("invoiceStatus").value,
    };
    if (invoice.lineItems.length === 0 && invoice.timeBlocks.length === 0) return showToast("Add at least one line item or time block","warn");
    const newId = stateApi.upsertInvoice(invoice);
    selectedInvoiceId = newId;
    invoiceForm.reset();
    document.getElementById("invoiceId").value = "";
    seedInvoiceForm();
    renderInvoices();
    renderDashboard();
    saveDraft('invoices', null);
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
      <div><strong>${client?.name || "Invoice"}</strong> · ${utils.formatCurrency(invoice.total)}</div>
      <div>${appointment ? new Date(appointment.datetime).toLocaleString() : "No appointment linked"}</div>
      <div class="help">Due ${invoice.dueDate || "N/A"} ${invoice.reference ? `• Ref ${invoice.reference}` : ""} ${invoice.taxIncluded ? "• Tax incl." : ""} ${invoice.paymentUrl ? `• Pay: ${invoice.paymentUrl}` : ""} ${invoice.paymentMethod ? `• Method: ${invoice.paymentMethod}` : ""}</div>
      ${invoice.paymentNotes ? `<div class="help">Payment notes: ${invoice.paymentNotes}</div>` : ""}
        <div class="status ${invoice.status}">${invoice.status}</div>
        <div class="chip-row">
          <button class="ghost small" data-action="edit">Load</button>
          <button class="ghost small" data-action="mark">${invoice.status === "paid" ? "Mark unpaid" : "Mark paid"}</button>
          <button class="ghost small" data-action="print">Print</button>
        </div>
      `;
      li.querySelector('[data-action="edit"]').addEventListener("click", () => loadInvoiceIntoForm(invoice.id));
      li.querySelector('[data-action="mark"]').addEventListener("click", () => {
        stateApi.markInvoiceStatus(invoice.id, invoice.status === "paid" ? "unpaid" : "paid");
        renderInvoices();
        renderDashboard();
      });
      li.querySelector('[data-action="print"]').addEventListener("click", () => openPrintableInvoice(invoice));
      invoiceListEl.appendChild(li);
    });
  }

  function loadInvoiceIntoForm(id) {
    const invoice = state.invoices.find((i) => i.id === id);
    if (!invoice) return;
    selectedInvoiceId = id;
    document.getElementById("invoiceId").value = invoice.id;
    invoiceAppointment.value = invoice.appointmentId || "";
    document.getElementById("invoiceTravel").value = invoice.travel || 0;
    document.getElementById("invoiceDiscount").value = invoice.discount || 0;
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
    win.document.write(`
      <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .total { font-size: 24px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .muted { color: #555; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <strong>${settings.businessName || "Parris Tech Services"}</strong><br>
            ${settings.phone || ""}<br>
            ${settings.email || ""}${settings.abn ? `<br>ABN: ${settings.abn}` : ""}
          </div>
          <div>
            <div class="total">Total: ${utils.formatCurrency(invoice.total)}</div>
            <div class="muted">${invoice.status.toUpperCase()}</div>
            ${invoice.dueDate ? `<div class="muted">Due: ${invoice.dueDate}</div>` : ""}
            ${invoice.reference ? `<div class="muted">Ref: ${invoice.reference}</div>` : ""}
            ${invoice.taxIncluded ? `<div class="muted">Tax included (GST)</div>` : ""}
          </div>
        </div>
        <div>
          <strong>Bill to:</strong><br>
          ${client?.name || "Client"}<br>
          ${client?.email || ""} ${client?.phone || ""}
        </div>
        <h3>Line items</h3>
        <table>
          <thead><tr><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            ${(invoice.lineItems || [])
              .map((item) => `<tr><td>${item.description}</td><td>${utils.formatCurrency(item.amount)}</td></tr>`)
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
                  `<tr><td>${block.label}</td><td>${block.minutes}</td><td>${utils.formatCurrency(block.rate)}</td></tr>`
              )
              .join("")}
          </tbody>
      </table>
      <p>Travel/Call-out: ${utils.formatCurrency(invoice.travel || 0)}<br>
      Discount: ${utils.formatCurrency(invoice.discount || 0)}</p>
      ${state.settings.invoiceFooter ? `<p>${state.settings.invoiceFooter}</p>` : ""}
      <button onclick="window.print()">Print</button>
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
    if (!template.title) return alert("Template title required");
    stateApi.upsertTemplate(template);
    templateForm.reset();
    document.getElementById("templateId").value = "";
    renderTemplates();
    saveDraft('templates', null);
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

  // ------------------ Template helpers ------------------
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
    const ctx = { name: 'Kate Staley', datetime: new Date().toLocaleString(), location: 'Onsite' };
    previewEl.textContent = renderTemplate(tpl, ctx);
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

  function sendFollowUp(appt, mode){
    const client = state.clients.find(c=>c.id===appt.clientId);
    const ctx = {
      name: client?.name || "",
      datetime: new Date(appt.datetime).toLocaleString(),
      location: appt.location || "",
      summary: "Completed visit; notes attached.",
      next_steps: "Book a follow-up if issues persist.",
    };
    const content = renderTemplate("Hi {{name}}, just following up after our session on {{datetime}}. {{summary}} Next steps: {{next_steps}}", ctx);
    if (mode === 'email') {
      window.location.href = `mailto:${client?.email||''}?subject=Follow-up from Parris Tech Services&body=${encodeURIComponent(content)}`;
    } else {
      window.location.href = `sms:${client?.phone||''}?&body=${encodeURIComponent(content)}`;
    }
  }

  function saveLink(event) {
    event?.preventDefault();
    const link = {
      id: document.getElementById("linkId").value || null,
      label: document.getElementById("linkLabel").value.trim(),
      url: document.getElementById("linkUrl").value.trim(),
    };
    if (!link.label || !link.url) return alert("Link label and URL required");
    stateApi.upsertLink(link);
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

  // ------------------ Finance / Reconcile ------------------
  function renderReconcile(){
    if (!reconcileList) return;
    const filtered = getFilteredInvoices();
    reconcileList.innerHTML = "";
    if (!filtered.length) {
      reconcileList.innerHTML = "<li>No invoices match filters.</li>";
    } else {
      filtered.forEach(inv=>{
        const client = state.clients.find(c=>c.id===inv.clientId);
        const dueText = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A";
        const li = document.createElement('li');
        li.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
            <div>
              <input type="checkbox" class="reconcile-check" data-id="${inv.id}">
              <strong>${client?.name || "Invoice"}</strong> · ${utils.formatCurrency(inv.total)} · ${inv.status}
              <div class="help">Ref ${inv.reference || "—"} · Due ${dueText}</div>
            </div>
            <button class="ghost small" data-action="pay">Mark paid</button>
          </div>
        `;
        li.querySelector('[data-action="pay"]').addEventListener('click', ()=>{
          stateApi.markInvoiceStatus(inv.id, 'paid');
          renderInvoices();
          renderReconcile();
          renderDashboard();
        });
        reconcileList.appendChild(li);
      });
    }
    renderFinanceSummary(filtered);
  }

  function getFilteredInvoices(){
    const q = (invoiceSearch?.value || "").toLowerCase();
    const status = invoiceStatusFilter?.value || "";
    const from = invoiceDueFrom?.value ? new Date(invoiceDueFrom.value) : null;
    const to = invoiceDueTo?.value ? new Date(invoiceDueTo.value) : null;
    const monthVal = monthFilter?.value;
    const monthStart = monthVal ? new Date(`${monthVal}-01T00:00:00`) : null;
    const monthEnd = monthVal ? new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999) : null;
    return state.invoices.filter(inv=>{
      const client = state.clients.find(c=>c.id===inv.clientId);
      const hay = [(client?.name||""), (inv.reference||""), inv.status||""].join(" ").toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (status && inv.status !== status) return false;
      if (from && inv.dueDate && new Date(inv.dueDate) < from) return false;
      if (to && inv.dueDate && new Date(inv.dueDate) > to) return false;
      if (monthStart && inv.dueDate){
        const d = new Date(inv.dueDate);
        if (d < monthStart || d > monthEnd) return false;
      }
      return true;
    });
  }

  function bulkMarkPaid(){
    const checks = reconcileList?.querySelectorAll('.reconcile-check:checked') || [];
    checks.forEach(cb=> stateApi.markInvoiceStatus(cb.dataset.id, 'paid'));
    renderInvoices();
    renderReconcile();
    renderDashboard();
  }

  function exportInvoicesCsv(){
    const rows = [["Client","Status","Reference","Due Date","Total"]];
    getFilteredInvoices().forEach(inv=>{
      const client = state.clients.find(c=>c.id===inv.clientId);
      rows.push([client?.name||"", inv.status, inv.reference||"", inv.dueDate||"", inv.total||0]);
    });
    downloadCsv(rows, 'invoices.csv');
  }

  function exportInvoiceCsvQuick(){
    const rows = [["Client","Status","Reference","Due Date","Total"]];
    state.invoices.forEach(inv=>{
      const client = state.clients.find(c=>c.id===inv.clientId);
      rows.push([client?.name||"", inv.status, inv.reference||"", inv.dueDate||"", inv.total||0]);
    });
    downloadCsv(rows, 'invoices_all.csv');
  }

  function downloadCsv(rows, filename){
    const csv = rows.map(r=>r.map(val=>`"${String(val).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    showToast('CSV exported','success');
  }

  function renderFinanceSummary(filtered){
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const mtd = filtered.filter(inv=> inv.status==='paid' && inv.dueDate && new Date(inv.dueDate)>=startMonth)
      .reduce((s,inv)=>s+(inv.total||0),0);
    const overdue = filtered.filter(inv=> inv.status==='unpaid' && inv.dueDate && new Date(inv.dueDate) < now);
    const nextDue = filtered.filter(inv=>{
      if (inv.status !== 'unpaid' || !inv.dueDate) return false;
      const d=new Date(inv.dueDate);
      return d>=now && d<= new Date(now.getTime()+7*86400000);
    });
    const aging = { b0:0, b1:0, b2:0 };
    filtered.forEach(inv=>{
      if (inv.status !== 'unpaid' || !inv.dueDate) return;
      const days = Math.floor((now - new Date(inv.dueDate))/(86400000));
      if (days < 0) return;
      if (days <= 30) aging.b0 += (inv.total || 0);
      else if (days <= 60) aging.b1 += (inv.total || 0);
      else aging.b2 += (inv.total || 0);
    });
    if (mtdRevenueEl) mtdRevenueEl.textContent = utils.formatCurrency(mtd);
    if (overdueCountEl) overdueCountEl.textContent = overdue.length;
    if (overdueTotalEl) overdueTotalEl.textContent = utils.formatCurrency(overdue.reduce((s,inv)=>s+(inv.total||0),0));
    if (nextDueCountEl) nextDueCountEl.textContent = nextDue.length;
    if (agingSummaryEl) agingSummaryEl.textContent = [aging.b0, aging.b1, aging.b2].map(v=>utils.formatCurrency(v)).join(" / ");
  }

  function exportMonthlyCsv(){
    const monthVal = monthFilter?.value;
    if (!monthVal) { showToast("Select a month","warn"); return; }
    const [year, month] = monthVal.split('-').map(Number);
    const rows = [["Client","Status","Reference","Due Date","Total"]];
    state.invoices.forEach(inv=>{
      if (!inv.dueDate) return;
      const d = new Date(inv.dueDate);
      if (d.getFullYear() === year && d.getMonth()+1 === month){
        const client = state.clients.find(c=>c.id===inv.clientId);
        rows.push([client?.name||"", inv.status, inv.reference||"", inv.dueDate, inv.total||0]);
      }
    });
    downloadCsv(rows, `invoices-${monthVal}.csv`);
  }

  function loadSettingsForm() {
    document.getElementById("businessName").value = state.settings.businessName || "";
    document.getElementById("businessPhone").value = state.settings.phone || "";
    document.getElementById("businessEmail").value = state.settings.email || "";
    document.getElementById("businessAbn").value = state.settings.abn || "";
    const pricingModel = state.settings.pricingModel || "time-block";
    pricingForm.querySelectorAll('input[name="pricingModel"]').forEach((radio) => {
      radio.checked = radio.value === pricingModel;
    });
    document.getElementById("blockMinutes").value = state.settings.pricing.blockMinutes || 30;
    document.getElementById("blockRate").value = state.settings.pricing.blockRate || 0;
    document.getElementById("hourlyRate").value = state.settings.pricing.hourlyRate || 0;
    document.getElementById("pricingNotes").value = state.settings.pricingNotes || "";
    if (invoiceFooterInput) invoiceFooterInput.value = state.settings.invoiceFooter || "";
    if (brandPrimaryInput) brandPrimaryInput.value = state.settings.brand?.primary || brandPrimaryInput.value;
    if (brandAccentInput) brandAccentInput.value = state.settings.brand?.accent || brandAccentInput.value;
    if (brandThemeSelect) brandThemeSelect.value = state.settings.brand?.theme || "default";
    if (state.settings.brand?.logoDataUrl && brandLogoPreview) {
      brandLogoPreview.src = state.settings.brand.logoDataUrl;
      brandLogoPreview.style.display = 'block';
    }
    applyBrand();
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
      brand: {
        primary: brandPrimaryInput?.value || "#38bdf8",
        accent: brandAccentInput?.value || "#a855f7",
        logoDataUrl: state.settings.brand?.logoDataUrl || "",
        theme: brandThemeSelect?.value || "default",
      },
    };
    stateApi.setSettings(settings);
    state = stateApi.getState();
    applyBrand();
    alert("Settings saved");
  }

  function handleExport() {
    const dataStr = JSON.stringify(stateApi.exportData(), null, 2);
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

  function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const raw = e.target.result;
        const data = JSON.parse(raw);
        if (data?.salt && data?.iv && data?.data) {
          const pass = prompt("Enter passphrase to decrypt:");
          if (!pass) return;
          const decrypted = await decryptPayload(data, pass);
          const valid = validateImportedData(decrypted);
          if (!valid) throw new Error("Invalid data shape");
          stateApi.importData(decrypted);
        } else {
          if (data.version && data.version !== (state.version || 1)) {
            const proceed = confirm(`Version mismatch (file v${data.version}, app v${state.version||1}). Import anyway?`);
            if (!proceed) return;
          }
          const valid = validateImportedData(data);
          if (!valid) throw new Error("Invalid data shape");
          stateApi.importData(data);
        }
        state = stateApi.getState();
        renderAll();
        showToast("Data imported","success");
      } catch (err) {
        console.error(err);
        showToast("Invalid or encrypted JSON","warn");
      }
    };
    reader.readAsText(file);
  }

  function handleImportDryRun(event){
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e)=>{
      try{
        const raw = e.target.result;
        const data = JSON.parse(raw);
        let payload = data;
        if (data?.salt && data?.iv && data?.data) {
          const pass = prompt("Enter passphrase to decrypt (dry run):");
          if (!pass) return;
          payload = await decryptPayload(data, pass);
        }
        const valid = validateImportedData(payload);
        showToast(valid ? "Dry run OK: data shape valid" : "Dry run failed: invalid data shape", valid ? "success" : "warn");
      } catch(err){
        console.error(err);
        showToast("Dry run failed: invalid or encrypted file","warn");
      }
    };
    reader.readAsText(file);
  }

  async function handleEncryptedExport() {
    const passphrase = prompt("Enter a passphrase to encrypt export:");
    if (!passphrase) return;
    try {
      const data = JSON.stringify(stateApi.exportData());
      const enc = new TextEncoder();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(data));
      const payload = {
        v: state.version || 1,
        salt: Array.from(new Uint8Array(salt)),
        iv: Array.from(new Uint8Array(iv)),
        data: Array.from(new Uint8Array(encrypted)),
      };
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parris-tech-services-data.encrypted.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("Encrypted export created", "success");
    } catch (err) {
      console.error(err);
      showToast("Encrypted export failed", "warn");
    }
  }

  async function decryptPayload(payload, passphrase){
    const enc = new TextEncoder();
    const salt = new Uint8Array(payload.salt);
    const iv = new Uint8Array(payload.iv);
    const data = new Uint8Array(payload.data);
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(new Uint8Array(decrypted)));
  }

  function validateImportedData(data){
    if (typeof data !== 'object' || data === null) return false;
    const okArr = (arr) => Array.isArray(arr);
    if (!okArr(data.clients) || !okArr(data.appointments) || !okArr(data.invoices) || !okArr(data.templates)) return false;
    return true;
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
  function handleClientsCsv(event){
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      const text = e.target.result;
      const rows = text.split(/\r?\n/).map(r=>r.trim()).filter(Boolean);
      if (!rows.length) { showToast('Empty CSV', 'warn'); return; }
      const headers = rows[0].split(',').map(h=>h.trim().toLowerCase());
      const created = [];
      for (let i=1;i<rows.length;i++){
        const cols = rows[i].split(',');
        const obj = {};
        headers.forEach((h,idx)=> obj[h]= (cols[idx]||'').trim());
        const client = {
          id: null,
          name: obj.name || obj.fullname || obj.display || obj.title || '',
          phone: obj.phone || obj.mobile || '',
          email: obj.email || '',
          address: obj.address || '',
          preferredContact: obj.preferredcontact || '',
        concession: (obj.concession||'').toLowerCase() === 'true',
        type: obj.type || obj.clienttype || '',
        consent: (obj.consent||'').toLowerCase() === 'true',
        lastContact: obj.lastcontact || '',
        notes: obj.notes || '',
        tags: obj.tags ? obj.tags.split(';').map(s=>s.trim()).filter(Boolean) : [],
        devices: obj.devices ? obj.devices.split(';').map(s=>s.trim()).filter(Boolean) : []
      };
        stateApi.upsertClient(client);
        created.push(client.name || client.email);
      }
      renderAll();
      showToast(`Imported ${created.length} clients`, 'success');
    };
    reader.readAsText(file);
  }

  function findDuplicates(){
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
      const ids = ev.currentTarget.dataset.ids.split(',');
      const ok = confirm('Merge this group into a single client?');
      if (!ok) return;
      mergeClients(ids);
      container.remove();
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
      primary.name = primary.name || other.name || '';
      primary.phone = primary.phone || other.phone || '';
      primary.email = primary.email || other.email || '';
      primary.address = primary.address || other.address || '';
      primary.preferredContact = primary.preferredContact || other.preferredContact || '';
      primary.concession = primary.concession || other.concession;
      primary.notes = [primary.notes||'', other.notes||''].filter(Boolean).join('\\n');
      primary.devices = Array.from(new Set([...(primary.devices||[]), ...(other.devices||[])]));
      primary.type = primary.type || other.type || '';
      primary.consent = primary.consent || other.consent;
      primary.lastContact = primary.lastContact || other.lastContact || '';
      stateApi.deleteItem('clients', id);
    });
    stateApi.upsertClient(primary);
    state = stateApi.getState();
    renderClients();
    showToast('Merged group — review the primary client record','success');
  }

  function applyBrand() {
    const root = document.documentElement;
    const themeKey = state.settings.brand?.theme || "default";
    const themeMap = {
      default: { primary:"#38bdf8", accent:"#a855f7", bg:"#0f172a", panel:"#111827", card:"#0b1222", border:"#1f2937" },
      irish: { primary:"#0ea5e9", accent:"#22c55e", bg:"#0b1a12", panel:"#0f261a", card:"#0c1f15", border:"#123021" },
      aussie: { primary:"#22c55e", accent:"#f59e0b", bg:"#0c1c0c", panel:"#0f2510", card:"#0c1d0d", border:"#16321b" },
      halloween: { primary:"#f97316", accent:"#7c3aed", bg:"#0f0c1a", panel:"#151026", card:"#100c1d", border:"#241a3a" },
      christmas: { primary:"#ef4444", accent:"#22c55e", bg:"#0f1712", panel:"#132019", card:"#101a14", border:"#1f2f25" },
    };
    const theme = themeMap[themeKey] || themeMap.default;
    const primary = brandPrimaryInput?.value || theme.primary;
    const accent = brandAccentInput?.value || theme.accent;
    root.style.setProperty('--accent', primary);
    root.style.setProperty('--accent-2', accent);
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--panel', theme.panel);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--border', theme.border);
    root.style.background = `radial-gradient(circle at 20% 20%, ${primary}22, transparent 25%), radial-gradient(circle at 80% 0%, ${accent}22, transparent 25%), ${theme.bg}`;
    document.body.style.background = "transparent";
    const logoSrc = state.settings.brand?.logoDataUrl || defaultLogo;
    if (brandLogoPreview) {
      brandLogoPreview.src = logoSrc;
      brandLogoPreview.style.display = 'block';
    }
    if (brandLogoHeader) {
      brandLogoHeader.src = logoSrc;
    }
  }

  function handleLogoUpload(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      const dataUrl = ev.target.result;
      if (brandLogoPreview) {
        brandLogoPreview.src = dataUrl;
        brandLogoPreview.style.display = 'block';
      }
      if (brandLogoHeader) brandLogoHeader.src = dataUrl;
      state.settings.brand = state.settings.brand || {};
      state.settings.brand.logoDataUrl = dataUrl;
      stateApi.setSettings(state.settings);
      showToast('Logo saved', 'success');
    };
    reader.readAsDataURL(file);
  }

  function loadSeed(){
    const val = seedSelector?.value || "default";
    stateApi.resetToDemo();
    if (val === "individual") {
      state.settings.pricingModel = "hourly";
      state.settings.pricing.hourlyRate = 75;
    }
    if (val === "business") {
      state.settings.pricingModel = "time-block";
      state.settings.pricing.blockMinutes = 60;
      state.settings.pricing.blockRate = 100;
    }
    stateApi.setSettings(state.settings);
    state = stateApi.getState();
    renderAll();
    showToast(`Loaded ${val} seed`, 'info');
  }

  function toggleCleanup(){
    if (!cleanupTextEl) return;
    cleanupTextEl.style.display = cleanupTextEl.style.display === 'block' ? 'none' : 'block';
    if (cleanupTextEl.textContent.trim()) return;
    cleanupTextEl.textContent = `Windows — Safe Cleanup
Pre-checks: confirm backup exists; create System Restore point; get consent.
Startup Apps: Task Manager → Startup; disable nonessential.
Uninstall: Settings → Apps; remove large/unused apps.
Disk Cleanup/Storage Sense: remove temp files.
Browser extensions: remove unknown/unused.
Malware scan: Windows Defender full scan.
Update Windows & drivers; check disk health (chkdsk/SSD tool).
Clear Downloads/large files; check OneDrive sync/duplicates.
Adjust visual effects; clear temp caches; reboot and verify.

macOS — Safe Cleanup
Pre-checks: confirm Time Machine/backup; consent.
Login Items: System Settings → General → Login Items; remove nonessential.
Storage: About This Mac → Storage → Manage; enable recommendations.
Uninstall unused apps; review iCloud Drive/Photos settings.
Browser cleanup; malware scan (Malwarebytes if available).
Update macOS and apps; Disk Utility First Aid.
Review Activity Monitor; manage Time Machine snapshots if disk tight.
Reboot and verify; recommend backups/password manager/2FA.`;
  }

  function renderChangelog(){
    if (!changelogEntries) return;
    changelogEntries.innerHTML = "";
    const entries = [
      "Added appointment follow-up, recurring flag, and device checklist.",
      "Templates: copy/email/SMS with variables and preview.",
      "Encrypted export option and brand color/logo settings.",
      "Duplicate finder and CSV import for clients.",
      "URL ingest: session summary + device-based checklist suggestions.",
      "Inline validation, shortcuts, sticky headers, onboarding tips, themes.",
      "Dashboard/Contact links now include JoshHub.",
    ];
    entries.forEach((txt)=> {
      const li = document.createElement('div');
      li.textContent = txt;
      changelogEntries.appendChild(li);
    });
  }

  function ingestSessionSummaryFromUrl(){
    const params = new URLSearchParams(window.location.search);
    const summary = params.get('sessionSummary');
    const apptId = params.get('appt');
    if (!summary || !apptId) return;
    const appt = state.appointments.find(a=>a.id===apptId);
    if (!appt) return;
    appt.notes = [appt.notes||'', `Session summary: ${decodeURIComponent(summary)}`].filter(Boolean).join('\\n');
    stateApi.upsertAppointment(appt);
    renderAppointments();
    renderDashboard();
    showToast('Session summary imported from ParrisTechApp','success');
  }
})(); 
  const reconcileList = document.getElementById("reconcileList");
  const invoiceSearch = document.getElementById("invoiceSearch");
  const invoiceStatusFilter = document.getElementById("invoiceStatusFilter");
  const invoiceDueFrom = document.getElementById("invoiceDueFrom");
  const invoiceDueTo = document.getElementById("invoiceDueTo");
const exportInvoicesCsvBtn = document.getElementById("exportInvoicesCsv");
const bulkMarkPaidBtn = document.getElementById("bulkMarkPaid");
const mtdRevenueEl = document.getElementById("mtdRevenue");
const overdueCountEl = document.getElementById("overdueCount");
const overdueTotalEl = document.getElementById("overdueTotal");
const nextDueCountEl = document.getElementById("nextDueCount");
const monthFilter = document.getElementById("monthFilter");
const exportMonthlyCsvBtn = document.getElementById("exportMonthlyCsv");
const agingSummaryEl = document.getElementById("agingSummary");
