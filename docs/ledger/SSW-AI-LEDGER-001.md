# Soul Super Wallet AI-First Program
## Living Discussion & Decision Ledger

**Program:** Soul Super Wallet AI-First / SERA Companion Architecture  
**Ledger ID:** SSW-AI-LEDGER-001  
**Status:** Active  
**Record Type:** Append-only living discussion, analysis, and decision record  
**Start Date:** 2026-09-16  
**Rule:** Preserve each substantive user prompt verbatim followed by the assistant's complete visible response verbatim. Do not summarize, rewrite, reorder, or overwrite prior entries unless explicitly instructed by the user.

---

## Entry 001
**Date:** 2026-09-16  
**Topic:** AI-first Soul Super Wallet and iOS / Android platform capability assessment

### User Prompt — Verbatim

Next project is to turn Soul Super Wallet in to a AI-first wallet where the interface is the agent and the rest is incidental for viewing when needed, credentials, assets, news, and all. 

What kind of support do iOS and Android have to be able to launch something like this? An app whose to-go interface is an AI companion that can float around or park itself on the homescreen for quick access. Before we build we must understand the operating system support we have from both Apple App Store and Google Play Store and their operating systems, iOS and Android. 

Please write in English language.

### Assistant Response — Verbatim

Yes. The concept is technically viable, but the operating systems force us to think about it as **one AI-first wallet with two different presence models**.

The important finding is that we should not begin by redesigning Soul Super Wallet screens. We should begin by designing **SERA as the operating interface to the wallet**, then let credentials, assets, transactions, news, identity, settings, activity and conventional screens become inspectable surfaces behind her.

As of September 2026, the platform situation looks like this.

## 1. The product model I think we should build

Instead of:

**Open Wallet → navigate → choose feature → perform action**

Soul Super Wallet becomes:

**Invoke SERA → tell her what you need → SERA determines intent → verifies identity/authority/policy → presents decision → obtains authorization where required → executes → provides evidence**

The conventional wallet becomes something closer to an **instrument panel behind the agent**.

For example:

> “SERA, do I have enough USDC to pay the invoice from Acme?”

SERA can answer conversationally.

> “Pay Acme $1,850.”

Now SERA identifies the payment intent, determines the wallet and asset, checks balance/gas, verifies recipient, invokes Trust Protocol/REV, presents the transaction for user authorization where required, submits it and returns the receipt.

Or:

> “What credentials do I have for travel?”

Instead of taking the user into a credential browser, SERA retrieves them and says something like:

“Your passport credential, TSA credential and Delta boarding credential are available. Your passport credential expires in 14 months.”

The user can then say:

> “Show me the boarding pass.”

Only then does the graphical wallet surface appear.

That architecture is absolutely feasible.

The question is how omnipresent SERA can be.

---

# 2. iOS: very capable, but Apple controls the stage

There is an important limitation to understand immediately:

### iOS does not give a normal App Store application a general-purpose floating overlay that can hover over arbitrary applications.

So we cannot build an Android-style movable SERA avatar that permanently floats above Safari, Messages, Amazon, Gmail, etc.

Apple deliberately constrains this sort of cross-application UI.

But iOS now gives us a surprisingly rich collection of **system surfaces**, and together they can make SERA feel pervasive without violating Apple's model.

Apple describes WidgetKit as allowing apps to surface content through Home Screen widgets, Lock Screen widgets, Live Activities and Controls. App Intents then allows actions to execute from these surfaces and integrate with system experiences. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

So I would design SERA on iOS as a **distributed companion**, rather than a floating companion.

### The iOS presence architecture could look like this:

| Surface | SERA use |
|---|---|
| Main app | Full conversational SERA |
| Home Screen widget | SERA quick access + status |
| Lock Screen widget | Ask / authenticate / wallet status |
| Control Center | Invoke SERA / scan / pay / prove |
| Dynamic Island | Active transaction / agent task / authorization |
| Live Activity | Long-running task or transaction status |
| Notifications | Proactive alerts and approvals |
| App Intents | Execute SSW actions from system surfaces |
| Siri | Voice invocation and supported intents |
| Shortcuts | User-created SERA workflows |
| Action Button | Direct SERA launch where supported |
| Apple Watch | Authentication, alerts, credential/payment actions |
| StandBy | Wallet/agent contextual status |

Apple explicitly supports interactive widgets through buttons and toggles, with actions implemented through App Intents. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

This is considerably more interesting than merely putting a SERA icon on the Home Screen.

---

# 3. The iOS Home Screen SERA

Imagine the user's Home Screen.

Instead of a conventional Soul Super Wallet icon being the primary interaction:

**SERA widget**

could show:

**SERA**

> What can I help with?

🎙 Speak  
⌨ Ask  
◎ Scan  
↗ Pay

The widget cannot become an unrestricted mini-app. Apple expects widgets to remain glanceable and focused, and widget code itself isn't simply running continuously behind the interface. Interactive actions are handed to App Intents. ([developer.apple.com](https://developer.apple.com/videos/play/wwdc2026/277/?utm_source=chatgpt.com))

But tapping:

**Ask SERA**

could deep-link immediately into the conversational interface.

Apple explicitly supports deep-linking a widget or Live Activity into the appropriate scene in the application. ([developer.apple.com](https://developer.apple.com/documentation/WidgetKit/Linking-to-specific-app-scenes-from-your-widget-or-Live-Activity?changes=_2_3_2&language=objc&utm_source=chatgpt.com))

So the experience can be:

**Home Screen → tap SERA → conversation already active**

rather than:

Home Screen → wallet splash → wallet dashboard → AI tab → conversation.

That difference sounds small technically. Product-wise, it is enormous.

---

# 4. SERA through the Dynamic Island

Dynamic Island is particularly interesting.

Apple's Live Activities can surface on the Lock Screen and Dynamic Island and can support interactions. ([developer.apple.com](https://developer.apple.com/ios?utm_source=chatgpt.com))

Suppose the user tells SERA:

> “Move $5,000 USDC to my treasury wallet once ETH gas goes below 8 gwei.”

SERA doesn't need to leave a traditional wallet UI open.

When the condition is reached:

**Dynamic Island**

> SERA  
> Transfer ready  
> $5,000 USDC

Tap.

Then:

**Review → authorize → execute**

Likewise:

> “Book the cheapest refundable Detroit to New York flight tomorrow afternoon.”

If the future Soulverse agent architecture supports the commerce workflow, the Dynamic Island could communicate the **state of the agent task** rather than pretending that SERA must literally remain running visually.

Conceptually:

**SERA ◉ Searching**

then

**SERA ◉ 3 options found**

then

**SERA ◉ Approval required**

then

**✓ Booking complete**

This is arguably a better iOS-native implementation than a cartoon character floating over other apps.

---

# 5. Lock Screen SERA

Apple also allows widgets on the Lock Screen. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit?changes=_10&language=objc&utm_source=chatgpt.com))

We could create several SERA configurations:

**SERA**
- Ask
- Scan credential
- Prove identity
- Pay
- Wallet status
- Pending approvals

For a decentralized identity wallet, this matters enormously.

Imagine approaching an airport desk.

Without opening Soul Super Wallet:

**Lock screen → SERA credential control → authenticate → present credential**

Or:

**Control Center → Soul ID → present**

The wallet becomes much less "app-like."

---

# 6. Control Center could become another SERA doorway

Apple now lets applications expose Controls through WidgetKit/App Intents. Controls can appear in Control Center and, depending on context/device, other system surfaces. ([developer.apple.com](https://developer.apple.com/documentation/widgetkit/controls-collection?utm_source=chatgpt.com))

We should seriously consider controls such as:

**Ask SERA**

**Scan**

**Pay**

**Present Soul ID**

**Emergency Lock Wallet**

That last one could become particularly powerful with SoulShield/REV.

For example:

**Control Center → Lock Wallet**

→ REV denies transaction execution  
→ wallet enters protection state  
→ SERA confirms the action

This starts turning Soulverse into something closer to an **OS capability** rather than merely an application.

---

# 7. Siri/App Intents integration is strategically important

Apple's App Intents framework is now one of the major ways applications make their functionality accessible to system experiences, including Siri, Spotlight, Shortcuts and Apple Intelligence-related experiences. ([developer.apple.com](https://developer.apple.com/documentation/appintents/apple-intelligence-and-siri-ai?utm_source=chatgpt.com))

That means Soulverse should expose an intentional action vocabulary.

For example:

```text
GetWalletBalance
GetCredential
PresentCredential
VerifyCredential
GetTransactionStatus
PrepareTransfer
AuthorizeTransfer
SendAsset
ReceiveAsset
GetTrustStatus
LockWallet
UnlockWallet
ScanIdentity
AskSERA
```

Then SERA and iOS both operate on the same underlying capability layer.

That is much better architecture than tying AI directly to SwiftUI screens.

---

# 8. iOS background intelligence is constrained

This is another architectural boundary we need to respect.

An iOS application normally becomes **suspended when it moves into the background**. Apple permits specific background execution modes rather than giving every application indefinite computation time. ([developer.apple.com](https://developer.apple.com/documentation/xcode/configuring-background-execution-modes?utm_source=chatgpt.com))

Therefore we should **not** design:

> "SERA runs continuously on the iPhone in the background."

Instead:

### SERA should have three execution tiers.

**Device SERA**

Handles:
- UI
- voice
- local inference where appropriate
- local wallet context
- cryptography
- biometric authorization
- key operations
- privacy filtering

**Soulverse Agent Runtime**

Handles:
- persistent tasks
- asynchronous workflows
- monitored conditions
- research
- transaction preparation
- service integrations
- AP2/AP3 commerce workflows

**OS event layer**

Handles:
- push notifications
- Live Activities
- widgets
- App Intents
- background refresh where appropriate

So SERA may *appear* continuously available while respecting iOS process rules.

That is the right abstraction.

---

# 9. Android is considerably more permissive

Android can get much closer to the product you originally described:

> **an AI companion that can float around or park itself on the Home Screen.**

Android gives us several mechanisms.

The most interesting are:

### A. Home Screen widgets

Android widgets are movable and resizable Home Screen surfaces that expose application information and functionality. ([developer.android.com](https://developer.android.com/develop/ui/views/appwidgets/overview?utm_source=chatgpt.com))

We could have:

**Small SERA**

👁 SERA  
Ask me anything

or a wider:

**SERA**

> What would you like me to do?

🎙️ Speak | Scan | Pay | ID

And unlike a normal app icon, users can resize it.

---

# 10. Android notification bubbles are almost made for this idea

Android notification bubbles literally allow conversations to float above other app content and expand into an interactive view. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

This may be our cleanest Android implementation.

Imagine a small SERA orb:

**◉**

sitting beside the screen.

Tap it.

A conversational window unfolds:

> **SERA**  
> What do you need?

User:

> “How much ETH do I have?”

SERA:

> 4.81 ETH across two accounts.

Collapse it.

Back to:

**◉**

Android specifically describes bubbles as floating above other app content and allowing the user to expand and interact with the associated conversation. Users remain in control of whether bubbles are enabled. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

For SERA, the conceptual fit is extremely strong because **SERA actually is a conversation**.

---

# 11. Android 17 makes this even more interesting

Google's current Android documentation states that beginning with **Android 17, bubbles are formalized as a proper windowing mode**, similar in concept to other multitasking modes, and users can add apps to the bubble UI. ([developer.android.com](https://developer.android.com/develop/ui/compose/notifications/bubbles?utm_source=chatgpt.com))

That direction strongly supports the AI-first SSW concept.

Instead of treating the bubble as a novelty, we can treat it as an Android-native SERA surface.

---

# 12. Android also technically supports real overlays

Android has `TYPE_APPLICATION_OVERLAY`.

An app with `SYSTEM_ALERT_WINDOW` permission can display a window above other application windows. ([developer.android.com](https://developer.android.com/reference/kotlin/android/Manifest.permission?utm_source=chatgpt.com))

So yes:

### We technically can build a SERA avatar that follows the user between applications.

Something like:

```text
            ◉ SERA
               ↓

┌───────────────────────────┐
│       another app         │
│                           │
│                           │
│                     ◉     │
└───────────────────────────┘
```

Drag it.

Park it.

Tap it.

Expand:

```text
        ┌─────────────────┐
        │ SERA            │
        │ What can I do?  │
        │                 │
        │ 🎙 Ask    Scan  │
        └─────────────────┘
               ◉
```

This is technically possible.

But I would **not make unrestricted overlay permission our default architecture**.

Google itself says very few apps should need `SYSTEM_ALERT_WINDOW`, and Android recommends alternatives such as bubbles or picture-in-picture where appropriate. ([developer.android.com](https://developer.android.com/reference/kotlin/android/Manifest.permission?utm_source=chatgpt.com))

So my hierarchy would be:

**1. Bubble**  
**2. Widget**  
**3. Notification/Quick Settings/system surfaces**  
**4. Optional overlay companion mode**

not overlay first.

---

# 13. Android background execution is also not unlimited

Android gives us more freedom, but modern Android is increasingly strict about background processes.

For example, Android generally prevents apps targeting Android 12+ from arbitrarily starting foreground services while already in the background, except for specified circumstances. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start?utm_source=chatgpt.com))

Interactions with a widget, notification or bubble are among the user-visible events that can enable certain legitimate foreground work. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start?utm_source=chatgpt.com))

Android also requires foreground services to remain visibly apparent to the user and applies increasingly tight restrictions and resource controls. ([developer.android.com](https://developer.android.com/develop/background-work/services/fgs/launch?authuser=0000&hl=en&utm_source=chatgpt.com))

So again:

**persistent agent ≠ persistent phone process.**

The long-running SERA brain should not depend on keeping an Android service immortal either.

---

# 14. There is a very important restriction for our AI-agent design

This one should become an architecture decision now.

We should **not build SERA by giving it Accessibility permissions and letting it click through other apps autonomously.**

Google's current AccessibilityService policy explicitly says that apps using Accessibility for automation cannot use it to autonomously:

- initiate,
- plan,
- execute actions,
- or make decisions on the user's behalf.

Narrow deterministic automation remains possible, but generalized autonomous AI automation through Accessibility is prohibited for ordinary apps. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/10964491?hl=en&utm_source=chatgpt.com))

So this architecture:

**SERA → inspect Amazon UI → click product → enter card → click Buy**

is the wrong foundation.

Instead:

**SERA → merchant API / agent protocol / deep link / Intent / AP2 / commerce interface**

is the correct architecture.

That aligns beautifully with what we were already building around **SVID4AI, delegated authority, Trust Protocol, REV and AP2/AP3**.

The agent should interact with **systems**, not impersonate human finger taps.

---

# 15. This changes the SVID4AI story considerably

There is a deeper architecture emerging.

Instead of:

```text
User
 ↓
SERA
 ↓
UI automation
 ↓
Other Apps
```

we want:

```text
                         ┌── Merchant
                         │
                         ├── Bank
                         │
User → SERA → SVID4AI → ├── Airline
           ↓             │
       Soul ID           ├── Exchange
           ↓             │
    Trust Protocol       ├── Credential Issuer
           ↓             │
          REV            └── Agent/API Service
           ↓
      Authorization
           ↓
       Execution
```

The app isn't the agent.

**The interface is the agent.**

The wallet provides its powers.

That's an important distinction.

---

# 16. App Store implications for Soul Super Wallet

Apple currently permits cryptocurrency wallet applications, provided the wallet is offered by a developer enrolled as an organization. Apple separately imposes stricter requirements around exchanges, ICOs and regulated financial services. ([developer.apple.com](https://developer.apple.com/app-store/review/guidelines/uk/?utm_source=chatgpt.com))

That fits Soul Super Wallet's non-custodial model much better than if Soulverse itself were operating as a custodial exchange.

For the App Store architecture, I would therefore keep clear boundaries between:

**wallet functionality**

and

**regulated service providers accessed through the wallet**.

For example:

```text
SERA
 ↓
"I want to swap 2 ETH"
 ↓
Soulverse prepares intent
 ↓
licensed/eligible provider
 ↓
user authorization
 ↓
execution
```

rather than positioning Soulverse as the exchange unless that regulatory role is intentionally undertaken.

Apple also specifically calls out financial services and crypto exchanges as highly regulated categories that should be submitted by appropriate legal entities. ([developer.apple.com](https://developer.apple.com/app-store/review/guidelines/uk/?utm_source=chatgpt.com))

---

# 17. Google Play is interesting for SSW because it explicitly distinguishes non-custodial wallets

Google's current policy says:

> **Non-custodial wallets are out of scope of its Cryptocurrency Exchanges and Software Wallets policy.** ([support.google.com](https://support.google.com/googleplay/android-developer/answer/16329703?hl=en&utm_source=chatgpt.com))

That's significant for Soul Super Wallet.

It does **not** mean "no regulation."

Google still requires compliance with applicable laws and its blockchain/user-data policies. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/13607354?hl=en&utm_source=chatgpt.com))

But the distinction supports maintaining SSW very clearly as:

**user-controlled keys + user-controlled assets + user-authorized actions**

rather than quietly introducing custodial behaviour through SERA.

---

# 18. AI introduces another policy layer

Google's July 2026 policy update explicitly clarified that its User Data rules apply to **third-party AI integrations** and that developers remain responsible for disclosure, consent and limited use of data. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/17134731?hl=en&utm_source=chatgpt.com))

Google also has an AI-generated-content policy applying to chatbot-style generative AI applications. ([support.google.com](https://support.google.com/googleplay/android-developer/answer/14094294?hl=en&utm_source=chatgpt.com))

That gives us another important SERA principle:

### SERA must never simply dump wallet context into an external LLM.

Instead we should build something like:

```text
Wallet Data
    │
    ▼
SERA Context Broker
    │
    ├─ sensitivity classification
    ├─ credential minimization
    ├─ purpose limitation
    ├─ user policy
    ├─ local processing
    └─ selective external inference
             │
             ▼
           Model
```

Keys, seeds and signing material obviously never enter the AI context.

But I would go further.

Raw credentials need not enter it either unless absolutely required.

SERA should usually reason on **claims and abstractions**.

For example:

not:

> Kavitha's full passport credential JSON...

but:

```text
credential_type: passport
status: valid
expiry_remaining: 14_months
issuer_trust: verified
requested_claim: nationality
```

That is more consistent with the privacy architecture Soulverse is already building.

---

# 19. SERA must distinguish "thinking" from "authority"

This becomes absolutely central once AI becomes the wallet interface.

An AI can say:

> "I recommend paying this invoice."

That does not mean it possesses the authority to pay it.

We need four distinct layers:

```text
INTENT
What does the user want?

       ↓

REASONING
What action would accomplish it?

       ↓

AUTHORITY
Is SERA allowed to perform it?

       ↓

AUTHORIZATION
Does this particular execution satisfy policy?

       ↓

EXECUTION
Perform the action.
```

This maps almost perfectly onto:

**Soul ID → SVID4AI → Trust Protocol → REV → Wallet execution.**

That is one of the reasons this product direction fits Soulverse unusually well.

---

# 20. Transactions should have graduated autonomy

We should not make every request require the same interaction.

Consider:

### Tier 0: Read

> “What's my USDC balance?”

No transaction authorization.

### Tier 1: Prepare

> “Prepare $50 USDC for Jane.”

SERA creates the transaction but does not execute.

### Tier 2: Explicit approval

> “Send Jane $50.”

SERA prepares.

User biometric approval.

Execution.

### Tier 3: Delegated

> “Pay my AWS invoice automatically each month if it remains under $500.”

User creates bounded authority.

```text
recipient = AWS
asset = USDC
max = $500
frequency = monthly
expiry = 12 months
```

SVID4AI records delegation.

Trust Protocol verifies authority.

REV gates every execution.

### Tier 4: Autonomous conditional

> “Maintain at least $5,000 USDC in my operating wallet. Rebalance when necessary.”

Now SERA can act within a highly explicit authority envelope.

That is where an AI-first wallet starts becoming genuinely new rather than a chatbot pasted onto a crypto wallet.

---

# 21. I would therefore define the two UX models this way

### iOS

**SERA Everywhere, Floating Nowhere**

```text
Home Widget
    │
Lock Screen
    │
Control Center
    │
Dynamic Island
    │
Siri / Intents
    │
Notifications
    │
Watch
    │
    ▼
   SERA
    │
    ▼
Soul Super Wallet
```

Apple controls the external presentation surfaces.

---

### Android

**SERA Everywhere, Floating When Wanted**

```text
Home Widget ─────┐
Bubble ──────────┤
Overlay* ────────┤
Notification ────┤
Quick actions ───┤
Voice ───────────┤
                 ▼
                SERA
                 │
                 ▼
          Soul Super Wallet

* optional, permissioned mode
```

---

# 22. We should not create an AI tab

This deserves emphasis.

A conventional implementation would probably produce:

```text
Home
Assets
Credentials
Activity
AI
Settings
```

I think that would miss the opportunity.

Instead:

```text
┌──────────────────────────────┐
│                              │
│             SERA             │
│                              │
│       What can I do?         │
│                              │
│          ◉ Speak             │
│                              │
│                              │
│ Credentials  Assets  Activity│
└──────────────────────────────┘
```

And eventually even the buttons might disappear until needed.

SERA becomes **the shell**.

Assets become a view.

Credentials become a view.

News becomes a view.

Transactions become a view.

Identity becomes a view.

Settings become a view.

The user no longer has to know *where a function lives*.

That is a profound usability change.

---

# 23. We can make SERA proactive without becoming annoying

Because SERA has context, she can surface:

> “Your identity credential expires in 12 days.”

> “A wallet you've transacted with was flagged by your policy.”

> “Your recurring subscription increased 18%.”

> “The recipient you're about to pay differs from the one used last month.”

> “Your travel credential is ready.”

> “Your wallet has three pending approvals.”

> “ETH gas is currently below the threshold you asked me to watch.”

But SERA should operate under a **proactivity policy**:

```text
CRITICAL
interrupt

ACTION REQUIRED
surface prominently

RELEVANT
surface opportunistically

INFORMATIONAL
place in briefing

LOW VALUE
remain silent
```

Otherwise an intelligent wallet quickly becomes an intelligent mosquito.

---

# 24. Voice should be first-class

The conversational surface should support:

**text**

and

**voice**

from day one.

For example:

> “SERA.”

> “Yes?”

> “How much money did I send this week?”

> “$4,820 across seven transactions. $3,100 went to business accounts.”

> “Anything unusual?”

> “One transaction was 2.4 times larger than your typical payment to that recipient.”

> “Show it.”

Only at **show it** does a conventional interface appear.

That is what I mean by the graphical wallet becoming incidental.

---

# 25. We should eventually think beyond the phone

If the interface truly becomes SERA, the concept naturally extends to:

```text
                    SERA
                     │
       ┌─────────────┼─────────────┐
       │             │             │
     iPhone       Android        Web
       │             │             │
    Watch          Wear OS       Desktop
       │             │             │
    CarPlay      Android Auto      │
       │             │             │
       └─────────────┼─────────────┘
                     │
               Agent Runtime
                     │
                Soulverse
```

The device becomes merely another viewport into the same identity-bound agent.

---

# 26. Platform capability summary

| Capability | iOS | Android |
|---|---|---|
| AI-first app UI | **Yes** | **Yes** |
| Home Screen companion | **Yes, widget** | **Yes, widget** |
| Interactive Home widget | **Yes, constrained** | **Yes** |
| Floating conversation | **No general overlay** | **Yes, Bubble** |
| Arbitrary floating avatar | **No** | **Technically yes, permission required** |
| Persistent overlay over apps | **No** | **Possible, heavily permissioned** |
| Lock Screen presence | **Excellent** | **Good** |
| Dynamic ongoing task UI | **Live Activities / Dynamic Island** | **Notifications / bubbles / system surfaces** |
| Voice invocation | **Yes** | **Yes** |
| OS shortcuts/actions | **App Intents** | **Intents / shortcuts / actions** |
| Continuous arbitrary background AI | **No** | **No, constrained** |
| Cloud agent runtime | **Yes** | **Yes** |
| External-app UI automation | **Not a viable architecture** | **Do not use Accessibility for autonomous AI** |
| API/agent commerce | **Yes** | **Yes** |
| Non-custodial wallet distribution | **Permitted subject to policy** | **Supported; special crypto-wallet policy currently excludes non-custodial wallets** |

---

# 27. My proposed architecture

I would now stop thinking of the project as:

**"Add AI to Soul Super Wallet."**

It deserves its own architecture.

I would define:

## SSW AI-FIRST ARCHITECTURE

```text
┌─────────────────────────────────────────────────────────┐
│                    SERA EXPERIENCE                       │
│                                                         │
│  Conversation │ Voice │ Proactivity │ Context │ Views   │
└─────────────────────────┬───────────────────────────────┘
                          │
                SERA ORCHESTRATOR
                          │
       ┌──────────────────┼───────────────────┐
       │                  │                   │
       ▼                  ▼                   ▼
 Intent Engine      Context Engine       Agent Planner
       │                  │                   │
       └──────────────────┼───────────────────┘
                          ▼
                  AUTHORITY LAYER
                          │
                    Soul ID
                          │
                    SVID4AI
                          │
                  Trust Protocol
                          │
                         REV
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      Credentials       Assets        Services
      Soulogram          SSW          Commerce
      SoulScan          SoulFi        APIs
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                    EXECUTION LAYER
                          │
                  Evidence / Receipt
```

That is where I think we should start the new program.

---

# 28. Before coding, I recommend one formal platform-definition phase

I would make this the first controlled workstream:

### **SSW-AI-01: AI-First Wallet Platform Capability & Constraint Architecture**

It should document, feature by feature:

1. **iOS capability matrix**
   - widgets
   - Live Activities
   - Dynamic Island
   - App Intents
   - Siri
   - Shortcuts
   - Control Center
   - notifications
   - Lock Screen
   - Action Button
   - background execution
   - biometrics
   - NFC
   - credential presentation
   - watchOS
   - CarPlay
   - App Store restrictions

2. **Android capability matrix**
   - widgets
   - bubbles
   - overlays
   - notifications
   - shortcuts
   - voice
   - foreground services
   - background jobs
   - Digital Credentials
   - NFC
   - biometrics
   - Wear OS
   - Android Auto
   - Play Store restrictions

3. **SERA interaction taxonomy**
   - ask
   - view
   - retrieve
   - recommend
   - prepare
   - authorize
   - execute
   - monitor
   - delegate
   - automate

4. **Agent authority model**
   - user action
   - explicit consent
   - standing mandate
   - delegated authority
   - transaction limits
   - expiry
   - revocation
   - Trust Protocol
   - REV
   - AURION

5. **OS presence architecture**
   - iOS distributed SERA
   - Android ambient/floating SERA

6. **privacy architecture**
   - local context
   - cloud context
   - model isolation
   - credential minimization
   - key isolation
   - data retention
   - third-party model exposure

7. **App Store / Play Store release requirements**

8. **reference UX flows**

9. **technical architecture**

10. **production readiness constraints**

I would then move directly into **SSW-AI-02: SERA Interaction, Intent & Authority Architecture**, before we touch the existing wallet UI.

The central conclusion from this first investigation is quite encouraging: **Apple does not let us literally float SERA around iOS, but it gives us enough system surfaces to make her feel continuously accessible. Android can go further and give us a real bubble or optional floating companion.** If we architect SERA as the identity-bound agent shell rather than as a screen inside the wallet, we can build one coherent product across both without fighting either operating system.