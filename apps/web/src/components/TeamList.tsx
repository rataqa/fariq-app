import { Select } from 'antd';
import React from 'react';

import { IApiResponseWithTeams } from '../api/types';

interface IPropsOfTeamList {
  res?: IApiResponseWithTeams;
  selected: string;
  onChange?: (val: string) => void;
}

const TeamList: React.FC<IPropsOfTeamList> = ({ res, selected, onChange }) => {
  const options = res?.data.map(({ id, name }) => ({ value: id, label: name }));
  return (
    <div>
      <p>Team</p>
      <Select
        showSearch={{ optionFilterProp: 'label' }}
        placeholder="Select a team"
        onChange={onChange}
        options={options}
        defaultValue={selected}
        style={{ width: 300 }}
      />
    </div>
  );
};

export default TeamList;
