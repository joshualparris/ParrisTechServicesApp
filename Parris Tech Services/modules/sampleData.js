import { uid } from "./utils.js";

export function getDemoData() {
  const aliceId = uid();
  const benId = uid();
  const today = new Date();
  const isoDate = (hours) => {
    const d = new Date(today);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const appointments = [
    {
      id: uid(),
      clientId: aliceId,
      datetime: isoDate(15),
      location: "onsite",
      duration: 90,
      status: "booked",
      notes: "Checkup + storage cleanup",
    },
    {
      id: uid(),
      clientId: benId,
      datetime: isoDate(18),
      location: "remote",
      duration: 60,
      status: "arrived",
      notes: "Email security + Wi-Fi review",
    },
  ];

  const invoices = [
    {
      id: uid(),
      appointmentId: appointments[0].id,
      clientId: aliceId,
      lineItems: [
        { id: uid(), description: "Tech checkup service", amount: 120 },
      ],
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
      content:
        "Hi {{name}}, your appointment is booked for {{datetime}}. Location: {{location}}. Reply to confirm or adjust.",
    },
    {
      id: uid(),
      title: "What to expect",
      category: "pre-visit",
      content:
        "I’ll run a performance and security checkup. Please have your chargers handy and back up anything sensitive.",
    },
    {
      id: uid(),
      title: "Follow-up email",
      category: "follow-up",
      content:
        "Hi {{name}}, thanks for today. Summary: {{summary}}. Next steps: {{next_steps}}. If anything feels off, reply or call 0457 633 371.",
    },
    {
      id: uid(),
      title: "Privacy & consent",
      category: "consent",
      content:
        "I will handle your devices and data with care. I’ll only make changes you agree to and will request consent before deleting files or adjusting security settings.",
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
      brand: { primary: "#38bdf8", accent: "#a855f7", logoDataUrl: "" },
    },
    version: 1,
  };
}
