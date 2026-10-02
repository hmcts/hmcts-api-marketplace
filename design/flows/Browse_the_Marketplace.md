# Browse the Marketplace

```mermaid
stateDiagram-v2
    direction LR

    state "Visitor (not logged in)" as Visitor {
        [*] --> MarketplaceHome
        MarketplaceHome: Marketplace Home
        BrowseCatalogue: Browse API Catalogue
        BrowseGuidance: Browse Guidance
        AccessDocs: Access Documentation
        HelpSupport: Help & Support
        PublishAPI: Publish API
        APIProducerStandards: API producer standards

        MarketplaceHome --> BrowseCatalogue
        MarketplaceHome --> BrowseGuidance
        MarketplaceHome --> AccessDocs
        MarketplaceHome --> HelpSupport
        MarketplaceHome --> PublishAPI

        BrowseGuidance --> [*]
        AccessDocs --> [*]
        HelpSupport --> [*]

        PublishAPI --> APIProducerStandards
    }

    RequestNewAPI: Request new API
    RequestAPIAccess: Request API access (Try it now is the first step)
    APIForPublication: API for publication

    BrowseCatalogue --> RequestNewAPI: continues at login gate, see Request_new_API.md
    HelpSupport --> RequestNewAPI: continues at login gate, see Request_new_API.md
    BrowseCatalogue --> RequestAPIAccess: continues at login gate, see Request_API_access.md
    APIProducerStandards --> APIForPublication

    RequestNewAPI --> [*]
    RequestAPIAccess --> [*]: continues at login gate, see Request_API_access.md
    APIForPublication --> [*]: continues at login gate, see Publish_API.md
```
