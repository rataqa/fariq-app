import { Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { FC } from 'react';
import { IApiResponseWithPullRequestStats } from '../../api/types';

interface IPropsForTimeSheetView {
  res?: IApiResponseWithPullRequestStats;
}

const FRI = 5, SAT = 6, WEEKEND = [FRI, SAT];

const isWeekend = (yyyymmdd: string) => {
  const date = dayjs(yyyymmdd, 'YYYYMMDD');
  return WEEKEND.includes(date.day());
};

const getColor = (yyyymmdd: string) => {
  if (isWeekend(yyyymmdd)) return 'lime';
  return 'geekblue';
}

const columns = [
  {
    title: 'Day',
    dataIndex: 'day',
    key: 'day',
    render: (_: any, row: any) => (
      <Tag color={getColor(row.day)} key={row.day}>{row.day}</Tag>
    )
  },
  {
    title: 'PRs',
    dataIndex: 'prCount',
    key: 'prCount',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    // render: (_: any, row: any) => (
    //   <p>{row.text.split('\n').map((line: string, idx: number) => (<span key={`${idx}-${line}`}>{line}<br /></span>))}</p>
    // ),
  },
];

const TimeSheetView: FC<IPropsForTimeSheetView> = ({ res }) => {
  const ds: any = [];

  Object.entries(res?.data || {}).forEach(([_email, dayStats]) => {
    Object.entries(dayStats).forEach(([yyyymmdd, row]) => {
      ds.push({
        day: yyyymmdd,
        prCount: row.count,
        description: row.text,
      });
    })
  })

  return (
    <div>
      <Table dataSource={ds} columns={columns} pagination={false} />
      {res?.meta && (
        <p>Total PRs {res.meta?.totalPullRequests}. Closed {res.meta?.totalClosedPullRequests}. Average hours to close {res.meta?.avgTimeToCloseInHrs}</p>
      )}
      <div>Legend: <Tag color='geekblue'>Workday</Tag>, <Tag color='lime'>Holiday/Weekend</Tag></div>
    </div>
  );
};

export default TimeSheetView;
