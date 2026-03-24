export namespace RepoStats {
  export interface Root {
    count: number;
    value: Value[];
  }

  export interface Value {
    commit       : Commit;
    name         : string;
    aheadCount   : number;
    behindCount  : number;
    isBaseVersion: boolean;
  }

  export interface Commit {
    commitId         : string;
    author           : Author;
    committer        : Committer;
    comment          : string;
    url              : string;
    commentTruncated?: boolean;
    treeId          ?: string;
    parents         ?: string[];
  }

  export interface Author {
    name: string;
    email: string;
    date: string;
  }

  export interface Committer {
    name : string;
    email: string;
    date : string;
  }
}