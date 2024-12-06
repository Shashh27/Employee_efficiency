import React, { useState, useEffect } from "react";
import axios from "axios";
import { Layout, Menu, Table, Modal, Tag, Button , Dropdown , Menu as AntMenu } from "antd";
import logo from "../assets/cmti_logo.jpg";
import Report from "./Report"; // Import the Report component
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../utils/auth';

const { Header, Content } = Layout;

export default function Supervisor() {
  const [reportData, setReportData] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get("http://localhost:8000/supervisor_reports");
        setReportData(response.data.map((report, index) => ({
          ...report,
          key: index + 1,
          slno: index + 1
        })));
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);


  const handleStatusUpdate = async (record, status) => {
    try {
      const response = await axios.put("http://localhost:8000/update_status", {
        status: status,
        operator_name: record.operator_name,
        report_date: record.report_date
      });

      // Update local state to reflect the status change
      const updatedReports = reportData.map(report => 
        report.operator_name === record.operator_name && 
        report.report_date === record.report_date 
          ? { ...report, status: status }
          : report
      );
      setReportData(updatedReports);

      // Show success message
      message.success(`Report ${status} successfully`);
    } catch (error) {
      console.error("Error updating report status:", error);
      message.error("Failed to update report status");
    }
  };

  const handleViewReport = (record) => {
    setSelectedReport(record);
    setIsModalVisible(true);
  };

  const columns = [
    { 
      title: "Sl No", 
      dataIndex: "slno", 
      key: "slno", 
      align: "center",
    },
    { 
      title: "Name", 
      dataIndex: "operator_name", 
      key: "report", 
      align: "center",
      render: (_, record) => `${record.operator_name} - ${record.report_date}`
    },
    {
      title: "Report",
      key: "report",
      align: "center",
      render: (_, record) => (
        <Button onClick={() => handleViewReport(record)}>
          View Report
        </Button>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        if (status === "approved") {
          return <Tag color="green">Approved</Tag>;
        } else if (status === "rejected") {
          return <Tag color="red">Rejected</Tag>;
        }
        return <Tag color="yellow">Pending</Tag>;
      }
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) =>
        record.action === "Approved" ? (
          <Tag color="green">APPROVED</Tag>
        ) : record.action === "Rejected" ? (
          <Tag color="red">REJECTED</Tag>
        ) : (
          <>
            <Button
              style={{
                borderColor:'green',
                color:'green',
                marginRight: 8,
              }}
              onClick={() => handleStatusUpdate(record, "approved")}
            >
              Approve
            </Button>
            <Button
              style={{
                borderColor: "red",
                color: "red",
              }}
              onClick={() => handleStatusUpdate(record, "rejected")}
            >
              Reject
            </Button>
          </>
        ),
    }
  ];

  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  const profileMenu = (
    <AntMenu>
      <AntMenu.Item key="logout" onClick={handleLogout}>
        Logout
      </AntMenu.Item>
    </AntMenu>
  );


  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Header style={{ backgroundColor: "#fff" }}>
        <Menu theme="light" mode="horizontal" style={{ width: "100%" }} defaultSelectedKeys={["reports"]}>
          <Menu.Item style={{ pointerEvents: "none" }}>
            <img src={logo} alt="Logo" style={{ height: "35px", width: "100px", marginTop: "7px" }} />
          </Menu.Item>
          <Menu.Item key="profile" style={{ marginLeft: 'auto' }}>
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <UserOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
            </Dropdown>
          </Menu.Item>
        </Menu>
      </Header>
      
      <Content>
        <div
          style={{
            width: "1400px",
            marginLeft: "60px",
            backgroundColor: "white",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          <h2 style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: "25px", padding: "20px" }}>
            Production Reports
          </h2>
          <Table 
            columns={columns} 
            dataSource={reportData} 
            pagination={{ pageSize: 5 }} 
          />
        </div>
      </Content>

      <Modal
        title="Production Report"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1100}
        footer={null}
      >
        {selectedReport && <Report reportData={selectedReport} />}
      </Modal>
    </Layout>
  );
}