export namespace Repos {

  export interface ISearchOptions {
    /**
     * member ID
     */
    'searchCriteria.creatorId'?: string;

    /**
     * creationDate >= this date/time
     */
    'searchCriteria.minTime'?: string;

    /**
     * creationDate <= this date/time
     */
    'searchCriteria.maxTime'?: string;

    /**
     * 'active', 'completed'
     */
    'searchCriteria.status'?: string | 'active' | 'completed';

    /**
     * 100
     */
    $top?: number;

    /**
     * 0
     */
    $skip?: number;
  }

  export interface Root {
    value: Value[];
    count: number;
  }

  export interface Value {
    id              : string;
    name            : string;
    url             : string;
    project         : Project;
    defaultBranch  ?: string;
    size            : number;
    remoteUrl       : string;
    sshUrl          : string;
    webUrl          : string;
    isDisabled      : boolean;
    isInMaintenance : boolean;
  }

  export interface Project {
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