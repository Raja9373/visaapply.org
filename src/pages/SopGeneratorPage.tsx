import React, { useState } from 'react';
import {
  GraduationCap,
  FileText,
  Copy,
  Download,
  Check,
  Sparkles,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EmailSubscribeBox } from '../components/EmailSubscribeBox';
import { PageBackBar, PageBottomBack } from '../components/PageBackBar';

interface SopGeneratorPageProps {
  onNavigate?: (path: string) => void;
}

const SAMPLE_SOP_TEXT = `STATEMENT OF PURPOSE (SOP)

Applicant Name: Aarav Mehta
Target Program: Master of Science (MSc) in Computer Science & Data Analytics
Target Institution: Technical University of Munich (TUM) / University of Toronto
Destination Country: Canada / Germany

1. INTRODUCTION
In an era defined by rapid digital transformation, data-driven decision-making has become the cornerstone of modern enterprise architecture and public policy. From my earliest exposure to algorithmic problem-solving during my undergraduate studies, I have been deeply motivated to understand how scalable software systems can solve complex real-world operational bottlenecks. Today, I am submitting this Statement of Purpose to apply for a Student Visa to pursue the Master of Science in Computer Science & Data Analytics, a program that aligns directly with my academic preparation, professional trajectory, and long-term career vision in my home country.

2. ACADEMIC BACKGROUND
I completed my Bachelor of Technology (B.Tech) in Computer Science and Engineering from a recognized university in India, graduating with First Class with Distinction (8.6 CGPA). Throughout my four-year undergraduate curriculum, I built a rigorous foundation in Data Structures, Relational Database Management Systems, Operating Systems, Linear Algebra, and Statistical Inference. For my final-year capstone project, I led a four-member research team to design a predictive supply-chain inventory optimization engine using Python, reducing simulated warehouse stock-outs by 22%. My consistent academic record and practical laboratory coursework prepared me well for advanced graduate-level research.

3. PROFESSIONAL & WORK EXPERIENCE
Following my graduation, I joined a leading technology consulting firm as a Software Engineer, where I have worked for the past two years. In this role, I collaborated with cross-functional engineering teams to build enterprise data pipelines and cloud-native microservices. While working on large-scale financial analytics platforms, I realized that while my undergraduate degree equipped me with strong software implementation skills, advancing into a Senior Solutions Architect role requires formal graduate-level mastery of distributed machine learning, big data governance, and high-performance computing.

4. WHY THIS COURSE
The Master of Science in Computer Science & Data Analytics offers a comprehensive curriculum that bridges theoretical computer science with applied enterprise analytics. Modules such as Advanced Machine Learning, Cloud Computing Architecture, Statistical Modeling, and Ethical AI Governance directly address the knowledge gaps I identified during my industry tenure. Completing this structured postgraduate program will equip me with the specialized analytical frameworks needed to lead complex digital transformation projects.

5. WHY THIS UNIVERSITY
After thoroughly researching global universities, I selected this institution due to its internationally respected faculty, state-of-the-art research laboratories, and strong emphasis on industry-integrated learning. The department's interdisciplinary research clusters and collaborative capstone projects provide an unmatched academic environment where I can learn alongside a diverse cohort of international scholars.

6. WHY THIS COUNTRY
I chose to pursue my graduate degree here because its higher education system is globally renowned for academic rigor, research innovation, and practical pedagogy. Unlike domestic programs that often remain heavily theoretical, universities in this destination integrate real-world case studies and modern laboratory infrastructure. Furthermore, a degree from this jurisdiction holds immense prestige among multinational employers in my home country.

7. FUTURE PLANS & HOME COUNTRY TIES
My ultimate career objective is to return to my home country immediately upon completing my degree to take up a leadership position as a Principal Data Architect or Lead Cloud Strategist with a top-tier technology enterprise. The technology and digital infrastructure sector in my home country is expanding rapidly, creating an acute demand for specialists trained at top international universities. In addition to strong career prospects, my parents and immediate family reside permanently in my home country, where our family maintains established residential property and financial assets. I have a clear professional and personal commitment to return home after completing my studies.

8. CONCLUSION
In summary, my academic credentials, two years of hands-on software engineering experience, and full financial backing ensure that I am thoroughly prepared to succeed in this program. I solemnly undertake to abide by all student visa regulations, maintain full-time academic standing, and return to my home country upon completion of my course. I respectfully request your favorable consideration of my student visa application.

Sincerely,
Aarav Mehta`;

export const SopGeneratorPage: React.FC<SopGeneratorPageProps> = ({
  onNavigate = (p) => {
    window.history.pushState({}, '', p);
    window.scrollTo(0, 0);
  }
}) => {
  const [formData, setFormData] = useState({
    name: '',
    country: 'Canada',
    university: '',
    course: '',
    pastEducation: '',
    workExperience: '',
    whyCourse: '',
    futurePlans: ''
  });

  const [generatedSop, setGeneratedSop] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleGenerateSop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.university || !formData.course) {
      alert('Please enter your Name, University, and Course.');
      return;
    }

    const name = formData.name.trim();
    const country = formData.country.trim();
    const university = formData.university.trim();
    const course = formData.course.trim();
    const pastEdu =
      formData.pastEducation.trim() ||
      'Bachelor’s degree with strong academic standing (First Class / High GPA) and foundational coursework';
    const workExp =
      formData.workExperience.trim() ||
      'Practical internships, academic research projects, and hands-on industry exposure demonstrating strong analytical and collaborative skills';
    const whyCourse =
      formData.whyCourse.trim() ||
      `Acquire advanced theoretical depth, modern analytical frameworks, and global best practices in ${course}`;
    const futurePlans =
      formData.futurePlans.trim() ||
      'Return to my home country upon graduation to secure a senior leadership role at a leading multinational organization and contribute to domestic industry growth';

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const sopText = `STATEMENT OF PURPOSE (SOP) FOR STUDENT VISA

Date: ${todayStr}
Applicant Name: ${name}
Target University: ${university}
Program of Study: ${course}
Destination Country: ${country}

1. INTRODUCTION
Education is the most powerful catalyst for professional excellence and technological progress. Throughout my academic and professional journey, I have consistently sought opportunities to deepen my domain expertise and solve complex real-world problems with precision and integrity. At this pivotal stage of my career, I am applying for a Student Visa to pursue ${course} at ${university} in ${country}. This Statement of Purpose outlines my academic background, professional experience, clear rationale for selecting this specific program and institution, and my definitive post-study career roadmap in my home country.

2. ACADEMIC BACKGROUND
My academic foundation has been built on intellectual curiosity, disciplined study, and practical application. I have completed ${pastEdu}. During my previous studies, I consistently maintained strong academic standing while actively participating in technical seminars, laboratory assignments, and collaborative capstone projects. My undergraduate and secondary coursework provided me with a solid grounding in core principles, quantitative analysis, and structured research methodologies. However, as global industry standards continue to evolve rapidly, I recognized the necessity of pursuing a specialized program—${course}—to transition from foundational knowledge to advanced mastery.

3. PROFESSIONAL EXPERIENCE & PRACTICAL EXPOSURE
Complementing my classroom education, I have gained valuable practical insights through my professional background: ${workExp}. Working in fast-paced environments taught me project execution, cross-functional communication, and analytical problem-solving under strict deadlines. At the same time, my real-world assignments highlighted specific advanced areas where I needed structured graduate-level education. This realization directly inspired my decision to pursue ${course} at ${university}, so that I can bridge the gap between my current capabilities and the advanced competencies demanded by top-tier global employers.

4. WHY THIS COURSE (${course.toUpperCase()})
Selecting the right academic program is vital for long-term career progression. My primary motivation for choosing ${course} is clear: ${whyCourse}. The curriculum of this program is thoughtfully structured, combining rigorous core modules with applied electives, case studies, and research-oriented projects. By mastering these specialized subjects, I will gain a comprehensive command of contemporary tools, regulatory standards, and strategic frameworks that are not covered in standard domestic programs.

5. WHY THIS UNIVERSITY (${university.toUpperCase()})
After evaluating numerous universities, ${university} stood out as my premier choice for pursuing ${course}. ${university} is internationally respected for its distinguished faculty, modern research infrastructure, and student-centric pedagogy. The university’s strong emphasis on experiential learning, interdisciplinary collaboration, and academic excellence provides the ideal intellectual environment for my studies. Being admitted to ${university} is a proud milestone in my academic journey, and I am eager to contribute positively to its campus community and scholarly initiatives.

6. WHY THIS COUNTRY (${country.toUpperCase()})
I chose ${country} as my study destination because its higher education system is globally benchmarked for quality assurance, research innovation, and practical relevance. Universities in ${country} emphasize critical thinking, independent research, and real-world problem solving rather than rote memorization. Furthermore, an academic qualification earned in ${country} carries exceptional recognition among multinational corporations and industry leaders in my home country, giving returning graduates a distinct competitive advantage in the domestic employment market. Additionally, my family and I have arranged complete, verified financial resources to cover my tuition fees, accommodation, and living expenses in ${country} without any financial strain.

7. FUTURE PLANS & STRONG TIES TO HOME COUNTRY
My long-term career goal is clear and well-defined: ${futurePlans}. The economy and corporate sector in my home country are experiencing rapid modernization, creating a high demand for professionals who possess international academic training from institutions like ${university}. Upon completing ${course}, I will return directly to my home country to step into a high-impact specialist or managerial role. Beyond strong career incentives, I possess deep personal, familial, and economic ties to my home country. My immediate family members reside permanently here, and our family holds established residential property and financial investments that require my long-term presence.

8. CONCLUSION
In conclusion, pursuing ${course} at ${university} in ${country} is the most logical and essential step toward achieving my academic and professional aspirations. I possess the academic readiness, financial solvency, and focused determination required to excel in this program. I solemnly pledge to comply strictly with all student visa regulations of ${country}, maintain exemplary academic standing, and depart ${country} promptly upon the completion of my authorized studies. I respectfully request the Visa Officer to grant my Student Visa application.

Yours sincerely,

${name}
Applicant for ${course}
${university}, ${country}`;

    setGeneratedSop(sopText);
    setTimeout(() => {
      const el = document.getElementById('sop-output-box');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDownloadPdf = (content: string, fileName: string) => {
    if (!content) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);

      const margin = 20;
      const pageWidth = 210 - margin * 2;
      const splitText = doc.splitTextToSize(content, pageWidth);

      let cursorY = 25;
      const pageHeight = 297 - margin;

      for (let i = 0; i < splitText.length; i++) {
        if (cursorY > pageHeight) {
          doc.addPage();
          cursorY = 25;
        }
        doc.text(splitText[i], margin, cursorY);
        cursorY += 5.2;
      }

      doc.save(fileName);
    } catch {
      alert('Unable to generate PDF directly. Please copy the text using the Copy button.');
    }
  };

  const sopTips = [
    {
      title: 'Connect Past Education & Work to Your Chosen Course',
      desc: 'Visa officers look for a logical academic progression. Clearly explain how your previous degree or work experience led you to choose this specific course.'
    },
    {
      title: 'Explain Why You Chose This Country Over Home Country Options',
      desc: 'Highlight specific curriculum advantages, research facilities, and global recognition of the university rather than generic praise about the country.'
    },
    {
      title: 'Demonstrate Clear Post-Study Return Intent (Home Country Ties)',
      desc: 'For Canada (GTE/Study Permit), Australia (GS), UK, and USA (F-1), clearly state how this degree will help you get a high-paying job back in your home country, and mention family and property ties.'
    },
    {
      title: 'Keep Word Count Around 800–1,000 Words with Clear Headings',
      desc: 'Consular officers review dozens of files daily. Use clean, structured paragraphs covering Introduction, Academic Background, Why This University, Why This Country, and Future Plans.'
    },
    {
      title: 'Maintain 100% Consistency with Your Financial & Academic Documents',
      desc: 'Ensure that every university name, intake date, GPA/percentage, and sponsor detail mentioned in your SOP matches your admission offer letter and financial statements.'
    }
  ];

  const faqs = [
    {
      q: 'What is the ideal length for a Student Visa SOP?',
      a: 'An ideal Statement of Purpose (SOP) for a Student Visa is between 750 and 1,000 words (approximately 1.5 to 2 pages on A4 paper). It should be concise, well-structured into clear sections, and directly address why you chose the course, university, and country, as well as your career plans back home.'
    },
    {
      q: 'Is a Visa SOP different from a University Admission SOP?',
      a: 'Yes. While a University Admission SOP focuses primarily on your academic achievements and research interests, a Student Visa SOP must also convince the immigration officer that you are a genuine student with sufficient financial backing and strong incentives to return to your home country after graduation.'
    },
    {
      q: 'Can I edit the generated SOP before downloading the PDF?',
      a: 'Yes! Once you click "Generate SOP", the full 800-word Statement of Purpose is displayed in an editable box so you can customize any sentence before copying or downloading your A4 PDF.'
    },
    {
      q: 'Is this Student Visa SOP Generator 100% free?',
      a: 'Yes, our Student Visa SOP Generator is 100% free with instant Copy and PDF Download—no login, no watermark, and no payment required.'
    }
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Top Back Bar */}
      <PageBackBar onNavigate={onNavigate} pageName="Free SOP Generator for Student Visa" />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black text-emerald-300 border border-emerald-400/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% FREE • NO LOGIN REQUIRED</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Free SOP Generator for Student Visa
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Instantly generate a structured, 800-word Statement of Purpose (SOP) for Canada, UK, USA, Australia, Germany, and European Student Visas. Includes Academic Background, Why This University, Why This Country, and Future Return Plans.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-10">
        {/* SOP Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B2A5B] flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Enter Your Student &amp; Course Details</h2>
                <p className="text-xs text-slate-500">Fill in the fields below to auto-generate your 800-word embassy-formatted Statement of Purpose</p>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              100% FREE PDF
            </span>
          </div>

          <form onSubmit={handleGenerateSop} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name (As on Passport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Destination Country *
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                >
                  <option value="Canada">🇨🇦 Canada (IRCC Study Permit)</option>
                  <option value="United Kingdom (UK)">🇬🇧 United Kingdom (UK Student Visa)</option>
                  <option value="United States (USA)">🇺🇸 United States (USA F-1 Visa)</option>
                  <option value="Australia">🇦🇺 Australia (Subclass 500 Genuine Student)</option>
                  <option value="Germany">🇩🇪 Germany (National Student Visa)</option>
                  <option value="Ireland">🇮🇪 Ireland (Study Visa)</option>
                  <option value="France">🇫🇷 France (Long-Stay Student Visa)</option>
                  <option value="New Zealand">🇳🇿 New Zealand (Fee Paying Student Visa)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  University / College Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. University of Toronto / Technical University of Munich"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Course / Degree Program *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MSc in Data Science / MBA in International Finance"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Past Education (Degree, College &amp; GPA/Marks) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. B.Tech in Computer Science from Delhi University (2023) with 8.5 CGPA and IELTS 7.5 overall"
                  value={formData.pastEducation}
                  onChange={(e) => setFormData({ ...formData, pastEducation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Work Experience / Internships (If any)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2 years as Software Engineer at TCS working on enterprise cloud data pipelines (or 'Fresh Graduate with 6-month internship')"
                  value={formData.workExperience}
                  onChange={(e) => setFormData({ ...formData, workExperience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Why This Course? *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. To gain hands-on expertise in machine learning, cloud architecture, and quantitative analytics"
                  value={formData.whyCourse}
                  onChange={(e) => setFormData({ ...formData, whyCourse: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Future Plans (Career Goal in Home Country) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Return to India to work as a Lead Data Architect at a top technology firm while staying close to my parents"
                  value={formData.futurePlans}
                  onChange={(e) => setFormData({ ...formData, futurePlans: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Generate SOP (800-Word Official Format) →</span>
            </button>
          </form>
        </div>

        {/* Generated SOP Output Box */}
        {generatedSop && (
          <div id="sop-output-box" className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-2 border-[#0B2A5B] scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full uppercase">
                  ✓ 800-Word Student Visa SOP Ready
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Your Generated Statement of Purpose ({formData.country})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedSop);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy SOP'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadPdf(
                      generatedSop,
                      `Student_Visa_SOP_${formData.name.replace(/\s+/g, '_') || 'Applicant'}.pdf`
                    )
                  }
                  className="px-4 py-2 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <textarea
              rows={18}
              value={generatedSop}
              onChange={(e) => setGeneratedSop(e.target.value)}
              className="mt-5 w-full p-5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]"
            />
          </div>
        )}

        {/* 5 SOP Tips Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">5 Expert SOP Tips for 100% Student Visa Success</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {sopTips.map((tip, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="w-7 h-7 rounded-full bg-[#0B2A5B] text-white text-xs font-black flex items-center justify-center mb-3">
                    {idx + 1}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 mb-1.5">{tip.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample SOP Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Sample Approved Student Visa SOP (800 Words)</h2>
                <p className="text-xs text-slate-500">Reference template showing ideal paragraph structure and home-country ties</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SAMPLE_SOP_TEXT);
                  setCopiedSample(true);
                  setTimeout(() => setCopiedSample(false), 2500);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSample ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSample ? 'Copied!' : 'Copy Sample'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(SAMPLE_SOP_TEXT, 'Sample_Student_Visa_SOP.pdf')}
                className="px-3.5 py-2 bg-[#0B2A5B] hover:bg-[#0B3D91] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample PDF</span>
              </button>
            </div>
          </div>

          <pre className="p-5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {SAMPLE_SOP_TEXT}
          </pre>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B2A5B]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions (Student Visa SOP)</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/60 hover:bg-slate-100/80 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
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

        {/* Email Only Subscribe Box */}
        <EmailSubscribeBox pageContext="Student Visa SOP Generator" />
      </div>

      {/* Bottom Back to Home */}
      <PageBottomBack onNavigate={onNavigate} />
    </div>
  );
};
