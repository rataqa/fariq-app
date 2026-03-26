export namespace DbWork {
  export interface IData {
    workItems: Array<IWorkItem>;
  }

  export interface IWorkItem {
    projectId  : string;
    id         : number;
    title      : string;
    itemType   : string;
    state      : string;
    createdDate: string;
    createdBy  : {
      id        : string;
      uniqueName: string;
    };
  }
}
