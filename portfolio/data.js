window.PORTFOLIO = {
  "name": "Abducadir Aligure",
  "date": "September 2026",
  "headline": "Supply chains, data and practical tools.",
  "intro": "I'm a Purchasing and Logistics Engineering student nearing graduation at JAMK, based in Helsinki. I'm interested in how supply-chain processes and systems connect, and what better data helps people decide.",
  "positioning": "Alongside my studies, I build software with AI and test ideas against problems I've seen in real work. I'm looking for a junior role in analytics, supply-chain technology or implementation.",
  "selectedIntro": "Four examples of working from a real problem to data, software and a clearer next step.",
  "projects": [
    {
      "id": "safka",
      "title": "SafkaStock",
      "category": "Supply-chain data and integrations",
      "stage": "Side project / in development",
      "summary": "A side project exploring what supplier records can tell a food business about its spending and changing costs.",
      "subtitle": "A restaurant's unanswered margin questions led me to build, test and rethink a supply-chain tool.",
      "steps": "Import / Match / Compare",
      "role": "Customer discovery, workflow design and AI-assisted development",
      "tools": [
        "TypeScript",
        "PostgreSQL and Prisma",
        "PDF and spreadsheet imports",
        "Claude, Codex and GitHub"
      ],
      "sourceNote": "The first version was co-built with a friend. I am continuing the work as a side project. Source code and customer files are private.",
      "links": [
        [
          "Project walkthrough",
          "https://aqoon.live/portfolio/safkastock"
        ]
      ],
      "blocks": [
        {
          "heading": "The problem behind it",
          "text": "A pizzeria owner had supplier records and a till system, but still could not easily work out what a pizza cost to make or whether to raise prices. I wanted to connect that information so it could support everyday decisions."
        },
        {
          "heading": "What the first pilot exposed",
          "text": "A friend and I built and tested an early version. We tried to cover too much: purchases, stock, sales and waste. Missing product data and manual setup made onboarding too demanding for small businesses. Adding more features did not fix the foundation."
        },
        {
          "heading": "What I changed",
          "text": "I narrowed the starting point to purchasing questions using records a business already has. Supported Kespro spreadsheets can show spending before every product is mapped. Delivery PDFs provide detail for price comparisons, where product identity, units and price basis must agree. Accepted mappings can be reused."
        },
        {
          "heading": "My work and the current scope",
          "text": "I use Claude and Codex to help build imports, database workflows and purchasing comparisons, managing changes through GitHub and checking them against source records and tests. These are file imports, not live POS or ERP integrations. Recipe and sales connections remain planned; dish margins, inventory and waste are later work."
        },
        {
          "heading": "What I learned",
          "text": "A price comparison is only useful if the products and units really match. Working through messy records taught me to ask what the data can support now, what needs more context, and when the honest answer is that a comparison cannot yet be made."
        }
      ]
    },
    {
      "id": "aqoon",
      "title": "AQOON service tools",
      "category": "Customer workflows and operations",
      "stage": "Used in service delivery",
      "summary": "Turning family enquiries into a clear process for understanding needs, supporting applications and following up.",
      "subtitle": "Customer conversations shaped the website, intake and follow-up tools I built.",
      "steps": "Reach / Support / Follow through",
      "role": "Service discovery, pilot delivery and AI-assisted development",
      "tools": [
        "HTML, CSS and JavaScript",
        "Supabase",
        "Vercel"
      ],
      "sourceNote": "The walkthrough connects a customer workflow to real code and tests. Family records and the operator tracker remain private.",
      "links": [
        [
          "Project walkthrough",
          "https://github.com/Abdikadir11933/aqoon-landing/blob/master/docs/showcase.md"
        ]
      ],
      "blocks": [
        {
          "heading": "The gap I saw",
          "text": "Families could benefit from a service without knowing it existed or how to apply. Through AQOON, I spoke with Somali-speaking families and service providers to understand where the process broke down."
        },
        {
          "heading": "What I did",
          "text": "I ran summer service-development pilots with Pilke Päiväkodit and the City of Vantaa. My work included explaining services, helping with applications, coordinating with providers and following up. Those conversations also showed me what our tools needed to record."
        },
        {
          "heading": "What I built",
          "text": "Using Claude Code, I built the website, enquiry forms and a private tracker for requests, conversation notes and next actions. I worked on the flow from a short initial enquiry to a more detailed conversation, so people did not have to complete a long questionnaire before getting help."
        },
        {
          "heading": "A distinction that mattered",
          "text": "A contact, an application and a confirmed service start are different outcomes. Keeping them separate helped me report what had actually happened and see where follow-up was still needed. This work taught me to connect software decisions with the people using the process."
        }
      ]
    },
    {
      "id": "letter",
      "title": "Finnish letter assistant",
      "category": "AI and language",
      "stage": "Side project / working MVP",
      "summary": "Explaining Finnish official letters in Somali, with checks for unsupported dates and commitments.",
      "subtitle": "Helping someone understand a letter, beyond translating its words.",
      "steps": "Read / Explain / Check",
      "role": "Problem research, application design and AI-assisted development",
      "tools": [
        "Next.js and React",
        "Express and Supabase",
        "LLM APIs and model routing"
      ],
      "sourceNote": "Separate from the public AQOON website. Private source; wider reader evaluation is still needed.",
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
        }
      ]
    },
    {
      "id": "nitrate",
      "title": "Groundwater nitrate analysis",
      "category": "Data analysis / HAN coursework",
      "stage": "University project / 2025",
      "summary": "Cleaning environmental data in Python and comparing models for groundwater nitrate prediction.",
      "subtitle": "An exchange-year project connecting data preparation, modelling and an environmental question.",
      "steps": "Prepare / Model / Compare",
      "role": "Data preparation and model comparison as part of university coursework",
      "tools": [
        "Python and Pandas",
        "scikit-learn",
        "Random Forest and XGBoost"
      ],
      "sourceNote": "Academic work completed during my Data-Driven Decision Making studies at HAN. This was not a deployed prediction service.",
      "links": [],
      "blocks": [
        {
          "heading": "The question",
          "text": "During my exchange at HAN in the Netherlands, I worked on groundwater nitrate prediction in the context of the Dutch dairy sector. The project gave me a practical way to use data analysis beyond spreadsheet reporting."
        },
        {
          "heading": "What I worked on",
          "text": "I cleaned environmental datasets in Python and compared Random Forest and XGBoost models. The work connected preparing usable data with testing different approaches to the prediction task."
        },
        {
          "heading": "What I took from it",
          "text": "I gained a foundation in Python data analysis and model comparison that I now build on in my own projects. My Python and SQL skills are still developing; I use AI support for coding and keep working on my ability to understand and check the result."
        }
      ]
    }
  ],
  "otherIntro": "Two additional examples of working through data and application behaviour.",
  "otherGroups": [
    {
      "id": "additional-work",
      "title": "Further examples",
      "entries": [
        {
          "id": "ridelink",
          "title": "RideLink: shared-ride coordination",
          "stage": "Side project / working MVP",
          "text": "I built a team dashboard, calendar imports and a shared page for parents to offer or claim seats. A database transaction checks remaining capacity before saving a booking. This taught me to handle simultaneous requests, not just the first successful click. Calendar updates and cancellations still need work before a full team trial.",
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
    "title": "Logistics student. Hands-on learner.",
    "intro": "I'm finishing my Purchasing and Logistics Engineering degree at JAMK. Work in retail, food operations and warehouses has made me curious about what happens behind the numbers: how goods move, where information gets lost and what people need to make a decision.",
    "approach": "I start by asking someone how the work actually happens. Then I map the problem, build a small next step and check it. I use Claude Code and Codex daily for planning, coding, review and tests. SafkaStock has given me practice with imports, databases and integrations, including plenty of cases where the first approach needed rethinking.",
    "experience": [
      {
        "title": "AQOON / Service-development pilots",
        "period": "Summer 2026 / Customer work and workflow tools",
        "text": "Ran projects with Pilke Päiväkodit and the City of Vantaa. Spoke with families, supported applications, coordinated follow-up and built tools to organise the work."
      },
      {
        "title": "Witas Agile Experiments Incubator",
        "period": "October to November 2025 / 135-hour internship",
        "text": "Worked on the first SafkaStock MVP and customer testing during a 135-hour internship."
      },
      {
        "title": "Customer service and operations",
        "period": "Retail, food operations and warehouse roles",
        "text": "At R-kioski, I handled independent shifts, customer enquiries and stock rotation. At IKEA, I worked with stock replenishment and food-hygiene procedures. During my exchange in the Netherlands, I also worked in automated fulfilment."
      }
    ],
    "education": "Purchasing and Logistics Engineering at JAMK, nearing graduation. During my 2024–2025 exchange at HAN in Arnhem, I studied Data-Driven Decision Making in Business and used Python for data preparation and modelling.",
    "lookingFor": "I'm looking for a full-time junior role in analytics, supply-chain technology or implementation. I want to work with real operational data, understand customers' problems and learn from an experienced team. I'm based in Helsinki and open to hybrid or remote work.",
    "facts": [
      [
        "Based in",
        "Helsinki, Finland"
      ],
      [
        "Education",
        "Purchasing and Logistics Engineering, JAMK. Nearing graduation."
      ],
      [
        "Exchange",
        "HAN, Arnhem. Data-Driven Decision Making in Business."
      ],
      [
        "Data skills",
        "Python and SQL fundamentals; Excel and Power BI through coursework and projects."
      ],
      [
        "Building",
        "AI-assisted development with Claude Code and Codex; GitHub, TypeScript, PostgreSQL and Prisma through projects."
      ],
      [
        "Languages",
        "Finnish and English fluent; Somali native."
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
      "title": "From first contact to practical follow-through",
      "steps": [
        [
          "Reach",
          "Make the opportunity understandable",
          "I use plain-Somali content and community outreach to explain a service and give people a clear way to ask for help."
        ],
        [
          "Listen",
          "Understand and organise the request",
          "I speak with the family, clarify what they need and record the relevant details and next actions in our private tracker."
        ],
        [
          "Support",
          "Help with the actual next step",
          "I research suitable options, help with forms and applications, and contact a provider when the situation needs clarification."
        ],
        [
          "Follow up",
          "Check progress without overstating it",
          "I follow up on the agreed action and distinguish an enquiry, an application and a confirmed start. Those are different stages of the work."
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
      "title": "The current foundation",
      "steps": [
        [
          "Import",
          "Start with supplier records",
          "Import supported PDFs and spreadsheets into structured records, retaining the source behind each calculation."
        ],
        [
          "Summarise",
          "Use what the report already establishes",
          "Show purchasing totals and categories within the selected report's scope. These answers do not require every product to be mapped."
        ],
        [
          "Compare",
          "Check purchasing costs",
          "Match product identity, units and price basis before comparing delivery records. Reuse accepted mappings. Keep overlapping report and delivery amounts separate."
        ],
        [
          "Next",
          "Connect recipes and sales",
          "Planned next step: link recipe quantities and sales to the cost foundation. This connection is still in development."
        ]
      ]
    },
    "nitrate": {
      "title": "The coursework approach",
      "steps": [
        [
          "Prepare",
          "Clean the input data",
          "Use Python to prepare environmental datasets for analysis."
        ],
        [
          "Model",
          "Try two modelling approaches",
          "Work with Random Forest and XGBoost on the nitrate prediction task."
        ],
        [
          "Compare",
          "Review the model results",
          "Compare the approaches as coursework, without treating the output as a deployed prediction service."
        ],
        [
          "Learn",
          "Build on the foundation",
          "Apply the experience to new data problems while developing my Python skills."
        ]
      ]
    }
  }
};
