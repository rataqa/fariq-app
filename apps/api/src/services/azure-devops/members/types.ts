export namespace Members {
  export interface Root {
    value: Value[];
    count: number;
  }

  export interface Value {
    isTeamAdmin?: boolean;
    identity    : Identity;
  }

  export interface Identity {
    id         : string;
    uniqueName : string;
    displayName: string;

    /**
     * Lookup /{organization}/_apis/identities?subjectDescriptors={CSV}
     * Lookup /{organization}/_apis/graph/users/{descriptor} ==> mailAddress
     */
    descriptor: string;

    _links  : Links;
    url     : string;
    imageUrl: string;
  }

  export interface Links {
    avatar: Avatar;
  }

  export interface Avatar {
    href: string;
  }

}