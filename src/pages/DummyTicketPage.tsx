import React, { useState } from 'react';
import { 
  Plane, 
  Hotel, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Send,
  Download,
  Sparkles,
  Gift,
  Check
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { FreeLeadMagnetBar } from '../components/FreeLeadMagnetBar';
import { AdSenseBanner } from '../components/AdSenseBanner';

interface DummyTicketPageProps {
  onNavigate?: (path: string) => void;
}

export const DummyTicketPage: React.FC<DummyTicketPageProps> = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    passportNumber: '',
    email: '',
    whatsapp: '',
    fromCity: '',
    toCity: '',
    travelDate: '',
    returnDate: '',
    packageType: 'combo'
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleDownloadSamplePdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(11, 42, 91); // #0B2A5B
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('OFFICIAL FLIGHT & HOTEL RESERVATION (SAMPLE)', 105, 14, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('FOR EMBASSY VISA APPLICATION PURPOSE ONLY • NOT A VALID BOARDING PASS', 105, 22, { align: 'center' });

      // Body Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PASSENGER & BOOKING RECORD (GDS ITINERARY)', 15, 42);

      // Box 1: Booking Details
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 46, 180, 26, 3, 3, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PASSENGER NAME:', 20, 54);
      doc.text('AIRLINE PNR:', 110, 54);
      doc.text('E-TICKET STATUS:', 20, 64);
      doc.text('ISSUE DATE:', 110, 64);

      doc.setFont('helvetica', 'normal');
      doc.text('SHARMA / RAHUL MR (SAMPLE)', 60, 54);
      doc.text('VA-7X89Q2 (VERIFIED)', 145, 54);
      doc.text('CONFIRMED RESERVATION (UN-TICKETED)', 60, 64);
      doc.text(new Date().toLocaleDateString('en-GB'), 145, 64);

      // Flight Details Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('FLIGHT SEGMENTS (ROUNDTRIP ITINERARY)', 15, 82);

      // Segment 1: Outbound
      doc.setFillColor(238, 242, 255);
      doc.roundedRect(15, 86, 180, 30, 2, 2, 'FD');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('OUTBOUND: New Delhi (DEL)  -->  Paris Charles de Gaulle (CDG)', 20, 93);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Flight: AF-225 • Air France Boeing 777-300ER • Economy (Class V)', 20, 99);
      doc.text('Departure: Indira Gandhi Intl (DEL) Terminal 3 • 01:45 AM • Non-stop', 20, 105);
      doc.text('Arrival: Paris CDG Terminal 2E • 07:10 AM (Same Day) • Baggage: 23kg', 20, 111);

      // Segment 2: Inbound
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 120, 180, 30, 2, 2, 'FD');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('INBOUND: Paris Charles de Gaulle (CDG)  -->  New Delhi (DEL)', 20, 127);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Flight: AF-226 • Air France Boeing 777-300ER • Economy (Class V)', 20, 133);
      doc.text('Departure: Paris CDG Terminal 2E • 10:25 AM • Non-stop', 20, 139);
      doc.text('Arrival: Indira Gandhi Intl (DEL) Terminal 3 • 22:50 PM • Baggage: 23kg', 20, 145);

      // Hotel Voucher Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('HOTEL ACCOMMODATION CONFIRMATION VOUCHER', 15, 162);

      doc.setFillColor(254, 243, 199);
      doc.roundedRect(15, 166, 180, 34, 2, 2, 'FD');
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPERTY: Novotel Paris Centre Tour Eiffel (4-Star Hotel)', 20, 173);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('Address: 61 Quai de Grenelle, 75015 Paris, France • Phone: +33 1 40 58 20 00', 20, 179);
      doc.text('Booking Ref: HT-PAR-8924011 • Room: Superior Double Room (Free WiFi, Breakfast)', 20, 185);
      doc.text('Check-In: 14:00 hrs • Check-Out: 11:00 hrs • Status: Guaranteed for Visa Inspection', 20, 191);
      doc.text('Cancellation Policy: Free cancellation permitted up to 48 hours prior to arrival.', 20, 197);

      // Mandatory Legal Notice
      doc.setDrawColor(239, 68, 68);
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(15, 210, 180, 28, 2, 2, 'FD');
      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('MANDATORY EMBASSY SUBMISSION NOTICE & TRAVEL DISCLAIMER:', 20, 217);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text('1. This document is an un-ticketed reservation generated to fulfill consular visa application rules.', 20, 223);
      doc.text('2. Embassies (VFS/BLS) explicitly instruct applicants NOT to buy non-refundable tickets prior to visa grant.', 20, 228);
      doc.text('3. DO NOT attempt to board any flight or check into the hotel with this sample reservation.', 20, 233);

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('Generated by VisaApply.org • World\'s Largest Free Visa Portal (249 Countries)', 105, 252, { align: 'center' });

      doc.save('VisaApply_Sample_Dummy_Ticket_Reservation.pdf');
    } catch (err) {
      alert('Unable to generate sample PDF. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.whatsapp) {
      alert('Please fill in your Name and WhatsApp number.');
      return;
    }

    try {
      const existingLeads = JSON.parse(localStorage.getItem('visaapply_dummy_ticket_leads') || '[]');
      existingLeads.push({
        ...formData,
        isFreePromo: true,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem('visaapply_dummy_ticket_leads', JSON.stringify(existingLeads));
    } catch {
      // Local storage fallback
    }

    setSubmitted(true);
  };

  const faqs = [
    {
      q: "What is a dummy ticket for a visa application?",
      a: "A dummy ticket is an authentic, temporary flight and/or hotel reservation with a verifiable PNR (Passenger Name Record) or Booking Reference ID generated through legitimate airline Global Distribution Systems (GDS). It demonstrates your intended itinerary to consular officers without requiring you to purchase an expensive non-refundable airline ticket before your visa is approved."
    },
    {
      q: "Is a dummy ticket acceptable for Schengen, US, UK, and Canada embassies?",
      a: "Yes. Embassies and consulates worldwide (including VFS Global, BLS International, and TLScontact) explicitly advise applicants in their official checklists NOT to purchase non-refundable flight tickets prior to visa grant. They specifically ask for a 'Flight Itinerary' or 'Roundtrip Reservation', which is exactly what this service provides."
    },
    {
      q: "How long does the PNR and reservation remain valid?",
      a: "Our reservations remain active and verifiable on airline/hotel verification portals for 7 to 14 days, providing ample time for the embassy or visa processing center to review your application documents."
    },
    {
      q: "Can I travel on a dummy ticket?",
      a: "NO. A dummy ticket is strictly an itinerary reservation document for visa and consular inspection. It is NOT a confirmed passenger boarding ticket and cannot be used to board an aircraft or check into a hotel. Once your visa is granted, you must book real, ticketed travel."
    },
    {
      q: "Is this service really 100% free?",
      a: "Yes! You can instantly download the Free Sample PDF and Visa Checklist above. If you want our reservation desk to generate a customized PNR itinerary for your specific dates, submit the form below—the first 100 users daily are 100% FREE without any payment or credit card required!"
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-black">
            <Gift className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE Tool • Zero Payment • No Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            FREE Dummy Ticket Guide + Sample PDF
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Download free verifiable flight itinerary samples, hotel reservation templates, and embassy document checklists. 
            First 100 applicants get personalized GDS itineraries made 100% free!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Simple Explanation Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center shrink-0 border border-blue-100">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-sm sm:text-base leading-relaxed text-slate-700">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                What is a Dummy Ticket &amp; How Does It Work?
              </h2>
              <p>
                A <strong>Dummy Ticket</strong> is a <strong>temporary flight + hotel reservation</strong> generated specifically for your visa application. It is <strong>NOT a real ticket for travel</strong>.
              </p>
              <p className="text-slate-600 text-sm">
                Each reservation includes an authentic 6-character airline <strong>PNR (Passenger Name Record)</strong> or hotel booking voucher verifiable online. Valid for <strong>7–14 days</strong>, giving the consulate enough time to process your visa without requiring you to lock in thousands of rupees in non-refundable airline tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Free Sample Template + Checklist Download Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {/* Card 1: Free Sample PDF */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  FREE DOWNLOAD
                </span>
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Sample Flight + Hotel Reservation PDF</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Download an authentic GDS flight reservation and confirmed hotel booking voucher template formatted for Schengen (France/Germany) &amp; US visas.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sample PNR &amp; Airline Segments</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotel Voucher &amp; Booking ID</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Embassy Accepted Layout</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleDownloadSamplePdf}
              className="mt-6 w-full py-3 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Free Sample PDF</span>
            </button>
          </div>

          {/* Card 2: Free Visa Itinerary Checklist */}
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-full">
                  OFFICIAL CHECKLIST
                </span>
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">Embassies Itinerary Document Checklist</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                VFS Global &amp; BLS certified list of itinerary documents required by consular officers to prevent refusal under lack of travel itinerary rules.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Roundtrip Dates Match Rule</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hotel Stay Across Multiple Cities</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Internal European Rail/Bus Bookings</span>
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={handleDownloadSamplePdf}
              className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Free Checklist</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Box with RED Border */}
        <div className="border-2 border-red-500 bg-red-50/70 rounded-2xl p-5 sm:p-6 mb-10 text-red-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm sm:text-base leading-relaxed">
              <h3 className="font-extrabold text-red-900 uppercase tracking-wide text-xs sm:text-sm">
                Mandatory Visa Applicant Disclaimer
              </h3>
              <p className="font-bold">
                This is a temporary reservation for visa purpose only. You cannot travel with this. After visa approval, book a real ticket.
              </p>
              <p className="text-xs text-red-800">
                A dummy ticket is solely intended to satisfy consular documentary requirements at embassies, VFS Global, BLS, and consular visa counters. Attempting to board a flight with an un-ticketed reservation will result in denied boarding at airport immigration.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Capture Form: 100% Free First 100 Users */}
        <div id="reservation-form" className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-10 scroll-mt-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full mb-1">
                <span>🎁</span> FIRST 100 USERS FREE TODAY
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Want Us to Make It for You?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Fill form, we will contact on WhatsApp — <strong>First 100 users FREE</strong> (Zero payment, no checkout).
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-center">
              <span>Spots Left Today: </span>
              <span className="font-black text-emerald-700">23 / 100</span>
            </div>
          </div>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900">Request Received!</h3>
              <p className="text-base font-semibold text-emerald-800 max-w-lg mx-auto">
                We will send PDF on your Email + WhatsApp within 4 hours.
              </p>
              <p className="text-xs text-emerald-700">
                Our reservation desk is preparing your verifiable itinerary for <strong>{formData.toCity || 'your destination'}</strong> ({formData.packageType.toUpperCase()}). 100% Free promo applied!
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Submit Another Free Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name (As on Passport) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Passport Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Z1234567"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WhatsApp Number (Fastest Delivery) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    From City / Airport *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi (DEL)"
                    value={formData.fromCity}
                    onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Destination City / Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Paris (CDG), France"
                    value={formData.toCity}
                    onChange={(e) => setFormData({ ...formData, toCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Travel Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.travelDate}
                    onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.returnDate}
                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Reservation Type *
                  </label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                  >
                    <option value="combo">Combo (Flight + Hotel) — 100% FREE</option>
                    <option value="flight">Flight Only — 100% FREE</option>
                    <option value="hotel">Hotel Only — 100% FREE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5 text-amber-300" />
                  <span>Request Free Reservation on WhatsApp (Zero Payment)</span>
                </button>
                <p className="text-center text-xs text-slate-500 mt-2">
                  🔒 100% Free Service. No payment, no checkout, no credit card required.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Lead Magnet Bar: Join Free WhatsApp Channel + Email Newsletter + AdSense Banner */}
        <FreeLeadMagnetBar pageContext="Dummy Ticket Free Guide" adSlot="dummy_ticket_banner" />

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/50 hover:bg-slate-100/70 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
