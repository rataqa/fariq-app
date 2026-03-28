import dayjs from 'dayjs';
import { FC, useState } from 'react';

import { useProjects } from '../../hooks/useProjects';
import { useTeams } from '../../hooks/useTeams';
import { useMembers } from '../../hooks/useMembers';

import ProjectList from '../../components/ProjectList';
import TeamList from '../../components/TeamList';
import MemberList from '../../components/MemberList';
import YearMonthPicker from '../../components/YearMonthPicker';
import { useMemberStats } from '../../hooks/useMemberStats';
import TimeSheetView from './TimeSheetView';

const CreateTimesheet: FC = () => {
  const [projectId, setProjectId] = useState('');
  const [teamId, setTeamId]       = useState('');
  const [memberId, setMemberId]   = useState('');
  const [yearMonth, setYearMonth] = useState('-');
  const [yyyy = '', mm = '']      = String(yearMonth || '-').split('-');

  const projects    = useProjects();
  const teams       = useTeams(projectId);
  const members     = useMembers(projectId, teamId);
  const memberStats = useMemberStats(projectId, memberId, yyyy, mm);

  function onSelectProject(v: string) {
    setProjectId(v);
    setTeamId('');
    setMemberId('');
    setYearMonth('-');
  }
  function onSelectTeam(v: string) {
    setTeamId(v);
    setMemberId('');
    setYearMonth('-')
  }
  function onSelectMember(v: string) {
    setMemberId(v);
    setYearMonth('-');
  }
  function onSelectYearMonth(yyyy_mm: string | null, e: string | null) {
    console.log(yyyy_mm);
    const d = dayjs(yyyy_mm)
    const yyyy = d.year();
    const mm = d.month() + 1;
    console.log(yyyy, mm);
    setYearMonth(`${yyyy}-${mm}`);
  }

  return (
    <div>
      <p>Create timesheet</p>
      <ProjectList res={projects.data} selected={projectId} onChange={onSelectProject} />
      <TeamList res={teams.data} selected={teamId} onChange={onSelectTeam} />
      <MemberList res={members.data} selected={memberId} onChange={onSelectMember} />
      <YearMonthPicker onChange={onSelectYearMonth} />
      <TimeSheetView res={memberStats.data} />
    </div>
  );
};

export default CreateTimesheet;
