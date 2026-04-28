// scamData.js
// 5 scam types × 3 difficulty levels
// Easy:   1 question per scam
// Medium: 2 questions per scam
// Hard:   short transcript with 1–2 red flags on the message level (not per line)
// No "both/all of the above" answer options anywhere.

export const SCAMS = [

  // ─────────────────────────────────────────────
  // 1. PHISHING & SPOOFING
  // ─────────────────────────────────────────────
  {
    id: "phishing",
    name: "Phishing & Spoofing",
    icon: "🎣",
    stats: {
      complaints: "48,064 elder victims in 2025",
      losses: "$77 million lost by elders in 2025",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Fake emails, texts, and calls that pretend to be trusted organizations to steal your personal information or money.",

    easy: [
      {
        id: "ph-e1",
        question:
          "You get a text: 'USPS Alert: Your package is on hold. Pay a $3.50 redelivery fee: usps-delivery-help.net'. What should you do?",
        options: [
          { text: "Pay the fee — it is only $3.50 and the package sounds important", correct: false },
          { text: "Go to usps.com yourself to check your deliveries", correct: true },
          { text: "Click the link to see if the package is real", correct: false },
          { text: "Call the number in the text to ask about the package", correct: false },
        ],
        explanation:
          "'usps-delivery-help.net' is not the official USPS site. Small fees are used as a hook — once you enter your card details, scammers have your card number. Always type the official website address yourself.",
      },
    ],

    medium: [
      {
        id: "ph-m1",
        question:
          "Your phone shows 'Social Security Administration' as the caller. The person says your Social Security number has been suspended due to fraud and demands immediate verification. What is most likely happening?",
        options: [
          { text: "A real SSA alert — you should cooperate and verify your information", correct: false },
          { text: "Caller ID spoofing — scammers can fake the name that appears on your phone", correct: true },
          { text: "A routine government security check", correct: false },
          { text: "An automated system that called the wrong number", correct: false },
        ],
        explanation:
          "Caller ID can be faked — this is called spoofing. The real SSA will never call threatening suspension or demanding immediate verification. Hang up and call SSA yourself at 1-800-772-1213.",
      },
      {
        id: "ph-m2",
        question:
          "An email warns that your account will be closed in 48 hours unless you confirm your password. The sending address is 'security@gmail-accounts-verify.com'. What is the biggest clue this is a scam?",
        options: [
          { text: "Real companies never send emails about account security", correct: false },
          { text: "Legitimate companies always give more than 48 hours notice", correct: false },
          { text: "The sending address uses a fake domain, not the real gmail.com", correct: true },
          { text: "The email did not address you by your full name", correct: false },
        ],
        explanation:
          "The domain 'gmail-accounts-verify.com' is fake — Google emails only come from @google.com or @accounts.google.com. Scammers register convincing-sounding domains to deceive you. Always check the full sending address, not just the display name.",
      },
    ],

    hard: {
      id: "ph-h1",
      type: "email",
      instruction:
        "Read this email carefully. Tap the part of the message body that is the biggest red flag, then tap 'Show answers'.",
      from: "medicare-benefits@medicare-gov-portal.com",
      subject: "URGENT: Your Medicare Benefits Require Immediate Verification",
      senderIsFlag: true,
      senderReason:
        "'medicare-gov-portal.com' is a fake domain. Real Medicare emails only come from medicare.gov.",
      body: [
        {
          id: "ph-h1-s1",
          text: "Dear Medicare Member, we have detected suspicious activity on your account. To protect your benefits, please confirm your Social Security number, date of birth, and bank account details by clicking the link below within 24 hours.",
          isFlag: true,
          reason:
            "Medicare will never ask for your Social Security number, date of birth, and bank account together by email. This combination is used for identity theft. Real agencies contact you by mail and never demand same-day responses.",
        },
        {
          id: "ph-h1-s2",
          text: "Failure to respond will result in permanent cancellation of your Medicare coverage. Medicare Benefits Security Department.",
          isFlag: false,
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // 2. TECH SUPPORT SCAMS
  // ─────────────────────────────────────────────
  {
    id: "techsupport",
    name: "Tech Support Scams",
    icon: "💻",
    stats: {
      complaints: "21,333 elder victims in 2025",
      losses: "$1.04 billion lost by elders in 2025",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Fake tech support agents claiming your computer has a virus, then charging for repairs or stealing access to your accounts.",

    easy: [
      {
        id: "ts-e1",
        question:
          "A full-screen pop-up appears on your computer: 'CRITICAL VIRUS DETECTED. Call Microsoft Support now: 1-888-555-0192.' Your computer plays an alarm. What should you do?",
        options: [
          { text: "Call the number immediately — this sounds serious", correct: false },
          { text: "Restart your computer or close your browser — Microsoft never sends pop-up warnings with phone numbers", correct: true },
          { text: "Give them remote access so they can fix it quickly", correct: false },
          { text: "Pay the virus removal fee shown on screen", correct: false },
        ],
        explanation:
          "Microsoft, Apple, and other tech companies never send pop-up alerts with phone numbers. The alarm is designed to frighten you. Simply restarting your computer or closing your browser ends the pop-up safely.",
      },
    ],

    medium: [
      {
        id: "ts-m1",
        question:
          "A tech support caller says they fixed your computer and will refund $500 as a thank-you. They ask for your bank details, then say they accidentally sent $5,000 and ask you to wire back the difference. What is this?",
        options: [
          { text: "A genuine mistake — wire the extra back to be honest", correct: false },
          { text: "An overpayment scam — the deposit will bounce and you will lose the money you wire back", correct: true },
          { text: "A loyalty reward from a legitimate tech company", correct: false },
          { text: "A trustworthiness test from the company", correct: false },
        ],
        explanation:
          "They deposit a fake check that appears in your account temporarily, then convince you to wire back the 'excess'. The original deposit bounces and you lose the money you sent — which was real.",
      },
      {
        id: "ts-m2",
        question:
          "During a tech support call, the agent asks you to install 'AnyDesk' so they can fix your computer remotely. Why is this dangerous even though AnyDesk itself is a real program?",
        options: [
          { text: "AnyDesk contains viruses that will infect your computer", correct: false },
          { text: "Installing any new software costs money you were not expecting", correct: false },
          { text: "Remote access gives the scammer full control of your computer, including any open bank accounts", correct: true },
          { text: "It will permanently slow down your computer", correct: false },
        ],
        explanation:
          "AnyDesk is a legitimate program — but in a scammer's hands it gives complete control of your computer. They can open your bank site, transfer funds, and steal passwords while you watch. Never install remote access software at the request of an unsolicited caller.",
      },
    ],

    hard: {
      id: "ts-h1",
      type: "phone",
      instruction:
        "Read this phone call transcript. Tap the part of the conversation that is the clearest red flag, then tap 'Show answers'.",
      from: "Caller ID: Microsoft Support — 1-800-642-7676",
      subject: "Incoming call transcript",
      senderIsFlag: true,
      senderReason:
        "Caller ID can be faked. Scammers can make any name or number appear on your screen, including real Microsoft numbers.",
      body: [
        {
          id: "ts-h1-s1",
          text: "Hello, this is David from Microsoft Security. Our servers have detected 47 critical errors on your Windows computer and hackers may access your bank account within 20 minutes.",
          isFlag: false,
        },
        {
          id: "ts-h1-s2",
          text: "The repair fee is $299, payable in Google Play gift cards — that is our secure payment system. Please do not tell your family about this, as it is a sensitive security matter.",
          isFlag: true,
          reason:
            "Requesting payment by gift card and telling you to keep it secret from family are two of the most reliable signs of a scam. No legitimate company accepts gift cards as payment or asks you to hide a repair from your loved ones.",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // 3. INVESTMENT FRAUD
  // ─────────────────────────────────────────────
  {
    id: "investment",
    name: "Investment Fraud",
    icon: "📈",
    stats: {
      complaints: "16,926 elder victims in 2025",
      losses: "$3.52 billion lost by elders in 2025 — the single largest loss category",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Fake investment opportunities — often in cryptocurrency — that promise high returns and steal your life savings.",

    easy: [
      {
        id: "inv-e1",
        question:
          "Someone contacts you on Facebook offering a cryptocurrency investment that returns 40% every month with zero risk. They offer to manage your money for you. What should you do?",
        options: [
          { text: "Invest a small amount first to test it", correct: false },
          { text: "Decline — guaranteed high returns with no risk do not exist in any real investment", correct: true },
          { text: "Ask for references from other customers before deciding", correct: false },
          { text: "Only invest money you can afford to lose", correct: false },
        ],
        explanation:
          "No investment can legally guarantee high returns with zero risk — that promise alone proves it is a scam. Legitimate financial advisors are registered professionals who never solicit strangers through social media.",
      },
    ],

    medium: [
      {
        id: "inv-m1",
        question:
          "You put $10,000 into a crypto platform an online contact recommended. The platform shows it growing to $40,000. When you try to withdraw, they say you must pay a $8,000 'government tax' first. What should you do?",
        options: [
          { text: "Pay the tax — it sounds like a real legal requirement", correct: false },
          { text: "Do not pay — the profits are fake and the tax fee will disappear too", correct: true },
          { text: "Pay half the tax as a compromise to unlock some funds", correct: false },
          { text: "Contact the platform's customer support to dispute the charge", correct: false },
        ],
        explanation:
          "The platform, the profits shown, and the 'tax' are all fake. No legitimate investment requires you to pre-pay taxes to withdraw your own money. This is the final stage of a pig butchering scam — once you pay, everything is gone.",
      },
      {
        id: "inv-m2",
        question:
          "You lost money in a cryptocurrency scam. Someone contacts you saying they are a recovery specialist who can get your money back for an upfront fee. What is this most likely to be?",
        options: [
          { text: "A legitimate service — crypto recovery specialists do exist", correct: false },
          { text: "A recovery scam targeting people who already lost money", correct: true },
          { text: "A government compensation program you should apply for", correct: false },
          { text: "A law firm willing to take your case", correct: false },
        ],
        explanation:
          "Recovery scams specifically target people who have already lost money, knowing they are desperate to recover it. No legitimate recovery service charges upfront fees. In 2025, recovery scams caused $1.4 billion in additional losses to people who were already victims.",
      },
    ],

    hard: {
      id: "inv-h1",
      type: "email",
      instruction:
        "Read this investment email. Tap the part that is the biggest red flag, then tap 'Show answers'.",
      from: "robert.chen@goldpathcapital-partners.net",
      subject: "Private Invitation: Exclusive Retirement Growth Opportunity",
      senderIsFlag: true,
      senderReason:
        "'goldpathcapital-partners.net' is not a registered investment firm. Verify any firm at investor.gov before sending money.",
      body: [
        {
          id: "inv-h1-s1",
          text: "A mutual friend mentioned you are looking for better returns on your retirement savings. Our exclusive cryptocurrency fund has returned 25 to 40 percent every month for the past year. This opportunity is open for the next 48 hours only — very limited spots remaining.",
          isFlag: true,
          reason:
            "25% monthly returns equal over 1,300% per year — no legitimate investment achieves this, and claiming it is illegal. The 48-hour deadline is designed to prevent you from researching or consulting a financial advisor.",
        },
        {
          id: "inv-h1-s2",
          text: "To get started, wire your funds directly to our account. We avoid traditional banks to protect your privacy and provide better returns.",
          isFlag: false,
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // 4. CONFIDENCE / ROMANCE SCAMS
  // ─────────────────────────────────────────────
  {
    id: "romance",
    name: "Confidence & Romance Scams",
    icon: "💌",
    stats: {
      complaints: "10,188 elder victims in 2025",
      losses: "$584 million lost by elders in 2025",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Scammers build a fake romantic or friendly relationship over weeks or months, then ask for money once trust is established.",

    easy: [
      {
        id: "rom-e1",
        question:
          "You have been messaging someone on a dating site for three weeks. They say they are a doctor working overseas and can never video call due to poor internet. Now they say they have an emergency and need $2,000 wired to them. What should you do?",
        options: [
          { text: "Send the money — you have built a real connection", correct: false },
          { text: "Send a smaller amount as a compromise", correct: false },
          { text: "Refuse and stop contact — never send money to someone you have not met in person", correct: true },
          { text: "Ask them to pay you back when they return to the country", correct: false },
        ],
        explanation:
          "This follows the exact pattern of a romance scam: weeks of messages, excuses to avoid video calls, then a sudden financial emergency. Never send money to someone you have not met in person, no matter how close you feel.",
      },
    ],

    medium: [
      {
        id: "rom-m1",
        question:
          "Your online partner keeps planning to visit, then cancelling due to a sudden emergency — a medical bill, a stuck shipment — and each time needs money to resolve it. This has happened three times. What is occurring?",
        options: [
          { text: "They are genuinely unlucky and need your support", correct: false },
          { text: "A manufactured crisis cycle — each emergency is invented to extract money before a visit that will never happen", correct: true },
          { text: "They may be testing whether you truly care about them", correct: false },
          { text: "International travel has many unpredictable complications", correct: false },
        ],
        explanation:
          "The cycle of a planned visit followed by a last-minute financial emergency is the core structure of a romance scam. The visit never happens because the person does not exist as described. Each crisis is scripted to extract another payment.",
      },
      {
        id: "rom-m2",
        question:
          "An online friend asks you to receive money in your bank account and forward it on to another account, keeping a percentage for yourself. What is this?",
        options: [
          { text: "A legitimate way to earn extra income online", correct: false },
          { text: "Money laundering — you would be moving stolen funds and could face criminal charges", correct: true },
          { text: "A test of how much they can trust you", correct: false },
          { text: "A legal arrangement as long as you receive payment for it", correct: false },
        ],
        explanation:
          "This is money mule recruitment. The money moving through your account is stolen from other victims. Even if you did not know it was stolen, you can face serious criminal charges. Scammers use trusted contacts to distance themselves from the crime.",
      },
    ],

    hard: {
      id: "rom-h1",
      type: "messages",
      instruction:
        "Read this text message conversation. Tap the part that is the clearest red flag, then tap 'Show answers'.",
      from: "James Anderson — met on Facebook 6 weeks ago",
      subject: "Text message conversation",
      senderIsFlag: false,
      body: [
        {
          id: "rom-h1-s1",
          text: "Good morning. I wish I could video call but the satellite connection on the oil rig only allows text. I have booked my flight — I cannot wait to finally meet you next month.",
          isFlag: false,
        },
        {
          id: "rom-h1-s2",
          text: "Something terrible has happened. A worker was injured and I must pay his hospital fees upfront or I will lose my job. Could you wire $1,500 to an account in Malaysia? Please do not tell your daughter — she would not understand our connection. I will repay you the moment I arrive.",
          isFlag: true,
          reason:
            "A sudden financial emergency combined with a request to keep it secret from family are the clearest signs of a romance scam. The request to wire money internationally to someone you have never met means the money cannot be recovered.",
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // 5. GOVERNMENT IMPERSONATION
  // ─────────────────────────────────────────────
  {
    id: "govimpersonation",
    name: "Government Impersonation",
    icon: "🏛️",
    stats: {
      complaints: "8,628 elder victims in 2025",
      losses: "$413 million lost by elders in 2025",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Scammers pretending to be from the IRS, Social Security Administration, Medicare, or law enforcement to frighten you into paying money.",

    easy: [
      {
        id: "gov-e1",
        question:
          "You get a call from someone claiming to be an IRS agent. They say you owe back taxes and will be arrested within hours if you do not pay immediately by gift card. What should you do?",
        options: [
          { text: "Pay with gift cards immediately to avoid arrest", correct: false },
          { text: "Ask them to call back tomorrow so you can gather funds", correct: false },
          { text: "Hang up — the IRS never calls with arrest threats and never accepts gift cards", correct: true },
          { text: "Give them your credit card number instead of gift cards", correct: false },
        ],
        explanation:
          "The IRS always contacts you by mail first and never threatens immediate arrest by phone. The IRS also never accepts gift cards, wire transfers, or cryptocurrency as payment. Phone threats combined with gift card demands are definitive signs of a scam.",
      },
    ],

    medium: [
      {
        id: "gov-m1",
        question:
          "A caller says your Medicare number was compromised and you need a new one. To send it they need your Medicare number, Social Security number, and bank account to verify your identity. What are they actually doing?",
        options: [
          { text: "Verifying your identity to protect your account", correct: false },
          { text: "Collecting three pieces of information needed to steal your identity and drain your accounts", correct: true },
          { text: "Following a standard Medicare security procedure", correct: false },
          { text: "Protecting you from the person who already stole your number", correct: false },
        ],
        explanation:
          "Your Medicare number, Social Security number, and bank account together give a scammer everything needed to steal your identity. Medicare sends new cards by mail automatically — they never call to collect personal information.",
      },
      {
        id: "gov-m2",
        question:
          "A caller from 'Customs and Border Protection' says a package addressed to you was seized containing drugs and cash. You must pay a bond immediately to avoid federal charges. What should you do?",
        options: [
          { text: "Pay the bond — federal charges are very serious", correct: false },
          { text: "Hang up and report it to the real CBP at 1-877-227-5511", correct: true },
          { text: "Cooperate and ask for a lawyer before paying", correct: false },
          { text: "Pay a smaller amount to show good faith", correct: false },
        ],
        explanation:
          "Real federal agencies do not call civilians demanding bond payments over the phone. If you were genuinely under federal investigation you would be contacted through official legal channels, not a phone call asking for immediate payment.",
      },
    ],

    hard: {
      id: "gov-h1",
      type: "phone",
      instruction:
        "Read this voicemail transcript. Tap the part that is the biggest red flag, then tap 'Show answers'.",
      from: "Caller ID: Social Security Administration — 1-800-772-1213",
      subject: "Voicemail transcript",
      senderIsFlag: true,
      senderReason:
        "The real SSA number is 1-800-772-1213 — but caller ID can be spoofed to show any number, including legitimate government numbers.",
      body: [
        {
          id: "gov-h1-s1",
          text: "This is Officer Michael Davis from the Social Security Administration. Your Social Security number has been suspended after being linked to drug trafficking. A federal arrest warrant has been issued in your name.",
          isFlag: false,
        },
        {
          id: "gov-h1-s2",
          text: "To protect your assets, you must immediately withdraw your savings and convert them to Bitcoin at a local ATM. Do not contact your bank, attorney, or any family members — doing so may constitute obstruction of justice. Call back immediately at 1-888-555-0047.",
          isFlag: true,
          reason:
            "No government agency ever instructs you to buy Bitcoin or withdraw cash. Threatening 'obstruction of justice' for speaking to a lawyer is designed to isolate you. The callback number also differs from the caller ID — a clear indicator of fraud.",
        },
      ],
    },
  },
];