// scamData.js
// All content for the Scam Shield elder education game.
// 5 scam types × 3 difficulty levels × 3 questions = 45 questions total for first draft
// Hard mode uses a highlight-the-red-flag format instead of multiple choice.
// built with the help of Claude to come up with scenarios.

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
          "You receive an email from 'Medicare' saying your benefits will be cancelled unless you confirm your Social Security number within 24 hours. What should you do?",
        options: [
          { text: "Reply with your Social Security number to protect your benefits", correct: false },
          { text: "Click the link in the email to verify your account", correct: false },
          { text: "Call Medicare directly at the official number (1-800-MEDICARE) to check", correct: true },
          { text: "Forward the email to your doctor for advice", correct: false },
        ],
        explanation:
          "Medicare will never email you threatening to cancel benefits. Always call the official number yourself — never use any phone number or link from the suspicious message itself.",
      },
      {
        id: "ph-e2",
        question:
          "An email from 'Your Bank Security Team' says there is suspicious activity on your account and asks you to click a link to verify. The email looks official with a real logo. What is the safest action?",
        options: [
          { text: "Click the link — it looks legitimate and has the right logo", correct: false },
          { text: "Reply asking them to call you instead", correct: false },
          { text: "Go to your bank's website by typing the address yourself in your browser", correct: true },
          { text: "Call the phone number listed at the bottom of the email", correct: false },
        ],
        explanation:
          "Logos and email designs can be copied perfectly by scammers. Always navigate to your bank by typing the address yourself, or call the number printed on the back of your bank card — never use contact details from the suspicious email.",
      },
      {
        id: "ph-e3",
        question:
          "You get a text message: 'USPS Alert: Your package is on hold. Pay a $3.50 redelivery fee to release it: usps-delivery-help.net'. What should you do?",
        options: [
          { text: "Pay the small fee — it is only $3.50 and the package sounds important", correct: false },
          { text: "Ignore it and go to usps.com directly to check your deliveries", correct: true },
          { text: "Click the link to see if the package is real", correct: false },
          { text: "Call the number in the text to ask about your package", correct: false },
        ],
        explanation:
          "The website 'usps-delivery-help.net' is not the official USPS site (usps.com). Small fees are used as a hook — once you enter your payment details, scammers have your card number. Always go directly to the official website.",
      },
    ],

    medium: [
      {
        id: "ph-m1",
        question:
          "You get a call and your phone shows 'Social Security Administration' as the caller. The person says your Social Security number has been suspended due to fraud and you must verify your identity immediately. What is happening?",
        options: [
          { text: "A real SSA alert — you should cooperate and verify your information", correct: false },
          { text: "Caller ID spoofing — scammers can fake the name that appears on your phone", correct: true },
          { text: "A test call from the government to check if you are alert", correct: false },
          { text: "A mistake — they called the wrong person", correct: false },
        ],
        explanation:
          "Caller ID can be faked — this is called spoofing. The real SSA will never call threatening suspension or demanding immediate verification. Hang up and call SSA yourself at 1-800-772-1213 to check if there is a real issue.",
      },
      {
        id: "ph-m2",
        question:
          "An email warns that your email account will be closed in 48 hours unless you log in to confirm your password. The sending address is 'security@gmail-accounts-verify.com'. Which detail reveals this is a scam?",
        options: [
          { text: "Real companies never send emails about account security", correct: false },
          { text: "The 48-hour deadline — real companies give you more time", correct: false },
          { text: "The sending address uses a fake domain, not the real gmail.com", correct: true },
          { text: "The email did not include your full name", correct: false },
        ],
        explanation:
          "The domain 'gmail-accounts-verify.com' is fake — Google emails only come from @google.com or @accounts.google.com. Scammers register convincing-sounding domains to trick you. Always check the full email address, not just the display name.",
      },
      {
        id: "ph-m3",
        question:
          "You receive an email saying you have won a $500 Amazon gift card and must click a link to claim it within 2 hours or it expires. You did not enter any contest. What tactic is being used?",
        options: [
          { text: "Urgency and false reward — designed to make you act before you think", correct: true },
          { text: "A real Amazon promotion — they do run surprise giveaways", correct: false },
          { text: "A loyalty reward for being a long-time customer", correct: false },
          { text: "An error — the email was meant for someone else", correct: false },
        ],
        explanation:
          "Creating a fake prize combined with an artificial deadline is a classic phishing tactic. The goal is to make you click before you have time to question whether it is real. Legitimate prizes do not expire in hours and do not require clicking links in unsolicited emails.",
      },
    ],

    hard: {
      id: "ph-h1",
      type: "email",
      instruction:
        "Read this email carefully and tap on every part that is a red flag. Then tap 'Show answers' to see how you did.",
      from: "medicare-benefits@medicare-gov-portal.com",
      subject: "URGENT: Your Medicare Benefits Require Immediate Verification",
      body: [
        {
          id: "ph-h1-s1",
          text: "Dear Medicare Member,",
          isFlag: false,
        },
        {
          id: "ph-h1-s2",
          text: "We have detected suspicious activity linked to your Medicare account and your benefits are at risk of immediate suspension.",
          isFlag: true,
          reason:
            "Creates fear and urgency to stop you from thinking clearly. Medicare does not send suspension threats by email.",
        },
        {
          id: "ph-h1-s3",
          text: "You must verify your identity within 24 hours to avoid interruption of your coverage.",
          isFlag: true,
          reason:
            "Artificial deadlines are a pressure tactic. Real agencies give you time and alternative ways to respond.",
        },
        {
          id: "ph-h1-s4",
          text: "Please click here to confirm your Social Security number, date of birth, and bank account details.",
          isFlag: true,
          reason:
            "Medicare will never ask for your Social Security number, date of birth, and bank account together over email. This combination is used for identity theft.",
        },
        {
          id: "ph-h1-s5",
          text: "Failure to respond will result in permanent cancellation of all Medicare services.",
          isFlag: true,
          reason:
            "This is a scare tactic. Medicare cannot permanently cancel benefits by email and would never threaten this.",
        },
        {
          id: "ph-h1-s6",
          text: "Medicare Benefits Security Department",
          isFlag: false,
        },
      ],
      senderIsFlag: true,
      senderReason:
        "'medicare-gov-portal.com' is a fake domain. Real Medicare emails come from medicare.gov only.",
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
          "A full-screen pop-up appears on your computer: 'CRITICAL VIRUS DETECTED. Do not close this window. Call Microsoft Support now: 1-888-555-0192.' Your computer makes an alarm sound. What should you do?",
        options: [
          { text: "Call the number immediately — this sounds serious", correct: false },
          { text: "Restart your computer or close your browser; Microsoft never sends pop-up warnings with phone numbers", correct: true },
          { text: "Give them remote access so they can fix it quickly", correct: false },
          { text: "Pay the virus removal fee shown on screen", correct: false },
        ],
        explanation:
          "Microsoft, Apple, and other tech companies never send pop-up alerts with phone numbers. These sounds and warnings are designed to frighten you. Simply restarting your computer or closing your browser ends the pop-up safely.",
      },
      {
        id: "ts-e2",
        question:
          "Someone calls saying they are from 'Windows Technical Support' and they can see error messages coming from your computer. They need remote access to fix it. What do you do?",
        options: [
          { text: "Give them remote access since they already know about your errors", correct: false },
          { text: "Hang up — Microsoft and Windows do not make unsolicited calls to customers", correct: true },
          { text: "Allow access to just one folder to be safe", correct: false },
          { text: "Ask them to call back tomorrow when your family member is there", correct: false },
        ],
        explanation:
          "Microsoft does not call customers proactively. Remote access gives scammers complete control of your computer — they can steal files, install malware, lock your computer, and access your bank accounts. Always hang up on unsolicited tech support calls.",
      },
      {
        id: "ts-e3",
        question:
          "A tech support caller says they fixed your computer problem and asks for payment of $299 by gift card — specifically an Amazon or Google Play gift card. What does this tell you?",
        options: [
          { text: "Gift cards are a normal payment method for tech services", correct: false },
          { text: "This is almost certainly a scam — legitimate businesses never ask for gift card payment", correct: true },
          { text: "It is convenient but you should ask for a discount first", correct: false },
          { text: "Only pay with a Google Play card, not Amazon, for safety", correct: false },
        ],
        explanation:
          "Asking for payment by gift card is one of the clearest signs of a scam. Gift cards cannot be refunded or traced, which is exactly why scammers prefer them. No legitimate tech company accepts gift cards as payment.",
      },
    ],

    medium: [
      {
        id: "ts-m1",
        question:
          "A tech support caller says they fixed your computer and will now refund $500 as a thank-you. They ask for your bank account details to send the refund. Then they say they accidentally sent $5,000 instead of $500 and ask you to wire back the difference. What is this?",
        options: [
          { text: "A genuine mistake — you should wire back the extra amount to be honest", correct: false },
          { text: "An overpayment scam — the $5,000 deposit will bounce and you will lose the money you wire", correct: true },
          { text: "A loyalty bonus from a legitimate tech company", correct: false },
          { text: "A test to see if you are trustworthy as a customer", correct: false },
        ],
        explanation:
          "This is a classic overpayment scam. They deposit a fake check that appears in your account temporarily, convince you to wire 'the excess' back, and then the original deposit bounces. You end up losing the money you wired, which was real.",
      },
      {
        id: "ts-m2",
        question:
          "During a tech support call, the agent asks you to install a program called 'AnyDesk' or 'TeamViewer' so they can fix your computer remotely. Why is this dangerous even if the program itself is real?",
        options: [
          { text: "Those programs contain viruses", correct: false },
          { text: "Installing any new software costs money", correct: false },
          { text: "Remote access tools give the scammer full control of your computer, including your files and any open bank websites", correct: true },
          { text: "It will slow down your computer permanently", correct: false },
        ],
        explanation:
          "AnyDesk and TeamViewer are real, legitimate programs — but in a scammer's hands they hand over complete control of your computer. While you watch, they can open your bank site, transfer funds, steal passwords, and plant malware. Never install remote access software at the request of an unsolicited caller.",
      },
      {
        id: "ts-m3",
        question:
          "A tech support caller says: 'Do not tell your family about this — it is a sensitive security matter and they could accidentally make it worse.' Why would a real tech support agent never say this?",
        options: [
          { text: "Family members often interfere with technical repairs", correct: false },
          { text: "Scammers isolate victims from family because family members are likely to recognize the scam and intervene", correct: true },
          { text: "It is standard security protocol to keep repairs private", correct: false },
          { text: "Your family could accidentally reveal your passwords", correct: false },
        ],
        explanation:
          "Isolation is a deliberate scam tactic. Scammers know that a family member or friend hearing the conversation would likely spot the fraud immediately. Any caller who asks you to keep the conversation secret from loved ones is a scammer.",
      },
    ],

    hard: {
      id: "ts-h1",
      type: "phone",
      instruction:
        "Read this phone call transcript and tap on every red flag. Then tap 'Show answers' to see how you did.",
      from: "Caller ID: Microsoft Support — 1-800-642-7676",
      subject: "Incoming call transcript",
      body: [
        {
          id: "ts-h1-s1",
          text: "Hello, this is David from Microsoft Security. Our servers have detected 47 critical errors being sent from your Windows computer.",
          isFlag: true,
          reason:
            "Microsoft cannot monitor individual home computers remotely. The specific-sounding number (47 errors) is invented to sound credible.",
        },
        {
          id: "ts-h1-s2",
          text: "If we do not act in the next 20 minutes, hackers will gain access to your online banking.",
          isFlag: true,
          reason:
            "Artificial urgency with a short deadline is a pressure tactic designed to prevent you from pausing, researching, or calling a family member.",
        },
        {
          id: "ts-h1-s3",
          text: "I need you to download a program called AnyDesk so I can connect to your computer and stop the attack.",
          isFlag: true,
          reason:
            "Remote access software gives the caller complete control of your computer. Never install software at the request of an unsolicited caller.",
        },
        {
          id: "ts-h1-s4",
          text: "The repair fee is $299, payable in Google Play gift cards for our secure payment system.",
          isFlag: true,
          reason:
            "Gift card payment is one of the most reliable signs of a scam. No legitimate company uses gift cards as a payment method.",
        },
        {
          id: "ts-h1-s5",
          text: "Please do not mention this to your children or other family — they are not security-cleared to know about this issue.",
          isFlag: true,
          reason:
            "Isolating you from family is intentional. A real support agent would have no reason to keep a technical repair secret from your loved ones.",
        },
        {
          id: "ts-h1-s6",
          text: "Once we fix this, your computer will be fully protected and we will monitor it for free for life.",
          isFlag: true,
          reason:
            "Promises of lifetime free monitoring are unrealistic and used to make the offer sound more valuable than it is.",
        },
      ],
      senderIsFlag: true,
      senderReason:
        "Caller ID can be faked. Scammers can make any name or number appear on your screen, including real Microsoft numbers.",
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
          "Someone contacts you on Facebook offering a cryptocurrency investment that returns 40% every month with zero risk. They say they can manage your money for you. What should you do?",
        options: [
          { text: "Invest a small amount first to test it", correct: false },
          { text: "Decline — guaranteed high returns with no risk do not exist and this is a fraud warning sign", correct: true },
          { text: "Ask for references from other customers before investing", correct: false },
          { text: "Invest only money you can afford to lose", correct: false },
        ],
        explanation:
          "No investment can legally guarantee high returns with zero risk — that promise alone proves it is a scam. Legitimate financial advisors are registered professionals who never solicit strangers through social media.",
      },
      {
        id: "inv-e2",
        question:
          "You see an online video of a famous celebrity saying they doubled their retirement savings using a new cryptocurrency platform and encouraging viewers to join. What should you do before investing?",
        options: [
          { text: "Invest — a celebrity would not risk their reputation on a scam", correct: false },
          { text: "Search the celebrity's name along with the platform name and the word 'scam' to check if it is fake", correct: true },
          { text: "Invest a small amount since the celebrity seems trustworthy", correct: false },
          { text: "Share the video with friends so they can benefit too", correct: false },
        ],
        explanation:
          "AI can now create convincing fake videos of celebrities. In 2025, investment scams using AI-generated celebrity endorsements caused over $632 million in losses. Always search to verify before acting on any investment advice from a video.",
      },
      {
        id: "inv-e3",
        question:
          "A stranger you met in an online group says they have been quietly making a fortune in cryptocurrency and wants to teach you for free out of kindness. They show you their account with large profits. What is most likely happening?",
        options: [
          { text: "A genuinely generous person sharing their success", correct: false },
          { text: "The early stage of a 'pig butchering' scam — building trust before asking for your money", correct: true },
          { text: "A legitimate investment educator", correct: false },
          { text: "A financial advisor looking for new clients", correct: false },
        ],
        explanation:
          "Scammers spend weeks building a friendly relationship and showing fake profit screenshots before asking for money. This is called 'pig butchering' — they fatten you up with trust before taking everything. Be very cautious of strangers online who volunteer investment advice.",
      },
    ],

    medium: [
      {
        id: "inv-m1",
        question:
          "You have been chatting online with a friendly person for a month. They guided you to put $10,000 into a cryptocurrency platform that shows your investment growing to $40,000. When you try to withdraw, they say you owe a 20% 'government tax' of $8,000 first. What should you do?",
        options: [
          { text: "Pay the tax — it sounds like a real requirement", correct: false },
          { text: "Do not pay — this is a scam. The profits are fake and the tax fee will also disappear", correct: true },
          { text: "Pay half the tax as a compromise", correct: false },
          { text: "Contact the platform's customer support to resolve the issue", correct: false },
        ],
        explanation:
          "The investment platform, the profits shown, and the 'tax' are all fake. This is the final stage of a pig butchering scam. No legitimate investment platform requires you to pre-pay taxes to withdraw your own money. Once you pay, the scammer and your $10,000 are both gone.",
      },
      {
        id: "inv-m2",
        question:
          "An investment opportunity offers a 15% monthly return and says the strategy is a 'proprietary algorithm' that the company cannot share for legal reasons. Why is secrecy about the strategy a red flag?",
        options: [
          { text: "Legitimate investments always explain their strategies openly to investors", correct: false },
          { text: "A secretive strategy could be a Ponzi scheme — paying early investors with new investors' money rather than real returns", correct: false },
          { text: "Both of the above are true", correct: true },
          { text: "It is not a red flag — many legitimate funds keep strategies private", correct: false },
        ],
        explanation:
          "Both are true. Legitimate registered investments must disclose their strategies to regulators. Secrecy often means there is no real investment — just a Ponzi scheme that collapses once new money stops coming in. The SEC can verify if a firm is registered at investor.gov.",
      },
      {
        id: "inv-m3",
        question:
          "You lost money in a cryptocurrency scam. Someone contacts you saying they are a recovery specialist who can get your money back for an upfront fee. What is this?",
        options: [
          { text: "A legitimate service — recovery specialists do exist", correct: false },
          { text: "A recovery scam — targeting people who already lost money to steal from them again", correct: true },
          { text: "A government program you should take advantage of", correct: false },
          { text: "A law firm taking your case on contingency", correct: false },
        ],
        explanation:
          "Recovery scams specifically target people who have already lost money, knowing they are desperate to get it back. No legitimate recovery service charges upfront fees. In 2025, recovery scams caused $1.4 billion in additional losses to people who were already victims.",
      },
    ],

    hard: {
      id: "inv-h1",
      type: "email",
      instruction:
        "Read this investment pitch email and tap every red flag you can find. Then tap 'Show answers' to see how you did.",
      from: "robert.chen@goldpathcapital-partners.net",
      subject: "Private Invitation: Exclusive Retirement Growth Opportunity",
      body: [
        {
          id: "inv-h1-s1",
          text: "I am reaching out because a mutual friend mentioned you are looking for better returns on your retirement savings.",
          isFlag: true,
          reason:
            "Using a vague 'mutual friend' reference builds false trust and makes you less likely to be skeptical. Scammers almost never name the supposed friend.",
        },
        {
          id: "inv-h1-s2",
          text: "Our exclusive cryptocurrency fund has returned 25 to 40 percent every month for the past year — far above any bank or traditional investment.",
          isFlag: true,
          reason:
            "25% monthly = over 1,300% per year. No legitimate investment achieves this. Promising these returns is illegal and always a sign of fraud.",
        },
        {
          id: "inv-h1-s3",
          text: "This opportunity is only open for the next 48 hours — we have very limited spots remaining.",
          isFlag: true,
          reason:
            "Artificial scarcity and a tight deadline are designed to stop you from researching, consulting a financial advisor, or talking to family.",
        },
        {
          id: "inv-h1-s4",
          text: "We operate through a private offshore network to legally protect our clients from unnecessary taxation.",
          isFlag: true,
          reason:
            "Offshore accounts promising to avoid taxes describe illegal tax evasion, not a feature. Legitimate investments follow tax law and are transparent about it.",
        },
        {
          id: "inv-h1-s5",
          text: "Your principal investment is fully guaranteed — our algorithm has never had a losing month.",
          isFlag: true,
          reason:
            "It is illegal for any investment to guarantee the return of principal. This promise is meaningless because the company is not regulated and will simply disappear.",
        },
        {
          id: "inv-h1-s6",
          text: "To get started, simply wire your funds directly to our account. We avoid traditional banks for your security.",
          isFlag: true,
          reason:
            "Avoiding banks removes all consumer protections and makes recovery impossible. Legitimate investments use regulated custodian accounts, not direct wire transfers.",
        },
      ],
      senderIsFlag: true,
      senderReason:
        "'goldpathcapital-partners.net' is not a registered firm. You can verify any investment firm at investor.gov.",
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
          "You have been messaging with someone on a dating site for three weeks. They say they are a doctor working overseas. They have never been able to video call because of 'poor internet'. Now they say they have an emergency and need $2,000 wired to them. What should you do?",
        options: [
          { text: "Send the money — you have built a relationship and they need help", correct: false },
          { text: "Send half the amount as a compromise", correct: false },
          { text: "Refuse and stop contact — never send money to someone you have never met in person", correct: true },
          { text: "Ask them to pay you back when they return", correct: false },
        ],
        explanation:
          "This follows the exact pattern of a romance scam: building trust over weeks, excuses to avoid video calls, and then a sudden financial emergency. Never send money to someone you have not met in person, no matter how close you feel.",
      },
      {
        id: "rom-e2",
        question:
          "Someone you met online always has reasons why they cannot video chat — poor connection, broken camera, or working in a remote area. Why is this a warning sign?",
        options: [
          { text: "They might be embarrassed about their appearance", correct: false },
          { text: "They are likely using a fake photo and a real video call would reveal they are not who they claim to be", correct: true },
          { text: "Video calling is unreliable in many countries", correct: false },
          { text: "They may be shy and prefer text communication", correct: false },
        ],
        explanation:
          "Scammers use stolen photos of attractive or professional-looking strangers. A video call would immediately reveal the deception. Consistent, creative excuses to avoid video contact are one of the strongest warning signs of a romance scam.",
      },
      {
        id: "rom-e3",
        question:
          "An online friend you have grown close to asks you to receive money in your bank account and forward it to another account for them, keeping a small percentage for yourself. What is this?",
        options: [
          { text: "A legitimate way to earn extra income", correct: false },
          { text: "Money laundering — you would be helping move stolen funds and could face criminal charges", correct: true },
          { text: "A test of trust in the relationship", correct: false },
          { text: "A business arrangement that is legal if you are paid", correct: false },
        ],
        explanation:
          "This is money mule recruitment. The money passing through your account is stolen from other victims. Even if you did not know it was stolen, you could face serious legal consequences. Scammers deliberately use trusted contacts for this to distance themselves from the crime.",
      },
    ],

    medium: [
      {
        id: "rom-m1",
        question:
          "You have been in an online relationship for two months. Your partner says they are coming to visit next week, but then cancels due to an emergency — a medical bill, a stuck shipment, or a flight problem — and needs money to resolve it. This pattern repeats. What is happening?",
        options: [
          { text: "They are genuinely unlucky and need your support", correct: false },
          { text: "A manufactured crisis cycle — each emergency is invented to extract more money before the visit that never happens", correct: true },
          { text: "They may be testing whether you truly care about them", correct: false },
          { text: "International travel has many unpredictable complications", correct: false },
        ],
        explanation:
          "The repeated cycle of a planned visit followed by a last-minute financial emergency is the core structure of a romance scam. The visit never happens because the person does not exist as described. Each 'crisis' is scripted to extract another payment.",
      },
      {
        id: "rom-m2",
        question:
          "Your online partner of two months says they love you deeply and asks you to keep your relationship private from your family and friends for now. Why is this request dangerous?",
        options: [
          { text: "Some people are genuinely private about new relationships", correct: false },
          { text: "Isolation from family and friends removes the people most likely to recognize the scam and warn you", correct: true },
          { text: "Your family may be judgmental about online relationships", correct: false },
          { text: "It is a normal request early in a relationship", correct: false },
        ],
        explanation:
          "Scammers deliberately isolate victims from their support networks because a family member or friend who hears about the relationship would likely recognize the warning signs. If a new online partner asks you to keep them secret, treat that as a serious red flag.",
      },
      {
        id: "rom-m3",
        question:
          "A person you met online says they are a U.S. military officer deployed overseas. Romance scams frequently use this identity. Why does the military cover story work so well?",
        options: [
          { text: "Military personnel are trustworthy by nature", correct: false },
          { text: "It explains why they cannot meet in person, cannot video call easily, and need financial help — all at once", correct: true },
          { text: "Military people often look for relationships online", correct: false },
          { text: "It creates an admirable and sympathetic image", correct: false },
        ],
        explanation:
          "The military identity is specifically chosen because it explains every evasion tactic at once: no in-person meetings (deployed), unreliable video calls (field conditions), and financial needs (military pay delays or emergency fees). The U.S. Army Criminal Investigation Command warns that military romance scams are extremely common.",
      },
    ],

    hard: {
      id: "rom-h1",
      type: "messages",
      instruction:
        "Read this series of text messages from an online acquaintance and tap every red flag. Then tap 'Show answers' to see how you did.",
      from: "James Anderson — met on Facebook 6 weeks ago",
      subject: "Text message conversation",
      body: [
        {
          id: "rom-h1-s1",
          text: "Good morning beautiful. You are the first thing I think of every single day. I have never felt this way about anyone so quickly.",
          isFlag: true,
          reason:
            "Extremely rapid declarations of deep affection — called 'love bombing' — are a manipulation tactic to build emotional dependency quickly before asking for money.",
        },
        {
          id: "rom-h1-s2",
          text: "I wish I could video call you but the satellite connection on the oil rig only allows text. I hope you understand.",
          isFlag: true,
          reason:
            "A convenient, ongoing excuse to avoid video calls. Oil rig workers, military personnel, and doctors working abroad are the most common false identities used in romance scams.",
        },
        {
          id: "rom-h1-s3",
          text: "I have booked my flight to come visit you next month. I cannot wait to finally hold your hand.",
          isFlag: false,
        },
        {
          id: "rom-h1-s4",
          text: "Something terrible has happened. A worker was injured and I must pay his hospital fees upfront or I will lose my job. I am so ashamed to ask but I have no one else. Could you help with $1,500?",
          isFlag: true,
          reason:
            "A sudden financial emergency that conveniently arrives before the planned visit. The shame and isolation ('I have no one else') are designed to trigger sympathy and prevent you from consulting others.",
        },
        {
          id: "rom-h1-s5",
          text: "Please do not tell your daughter about this — she would not understand our connection and I do not want her to worry.",
          isFlag: true,
          reason:
            "Asking you to hide the request from family is deliberate isolation. Your daughter would almost certainly recognize this as a scam.",
        },
        {
          id: "rom-h1-s6",
          text: "Wire the money to this account in Malaysia. Once I am back in the U.S. I will repay you and we will laugh about this together.",
          isFlag: true,
          reason:
            "International wire transfers to unknown accounts are irreversible. The destination country is chosen because it is outside U.S. legal reach. The repayment promise and the visit will never happen.",
        },
      ],
      senderIsFlag: false,
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
          "You get a call from someone claiming to be an IRS agent saying you owe back taxes and will be arrested within hours if you do not pay immediately by gift card. What should you do?",
        options: [
          { text: "Pay with gift cards immediately to avoid arrest", correct: false },
          { text: "Ask them to call back tomorrow", correct: false },
          { text: "Hang up — the IRS never calls with arrest threats and never accepts gift cards", correct: true },
          { text: "Give them your credit card number instead of gift cards", correct: false },
        ],
        explanation:
          "The IRS always contacts you by mail first, never by phone with threats of immediate arrest. The IRS also never accepts gift cards, wire transfers, or cryptocurrency. These two details together — phone threats and gift card payment — are definitive signs of a scam.",
      },
      {
        id: "gov-e2",
        question:
          "A caller says they are from Social Security and your benefits are being suspended because your number was used in a crime. They say to call back at a number they provide to resolve it. What should you do?",
        options: [
          { text: "Call the number they gave you right away", correct: false },
          { text: "Hang up and call the real Social Security Administration at 1-800-772-1213", correct: true },
          { text: "Give them your Social Security number to prove your identity", correct: false },
          { text: "Stay on the line and cooperate to clear your name", correct: false },
        ],
        explanation:
          "The SSA does not call to suspend benefits without extensive prior written notice. Never call back a number a suspicious caller gave you — look up the real number yourself. The official SSA number is 1-800-772-1213.",
      },
      {
        id: "gov-e3",
        question:
          "A caller says they are a local police officer and there is a warrant out for your arrest for missing jury duty. They say you can pay a fine over the phone to cancel the warrant. What should you do?",
        options: [
          { text: "Pay the fine immediately — a warrant sounds very serious", correct: false },
          { text: "Ask them for their badge number and then pay", correct: false },
          { text: "Hang up — police do not call to collect fines and cannot cancel warrants over the phone", correct: true },
          { text: "Ask them to email you the warrant details first", correct: false },
        ],
        explanation:
          "Law enforcement does not call to collect fines or offer to cancel warrants over the phone. If there were a real warrant, officers would come to your home — they would not give you the option to pay by phone. This script is designed purely to frighten you into sending money.",
      },
    ],

    medium: [
      {
        id: "gov-m1",
        question:
          "A caller from 'Customs and Border Protection' says a package addressed to you was seized containing drugs and cash. You must pay a bond to avoid federal charges. What should you do?",
        options: [
          { text: "Pay the bond — federal charges are serious", correct: false },
          { text: "Hang up and report it to the real CBP at 1-877-227-5511", correct: true },
          { text: "Ask for a lawyer before paying anything", correct: false },
          { text: "Pay a smaller amount to show good faith", correct: false },
        ],
        explanation:
          "This scam uses a fabricated federal crime to create extreme fear. Real federal agencies do not call civilians demanding bond payments. If you were genuinely under investigation you would be contacted through official legal channels. Report impersonation scams to reportfraud.ftc.gov.",
      },
      {
        id: "gov-m2",
        question:
          "A caller says your Medicare number was compromised and you need a new card. To send you the new card they need to verify your Medicare number, Social Security number, and bank account. What are they actually doing?",
        options: [
          { text: "Verifying your identity to send a replacement card", correct: false },
          { text: "Collecting the three pieces of information needed to steal your identity and drain your bank account", correct: true },
          { text: "A standard Medicare security procedure", correct: false },
          { text: "Protecting you from the person who stole your Medicare number", correct: false },
        ],
        explanation:
          "Medicare number, Social Security number, and bank account together give a scammer everything needed to steal your identity and drain your accounts. Medicare sends new cards by mail automatically — they never call to collect this information. Call 1-800-MEDICARE directly if you have concerns.",
      },
      {
        id: "gov-m3",
        question:
          "You receive a letter in the mail saying you owe the IRS money and must pay within 30 days. The letter has an official-looking IRS logo. How do you verify if this is real?",
        options: [
          { text: "Call the phone number printed on the letter", correct: false },
          { text: "Pay it to be safe — the IRS logo makes it look official", correct: false },
          { text: "Look up the IRS directly at irs.gov or call 1-800-829-1040 to verify using your own reference", correct: true },
          { text: "Ignore it — the IRS only communicates by phone", correct: false },
        ],
        explanation:
          "The IRS does send letters, so mail is more legitimate than phone calls — but fake letters also exist. Never call a number from the letter itself. Go directly to irs.gov or call the official IRS number to verify. You can also check your tax status by creating an account at irs.gov.",
      },
    ],

    hard: {
      id: "gov-h1",
      type: "phone",
      instruction:
        "Read this voicemail transcript and tap every red flag. Then tap 'Show answers' to see how you did.",
      from: "Caller ID: Social Security Administration — 1-800-772-1213",
      subject: "Voicemail transcript",
      body: [
        {
          id: "gov-h1-s1",
          text: "This is Officer Michael Davis calling from the Social Security Administration Office of Inspector General.",
          isFlag: true,
          reason:
            "The SSA Office of Inspector General investigates fraud — they do not call individuals with warnings. Using an official-sounding title adds false authority.",
        },
        {
          id: "gov-h1-s2",
          text: "Your Social Security number has been suspended after being linked to suspicious activity involving drug trafficking across the Texas-Mexico border.",
          isFlag: true,
          reason:
            "The SSA cannot suspend a Social Security number. Adding specific dramatic details like drug trafficking and a named border makes the fake crime feel real.",
        },
        {
          id: "gov-h1-s3",
          text: "A federal arrest warrant has been issued in your name. You have the right to remain silent.",
          isFlag: true,
          reason:
            "Real law enforcement does not announce arrest warrants by voicemail. Quoting Miranda rights over the phone is theater designed to maximize fear.",
        },
        {
          id: "gov-h1-s4",
          text: "To protect your assets during the investigation, you must immediately withdraw your savings and convert them to Bitcoin at a local ATM.",
          isFlag: true,
          reason:
            "No government agency ever instructs you to withdraw cash or buy cryptocurrency. Once you deposit cash into a Bitcoin ATM for a 'government wallet,' it is gone instantly and cannot be recovered.",
        },
        {
          id: "gov-h1-s5",
          text: "Do not contact your bank, attorney, or family members — this is an active federal investigation and doing so may constitute obstruction of justice.",
          isFlag: true,
          reason:
            "This is deliberate isolation from anyone who could help you. Threatening 'obstruction of justice' for talking to a lawyer is not how federal law works and is designed to trap you alone with the scammer.",
        },
        {
          id: "gov-h1-s6",
          text: "Call us back immediately at 1-888-555-0047 to avoid arrest. This is your final notice.",
          isFlag: true,
          reason:
            "The callback number is different from the spoofed Caller ID number. Urgency language like 'final notice' and 'avoid arrest' are designed to short-circuit rational thinking.",
        },
      ],
      senderIsFlag: true,
      senderReason:
        "The real SSA number is 1-800-772-1213 — but caller ID can be spoofed to show any number, including real government numbers.",
    },
  },
];