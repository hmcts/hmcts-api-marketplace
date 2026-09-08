# Request API access

```mermaid
stateDiagram-v2
    direction LR

    state "Consumer" as ReqAccess_Consumer {
        [*] --> LoginGateAccess
        LoginGateAccess: Log in / Register
        SubmittedAccess: Submitted
        MoreInfoAccess1: More Info Needed
        CreateApplication: Create application for environment access
        MoreInfoAccess2: More Info Needed
        DeclinedEnvApp: Declined
        TestingInEnvironment: Testing in environment
    }

    state "DAP & Producer" as ReqAccess_DAP {
        InReviewAccess: In Review
        ApprovedAccess: Approved
        DeclinedInitial: Declined
    }

    state "Marketplace Team & Producer" as ReqAccess_MTP {
        ReviewingApplication: Reviewing application
        EnvironmentAccessIssued: Environment access issued
    }

    state "System" as ReqAccess_Sys {
        Active: Active
    }

    LoginGateAccess --> SubmittedAccess
    SubmittedAccess --> InReviewAccess: DAP & Producer review
    InReviewAccess --> MoreInfoAccess1: needs clarification
    MoreInfoAccess1 --> InReviewAccess: responds
    InReviewAccess --> ApprovedAccess: approved
    InReviewAccess --> DeclinedInitial: declined
    DeclinedInitial --> [*]
    ApprovedAccess --> CreateApplication: notifies Consumer, approved
    CreateApplication --> ReviewingApplication: submits application
    ReviewingApplication --> MoreInfoAccess2: needs clarification
    MoreInfoAccess2 --> ReviewingApplication: responds
    ReviewingApplication --> DeclinedEnvApp: not eligible (Marketplace Team notifies Consumer)
    DeclinedEnvApp --> [*]
    ReviewingApplication --> EnvironmentAccessIssued: approved
    EnvironmentAccessIssued --> TestingInEnvironment: environment ready, Consumer tests
    TestingInEnvironment --> CreateApplication: requests next environment in sequence
    TestingInEnvironment --> Active: final environment confirmed
    Active --> [*]
```
