// scamData.js
//
// Each scam has a BANK of questions per difficulty — the quiz picks randomly
// so it is different every time.
//
// Easy:   3 questions in bank — quiz picks 1
// Medium: 4 questions in bank — quiz picks 2
// Hard:   3 scenarios in bank — quiz picks 1
//
// Hard mode instructions accurately state the number of red flags
// in that specific scenario (1 or 2).
//
// No "both/all of the above" answer options anywhere.

// ─── Shuffle helper ───────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Raw scam bank ────────────────────────────────────────────────────────────
const SCAM_BANK = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1. PHISHING & SPOOFING
  // ───────────────────────────────────────────────────────────────────────────
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

    easyBank: [
      {
        id: "ph-e1",
        question:
          "You get a text: 'USPS Alert: Your package is on hold. Pay a $3.50 redelivery fee: usps-delivery-help.net'. What should you do?",
        options: [
          {
            text: "Pay the fee — it is only $3.50 and the package sounds important",
            correct: false,
          },
          {
            text: "Go to usps.com yourself to check your deliveries",
            correct: true,
          },
          {
            text: "Click the link to see if the package is real",
            correct: false,
          },
          {
            text: "Call the number in the text to ask about the package",
            correct: false,
          },
        ],
        explanation:
          "'usps-delivery-help.net' is not the official USPS site. Small fees are used as a hook — once you enter your card details, scammers have your card number. Always type the official website address yourself.",
      },
      {
        id: "ph-e2",
        question:
          "You receive an email from 'Apple Support' saying your Apple ID has been locked and you must click a link to unlock it within 24 hours. What should you do?",
        options: [
          {
            text: "Click the link and log in before your account is locked",
            correct: false,
          },
          {
            text: "Go directly to apple.com yourself and check your account",
            correct: true,
          },
          {
            text: "Reply to the email asking for more information",
            correct: false,
          },
          { text: "Call the phone number in the email", correct: false },
        ],
        explanation:
          "Legitimate companies never send urgent emails demanding you click a link to avoid account closure. Always go to the official website by typing it yourself — never through a link in an email you did not request.",
      },
      {
        id: "ph-e3",
        question:
          "You get a text saying you have won a $500 gift card and need to click a link to claim it within 2 hours. You did not enter any contest. What should you do?",
        options: [
          { text: "Click quickly before the offer expires", correct: false },
          { text: "Forward it to a friend who might want it", correct: false },
          {
            text: "Delete it — you cannot win a contest you never entered",
            correct: true,
          },
          {
            text: "Click the link to see if it is real before deciding",
            correct: false,
          },
        ],
        explanation:
          "Unsolicited prize texts are almost always phishing attempts. Clicking the link may install malware or take you to a fake page that steals your personal information. If you did not enter a contest, you did not win one.",
      },
    ],

    mediumBank: [
      {
        id: "ph-m1",
        question:
          "Your phone shows 'Social Security Administration' as the caller. The person says your Social Security number has been suspended and demands immediate verification. What is most likely happening?",
        options: [
          {
            text: "A real SSA alert — you should cooperate and verify your information",
            correct: false,
          },
          {
            text: "Caller ID spoofing — scammers can fake the name that appears on your phone",
            correct: true,
          },
          { text: "A routine government security check", correct: false },
          {
            text: "An automated system that called the wrong number",
            correct: false,
          },
        ],
        explanation:
          "Caller ID can be faked — this is called spoofing. The real SSA will never call threatening suspension or demanding immediate verification. Hang up and call SSA yourself at 1-800-772-1213.",
      },
      {
        id: "ph-m2",
        question:
          "An email warns your account will close in 48 hours unless you confirm your password. The sending address is 'security@gmail-accounts-verify.com'. What is the biggest clue this is a scam?",
        options: [
          {
            text: "Real companies never send emails about account security",
            correct: false,
          },
          {
            text: "Legitimate companies always give more than 48 hours notice",
            correct: false,
          },
          {
            text: "The sending address uses a fake domain, not the real gmail.com",
            correct: true,
          },
          {
            text: "The email did not address you by your full name",
            correct: false,
          },
        ],
        explanation:
          "The domain 'gmail-accounts-verify.com' is fake — Google emails only come from @google.com or @accounts.google.com. Always check the full sending address, not just the display name.",
      },
      {
        id: "ph-m3",
        question:
          "A text message from your bank says there has been suspicious activity on your account and provides a phone number to call immediately. What should you do?",
        options: [
          {
            text: "Call the number in the text immediately — the threat sounds urgent",
            correct: false,
          },
          {
            text: "Call the number on the back of your bank card or on the bank's official website",
            correct: true,
          },
          {
            text: "Reply to the text to confirm your identity",
            correct: false,
          },
          {
            text: "Click the link in the text to see your account",
            correct: false,
          },
        ],
        explanation:
          "Scammers send fake bank alerts to get you to call their fake number. Always find your bank's contact number independently — on the back of your debit card or the official website — never from a number in an unsolicited text.",
      },
      {
        id: "ph-m4",
        question:
          "You receive a voicemail from 'Amazon' saying a $799 purchase was made on your account and asking you to press 1 or call a number to cancel it. You did not make this purchase. What should you do?",
        options: [
          {
            text: "Press 1 to speak to someone about the charge immediately",
            correct: false,
          },
          {
            text: "Log in to your real Amazon account directly to check your orders",
            correct: true,
          },
          {
            text: "Call back the number left in the voicemail",
            correct: false,
          },
          {
            text: "Give them your account details to verify the charge is fraudulent",
            correct: false,
          },
        ],
        explanation:
          "This is a common phishing voicemail designed to frighten you into calling a fake number. Log in to amazon.com directly — if there is no suspicious order, the call was fake. Amazon will never ask for personal details over a cold call.",
      },
    ],

    hardBank: [
      {
        id: "ph-h1",
        type: "email",
        instruction:
          "Read this email carefully. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
        from: "medicare-benefits@medicare-gov-portal.com",
        subject:
          "URGENT: Your Medicare Benefits Require Immediate Verification",
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
      {
        id: "ph-h2",
        type: "email",
        instruction:
          "Read this email. There is 1 red flag — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "noreply@paypal-secure-alerts.com",
        subject: "Your PayPal account has been limited",
        senderIsFlag: true,
        senderReason:
          "'paypal-secure-alerts.com' is not a PayPal domain. Real PayPal emails come from @paypal.com only.",
        body: [
          {
            id: "ph-h2-s1",
            text: "We noticed unusual activity on your PayPal account. Your account has been temporarily limited until you complete a security check.",
            isFlag: false,
          },
          {
            id: "ph-h2-s2",
            text: "Please click the button below to restore access. This is routine and takes less than 2 minutes.",
            isFlag: false,
          },
        ],
      },
      {
        id: "ph-h3",
        type: "email",
        instruction:
          "Read this email. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
        from: "support@irs-refund-portal.net",
        subject: "You have a pending tax refund of $2,847.00",
        senderIsFlag: true,
        senderReason:
          "'irs-refund-portal.net' is a fake domain. The IRS only contacts taxpayers by mail, never by unsolicited email.",
        body: [
          {
            id: "ph-h3-s1",
            text: "Congratulations! Our records show you are entitled to a federal tax refund of $2,847.00 for the previous tax year.",
            isFlag: false,
          },
          {
            id: "ph-h3-s2",
            text: "To receive your refund within 3 business days, please provide your Social Security number, bank routing number, and account number using the secure form below. You must respond within 48 hours or the refund will be forfeited.",
            isFlag: true,
            reason:
              "The IRS never emails requesting your bank account details to deliver a refund. Legitimate refunds are issued automatically by mail or direct deposit based on your tax return — they never ask you to submit banking information in response to an email.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2. TECH SUPPORT SCAMS
  // ───────────────────────────────────────────────────────────────────────────
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

    easyBank: [
      {
        id: "ts-e1",
        question:
          "A full-screen pop-up appears: 'CRITICAL VIRUS DETECTED. Call Microsoft Support now: 1-888-555-0192.' Your computer plays an alarm. What should you do?",
        options: [
          {
            text: "Call the number immediately — this sounds serious",
            correct: false,
          },
          {
            text: "Restart your computer or close your browser — Microsoft never sends pop-up warnings with phone numbers",
            correct: true,
          },
          {
            text: "Give them remote access so they can fix it quickly",
            correct: false,
          },
          { text: "Pay the virus removal fee shown on screen", correct: false },
        ],
        explanation:
          "Microsoft, Apple, and other tech companies never send pop-up alerts with phone numbers. The alarm is designed to frighten you. Simply restarting your computer or closing your browser ends the pop-up safely.",
      },
      {
        id: "ts-e2",
        question:
          "Someone calls saying they are from your internet provider and have detected that your router is sending out viruses. They want to fix it remotely. What should you do?",
        options: [
          {
            text: "Allow them access — internet providers do monitor for problems",
            correct: false,
          },
          {
            text: "Hang up and call your actual internet provider using the number on your bill",
            correct: true,
          },
          {
            text: "Let them connect briefly to prove the problem is real",
            correct: false,
          },
          {
            text: "Give them your account number to verify they are from your provider",
            correct: false,
          },
        ],
        explanation:
          "Internet providers do not call customers unsolicited to fix router problems. This is a common tech support scam. Always verify by calling the number on your bill or official website — never trust a number the caller gives you.",
      },
      {
        id: "ts-e3",
        question:
          "You see a pop-up saying your McAfee subscription has expired and your computer is at risk. It shows a phone number to call. You do not use McAfee. What should you do?",
        options: [
          {
            text: "Call the number — the warning still might be real",
            correct: false,
          },
          { text: "Buy McAfee to be safe", correct: false },
          {
            text: "Close the pop-up and run your actual antivirus software if you have it",
            correct: true,
          },
          {
            text: "Click the link to see more details about the problem",
            correct: false,
          },
        ],
        explanation:
          "Pop-ups warning that your subscription expired are almost always fake — especially for software you do not have. Close the pop-up or restart your browser. Legitimate antivirus warnings appear in the software itself, not in your browser.",
      },
    ],

    mediumBank: [
      {
        id: "ts-m1",
        question:
          "A tech support caller says they will refund $500 but accidentally sends $5,000 and asks you to wire back the difference. What is this?",
        options: [
          {
            text: "A genuine mistake — wire the extra back to be honest",
            correct: false,
          },
          {
            text: "An overpayment scam — the deposit will bounce and you will lose the money you wire back",
            correct: true,
          },
          {
            text: "A loyalty reward from a legitimate tech company",
            correct: false,
          },
          { text: "A trustworthiness test from the company", correct: false },
        ],
        explanation:
          "They deposit a fake check that appears in your account temporarily, then convince you to wire back the 'excess'. The original deposit bounces and you lose the money you sent — which was real.",
      },
      {
        id: "ts-m2",
        question:
          "A tech support agent asks you to install 'AnyDesk' so they can fix your computer remotely. Why is this dangerous even though AnyDesk is a real program?",
        options: [
          {
            text: "AnyDesk contains viruses that will infect your computer",
            correct: false,
          },
          {
            text: "Installing any new software costs unexpected money",
            correct: false,
          },
          {
            text: "Remote access gives the scammer full control of your computer, including any open bank accounts",
            correct: true,
          },
          {
            text: "It will permanently slow down your computer",
            correct: false,
          },
        ],
        explanation:
          "AnyDesk is a legitimate program — but in a scammer's hands it gives complete control of your computer. They can open your bank site, transfer funds, and steal passwords while you watch. Never install remote access software at the request of an unsolicited caller.",
      },
      {
        id: "ts-m3",
        question:
          "You paid $300 to a tech support company to remove a virus. A month later they call again saying the virus has returned and you need to pay again. What should you do?",
        options: [
          { text: "Pay again — the same virus can return", correct: false },
          {
            text: "Refuse and contact your real antivirus provider or a local technician to verify",
            correct: true,
          },
          { text: "Pay half as a compromise", correct: false },
          {
            text: "Ask them to prove the virus is there before paying",
            correct: false,
          },
        ],
        explanation:
          "Scammers who have already gotten money from you will often call back claiming the problem returned. A legitimate antivirus fix does not require repeat payments for the same issue. Contact a trusted local technician or your actual antivirus provider independently.",
      },
      {
        id: "ts-m4",
        question:
          "A caller from 'Windows Technical Department' says your computer has been sending error messages to Microsoft and they need to show you proof. They ask you to press Windows key + R and type a command. What should you do?",
        options: [
          {
            text: "Follow their instructions — Microsoft does monitor computers for errors",
            correct: false,
          },
          {
            text: "Hang up — Microsoft does not call users unsolicited, and running commands gives scammers access",
            correct: true,
          },
          {
            text: "Follow the steps but do not give them any personal information",
            correct: false,
          },
          {
            text: "Ask them to email the proof first before doing anything",
            correct: false,
          },
        ],
        explanation:
          "Microsoft never calls users unsolicited. Running commands at a stranger's request can install malware or open a backdoor to your computer. This is a classic social engineering technique — the 'proof' they show you is designed to look alarming but is actually normal system information.",
      },
    ],

    hardBank: [
      {
        id: "ts-h1",
        type: "phone",
        instruction:
          "Read this phone call transcript. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
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
      {
        id: "ts-h2",
        type: "email",
        instruction:
          "Read this email. There is 1 red flag in the message body — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "support@windows-security-center.com",
        subject: "Security Alert: Suspicious Login Detected on Your PC",
        senderIsFlag: false,
        body: [
          {
            id: "ts-h2-s1",
            text: "We have detected unauthorized access to your Windows computer from an IP address in Eastern Europe. Your files and banking information may be at risk.",
            isFlag: false,
          },
          {
            id: "ts-h2-s2",
            text: "To secure your computer immediately, please call our certified technicians at 1-888-555-0234 and provide your Windows license key and the last four digits of your Social Security number so we can verify your identity.",
            isFlag: true,
            reason:
              "Asking you to call a number and provide your Windows license key and Social Security digits is the core of a tech support scam. Microsoft never requests your SSN for computer support. This information would be used to steal your identity.",
          },
        ],
      },
      {
        id: "ts-h3",
        type: "phone",
        instruction:
          "Read this phone call transcript. There is 1 red flag — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "Caller ID: Apple Support — 1-800-275-2273",
        subject: "Incoming call transcript",
        senderIsFlag: true,
        senderReason:
          "This caller ID matches Apple's real support number, but caller ID can be spoofed. Apple never calls users unsolicited about account security.",
        body: [
          {
            id: "ts-h3-s1",
            text: "Hi, this is Jessica from Apple Support. We have detected that your iCloud account has been accessed from a device in China and your photos and documents may have been copied.",
            isFlag: false,
          },
          {
            id: "ts-h3-s2",
            text: "To secure your account right now I need you to disable your two-factor authentication so I can push a security patch directly to your device. This will only take two minutes.",
            isFlag: true,
            reason:
              "Asking you to disable two-factor authentication is a major red flag. This is the exact opposite of what any real security team would ask — it removes protection from your account. A scammer asking for this wants full access to your Apple account.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3. INVESTMENT FRAUD
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: "investment",
    name: "Investment Fraud",
    icon: "📈",
    stats: {
      complaints: "16,926 elder victims in 2025",
      losses:
        "$3.52 billion lost by elders in 2025 — the single largest loss category",
      source: "FBI IC3 2025 Annual Report",
    },
    description:
      "Fake investment opportunities — often in cryptocurrency — that promise high returns and steal your life savings.",

    easyBank: [
      {
        id: "inv-e1",
        question:
          "Someone on Facebook offers a cryptocurrency investment returning 40% every month with zero risk. What should you do?",
        options: [
          { text: "Invest a small amount first to test it", correct: false },
          {
            text: "Decline — guaranteed high returns with no risk do not exist in any real investment",
            correct: true,
          },
          {
            text: "Ask for references from other customers before deciding",
            correct: false,
          },
          { text: "Only invest money you can afford to lose", correct: false },
        ],
        explanation:
          "No investment can legally guarantee high returns with zero risk — that promise alone proves it is a scam. Legitimate financial advisors are registered professionals who never solicit strangers through social media.",
      },
      {
        id: "inv-e2",
        question:
          "A stranger on a dating app says they made a fortune in cryptocurrency and offers to teach you their method. They send you a link to a trading platform you have never heard of. What should you do?",
        options: [
          { text: "Try a small investment to see if it works", correct: false },
          {
            text: "Ask them to teach you without investing money first",
            correct: false,
          },
          {
            text: "Decline and stop contact — this is a classic pig butchering scam setup",
            correct: true,
          },
          {
            text: "Research the platform they recommend before investing",
            correct: false,
          },
        ],
        explanation:
          "Building a fake relationship before introducing a fraudulent investment is called a pig butchering scam. The platform they direct you to is fake — any money deposited disappears. The romantic connection is entirely manufactured to build trust.",
      },
      {
        id: "inv-e3",
        question:
          "You see a social media ad showing a celebrity endorsing a cryptocurrency that will 'triple your money in 30 days'. What should you do?",
        options: [
          { text: "Invest quickly before the offer ends", correct: false },
          {
            text: "Check if the celebrity actually endorsed it — if they did it must be real",
            correct: false,
          },
          {
            text: "Ignore it — celebrity crypto endorsements in ads are almost always fake or paid promotions for scams",
            correct: true,
          },
          { text: "Invest a small amount to test the claim", correct: false },
        ],
        explanation:
          "Scammers frequently use fake celebrity images or real paid posts to promote fraudulent investments. Even if a celebrity is shown, the investment may still be a scam. No legitimate investment guarantees tripling your money in 30 days.",
      },
    ],

    mediumBank: [
      {
        id: "inv-m1",
        question:
          "You put $10,000 into a crypto platform an online contact recommended. The platform shows $40,000 but asks for an $8,000 'government tax' before you can withdraw. What should you do?",
        options: [
          {
            text: "Pay the tax — it sounds like a real legal requirement",
            correct: false,
          },
          {
            text: "Do not pay — the profits are fake and the tax fee will disappear too",
            correct: true,
          },
          { text: "Pay half the tax as a compromise", correct: false },
          {
            text: "Contact the platform's customer support to dispute the charge",
            correct: false,
          },
        ],
        explanation:
          "The platform, the profits, and the 'tax' are all fake. No legitimate investment requires you to pre-pay taxes to withdraw your own money. This is the final stage of a pig butchering scam.",
      },
      {
        id: "inv-m2",
        question:
          "You lost money in a crypto scam. Someone contacts you saying they are a recovery specialist who can get your money back for an upfront fee. What is this?",
        options: [
          {
            text: "A legitimate service — crypto recovery specialists do exist",
            correct: false,
          },
          {
            text: "A recovery scam targeting people who already lost money",
            correct: true,
          },
          {
            text: "A government compensation program you should apply for",
            correct: false,
          },
          { text: "A law firm willing to take your case", correct: false },
        ],
        explanation:
          "Recovery scams specifically target people who have already lost money, knowing they are desperate. No legitimate recovery service charges upfront fees. In 2025, recovery scams caused $1.4 billion in additional losses to existing victims.",
      },
      {
        id: "inv-m3",
        question:
          "A financial advisor you met at a community event promises 12% annual returns guaranteed on a private investment fund. He says the opportunity is only available to a select group. What should you do?",
        options: [
          {
            text: "Invest — 12% sounds reasonable for a private fund",
            correct: false,
          },
          {
            text: "Verify they are a registered investment advisor at investor.gov before doing anything",
            correct: true,
          },
          {
            text: "Ask friends from the community event if they are investing",
            correct: false,
          },
          {
            text: "Invest a smaller amount to test the returns",
            correct: false,
          },
        ],
        explanation:
          "No investment can guarantee a fixed return — promising one is illegal. The 'exclusive group' framing is a classic Ponzi scheme tactic. Always verify any financial advisor is registered at investor.gov before giving them money.",
      },
      {
        id: "inv-m4",
        question:
          "An online contact asks you to convert your savings to cryptocurrency and send it to a 'secure wallet' they will manage for you, promising to double it in 60 days. What should you do?",
        options: [
          {
            text: "Send it — cryptocurrency is a legitimate investment",
            correct: false,
          },
          {
            text: "Refuse — sending crypto to someone else's wallet means you lose control of it permanently",
            correct: true,
          },
          { text: "Send half and keep half as a precaution", correct: false },
          {
            text: "Ask for their credentials first before sending",
            correct: false,
          },
        ],
        explanation:
          "Cryptocurrency transfers cannot be reversed. Sending crypto to someone else's wallet means you have given them your money permanently. Doubling money in 60 days is not possible in any legitimate investment.",
      },
    ],

    hardBank: [
      {
        id: "inv-h1",
        type: "email",
        instruction:
          "Read this investment email. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
        from: "robert.chen@goldpathcapital-partners.net",
        subject: "Private Invitation: Exclusive Retirement Growth Opportunity",
        senderIsFlag: true,
        senderReason:
          "'goldpathcapital-partners.net' is not a registered investment firm. Verify any firm at investor.gov before sending money.",
        body: [
          {
            id: "inv-h1-s1",
            text: "A mutual friend mentioned you are looking for better returns on your retirement savings. Our exclusive cryptocurrency fund has returned 25 to 40 percent every month for the past year. This opportunity is open for the next 48 hours only.",
            isFlag: true,
            reason:
              "25% monthly equals over 1,300% per year — no legitimate investment achieves this, and claiming it is illegal. The 48-hour deadline is designed to stop you from researching or asking a financial advisor.",
          },
          {
            id: "inv-h1-s2",
            text: "To get started, wire your funds directly to our account. We avoid traditional banks to protect your privacy and provide better returns.",
            isFlag: false,
          },
        ],
      },
      {
        id: "inv-h2",
        type: "messages",
        instruction:
          "Read this text message conversation. There is 1 red flag — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "Linda (met on Facebook group 3 weeks ago)",
        subject: "Text message conversation",
        senderIsFlag: false,
        body: [
          {
            id: "inv-h2-s1",
            text: "I know we just met but I wanted to share something that changed my life. I have been using this crypto platform my cousin introduced me to and made $18,000 in two months. I can show you exactly how to do it.",
            isFlag: false,
          },
          {
            id: "inv-h2-s2",
            text: "You just need to deposit $5,000 to start — I will manage the account for you and send you the profits weekly. You can withdraw anytime. Here is the link to register: crypto-wealth-global.net",
            isFlag: true,
            reason:
              "Asking you to give someone else control of your investment account is a serious red flag. Legitimate investments are managed by registered professionals through regulated platforms, not strangers on social media using unverified websites.",
          },
        ],
      },
      {
        id: "inv-h3",
        type: "email",
        instruction:
          "Read this investment email. There is 1 red flag in the message body — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "newsletter@wealthadvisorspro.org",
        subject: "Inside tip: Stock about to surge 500% — act before Friday",
        senderIsFlag: false,
        body: [
          {
            id: "inv-h3-s1",
            text: "Our team of analysts has identified a small-cap pharmaceutical company that is about to receive FDA approval for a major drug. Our sources indicate a 400 to 500 percent price increase is imminent.",
            isFlag: false,
          },
          {
            id: "inv-h3-s2",
            text: "This information is not yet public. You must purchase shares before Friday's announcement or you will miss the opportunity entirely. This tip has been shared with only 200 subscribers. Act now.",
            isFlag: true,
            reason:
              "Trading on non-public information is insider trading — it is illegal. Emails claiming to share exclusive tips about imminent stock surges are either pump-and-dump schemes or outright fraud. The urgency and secrecy are designed to stop you from thinking critically.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4. CONFIDENCE & ROMANCE SCAMS
  // ───────────────────────────────────────────────────────────────────────────
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

    easyBank: [
      {
        id: "rom-e1",
        question:
          "You have been messaging someone on a dating site for three weeks. They say they are a doctor overseas and can never video call. Now they say they have an emergency and need $2,000 wired. What should you do?",
        options: [
          {
            text: "Send the money — you have built a real connection",
            correct: false,
          },
          { text: "Send a smaller amount as a compromise", correct: false },
          {
            text: "Refuse and stop contact — never send money to someone you have not met in person",
            correct: true,
          },
          { text: "Ask them to pay you back when they return", correct: false },
        ],
        explanation:
          "This follows the exact pattern of a romance scam: weeks of messages, excuses to avoid video calls, then a sudden financial emergency. Never send money to someone you have not met in person, no matter how close you feel.",
      },
      {
        id: "rom-e2",
        question:
          "An online friend you have never met in person asks if they can send you a large check to deposit and forward the money to someone else, keeping some for yourself. What should you do?",
        options: [
          {
            text: "Agree — it seems like easy money for a small favour",
            correct: false,
          },
          {
            text: "Refuse — this is money laundering and you could face criminal charges",
            correct: true,
          },
          {
            text: "Only agree if you trust them based on your conversations",
            correct: false,
          },
          {
            text: "Ask to see the check first before deciding",
            correct: false,
          },
        ],
        explanation:
          "This is money mule recruitment. The check is fake and will bounce, but the money you forwarded was real. Even if you did not know the funds were stolen, forwarding them makes you legally liable.",
      },
      {
        id: "rom-e3",
        question:
          "You have been talking to someone online for a month and feel a real connection. They finally agree to video call but the video is very blurry and their face is hard to see. What does this most likely mean?",
        options: [
          {
            text: "They have a slow internet connection — this is normal",
            correct: false,
          },
          {
            text: "They may be using a pre-recorded or AI-generated video to avoid showing their real face",
            correct: true,
          },
          {
            text: "They are shy and nervous about video calling",
            correct: false,
          },
          { text: "Their camera is old", correct: false },
        ],
        explanation:
          "Scammers use pre-recorded videos, AI face-swapping tools, or deliberately poor quality streams to avoid showing who they really are. A genuine person who wants to meet you will find a way to video call clearly. Always insist on a real-time call where they hold up something you write.",
      },
    ],

    mediumBank: [
      {
        id: "rom-m1",
        question:
          "Your online partner keeps planning to visit then cancelling due to emergencies, each time needing money. This has happened three times. What is occurring?",
        options: [
          {
            text: "They are genuinely unlucky and need your support",
            correct: false,
          },
          {
            text: "A manufactured crisis cycle — each emergency is invented to extract money before a visit that will never happen",
            correct: true,
          },
          {
            text: "They may be testing whether you truly care about them",
            correct: false,
          },
          {
            text: "International travel has many unpredictable complications",
            correct: false,
          },
        ],
        explanation:
          "The cycle of a planned visit followed by a last-minute financial emergency is the core structure of a romance scam. The visit never happens because the person does not exist as described.",
      },
      {
        id: "rom-m2",
        question:
          "An online friend asks you to receive money in your bank account and forward it to another account, keeping a percentage for yourself. What is this?",
        options: [
          {
            text: "A legitimate way to earn extra income online",
            correct: false,
          },
          {
            text: "Money laundering — you would be moving stolen funds and could face criminal charges",
            correct: true,
          },
          { text: "A test of how much they can trust you", correct: false },
          {
            text: "A legal arrangement as long as you receive payment",
            correct: false,
          },
        ],
        explanation:
          "This is money mule recruitment. The money moving through your account is stolen from other victims. Even if you did not know it was stolen, you can face serious criminal charges.",
      },
      {
        id: "rom-m3",
        question:
          "Someone you met online says they work on an oil rig and will be back in three weeks. They have sent you gifts and are very attentive. Now they say a work accident happened and they need $3,000 for hospital fees. What should you do?",
        options: [
          {
            text: "Send the money — they have proven they care with the gifts",
            correct: false,
          },
          {
            text: "Refuse — the gifts and attention are part of the manipulation, not proof of a real relationship",
            correct: true,
          },
          {
            text: "Send half and explain you cannot afford more",
            correct: false,
          },
          {
            text: "Ask for proof of the accident before deciding",
            correct: false,
          },
        ],
        explanation:
          "Gifts in romance scams are a deliberate tactic called love bombing — they are designed to create a sense of obligation. The gifts often arrive through third parties and may themselves be part of a scam. Proof can also be faked.",
      },
      {
        id: "rom-m4",
        question:
          "A person you met on a dating app has a profile photo of an attractive professional. After weeks of messages, they say they are falling in love with you but still cannot video call. What should you do?",
        options: [
          {
            text: "Continue the relationship — some people are just camera shy",
            correct: false,
          },
          {
            text: "Reverse-image search their profile photo to see if it appears on other sites or belongs to someone else",
            correct: true,
          },
          {
            text: "Tell them you love them too and see what happens next",
            correct: false,
          },
          {
            text: "Ask for more photos to verify they are real",
            correct: false,
          },
        ],
        explanation:
          "Romance scammers steal attractive profile photos from real people's social media accounts. A reverse image search (right-click → Search image on Google) can reveal if the photo appears elsewhere online under a different name.",
      },
    ],

    hardBank: [
      {
        id: "rom-h1",
        type: "messages",
        instruction:
          "Read this text message conversation. There is 1 red flag — tap the part that is the clearest warning sign, then tap 'Show answers'.",
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
      {
        id: "rom-h2",
        type: "email",
        instruction:
          "Read this email from your online friend. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
        from: "captain.william.ford88@gmail.com",
        subject: "My darling — I need your help urgently",
        senderIsFlag: false,
        body: [
          {
            id: "rom-h2-s1",
            text: "My darling, I am writing with a heavy heart. I have been detained at customs in Dubai because my luggage contained items flagged for inspection. The official here says I need to pay a release fee of $2,200 to be cleared and allowed to fly home to you.",
            isFlag: true,
            reason:
              "Being detained at customs and needing a money transfer to be released is a classic romance scam script. Real customs processes do not work this way and would never require a personal wire transfer to an official.",
          },
          {
            id: "rom-h2-s2",
            text: "Please wire the money to this account immediately. I cannot call right now as my phone was taken during inspection. I will pay you back the moment I land. Please do not tell anyone — I am embarrassed and do not want my family to worry.",
            isFlag: true,
            reason:
              "Asking you to keep a financial request secret from family is a deliberate isolation tactic. Scammers know that family members are likely to recognize the scam and stop the transfer.",
          },
        ],
      },
      {
        id: "rom-h3",
        type: "messages",
        instruction:
          "Read this WhatsApp conversation. There is 1 red flag — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "Dr. Sarah Collins — met on LinkedIn 5 weeks ago",
        subject: "WhatsApp conversation",
        senderIsFlag: false,
        body: [
          {
            id: "rom-h3-s1",
            text: "I hope you are having a wonderful day. I have been thinking about you so much. I have never connected with someone the way I connect with you — you are so different from anyone I have met.",
            isFlag: false,
          },
          {
            id: "rom-h3-s2",
            text: "I know this is fast but I want to send you a gift — a package with something special inside. My shipping agent just contacted me to say there is a customs clearance fee of $350 that needs to be paid before they can deliver it to you. Could you pay it and I will transfer you the money back tonight?",
            isFlag: true,
            reason:
              "Asking you to pay a fee to receive a gift you did not request is a well-known romance scam tactic. The gift does not exist. This is designed to extract a small amount of money first, with larger requests to follow once you have paid.",
          },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 5. GOVERNMENT IMPERSONATION
  // ───────────────────────────────────────────────────────────────────────────
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

    easyBank: [
      {
        id: "gov-e1",
        question:
          "You get a call from someone claiming to be an IRS agent saying you owe back taxes and will be arrested if you do not pay immediately by gift card. What should you do?",
        options: [
          {
            text: "Pay with gift cards immediately to avoid arrest",
            correct: false,
          },
          {
            text: "Ask them to call back tomorrow so you can gather funds",
            correct: false,
          },
          {
            text: "Hang up — the IRS never calls with arrest threats and never accepts gift cards",
            correct: true,
          },
          {
            text: "Give them your credit card number instead of gift cards",
            correct: false,
          },
        ],
        explanation:
          "The IRS always contacts you by mail first and never threatens immediate arrest by phone. The IRS also never accepts gift cards, wire transfers, or cryptocurrency. Phone threats combined with gift card demands are definitive signs of a scam.",
      },
      {
        id: "gov-e2",
        question:
          "You receive a robocall saying your Social Security benefits have been suspended due to suspicious activity and you must press 1 to speak with an officer. What should you do?",
        options: [
          {
            text: "Press 1 — this sounds like an urgent official matter",
            correct: false,
          },
          {
            text: "Hang up and call the Social Security Administration directly at 1-800-772-1213",
            correct: true,
          },
          {
            text: "Press 1 but refuse to give any personal information",
            correct: false,
          },
          {
            text: "Call back the number that appeared on your caller ID",
            correct: false,
          },
        ],
        explanation:
          "The Social Security Administration does not suspend benefits by robocall. This is a common scam — pressing 1 connects you to a scammer who will try to extract personal information or money. Always hang up and call the official SSA number independently.",
      },
      {
        id: "gov-e3",
        question:
          "Someone calls claiming to be a sheriff's deputy saying there is a warrant for your arrest for missing jury duty. They say you can avoid arrest by paying a fine immediately over the phone. What should you do?",
        options: [
          {
            text: "Pay the fine — missing jury duty is a serious legal matter",
            correct: false,
          },
          {
            text: "Hang up — real law enforcement does not call demanding immediate payment to avoid arrest",
            correct: true,
          },
          {
            text: "Ask them to send the warrant by email so you can verify it",
            correct: false,
          },
          {
            text: "Pay a smaller amount as a good faith gesture",
            correct: false,
          },
        ],
        explanation:
          "Real law enforcement officers do not call asking for payment over the phone to cancel an arrest warrant. If a warrant existed, officers would appear in person. This is a fear-based scam designed to pressure you into paying before you think clearly.",
      },
    ],

    mediumBank: [
      {
        id: "gov-m1",
        question:
          "A caller says your Medicare number was compromised and needs your Medicare number, Social Security number, and bank account to send a replacement. What are they doing?",
        options: [
          {
            text: "Verifying your identity to protect your account",
            correct: false,
          },
          {
            text: "Collecting three pieces of information needed to steal your identity and drain your accounts",
            correct: true,
          },
          {
            text: "Following a standard Medicare security procedure",
            correct: false,
          },
          {
            text: "Protecting you from the person who already stole your number",
            correct: false,
          },
        ],
        explanation:
          "Your Medicare number, Social Security number, and bank account together give a scammer everything needed to steal your identity. Medicare sends new cards by mail — they never call to collect personal information.",
      },
      {
        id: "gov-m2",
        question:
          "A caller from 'Customs and Border Protection' says a package addressed to you was seized containing drugs. You must pay a bond immediately to avoid federal charges. What should you do?",
        options: [
          {
            text: "Pay the bond — federal charges are very serious",
            correct: false,
          },
          {
            text: "Hang up and report it to the real CBP at 1-877-227-5511",
            correct: true,
          },
          {
            text: "Cooperate and ask for a lawyer before paying",
            correct: false,
          },
          { text: "Pay a smaller amount to show good faith", correct: false },
        ],
        explanation:
          "Real federal agencies do not call civilians demanding bond payments over the phone. If you were genuinely under federal investigation you would be contacted through official legal channels.",
      },
      {
        id: "gov-m3",
        question:
          "You receive a letter that looks like it is from the IRS saying you owe $4,200 in back taxes and must pay within 10 days or face legal action. The letter includes a phone number to call. What should you do?",
        options: [
          {
            text: "Call the number on the letter immediately to resolve it",
            correct: false,
          },
          {
            text: "Look up the IRS at irs.gov or call 1-800-829-1040 to verify if you actually owe anything",
            correct: true,
          },
          {
            text: "Pay the amount by the deadline to avoid legal action",
            correct: false,
          },
          {
            text: "Ignore the letter — if it were real the IRS would have contacted you sooner",
            correct: false,
          },
        ],
        explanation:
          "Scammers send convincing-looking IRS letters. Always verify by contacting the IRS directly through their official website or phone number — never the number printed in a letter you received. The real IRS will have a record of any actual debt.",
      },
      {
        id: "gov-m4",
        question:
          "A caller claims to be from your state's Department of Motor Vehicles and says your license has been flagged and will be suspended unless you pay outstanding fees immediately by wire transfer. What should you do?",
        options: [
          {
            text: "Pay immediately — a suspended license would be a major problem",
            correct: false,
          },
          {
            text: "Ask for their badge number and call the DMV back using a number from the official state website",
            correct: true,
          },
          {
            text: "Pay a partial amount while you investigate",
            correct: false,
          },
          {
            text: "Give them your driver's license number to verify the issue",
            correct: false,
          },
        ],
        explanation:
          "Government agencies contact you by mail for fee issues and do not demand immediate wire transfers by phone. Always verify independently using contact information from the official government website — never information provided by the caller.",
      },
    ],

    hardBank: [
      {
        id: "gov-h1",
        type: "phone",
        instruction:
          "Read this voicemail transcript. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
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
      {
        id: "gov-h2",
        type: "email",
        instruction:
          "Read this email claiming to be from Medicare. There is 1 red flag in the body — tap the part you think is suspicious, then tap 'Show answers'.",
        from: "benefits@medicare.gov.account-verify.com",
        subject: "Action Required: Annual Medicare Benefit Review",
        senderIsFlag: true,
        senderReason:
          "The domain 'medicare.gov.account-verify.com' is fake. Real Medicare emails come from @cms.hhs.gov or @medicare.gov only.",
        body: [
          {
            id: "gov-h2-s1",
            text: "Dear Medicare beneficiary, as part of our annual review process, we are updating records for all Medicare recipients in your area.",
            isFlag: false,
          },
          {
            id: "gov-h2-s2",
            text: "To ensure uninterrupted coverage, please confirm your Medicare ID, date of birth, and the name of your primary care physician by clicking the link below. Failure to complete this within 72 hours may result in a temporary suspension of your benefits.",
            isFlag: true,
            reason:
              "Medicare never threatens benefit suspension by email for failing to click a link. Asking for your Medicare ID and personal details by email is identity theft. The 72-hour threat is designed to panic you into acting before you think.",
          },
        ],
      },
      {
        id: "gov-h3",
        type: "phone",
        instruction:
          "Read this phone call transcript. There are 2 red flags — tap both parts you think are suspicious, then tap 'Show answers'.",
        from: "Caller ID: IRS Criminal Investigation — 1-202-317-3000",
        subject: "Phone call transcript",
        senderIsFlag: true,
        senderReason:
          "This caller ID appears to be an IRS number but caller ID can be spoofed. The IRS does not call to demand same-day payment.",
        body: [
          {
            id: "gov-h3-s1",
            text: "This is Agent Patricia Moore from IRS Criminal Investigation. We have identified discrepancies in your tax filings from 2021 to 2023 totalling $6,800 in unpaid taxes.",
            isFlag: false,
          },
          {
            id: "gov-h3-s2",
            text: "You must settle this today to avoid criminal prosecution. We accept payment by Google Play gift cards or wire transfer only — standard payment methods are not available for this type of enforcement case. If you hang up, a warrant will be issued within the hour.",
            isFlag: true,
            reason:
              "The IRS never accepts gift cards or demands same-day payment by phone to avoid criminal prosecution. Threatening immediate arrest if you hang up is a high-pressure tactic to prevent you from verifying the claim or consulting a lawyer.",
          },
        ],
      },
    ],
  },
];

// ─── Quiz-ready SCAMS export ──────────────────────────────────────────────────
// Transforms the bank into the format the quiz components expect.
// Each time this module is imported, the questions are freshly shuffled
// so the quiz is different every session.

export const SCAMS = SCAM_BANK.map((scam) => {
  const flagCount = (hard) =>
    (hard.senderIsFlag ? 1 : 0) + hard.body.filter((s) => s.isFlag).length;

  // Pick 1 easy, 2 medium, 1 hard — randomly each time
  const easy = shuffle(scam.easyBank).slice(0, 1);
  const medium = shuffle(scam.mediumBank).slice(0, 2);
  const hard = shuffle(scam.hardBank)[0];

  // Fix hard mode instruction to accurately reflect its flag count
  const count = flagCount(hard);
  const fixedInstruction =
    count === 1
      ? hard.instruction.replace(
          /There (?:is \d+|are \d+) red flag[s]?[^.]*\./,
          "There is 1 red flag — tap the part you think is suspicious, then tap 'Show answers'.",
        )
      : hard.instruction.replace(
          /There (?:is \d+|are \d+) red flag[s]?[^.]*\./,
          `There are ${count} red flags — tap both parts you think are suspicious, then tap 'Show answers'.`,
        );

  return {
    id: scam.id,
    name: scam.name,
    icon: scam.icon,
    stats: scam.stats,
    description: scam.description,
    easy,
    medium,
    hard: { ...hard, instruction: fixedInstruction },
  };
});
