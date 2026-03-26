export namespace WorkItems {
  export interface Root {
    count: number;
    value: Value[];
  }

  export interface Value {
    id       : number;
    rev      : number;
    fields   : Fields;
    relations: Relation[];
    _links   : Links4;
    url      : string;
  }

  export interface Fields {
    "System.Id"                                                   : number;
    "System.AreaId"                                               : number;
    "System.AreaPath"                                             : string;
    "System.NodeName"                                             : string;
    "System.TeamProject"                                          : string;
    "System.AreaLevel1"                                           : string;
    "System.Rev"                                                  : number;
    "System.AuthorizedDate"                                       : string;
    "System.RevisedDate"                                          : string;
    "System.IterationId"                                          : number;
    "System.IterationPath"                                        : string;
    "System.IterationLevel1"                                      : string;
    "System.WorkItemType"                                         : string;
    "System.State"                                                : string;
    "System.Reason"                                               : string;
    "System.CreatedDate"                                          : string;
    "System.CreatedBy"                                            : SystemCreatedBy;
    "System.ChangedDate"                                          : string;
    "System.ChangedBy"                                            : SystemChangedBy;
    "System.AuthorizedAs"                                         : SystemAuthorizedAs;
    "System.PersonId"                                             : number;
    "System.Watermark"                                            : number;
    "System.Title"                                                : string;
    "Microsoft.VSTS.Scheduling.Effort"                           ?: number;
    "WEF_6CB513B6E70E43499D9FC94E5BBFB784_System.ExtensionMarker"?: boolean;
    "WEF_6CB513B6E70E43499D9FC94E5BBFB784_Kanban.Column"         ?: string;
    "System.Description"                                          : string;
    "System.AreaLevel2"                                          ?: string;
    "System.AssignedTo"                                          ?: string;
    "Microsoft.VSTS.Scheduling.RemainingWork"                    ?: number;
    "System.Tags"                                                ?: string;
  }

  export interface SystemCreatedBy {
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

  export interface SystemChangedBy {
    displayName: string;
    url        : string;
    _links     : Links2;
    id         : string;
    uniqueName : string;
    imageUrl   : string;
    descriptor : string;
  }

  export interface Links2 {
    avatar: Avatar2;
  }

  export interface Avatar2 {
    href: string;
  }

  export interface SystemAuthorizedAs {
    displayName: string;
    url        : string;
    _links     : Links3;
    id         : string;
    uniqueName : string;
    imageUrl   : string;
    descriptor : string;
  }

  export interface Links3 {
    avatar: Avatar3;
  }

  export interface Avatar3 {
    href: string;
  }

  export interface Relation {
    rel: string;
    url: string;
    attributes: Attributes;
  }

  export interface Attributes {
    isLocked            ?: boolean;
    comment             ?: string;
    authorizedDate      ?: string;
    id                  ?: number;
    resourceCreatedDate ?: string;
    resourceModifiedDate?: string;
    revisedDate         ?: string;
    name                ?: string;
  }

  export interface Links4 {
    self             : Self;
    workItemUpdates  : WorkItemUpdates;
    workItemRevisions: WorkItemRevisions;
    workItemHistory  : WorkItemHistory;
    html             : Html;
    workItemType     : WorkItemType;
    fields           : Fields2;
  }

  export interface Self {
    href: string;
  }

  export interface WorkItemUpdates {
    href: string;
  }

  export interface WorkItemRevisions {
    href: string;
  }

  export interface WorkItemHistory {
    href: string;
  }

  export interface Html {
    href: string;
  }

  export interface WorkItemType {
    href: string;
  }

  export interface Fields2 {
    href: string;
  }
}
