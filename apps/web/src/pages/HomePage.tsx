import { FC } from 'react';

import MainLayout from '../layouts/MainLayout';
import CreateTimesheet from '../features/timesheets/CreateTimesheet';

const HomePage: FC = () => (
  <MainLayout>
    <CreateTimesheet />
  </MainLayout>
);

export default HomePage;
