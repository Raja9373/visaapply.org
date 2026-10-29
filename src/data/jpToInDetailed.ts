export const JP_TO_IN_VISA: any = {
  "IN": {
    tourist: [
      {
        id: "e-tourist",
        name: "e-Tourist Visa (30 Days / 1 Year / 5 Years)",
        name_ja: "電子観光ビザ（e-Tourist Visa 30日 / 1年 / 5年）",
        icon: "🏖️",
        fee: "¥3,500 ($25 USD) for 30 days | ¥6,000 ($40 USD) for 1 year",
        validity: "30 days / 1 year / 5 years",
        stay: "Up to 90 days per visit",
        purpose: "Sightseeing, casual family visits, short yoga programs",
        purpose_ja: "観光、親族・知人訪問、短期ヨガ研修・瞑想体験",
        popular: true,
        eligibility: "Japanese passport holders with at least 6 months validity from date of arrival and 2 blank pages.",
        eligibility_ja: "到着日から6ヶ月以上の有効期間と2ページ以上の余白がある日本国パスポートを所持していること。",
        docs: [
          "Passport bio page scan (PDF, 10KB to 300KB)",
          "Passport size digital photograph (JPEG, white background, square)",
          "Confirmed return or onward flight ticket",
          "Hotel booking confirmation in India"
        ],
        docs_ja: [
          "パスポート顔写真ページのPDFスキャン（10KB〜300KB）",
          "パスポート用デジタル写真（JPEG、背景白、正方形）",
          "復路または第三国への航空券（Eチケット）",
          "インド滞在先のホテル予約確認書"
        ],
        infoReq: [
          "Full Name, Date of Birth, Place of Birth, Passport No, Expiry",
          "Father's & Mother's Full Name & Nationality",
          "Applicant's Current Occupation & Employer Address in Japan",
          "Reference Contact in India (Hotel Name & Address)",
          "Reference Contact in Japan (Family member or relative phone)"
        ],
        infoReq_ja: [
          "氏名、生年月日、出生地、パスポート番号、発行日・有効期限",
          "両親の氏名・国籍",
          "現職の職業名・勤務先名称および日本の住所・電話番号",
          "インド国内の緊急連絡先（滞在ホテル名・住所・電話番号）",
          "日本国内の緊急連絡先（ご家族・親族の電話番号）"
        ],
        steps: [
          "Visit official Government of India portal: indianvisaonline.gov.in",
          "Click 'Apply for e-Visa' and complete the application form",
          "Upload passport PDF and digital JPEG photo",
          "Pay the visa fee ($25 USD for 30 days) online via credit card",
          "Receive Electronic Travel Authorization (ETA) via email within 72 hours",
          "Print ETA document and present at Indian Immigration on arrival"
        ],
        steps_ja: [
          "インド政府公式e-Visaポータル（indianvisaonline.gov.in）にアクセス",
          "「Apply for e-Visa」をクリックし申請フォームに入力",
          "パスポートのPDFスキャンと正面顔写真（JPEG）をアップロード",
          "クレジットカードでビザ申請料金（30日ビザで約25ドル）を決済",
          "通常72時間以内に電子渡航許可（ETA）がメールで届く",
          "メール添付のETA（電子許可書）を印刷し、インド到着時に提示"
        ],
        embassy: {
          tokyo: "Embassy of India, Tokyo: 2-2-11 Kudan-Minami, Chiyoda-ku, Tokyo 102-0074, Phone: +81-3-3262-2391",
          osaka: "Consulate General of India, Osaka: Semba I.S. Bldg 10F, 1-9-26 Kyutaromachi, Chuo-ku, Osaka 541-0056, Phone: +81-6-6261-7299"
        },
        tips: "Japanese citizens are eligible for Visa-on-Arrival at 6 designated Indian airports (Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad), but applying for e-Visa online beforehand is strongly recommended to save queue time."
      },
      {
        id: "regular-tourist",
        name: "Regular Paper Tourist Visa (6 Months)",
        name_ja: "通常観光ビザ（紙ビザ 6ヶ月数次有効）",
        icon: "🏛️",
        fee: "¥2,700 JPY",
        validity: "6 months (Multiple Entry)",
        stay: "Up to 90 days per visit",
        purpose: "Long-term tourism, multiple entries into India",
        purpose_ja: "長期間の観光、インドへの複数回入国",
        docs: [
          "Original Passport (valid 6 months+)",
          "Printed Online Application Form with signature",
          "2 physical photos (2x2 inches, white background)",
          "Proof of residence in Japan"
        ],
        docs_ja: [
          "パスポート原本（有効期限6ヶ月以上）",
          "オンライン作成したビザ申請書（署名捺印済）",
          "証明写真2枚（5cm×5cm、背景白）",
          "日本での現住所証明書（住民票または運転免許証コピー）"
        ],
        steps: [
          "Fill online application on indianvisaonline.gov.in/visa",
          "Print the generated PDF form and sign in two places",
          "Submit form and original passport to VFS Japan / India Embassy Tokyo",
          "Collect passport with visa sticker in 3-5 business days"
        ],
        steps_ja: [
          "indianvisaonline.gov.in/visa でオンライン申請書を作成・保存",
          "生成されたPDF申請書を印刷し、所定欄2ヶ所に署名",
          "在日インド大使館（東京）または大阪総領事館指定窓口に提出",
          "約3〜5営業日後にビザ貼付済みのパスポートを受領"
        ]
      },
      {
        id: "5yr-tourist",
        name: "5-Year Multiple Entry Tourist Visa",
        name_ja: "5年間数次観光ビザ（5-Year Multiple Entry）",
        icon: "⭐",
        fee: "¥8,200 JPY ($80 USD)",
        validity: "5 years",
        stay: "Up to 90 days per visit",
        popular: true,
        purpose: "Frequent travelers, digital nomads, spiritual seekers",
        purpose_ja: "頻繁にインドへ渡航する方、リピーター、長期交流",
        docs: [
          "Passport valid for at least 1 year",
          "Digital photograph and passport PDF",
          "Bank balance proof or employment proof"
        ],
        docs_ja: [
          "1年以上有効なパスポート原本",
          "デジタル写真およびパスポートスキャンデータ",
          "残高証明書または在職証明書"
        ]
      }
    ],
    work: [
      {
        id: "employment",
        name: "Employment Visa (E-Visa for Executives & Experts)",
        name_ja: "就労ビザ（Employment Visa 駐在員・技術者向け）",
        icon: "💼",
        fee: "¥7,500 JPY",
        validity: "1 year to 5 years (Extendable in India)",
        stay: "Duration of employment contract",
        purpose: "Employment in Indian registered companies or Japanese MNC subsidiaries",
        purpose_ja: "インド現地法人・日系企業インド支社での就労・駐在",
        popular: true,
        eligibility: "Annual salary of $25,000 USD (approx ¥3.8M JPY) or higher, sponsored by an Indian company.",
        eligibility_ja: "年収25,000米ドル相当以上（約380万円以上）の雇用契約と、インド側企業のスポンサーシップがあること。",
        docs: [
          "Job offer letter & employment contract specifying designation & salary",
          "Incorporation certificate of Indian host company",
          "Applicant CV & professional qualification certificates",
          "Guarantee letter from Japanese headquarters (if expat transfer)"
        ],
        docs_ja: [
          "雇用契約書（役職・年収・就労期間が記載されたもの）",
          "インド現地の受入企業の会社登記簿謄本・設立証明書",
          "申請者の英文履歴書（CV）および学位・資格証明書",
          "日本本社からの派遣状・身元保証書"
        ],
        steps: [
          "Obtain registered job contract from employer in India",
          "Fill employment visa form on official government portal",
          "Submit documents at Indian Embassy in Tokyo or Consulate in Osaka",
          "Undergo visa verification process (5-10 working days)",
          "Register with FRRO (Foreigners Regional Registration Office) within 14 days of arrival in India"
        ],
        steps_ja: [
          "インドの雇用企業から正式な雇用契約書を受領",
          "公式ビザ申請サイトで「Employment Visa」を選択し入力",
          "東京の在日インド大使館または大阪領事館に必要書類一式を提出",
          "ビザ審査（約5〜10営業日）を経てパスポートを受領",
          "インド入国後14日以内に現地外国人登録所（FRRO）にてオンライン登録"
        ]
      }
    ],
    student: [
      {
        id: "student",
        name: "Student Visa (Higher Education & Research)",
        name_ja: "学生ビザ（Student Visa 大学・研究機関向け）",
        icon: "🎓",
        fee: "¥7,500 JPY",
        validity: "Up to 5 years (Duration of degree program)",
        stay: "Duration of academic course",
        purpose: "Full-time degree programs, research, Indian philosophy or Yoga degree",
        purpose_ja: "インドの大学・大学院・研究機関・ヨガ正規課程への留学",
        docs: [
          "Admission letter from UGC/AICTE recognized Indian institution",
          "Proof of financial support / Bank statement (parents or self)",
          "No Objection Certificate (NOC) from Ministry of Education (if applicable)"
        ],
        docs_ja: [
          "インド政府認可大学・機関からの正式入学許可書（Admission Letter）",
          "経費支弁書および銀行残高証明書（英文）",
          "過去の学歴・成績証明書（英文）"
        ]
      }
    ],
    family: [
      {
        id: "entry",
        name: "Entry Visa (X-Visa for Dependents & Family)",
        name_ja: "入国ビザ（Entry X-Visa 駐在員ご家族・帯同向け）",
        icon: "👨‍👩‍👧",
        fee: "¥7,500 JPY",
        validity: "Co-terminus with primary Employment visa holder",
        stay: "Same as spouse/parent holding employment visa",
        purpose: "Spouse & children accompanying Employment/Business visa holders in India",
        purpose_ja: "就労ビザ・ビジネスビザ保持者の配偶者および帯同ご家族",
        docs: [
          "Copy of primary applicant's Employment Visa & Passport",
          "Apostilled Family Register (Koseki Tohon) translated into English",
          "Marriage Certificate / Birth Certificate of children"
        ],
        docs_ja: [
          "主申請者（駐在員）のパスポートコピーおよび就労ビザコピー",
          "戸籍謄本の英訳および公証・アポスティーユ証明",
          "婚姻証明書およびお子様の誕生証明書（英文）"
        ]
      }
    ],
    business: [
      {
        id: "business",
        name: "Business Visa (B-Visa for Meetings & Joint Ventures)",
        name_ja: "商用ビザ（Business Visa 出張・業務連絡・商談向け）",
        icon: "🤝",
        fee: "¥7,500 JPY ($80 USD)",
        validity: "1 year / 5 years (Multiple Entry)",
        stay: "Up to 180 days per visit",
        popular: true,
        purpose: "Business meetings, factory inspection, technical setup, joint venture deals",
        purpose_ja: "商談、市場調査、工場視察、機器納入・技術指導",
        docs: [
          "Invitation letter from registered Indian company",
          "Recommendation letter from Japanese employer on company letterhead",
          "Business card & Japanese company incorporation proof"
        ],
        docs_ja: [
          "インド側受入企業からの英文招待状（Invitation Letter）",
          "日本側派遣会社からの英文推薦状・出張命令書",
          "申請者の英文名刺および日本会社の登記簿コピー"
        ]
      }
    ],
    pr: [
      {
        id: "oci",
        name: "OCI Card (Overseas Citizen of India - Lifelong)",
        name_ja: "OCIカード（インド海外市民権 - 終身ビザ免除）",
        icon: "⭐",
        fee: "¥27,500 JPY",
        validity: "Lifelong",
        stay: "Indefinite stay with multi-purpose entry rights",
        popular: true,
        purpose: "For Japanese nationals of Indian origin or spouses of Indian citizens",
        purpose_ja: "インド系日本人およびインド国民の日本人配偶者向け終身ビザ免除",
        docs: [
          "Proof of Indian origin (Surrender Certificate of Indian Passport)",
          "Japanese Naturalization Certificate",
          "Spouse's Indian Passport (if applying via marriage)"
        ],
        docs_ja: [
          "インドルーツ証明書（旧インドパスポート放棄証明書など）",
          "日本国帰化証明書",
          "配偶者のインドパスポートおよび婚姻証明書"
        ]
      }
    ]
  }
};

export function getJpToInVisaData(subtypeCode?: string) {
  return JP_TO_IN_VISA["IN"];
}
