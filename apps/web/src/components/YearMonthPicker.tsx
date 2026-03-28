import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

interface IPropsForYearMonthPicker {
  onChange: (s: string | null, e: string | null) => void;
}

const dateFormat = 'YYYY-MM-DD';

const YearMonthPicker: React.FC<IPropsForYearMonthPicker> = ({ onChange }) => {
  const now = new Date();
  const lastYear = dayjs(new Date(now.getFullYear() - 1, 0, 1), dateFormat);
  const thisMonth = dayjs(now, dateFormat);
  return (
    <Space vertical size={12}>
      <DatePicker prefix="Month" onChange={onChange} picker="month" minDate={lastYear} maxDate={thisMonth} />
    </Space>
  );
}

export default YearMonthPicker;
