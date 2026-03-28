import { Select } from 'antd';
import React from 'react';

import { IApiResponseWithProjects } from '../api/types';

interface IPropsOfProjectList {
  res?: IApiResponseWithProjects;
  selected: string;
  onChange?: (val: string) => void;
}

const ProjectList: React.FC<IPropsOfProjectList> = ({ res, selected, onChange }) => {
  const options = res?.data.map(({ id, name }) => ({ value: id, label: name }));
  return (
    <div>
      <p>Project</p>
      <Select
        showSearch={{ optionFilterProp: 'label' }}
        placeholder="Select a project"
        onChange={onChange}
        options={options}
        defaultValue={selected}
        style={{ width: 300 }}
      />
    </div>
  );
};

export default ProjectList;
