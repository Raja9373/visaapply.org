import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Download,
  Mail,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';
import { TopFreeToolsStrip } from '../components/TopFreeToolsStrip';
import { BottomFreeToolsSection } from '../components/BottomFreeToolsSection';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { HotelBookingWidget } from '../components/HotelBookingWidget';
import { FlightSearchWidget } from '../components/FlightSearchWidget';
import { AdSenseBanner } from '../components/AdSenseBanner';

interface DummyTicketPageProps {
  onNavigate?: (path: string) => void;
}

export const DummyTicketPage: React.FC<DummyTicketPageProps> = ({ 
  onNavigate = (p) => { window.history.pushState({}, '', p); window.scrollTo(0,0); } 
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);


  const handleDownloadSamplePdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header Banner
      doc.setFillColor(11, 42, 91);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('OFFICIAL FLIGHT & HOTEL RESERVATION (FREE SAMPLE)', 105, 14, { align: 'center' });

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
      doc.text('SHARMA / RAHUL MR (FREE SAMPLE)', 60, 54);
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

  const faqs = [
    {
      q: "What is a dummy ticket for a visa application?",
      a: "A dummy ticket is an authentic, temporary flight and/or hotel reservation with a verifiable PNR (Passenger Name Record) or Booking Reference ID generated through legitimate airline Global Distribution Systems (GDS). It demonstrates your intended itinerary to consular officers without requiring you to purchase an expensive non-refundable airline ticket before your visa is approved."
    },
    {
      q: "Is a dummy ticket acceptable for Schengen, US, UK, and Canada embassies?",
      a: "Yes. Embassies and consulates worldwide (including VFS Global, BLS International, and TLScontact) explicitly advise applicants in their official checklists NOT to purchase non-refundable flight tickets prior to visa grant. They specifically ask for a 'Flight Itinerary' or 'Roundtrip Reservation', which is exactly what this guide provides."
    },
    {
      q: "How long does the PNR and reservation remain valid?",
      a: "Our free guides and sample reservations remain active and verifiable on airline/hotel verification portals for 7 to 14 days, providing ample time for the embassy or visa processing center to review your application documents."
    },
    {
      q: "Can I travel on a dummy ticket?",
      a: "NO. A dummy ticket is strictly an itinerary reservation document for visa and consular inspection. It is NOT a confirmed passenger boarding ticket and cannot be used to board an aircraft or check into a hotel. Once your visa is granted, you must book real, ticketed travel."
    },
    {
      q: "Is this service 100% free?",
      a: "Yes! 100% free. You can search flights and book free cancellation hotels directly through our embedded widgets without paying anything."
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

      {/* Top Back Bar & Breadcrumb */}
      <PageBackBar onNavigate={onNavigate} pageName="Dummy Ticket" />

      {/* TOP Free Tools Strip */}
      <div className="bg-[#0B3D91] py-2 border-b border-blue-800">
        <TopFreeToolsStrip onNavigate={onNavigate} theme="dark" />
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-xs font-black">
            <span>✨ 100% Free Embedded Booking Widgets • Zero Commission Markup</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Dummy Ticket &amp; Flight Search Hub
          </h1>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Search live flights and book free-cancellation hotels directly below for your visa application.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        
        {/* Validity Box on TOP */}
        <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-black text-amber-900 text-sm sm:text-base">
                ⚠️ Official Validity &amp; Usage Rules (Must Read Before Visa Submission)
              </h3>
              <ul className="text-xs sm:text-sm text-amber-950 space-y-1 list-disc list-inside font-medium">
                <li><strong>Hotel Booking:</strong> Valid till free cancellation period (fully flexible, pay at property).</li>
                <li><strong>Flight Reservation:</strong> Valid for 7 to 14 days (GDS PNR verifiable online).</li>
                <li><strong>Travel Notice:</strong> STRICTLY for visa application consular proof only.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* EMBEDDED WIDGET 1: Hotel Booking Widget (Booking.com) */}
        <HotelBookingWidget defaultCity="Dubai" />

        {/* EMBEDDED WIDGET 2: Flight Search Widget (Aviasales / Travelpayouts) */}
        <FlightSearchWidget defaultFrom="DEL" defaultTo="DXB" />

        {/* Sample PDF Downloads */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Need a Sample PDF Template?</h3>
            <p className="text-xs text-slate-500">Download official formatting reference for embassy submission.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadSamplePdf}
              className="flex-1 sm:flex-none px-5 py-3 bg-[#0B3D91] hover:bg-[#082e6d] text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download Sample PDF</span>
            </button>
          </div>
        </div>

        {/* Shared Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Dummy Ticket Hub" className="mb-8" />

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

      {/* BOTTOM Free Tools Section */}
      <div className="mt-16 bg-slate-100 border-t border-slate-200 py-12">
        <BottomFreeToolsSection onNavigate={onNavigate || (() => {})} />
      </div>

      {/* Bottom Back Button */}
      <PageBottomBack onNavigate={onNavigate || (() => {})} />
    </div>
  );
};
