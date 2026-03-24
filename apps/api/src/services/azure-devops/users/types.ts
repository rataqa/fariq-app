export namespace Users {
  export interface Root {
    count: number;
    value: Value[];
  }

  export interface Value {
    subjectKind    : string;
    metaType      ?: string;
    directoryAlias?: string;
    domain         : string;
    principalName  : string;
    mailAddress    : string;
    origin         : string;
    originId       : string;
    displayName    : string;
    _links         : Links;
    url            : string;
    descriptor     : string;
  }

  export interface Links {
    self           : Self;
    memberships    : Memberships;
    membershipState: MembershipState;
    storageKey     : StorageKey;
    avatar         : Avatar;
  }

  export interface Self {
    href: string;
  }

  export interface Memberships {
    href: string;
  }

  export interface MembershipState {
    href: string;
  }

  export interface StorageKey {
    href: string;
  }

  export interface Avatar {
    href: string;
  }
}

export namespace User {
  export interface Root {
    /**
     * 'user'
     */
    subjectKind: string;

    /**
     * 'member', 'guest' or undefined
     */
    metaType?: string;

    directoryAlias: string;
    domain        : string;
    
    /**
     * username but sometimes it is a UUID v4
     */
    principalName: string;

    /**
     * email address but sometimes it is empty string
     */
    mailAddress: string;

    /**
     * 'aad'
     */
    origin        : string;

    /**
     * AAD identifier
     */
    originId: string;

    /**
     * Full name
     */
    displayName: string;
    _links     : Links;
    url        : string;
    descriptor : string;
  }

  export interface Links {
    self           : Self;
    memberships    : Memberships;
    membershipState: MembershipState;
    storageKey     : StorageKey;
    avatar         : Avatar;
  }

  export interface Self {
    href: string;
  }

  export interface Memberships {
    href: string;
  }

  export interface MembershipState {
    href: string;
  }

  export interface StorageKey {
    href: string;
  }

  export interface Avatar {
    href: string;
  }

}