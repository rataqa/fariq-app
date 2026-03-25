export namespace RepoPullRequests {

  export interface Root {
    value: Value[];
    count: number;
  }

  export interface Value {
    repository           : Repository;
    pullRequestId        : number;
    codeReviewId         : number;

    /**
     * 'active', 'completed'
     */
    status: string;

    createdBy            : CreatedBy;
    creationDate         : string;
    closedDate?          : string;
    title                : string;
    description          : string;
    sourceRefName        : string;
    targetRefName        : string;
    mergeStatus          : string;
    isDraft              : boolean;
    mergeId              : string;
    lastMergeSourceCommit: LastMergeSourceCommit;
    lastMergeTargetCommit: LastMergeTargetCommit;
    lastMergeCommit      : LastMergeCommit;
    reviewers            : Reviewer[];
    labels               : Label[];
    url                  : string;
    completionOptions    : CompletionOptions;
    supportsIterations   : boolean;
    completionQueueTime  : string;
  }

  export interface Repository {
    id     : string;
    name   : string;
    url    : string;
    project: Project;
  }

  export interface Project {
    id            : string;
    name          : string;
    state         : string;
    visibility    : string;
    lastUpdateTime: string;
  }

  export interface CreatedBy {
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

  export interface LastMergeSourceCommit {
    commitId: string;
    url     : string;
  }

  export interface LastMergeTargetCommit {
    commitId: string;
    url     : string;
  }

  export interface LastMergeCommit {
    commitId: string;
    url     : string;
  }

  export interface Reviewer {
    reviewerUrl : string;
    vote        : number;
    votedFor   ?: VotedFor[];
    hasDeclined : boolean;
    isFlagged   : boolean;
    displayName : string;
    url         : string;
    _links      : Links3;
    id          : string;
    uniqueName  : string;
    imageUrl    : string;
    isRequired ?: boolean;
    isContainer?: boolean;
  }

  export interface VotedFor {
    reviewerUrl: string;
    vote       : number;
    displayName: string;
    url        : string;
    _links     : Links2;
    id         : string;
    uniqueName : string;
    imageUrl   : string;
    isContainer: boolean;
  }

  export interface Links2 {
    avatar: Avatar2;
  }

  export interface Avatar2 {
    href: string;
  }

  export interface Links3 {
    avatar: Avatar3;
  }

  export interface Avatar3 {
    href: string;
  }

  export interface Label {
    id    : string;
    name  : string;
    active: boolean;
  }

  export interface CompletionOptions {
    mergeCommitMessage         : string;
    deleteSourceBranch         : boolean;
    squashMerge                : boolean;
    mergeStrategy              : string;
    autoCompleteIgnoreConfigIds: any[];
  }

}