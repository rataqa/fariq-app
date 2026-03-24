export namespace Projects {
  export interface Root {
    count: number;
    value: Value[];
  }

  export interface Value {
    id            : string;
    name          : string;
    description   : string;
    url           : string;
    state         : string;
    revision      : number;
    visibility    : string;
    lastUpdateTime: string;
  }
}
