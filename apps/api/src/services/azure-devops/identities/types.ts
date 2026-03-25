export namespace Identities {
  export interface Root {
    count: number;
    value: Value[];
  }

  export interface Value {
    id        : string;
    descriptor: string;

    /**
     * Lookup users by descriptor and get mailAddress
     */
    subjectDescriptor: string;

    providerDisplayName: string;

    isActive: boolean;

    members        : any[];
    memberOf       : any[];
    memberIds      : any[];
    properties     : Properties;
    resourceVersion: number;
    metaTypeId     : number;
  }

  export interface Properties {
    SchemaClassName     : SchemaClassName;
    Description         : Description;
    Domain              : Domain;
    Account             : Account;
    DN                  : Dn;
    Mail                : Mail;
    SpecialType         : SpecialType;
    PUID                : Puid;
    ComplianceValidated : ComplianceValidated;
    DirectoryAlias      : DirectoryAlias;
    MetadataUpdateDate ?: MetadataUpdateDate;

    "http://schemas.microsoft.com/identity/claims/objectidentifier": HttpSchemasMicrosoftComIdentityClaimsObjectidentifier;
  }

  export interface SchemaClassName {
    $type : string;
    $value: string;
  }

  export interface Description {
    $type : string;
    $value: string;
  }

  export interface Domain {
    $type : string;
    $value: string;
  }

  export interface Account {
    $type : string;
    $value: string;
  }

  export interface Dn {
    $type : string;
    $value: string;
  }

  export interface Mail {
    $type : string;
    $value: string;
  }

  export interface SpecialType {
    $type : string;
    $value: string;
  }

  export interface Puid {
    $type : string;
    $value: string;
  }

  export interface ComplianceValidated {
    $type : string;
    $value: string;
  }

  export interface HttpSchemasMicrosoftComIdentityClaimsObjectidentifier {
    $type : string;
    $value: string;
  }

  export interface DirectoryAlias {
    $type : string;
    $value: string;
  }

  export interface MetadataUpdateDate {
    $type : string;
    $value: string;
  }
}