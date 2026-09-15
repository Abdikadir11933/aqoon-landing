window.PORTFOLIO = {
  "name": "Abducadir Aligure",
  "date": "September 2026",
  "headline": "Learning by doing.",
  "intro": "I'm Abducadir, a Purchasing and Logistics Engineering student in Helsinki, with only my bachelor's thesis left. I'm looking for an entry-level role at a startup where I can contribute, take responsibility and learn from the people around me.",
  "positioning": "I bring over five years of customer-facing experience and a year and a half of building software with AI. These projects show how I approach a problem, what I've tried and what I've learned along the way.",
  "selectedIntro": "Five projects, from customer work to software MVPs. Each started with a problem I wanted to understand better.",
  "projects": [
    {
      "id": "aqoon",
      "title": "AQOON",
      "category": "Services and operations",
      "stage": "Live service platform",
      "summary": "Helping Somali families find services in Finland and work through the steps to access them.",
      "subtitle": "The gap between a service being available and a family being able to use it.",
      "steps": "Listen / Guide / Follow up",
      "role": "Community research, client outreach, service delivery and development",
      "tools": [
        "HTML, CSS and JavaScript",
        "Supabase",
        "Vercel"
      ],
      "sourceNote": "The service website and its source are public. The enquiry and follow-up tools are used privately.",
      "links": [
        [
          "Visit AQOON",
          "https://aqoon.live"
        ],
        [
          "View the source",
          "https://github.com/Abdikadir11933/aqoon-landing"
        ],
        [
          "Project walkthrough",
          "https://github.com/Abdikadir11933/aqoon-landing/blob/4b746cb1241e5f7fe0531fc74803c502ecd3e3a4/docs/showcase.md"
        ]
      ],
      "blocks": [
        {
          "heading": "The problem",
          "text": "I kept seeing two sides of the same problem. Institutions had programmes with places to fill, while Somali families who could benefit from them often did not know they existed. In conversations with families, I found that the barrier could be language, trust, an unfamiliar application or simply not knowing whom to ask."
        },
        {
          "heading": "What I did",
          "text": "I spent several weeks speaking with families, then approached institutions with an offer to help bridge that gap. The work means reaching people in their own language, listening to what is blocking them, helping with enrolment and following up. I also built the AQOON website, enquiry forms and a private tracker with Claude Code to support that work."
        },
        {
          "heading": "How the tools help",
          "text": "The tracker keeps requests, conversation notes and next actions together, so I can see what still needs attention. I separated initial contact, application progress and a confirmed service start. That helps me follow up on what a family actually needs next, instead of treating every enquiry as a completed outcome."
        },
        {
          "heading": "What came from it",
          "text": "First client project (a national private daycare chain) delivered and paid 2026, second project agreed with a city hobby program in Uusimaa."
        },
        {
          "heading": "What I learned",
          "text": "I learned that explaining a service is often only the first step. Someone may understand it and still need help with a form or a conversation before they can move forward. Doing the work myself helped me decide which parts needed a tool and which parts needed a person to stay in touch."
        }
      ]
    },
    {
      "id": "letter",
      "title": "AQOON Letter Assistant",
      "category": "AI and language",
      "stage": "Implemented MVP",
      "summary": "An AI assistant for understanding Finnish official letters in plain Somali and working out what needs attention.",
      "subtitle": "Helping someone understand a letter, beyond translating its words.",
      "steps": "Read / Explain / Check",
      "role": "Problem research, application design and AI-assisted development",
      "tools": [
        "Next.js and React",
        "Express and Supabase",
        "LLM APIs and model routing"
      ],
      "sourceNote": "A separate application within AQOON. The source is private.",
      "links": [],
      "blocks": [
        {
          "heading": "The problem",
          "text": "Growing up, I helped my family understand Finnish official letters. Even after translating the words, there could still be questions: what does this mean for me, do I need to reply, and is there a date I need to remember? I wanted to explore whether AI could make those letters easier to understand in plain Somali."
        },
        {
          "heading": "What I built",
          "text": "I built an application that explains a letter and supports follow-up questions and reply drafts. Using Claude Code, I developed the screens and the steps around the AI: a rule-based classifier sorts messages into seven types, the app chooses a model, and checks run on the response before it is shown."
        },
        {
          "heading": "A problem inside the problem",
          "text": "An explanation becomes less useful if it adds a date or commitment that was never in the letter. I worked on checks for invented dates, mismatched weekdays and unsupported promises in reply drafts. This taught me to think about the kind of message being handled and the information the user has actually provided."
        },
        {
          "heading": "Where I got to",
          "text": "The core MVP is implemented, including the classifier, model routing and tests for the response checks. My next step would be to try a wider range of letters with Somali-speaking readers and find out which explanations help them understand what to do next."
        },
        {
          "heading": "What I learned",
          "text": "A fluent answer is easy to mistake for a useful one. I learned to spend more time on the source information, the checks around the model and how the explanation reads to the person who needs it. I want to keep getting better at testing those parts together."
        }
      ]
    },
    {
      "id": "safka",
      "title": "SafkaStock",
      "category": "Logistics and operations",
      "stage": "Piloted, now paused",
      "summary": "Connecting purchases, sales and stock so a small food business can make better buying decisions.",
      "subtitle": "A shop-owner conversation about margins, buying decisions and food going bad.",
      "steps": "Purchases / Sales / Stock",
      "role": "Co-development, invoice imports, stock and sales tools, customer testing",
      "tools": [
        "React",
        "Express",
        "Prisma and PostgreSQL",
        "Invoice extraction"
      ],
      "sourceNote": "Co-built with a friend, starting from their foundation. The source is private.",
      "links": [],
      "blocks": [
        {
          "heading": "The conversation that started it",
          "text": "I asked a shop owner about his margins, and he could not tell me. When I asked how he decided what to buy, he said he went to the market and bought what was cheapest. He also could not say what was likely to go bad that day. That stayed with me. He was making everyday buying decisions without a clear view of his margins or what needed using first."
        },
        {
          "heading": "The problem I wanted to solve",
          "text": "Small food businesses can have supplier invoices and sales data in a point-of-sale system, yet still struggle to connect them to the stock on the shelf. I wanted to bring purchases, sales, stock counts and waste into one place, so an owner could start understanding costs and stock movement before deciding what to buy next."
        },
        {
          "heading": "What we built, and my part",
          "text": "A friend and I built SafkaStock as a restaurant stock-management MVP. I worked on stocktake and sales-entry screens, backend endpoints and importing purchase information from invoices. That included PDF parsing, AI-assisted extraction and matching invoice items to products already in the system. We developed the product across several iterations, building on my friend's foundation."
        },
        {
          "heading": "What happened",
          "text": "During my 135-hour internship with the Witas Agile Experiments Incubator in October and November 2025, I worked on the MVP and tested it with customers. We reached a pilot, but I spent too much time expanding the product before checking whether people would keep using it. The project was paused in summer 2026."
        },
        {
          "heading": "What I learned",
          "text": "The shop-owner conversation gave me a reason to investigate, but it did not tell me which solution people would use. I would now choose one decision to help with, test a smaller version earlier and watch whether it becomes part of someone's routine. This project taught me that understanding a problem and finding demand for a product are separate pieces of work."
        }
      ]
    },
    {
      "id": "ridelink",
      "title": "RideLink",
      "category": "Coordination and operations",
      "stage": "Implemented MVP",
      "summary": "Making it easier for a youth sports team to see who is driving, who needs a lift and which seats are available.",
      "subtitle": "One shared event for organising lifts to a match.",
      "steps": "Share / Offer seats / Join",
      "role": "Application design and AI-assisted development",
      "tools": [
        "Next.js, React and TypeScript",
        "Supabase",
        "iCalendar imports"
      ],
      "sourceNote": "Implemented MVP with private source.",
      "links": [],
      "blocks": [
        {
          "heading": "The problem",
          "text": "Arranging lifts to a youth sports match means keeping track of drivers, spare seats and people who still need a ride. I wanted to put those details around the event itself, so parents could see the options and join from one shared link."
        },
        {
          "heading": "What I built",
          "text": "I built a manager dashboard, calendar imports and a parent-facing page for offering or claiming seats. Managers sign in to organise events. Parents can use the event link without creating an account, which removes a step from a task that should be quick."
        },
        {
          "heading": "Working through the details",
          "text": "If two people try to claim the last seat at the same time, the screen alone cannot decide who gets it. I implemented a database transaction that checks remaining capacity before saving a booking. Working through that helped me understand why a simple-looking feature still needs careful handling behind the scenes."
        },
        {
          "heading": "Where I got to",
          "text": "The core MVP is implemented, from importing an event to sharing it and booking a seat. Keeping imported events up to date still needs work, including handling cancellations. I would finish that before testing the full routine with a team."
        },
        {
          "heading": "What I learned",
          "text": "I learned to think beyond the first successful booking. Events change and people act at the same time. Considering those situations changed how I designed both the booking process and the information parents need to see."
        }
      ]
    },
    {
      "id": "orders",
      "title": "DM Order Organizer",
      "category": "AI and operations",
      "stage": "Implemented MVP",
      "summary": "Helping a seller turn customer messages into orders they can check, organise and follow up on.",
      "subtitle": "Keeping track of an order after the conversation moves on.",
      "steps": "Paste / Review / Track",
      "role": "Application design, AI-assisted development and onboarding",
      "tools": [
        "React",
        "FastAPI and Python",
        "OpenAI API",
        "Supabase"
      ],
      "sourceNote": "Implemented MVP with private source. Messages are pasted into the app.",
      "links": [],
      "blocks": [
        {
          "heading": "The problem",
          "text": "A customer can place an order through a conversation, with the details spread across several messages. The seller then has to pull those details together and remember what has been paid for or sent. I wanted to try a small tool that helps sellers turn those messages into orders they can find and follow up on."
        },
        {
          "heading": "What I built",
          "text": "The seller pastes the messages, and AI suggests an order draft. They can check and edit it before saving, then mark the order as paid or sent. I built that flow along with search, filters and CSV export, and worked on the order of the fields and the first-use guidance."
        },
        {
          "heading": "The choice that mattered",
          "text": "I kept reviewing and saving as separate steps. A draft can be missing something or misunderstand a message, so the seller needs a clear chance to correct it. I started with pasted text to work on this core task before considering connections to messaging platforms."
        },
        {
          "heading": "Where I got to",
          "text": "The core MVP is implemented, from pasted messages to an editable draft and a saved order. The next thing I would test is how well it handles a seller's own conversations: what needs correcting, what is missing and whether the review actually saves them effort."
        },
        {
          "heading": "What I learned",
          "text": "The AI extraction is only part of the task. I also had to think about how someone checks the draft and finds the order again later. That made me pay more attention to the small interface decisions around the AI output."
        }
      ]
    }
  ],
  "otherIntro": "A few smaller projects I worked on for practice, coursework or curiosity.",
  "otherGroups": [
    {
      "id": "other-builds",
      "title": "Other builds",
      "entries": [
        {
          "id": "siteslip",
          "title": "SiteSlip / SnapToSheet",
          "stage": "Prototype",
          "text": "I built a receipt-processing prototype for work such as contracting and deliveries. It takes a photo through image checks, AI extraction and a review step, then exports the details to Excel or CSV. It gave me a way to explore the steps between a messy source document and a usable table.",
          "links": []
        },
        {
          "id": "self-monitoring",
          "title": "Kitchen record-keeping",
          "stage": "Prototype",
          "text": "A Python and Streamlit prototype for organising restaurant records, including invoices, cleaning and temperature checks. I worked on extracting invoice rows and reviewing them before saving them. Here I focused on reviewing and keeping day-to-day kitchen records.",
          "links": []
        },
        {
          "id": "tutoring",
          "title": "AQOON Tutoring OS",
          "stage": "Internal prototype",
          "text": "A toolkit of structured Claude prompts and supporting data for tutoring intake, learning plans, sessions and parent updates. I explored how AI could help with preparation while keeping a person responsible for reviewing the material. The interface is still unfinished.",
          "links": []
        },
        {
          "id": "halgan",
          "title": "Halgan Map",
          "stage": "Work in progress",
          "text": "A community-map idea I explored with Next.js, MapLibre and geographic data in Supabase. I worked on loading places and filtering them by time to learn how location data becomes an interactive map. Adding new map pins is still unfinished.",
          "links": []
        }
      ]
    },
    {
      "id": "experiments",
      "title": "Experiments and coursework",
      "entries": [
        {
          "id": "football",
          "title": "Football video analysis",
          "stage": "Personal experiment",
          "text": "A personal experiment combining a pretrained YOLO model, player tracking and a Streamlit interface to explore football footage. I worked with pitch mapping and heatmaps to learn how video can become useful data. The pass estimates are still experimental.",
          "links": [
            [
              "View the project",
              "https://github.com/Abdikadir11933/Interactive-Football-Player-Tracking-using-YOLO-and-OpenCV-"
            ]
          ]
        },
        {
          "id": "logistics-agent",
          "title": "Logistics Agent",
          "stage": "Learning experiment",
          "text": "An exploration of forecasting, safety stock and reorder points in Python, with an optional AI step for suggesting adjustments within set limits. It connects ideas from my degree with code. The project is incomplete, but it gave me a concrete way to work through those calculations.",
          "links": []
        },
        {
          "id": "accidents",
          "title": "Road-accident data mining",
          "stage": "Coursework",
          "text": "Coursework comparing classification models on UK road-accident severity data. I explored class imbalance and how different models handled the rarer, more serious cases. One useful lesson was that a high overall accuracy can still hide poor predictions for the cases that matter most.",
          "links": [
            [
              "View the coursework",
              "https://github.com/Abdikadir11933/Datamining"
            ]
          ]
        }
      ]
    }
  ],
  "about": {
    "title": "A little about me.",
    "intro": "I'm finishing my bachelor's degree in Purchasing and Logistics Engineering at JAMK, with only my thesis remaining. I enjoy talking to people, understanding what makes their work difficult and trying something that might help.",
    "approach": "I use Codex and Claude Code every day to build and work through code. I work on the screens, data and application logic, then test whether they work as intended. These projects are how I practise turning an idea into something useful and discover what I need to learn next.",
    "experience": [
      {
        "title": "AQOON",
        "period": "2026 / Community work and service delivery",
        "text": "I speak with families, help them navigate unfamiliar services and build tools for the enquiries and follow-up around that work."
      },
      {
        "title": "Witas Agile Experiments Incubator",
        "period": "October to November 2025 / 135-hour internship",
        "text": "I worked on an MVP and tested it with customers. Tatu Tuohimetsä, Project Specialist at Witas, is a recommender for this work."
      },
      {
        "title": "Customer service and operations",
        "period": "Over five years of customer-facing experience",
        "text": "My experience includes retail, independent kiosk shifts, restaurant work and warehouses in Finland. I also worked in automated fulfilment during my exchange in the Netherlands. These jobs taught me to listen, explain clearly and take responsibility for the work in front of me."
      }
    ],
    "education": "I'm completing my bachelor's degree in Purchasing and Logistics Engineering at JAMK. Only my thesis remains. During my exchange at HAN in the Netherlands, I studied Data-Driven Decision Making, which helped me connect my interest in operations with data and software.",
    "lookingFor": "I'm looking for a full-time, entry-level role at a startup in Finland or elsewhere in Europe, and I'm open to remote work. Customer success, implementation and operations interest me because they combine helping people with figuring out how a product works. I'd like to contribute to a team, learn from experienced people and grow into more responsibility. In the longer term, I hope to lead a startup of my own.",
    "facts": [
      [
        "Based in",
        "Helsinki, Finland"
      ],
      [
        "Education",
        "Purchasing and Logistics Engineering, JAMK. Only my thesis remains."
      ],
      [
        "Exchange",
        "HAN, Netherlands. Data-Driven Decision Making minor."
      ],
      [
        "Languages",
        "Somali, Finnish and English"
      ],
      [
        "Daily tools",
        "Codex and Claude Code. I also explore Gemini and Copilot."
      ],
      [
        "Looking for",
        "Full-time, entry-level startup roles. Finland, Europe or remote."
      ]
    ],
    "links": [
      [
        "Get in touch",
        "mailto:aligureabducadir@gmail.com"
      ],
      [
        "LinkedIn",
        "https://www.linkedin.com/in/abducadir-abdullahi-aligure-b1119033a"
      ]
    ]
  },
  "processes": {
    "aqoon": {
      "title": "From a first conversation to the next step",
      "steps": [
        [
          "Listen",
          "Understand the barrier",
          "I speak with families about what they need and where they are getting stuck. That gives me a starting point for the practical help."
        ],
        [
          "Organise",
          "Keep the details together",
          "The website collects enquiries. The tracker brings requests, interviews and call notes together so I can follow the conversation."
        ],
        [
          "Guide",
          "Agree on a next action",
          "That might mean working through an application, gathering information or finding the right person to contact. I record the next action."
        ],
        [
          "Follow up",
          "Find out what happened",
          "I keep contact, application and confirmed service start separate. That helps me see what still needs attention."
        ]
      ]
    },
    "letter": {
      "title": "From a letter to an explanation",
      "steps": [
        [
          "Identify",
          "Understand the message type",
          "A rule-based classifier sorts the message before the model is called. Different kinds of letters need different kinds of explanation."
        ],
        [
          "Explain",
          "Make the meaning easier to follow",
          "The app routes the request to a model to produce a plain-Somali explanation and support follow-up questions."
        ],
        [
          "Check",
          "Look for unsupported details",
          "I added checks for details such as invented dates, mismatched weekdays and wording that could create an unsupported commitment."
        ],
        [
          "Reply",
          "Help with the next step",
          "The application can help draft a reply using information the person supplies. I wanted the explanation to lead to a useful next action."
        ]
      ]
    },
    "safka": {
      "title": "Bringing stock information together",
      "steps": [
        [
          "Purchases",
          "Start with what came in",
          "I worked on importing purchase information from invoices, including extraction and matching the imported items to existing products."
        ],
        [
          "Sales",
          "Record what went out",
          "I built sales-entry screens and their backend endpoints to bring sales information into the stock workflow."
        ],
        [
          "Stocktake",
          "Check what is on hand",
          "I worked on stocktake screens so a physical count could sit alongside the purchase and sales records."
        ],
        [
          "Connect",
          "Support the buying decision",
          "The goal was to help an owner use purchase, sales and stock records together when deciding what to buy next."
        ]
      ]
    },
    "ridelink": {
      "title": "From a team event to a shared ride",
      "steps": [
        [
          "Import",
          "Bring in the event",
          "A team manager signs in and imports events from a calendar into the dashboard."
        ],
        [
          "Share",
          "Give parents one place to look",
          "The manager shares an event link. Parents can use it without creating an account."
        ],
        [
          "Offer",
          "Make available seats visible",
          "A parent can offer seats for that event so others can see where a lift is available."
        ],
        [
          "Join",
          "Check capacity before booking",
          "When someone claims a seat, a database transaction checks the remaining capacity before saving the booking."
        ]
      ]
    },
    "orders": {
      "title": "From customer messages to an order record",
      "steps": [
        [
          "Paste",
          "Bring in the conversation",
          "The seller pastes the customer messages into the tool. I started with this simple input so I could focus on the order task."
        ],
        [
          "Draft",
          "Organise the details",
          "The AI suggests a structured draft from the text, giving the seller one place to check the order details."
        ],
        [
          "Review",
          "Let the seller make corrections",
          "The draft stays editable. The seller reviews it and saves it when it is ready to become an order record."
        ],
        [
          "Track",
          "Keep the next actions visible",
          "Saved orders can be searched, filtered, marked as paid or sent, and exported to CSV."
        ]
      ]
    }
  }
};
