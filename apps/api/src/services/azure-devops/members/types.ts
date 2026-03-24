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
    displayName: string;
    url        : string;
    _links     : Links;
    id         : string;
    uniqueName : string;
    imageUrl   : string;
    descriptor : string;
  }

  export interface Links {
    avatar: Avatar;
  }

  export interface Avatar {
    href: string;
  }

}