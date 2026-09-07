// HMCTS API Marketplace — mock API dataset

var APIS = {
  "crime-prosecution-case-details": {
    name: "Crime Prosecution Case Details API",
    domain: "Case Administration",
    domainId: "case-admin",
    classification: "Official-Sensitive",
    classificationId: "sensitive",
    status: "Live",
    statusId: "live",
    team: "Crime Prosecution Digital Team",
    repo: "hmcts/api-cp-crime-prosecution-case-details",
    version: "2.4.0",
    summary: "Returns case details for prosecuted criminal cases, including defendant, hearing and outcome information, for services that need to display or process case progression.",
    whatItDoes: "This API lets your service look up a criminal case by reference number and get back the current status, listed hearings, and recorded outcomes. It does not return victim or witness personal data, and it does not allow you to create or amend case records.",
    endpoints: [
      { method: "GET", path: "/cases/{caseReference}", desc: "Retrieve a single case by its reference number" },
      { method: "GET", path: "/cases/{caseReference}/hearings", desc: "List all hearings scheduled or held for a case" },
      { method: "GET", path: "/cases/{caseReference}/outcomes", desc: "Retrieve recorded outcomes for a case" },
      { method: "GET", path: "/cases", desc: "Search cases by defendant name, date range or court" }
    ],
    schemas: ["Case", "Hearing", "Outcome", "Defendant (summary only)", "Court"],
    changelog: [
      { version: "2.4.0", note: "Added outcome recorded date to the Outcome schema" },
      { version: "2.3.0", note: "Deprecated the legacy /case-lookup endpoint (removed in v2.0)" },
      { version: "2.2.1", note: "Fixed pagination bug on the case search endpoint" }
    ]
  },
  "hearing-results": {
    name: "Hearing Results API",
    domain: "Hearing Results",
    domainId: "hearing-results",
    classification: "Official",
    classificationId: "official",
    status: "Live",
    statusId: "live",
    team: "Court Records Team",
    repo: "hmcts/api-hearing-results",
    version: "1.6.2",
    summary: "Provides recorded results and orders from court and tribunal hearings, for services that need to display hearing outcomes to legal professionals or the public.",
    whatItDoes: "This API returns the recorded result of a hearing once it has concluded, including any orders made. It is read-only and does not expose in-progress hearing notes or judicial deliberations.",
    endpoints: [
      { method: "GET", path: "/hearings/{hearingId}/result", desc: "Retrieve the recorded result of a hearing" },
      { method: "GET", path: "/hearings/{hearingId}/orders", desc: "List orders made at a hearing" },
      { method: "GET", path: "/results", desc: "Search hearing results by date range or court" }
    ],
    schemas: ["HearingResult", "Order", "Court"],
    changelog: [
      { version: "1.6.2", note: "Added court venue code to HearingResult schema" },
      { version: "1.5.0", note: "Added /results search endpoint" }
    ]
  },
  "court-listings-scheduling": {
    name: "Court Listings and Scheduling API",
    domain: "Scheduling and Listing",
    domainId: "scheduling",
    classification: "Official",
    classificationId: "official",
    status: "Live",
    statusId: "live",
    team: "Listing and Scheduling Team",
    repo: "hmcts/api-court-listings-scheduling",
    version: "3.1.0",
    summary: "Returns published court and tribunal listings, including scheduled hearing times, courtrooms and case types, for services that display daily cause lists.",
    whatItDoes: "This API lets your service retrieve the published list of hearings scheduled at a given court on a given day. It reflects publicly published cause lists and does not include unlisted or provisional hearings.",
    endpoints: [
      { method: "GET", path: "/listings/{courtId}/{date}", desc: "Retrieve the published listing for a court on a given date" },
      { method: "GET", path: "/courtrooms/{courtId}", desc: "List courtrooms available at a court" },
      { method: "POST", path: "/listings/search", desc: "Search listings across multiple courts and date ranges" }
    ],
    schemas: ["Listing", "Courtroom", "CaseType", "Court"],
    changelog: [
      { version: "3.1.0", note: "Added multi-court search endpoint" },
      { version: "3.0.0", note: "Breaking change: courtId now uses the new HMCTS court code format" }
    ]
  },
  "court-tribunal-reference-data": {
    name: "Court and Tribunal Reference Data API",
    domain: "Reference Data",
    domainId: "reference-data",
    classification: "Official",
    classificationId: "official",
    status: "Live",
    statusId: "live",
    team: "Reference Data Team",
    repo: "hmcts/api-court-tribunal-reference-data",
    version: "4.0.1",
    summary: "Provides canonical reference data for courts, tribunals, venues and case types across HMCTS, for services that need consistent lookups rather than hard-coded lists.",
    whatItDoes: "This API returns the current list of active courts and tribunals, their addresses, contact details and jurisdiction codes. Use it instead of maintaining your own copy of this data, which changes periodically.",
    endpoints: [
      { method: "GET", path: "/courts", desc: "List all active courts and tribunals" },
      { method: "GET", path: "/courts/{courtId}", desc: "Retrieve details for a single court or tribunal" },
      { method: "GET", path: "/case-types", desc: "List all case types and their jurisdiction" }
    ],
    schemas: ["Court", "Venue", "CaseType", "Jurisdiction"],
    changelog: [
      { version: "4.0.1", note: "Corrected postcode formatting for three Scottish venues" },
      { version: "4.0.0", note: "Breaking change: jurisdiction codes realigned to ISO-style format" }
    ]
  },
  "fees-financial-transactions": {
    name: "Fees and Financial Transactions API",
    domain: "Financial",
    domainId: "financial",
    classification: "Official-Sensitive",
    classificationId: "sensitive",
    status: "Live",
    statusId: "live",
    team: "Payments and Fees Team",
    repo: "hmcts/api-fees-financial-transactions",
    version: "1.2.0",
    summary: "Returns fee schedules and transaction records for court and tribunal payments, for services that need to calculate fees or reconcile payment status.",
    whatItDoes: "This API lets your service look up the current fee for a case type, and check the payment status of a transaction. It does not process payments itself and does not return full card or bank account details.",
    endpoints: [
      { method: "GET", path: "/fees/{caseType}", desc: "Retrieve the current fee for a case type" },
      { method: "GET", path: "/transactions/{transactionId}", desc: "Retrieve the status of a payment transaction" },
      { method: "GET", path: "/transactions", desc: "Search transactions by date range or case reference" }
    ],
    schemas: ["Fee", "Transaction", "CaseType"],
    changelog: [
      { version: "1.2.0", note: "Added remission status field to Transaction schema" },
      { version: "1.1.0", note: "Added transaction search endpoint" }
    ]
  },
  "tribunal-case-administration": {
    name: "Tribunal Case Administration API",
    domain: "Case Administration",
    domainId: "case-admin",
    classification: "Official",
    classificationId: "official",
    status: "Live",
    statusId: "live",
    team: "Tribunals Digital Team",
    repo: "hmcts/api-tribunal-case-administration",
    version: "1.9.3",
    summary: "Provides case administration data for tribunal cases, including case status, parties and represented status, for services supporting tribunal case management.",
    whatItDoes: "This API returns the administrative status of a tribunal case and the parties involved at a summary level. It does not return full witness statements, evidence bundles or judicial notes.",
    endpoints: [
      { method: "GET", path: "/tribunal-cases/{caseReference}", desc: "Retrieve a tribunal case by reference number" },
      { method: "GET", path: "/tribunal-cases/{caseReference}/parties", desc: "List parties associated with a tribunal case" },
      { method: "PUT", path: "/tribunal-cases/{caseReference}/status", desc: "Update the administrative status of a case (producer use only)" }
    ],
    schemas: ["TribunalCase", "Party", "CaseStatus"],
    changelog: [
      { version: "1.9.3", note: "Added represented-status flag to Party schema" },
      { version: "1.8.0", note: "Added PUT status endpoint for authorised producer services" }
    ]
  }
};
