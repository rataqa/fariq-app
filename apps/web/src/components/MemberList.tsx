import { Select } from 'antd';
import React from 'react';

import { IApiResponseWithMembers } from '../api/types';

interface IPropsOfMemberList {
  res?: IApiResponseWithMembers;
  selected: string;
  onChange?: (val: string) => void;
}

const MemberList: React.FC<IPropsOfMemberList> = ({ res, selected, onChange }) => {
  const options = res?.data.map(({ id, uniqueName }) => ({ value: id, label: uniqueName }));
  return (
    <div>
      <p>Member</p>
      <Select
        showSearch={{ optionFilterProp: 'label' }}
        placeholder="Select a member"
        onChange={onChange}
        options={options}
        defaultValue={selected}
        style={{ width: 300 }}
      />
    </div>
  );
};

export default MemberList;
