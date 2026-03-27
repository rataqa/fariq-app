export namespace Teams {
  export interface Root {
    value: Value[];
    count: number;
  }

  export interface Value {
    id         : string;
    name       : string;
    url        : string;
    description: string;
    identityUrl: string;
    projectName: string;
    projectId  : string;
  }
}
