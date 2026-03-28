import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { FC, PropsWithChildren } from 'react';

const { Header, Content, Footer } = Layout;

const items = [
  {
    key: 1,
    label: `nav 1`,
  },
  {
    key: 2,
    label: `nav 2`,
  },
];

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '0 48px' }}>
        <Breadcrumb
          style={{ margin: '16px 0' }}
          items={[{ title: 'Home' }, { title: 'List' }, { title: 'App' }]}
        />
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          <main>
            <h1>Fariq</h1>
            <p>Automated monthly timesheets for Azure DevOps teams.</p>
            <section>
              {children}
            </section>
          </main>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        ... ©{new Date().getFullYear()} Created by ...
      </Footer>
    </Layout>
  );
};

export default MainLayout;
