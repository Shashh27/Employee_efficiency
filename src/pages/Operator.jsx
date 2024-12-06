import React, { useState , useEffect} from 'react';
import { Layout, Menu, Form, Input, Select, Button, TimePicker, DatePicker, Table, Tag, Collapse, message , Modal , Dropdown, Menu as AntMenu} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Plus } from 'lucide-react';
import logo from '../assets/cmti_logo.jpg';
import Report from './Report';
import html2pdf from 'html2pdf.js';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate , useParams} from 'react-router-dom'
import { clearAuth } from '../utils/auth';

const { Header, Content } = Layout;
const { Option } = Select;
const { Panel } = Collapse;

export default function Operator() {
  const [activeTab, setActiveTab] = useState('reports');
  const [panelKeys, setPanelKeys] = useState([1]);  
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const { operatorName } = useParams();

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

  const addPanel = () => {
    setPanelKeys([...panelKeys, panelKeys.length + 1]);
  };

  const removePanel = (key) => {
    setPanelKeys(panelKeys.filter((panelKey) => panelKey !== key));
  };

  const formatPanelData = (values, panelKey) => {
    try {
      return {
        start_time: values[`startTime-${panelKey}`]?.format('HH:mm') || '',
        end_time: values[`endTime-${panelKey}`]?.format('HH:mm') || '',
        work_order: values[`workOrder-${panelKey}`] || '',
        process: values[`process-${panelKey}`] || '',
        dia: values[`dia-${panelKey}`] || '',
        item_name: values[`itemName-${panelKey}`] || '',
        quantity: parseInt(values[`quantity-${panelKey}`]) || 0,
        setup_time: parseFloat(values[`setUpTime-${panelKey}`]) || 0,
        mc_time: parseFloat(values[`mcTime-${panelKey}`]) || 0,
        loading_unloading_time: parseFloat(values[`loadingTime-${panelKey}`]) || 0,
        fld_breakdown_time: parseFloat(values[`fldTime-${panelKey}`]) || 0,
        no_load_time: parseFloat(values[`noLoadTime-${panelKey}`]) || 0
      };
    } catch (error) {
      console.error(`Error formatting panel ${panelKey} data:`, error);
      throw new Error(`Invalid data in panel ${panelKey}`);
    }
  };

  const onFinish = async (values) => {
    try {
      // Validate all required fields are present
      if (!values.operatorName || !values.shift || !values.date) {
        throw new Error('Missing required fields');
      }

      const panelEntries = await Promise.all(
        panelKeys.map(key => formatPanelData(values, key))
      );
      
      const reportData = {
        operator_name: values.operatorName,
        shift: values.shift,
        machine_name: values.machineName || '',
        report_date: values.date.format('YYYY-MM-DD'),
        shift_time: values.shiftTime || '',
        machine_number: values.machineNumber || '',
        quality_rework: values.qualityRework || 'no',
        multi_machine_operat: values.multimachine || 'no',
        rejection: values.rejection || 'no',
        actual_time: parseFloat(values.actualTime) || 0,
        ideal_time: parseFloat(values.idealTime) || 0,
        total_time_loss: parseFloat(values.totalTimeLoss) || 0,
        time_loss_no_load: parseFloat(values.timeLossNoLoad) || 0,
        panel_entries: panelEntries
      };

      const response = await fetch('http://localhost:8000/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error');
      }

      message.success('Report submitted successfully!');
      form.resetFields();
      setPanelKeys([1]);
      setActiveTab('reports');
    } catch (error) {
      message.error(`Failed to submit report: ${error.message}`);
      console.error('Error submitting report:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reports?operator_name=${operatorName}`);
      const data = await response.json();
      
      // Transform the data for table display
      const transformedData = Object.entries(data).map(([date, reports]) => ({
        key: date,
        date,
        reportData: reports[0],
        status: reports[0].status,
      }));
      
      setData(transformedData);
      console.log("t:",transformedData);
      console.log("data:",data);
    } catch (error) {
      message.error('Failed to fetch reports');
      console.error('Error fetching reports:', error);
    }
  };


  const showReport = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date', align: 'center' },
    {
      title: 'Report',
      key: 'report',
      align: 'center',
      render: (_, record) => (
        record.reportData ? (
          <Button type="link" onClick={() => showReport(record.reportData)}>
            View Report
          </Button>
        ) : null
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const displayStatus = status && status.trim() !== '' ? status : 'pending';
        const color =
          displayStatus === 'approved' ? 'green' : displayStatus === 'rejected' ? 'volcano' : 'blue';
        return <Tag color={color}>{displayStatus.toUpperCase()}</Tag>;
      },
    },
  ];


  const handleDownload = () => {
    if (!selectedReport) {
      message.error('No report selected');
      return;
    }

    // Get the existing report container from the modal
    const reportContainer = document.getElementById('report-container');
    
    if (!reportContainer) {
      message.error('Report container not found');
      return;
    }

    const opt = {
      margin: 10,
      filename: `Production_Report_${selectedReport.report_date}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
        scrollY: -window.scrollY // Handle scrolled content
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Add a class to the container for PDF generation
    reportContainer.classList.add('generating-pdf');

    // Generate PDF
    html2pdf()
      .set(opt)
      .from(reportContainer)
      .save()
      .then(() => {
        reportContainer.classList.remove('generating-pdf');
        message.success('PDF generated successfully');
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        message.error('Failed to generate PDF');
        reportContainer.classList.remove('generating-pdf');
      });
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Header style={{ backgroundColor: '#fff' }}>
        <Menu
          theme="light"
          mode="horizontal"
          style={{ width: '100%' }}
          defaultSelectedKeys={['reports']}
          onClick={(e) => {
            if (e.key !== 'profile') {
              setActiveTab(e.key);
            }
          }}
          selectedKeys={[activeTab]}        
          >
          <Menu.Item style={{ pointerEvents: 'none' }}>
            <img src={logo} alt="Logo" style={{ height: '35px', width: '100px', marginTop: '7px' }} />
          </Menu.Item>
          <Menu.Item key="reports" style={{ marginLeft: '1000px' }}>Reports</Menu.Item>
          <Menu.Item key="addReports">Add Reports</Menu.Item>
          <Menu.Item key="profile" style={{ marginLeft: 'auto' }}>
            <Dropdown overlay={profileMenu} trigger={['click']}>
              <UserOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
            </Dropdown>
          </Menu.Item>
        </Menu>
      </Header>

      <Content style={{ padding: '20px' }}>
        {activeTab === 'reports' && (
          <div style={{ width: '1400px', marginLeft: '60px', backgroundColor: 'white', borderRadius: '10px', marginTop: '10px' }}>
            <h2 style={{ textAlign: 'center', fontFamily: 'sans-serif', fontSize: '25px', padding: '20px' }}>Production Reports</h2>
            <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} locale={{ emptyText: 'No data' }} />
            
            <Modal
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              width={1200}
              footer={[
                <Button
                  type="primary"
                  onClick={handleDownload}
                  key="download"
                >
                  Download Report
                </Button>,
              ]}            >
           <div id="report-container" style={{ padding: '20px' }}>
              {selectedReport && <Report reportData={selectedReport} />}
            </div>
            </Modal>          
          </div>
        )}

        {activeTab === 'addReports' && (
          <div style={{ backgroundColor: 'white', width: '1480px', padding: '20px', borderRadius: '10px', marginTop: '10px' }}>
            <h2 style={{ textAlign: 'center', fontSize: '20px', marginBottom: '10px' }}>Add Production Report</h2>
            <Form
              name="operatorDashboard"
              layout="vertical"
              form={form}
              onFinish={onFinish}
            >
                <div style={{display:'flex' , gap:'50px'}}>
                  <Form.Item label="Operator Name" name="operatorName" rules={[{ required: true, message: 'Please input operator name!' }]}>
                    <Input placeholder="Enter operator name"  style={{width:'200px'}}/>
                  </Form.Item>

                  <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please select date!' }]}>
                    <DatePicker style={{ width: '150px' }} />
                  </Form.Item>

                  <Form.Item label="Shift" name="shift" rules={[{ required: true, message: 'Please input shift!' }]}>
                  <Select placeholder="Select shift" style={{width:'150px'}}>
                      <Option value="1st">1st</Option>
                      <Option value="2nd">2nd</Option>
                    </Select>                 
                  </Form.Item>
                  
                  <Form.Item label="Shift Time" name="shiftTime" rules={[{ required: true, message: 'Please input shift time!' }]}>
                    <Select placeholder="Select shift time" style={{width:'150px'}}>
                      <Option value="09:00-17:00">09:00-17:00</Option>
                      <Option value="18:00-02:00">18:00-02:00</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Machine Name" name="machineName" rules={[{ required: true, message: 'Please input machine name!' }]}>
                    <Input placeholder="Enter machine name" style={{width:'150px'}}/>
                  </Form.Item>

                  <Form.Item label="Machine Number" name="machineNumber" rules={[{ required: true, message: 'Please input machine number!' }]}>
                    <Input placeholder="Enter machine number" style={{width:'150px'}} />
                  </Form.Item>
              </div>
              {panelKeys.map((key, index) => (
                <Collapse key={key} style={{ marginBottom: '20px' }} defaultActiveKey={[`${key}`]}>
                  <Panel
                    header={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{`Report Details ${key}`}</span>
                        {index > 0 && (
                          <CloseOutlined onClick={() => removePanel(key)} style={{ cursor: 'pointer', color: 'red' }} />
                        )}
                      </div>
                    }
                    key={key}
                  >
                       <div style={{display:'flex' , gap:'10px'}}>
                        <Form.Item label="Start Time" name={`startTime-${key}`} rules={[{ required: true, message: 'Please select start time!' }]}>
                          <TimePicker style={{ width: '100px' }} format="HH:mm" />
                        </Form.Item>

                        <Form.Item label="End Time" name={`endTime-${key}`} rules={[{ required: true, message: 'Please select end time!' }]}>
                          <TimePicker style={{ width: '100px' }} format="HH:mm" />
                        </Form.Item>

                        <Form.Item label="Work Order" name={`workOrder-${key}`} rules={[{ required: true, message: 'Please input work order!' }]}>
                          <Input placeholder="Enter work order" style={{ width: '100px' }}  />
                        </Form.Item>

                        <Form.Item label="Process" name={`process-${key}`} rules={[{ required: true, message: 'Please input process!' }]}>
                          <Input placeholder="Enter process" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="DIA" name={`dia-${key}`} rules={[{ required: true, message: 'Please input DIA!' }]}>
                          <Input placeholder="Enter diameter" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="Item Name" name={`itemName-${key}`} rules={[{ required: true, message: 'Please input item name!' }]}>
                          <Input placeholder="Enter item name" style={{ width: '100px' }} />
                        </Form.Item>

                        <Form.Item label="Quantity" name={`quantity-${key}`} rules={[{ required: true, message: 'Please input quantity!' }]}>
                          <Input placeholder="Enter quantity" type="number" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="SetUp Time" name={`setUpTime-${key}`} rules={[{ required: true, message: 'Please input setup time!' }]}>
                          <Input placeholder="Enter set-up time" type="number" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="M/C Time" name={`mcTime-${key}`} rules={[{ required: true, message: 'Please input m/c time!' }]}>
                          <Input placeholder="Enter m/c time" type="number" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="Load-Unload Time" name={`loadingTime-${key}`} rules={[{ required: true, message: 'Please input loading/unloading time!' }]}>
                          <Input placeholder="Enter loading/unloading time" type="number" style={{ width: '100px' }} />
                        </Form.Item>

                        <Form.Item label="FLD/BREAK Down Time" name={`fldTime-${key}`} rules={[{ required: true, message: 'Please input fld/break down time!' }]}>
                          <Input placeholder="Enter fld/break down time" type="number" style={{ width: '100px' }}/>
                        </Form.Item>

                        <Form.Item label="No Load Time" name={`noLoadTime-${key}`} rules={[{ required: true, message: 'Please input no load time!' }]}>
                          <Input placeholder="Enter no load time" type="number" style={{ width: '100px' }}/>
                        </Form.Item>
                        </div>
                  </Panel>
                </Collapse>
              ))}

              <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
                <Button
                  type="dashed"
                  onClick={addPanel}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Report Details
                </Button>
              </div>

                 <div style={{display:'flex' , gap:'50px'}}>
                  <Form.Item label="Quality Rework" name="qualityRework" rules={[{ required: true, message: 'Please select quality rework' }]}>
                    <Select placeholder="Select quality rework" style={{width:'200px'}}>
                      <Option value="yes">Yes</Option>
                      <Option value="no">No</Option>
                      <Option value="nl">NL</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Rejection" name="rejection" rules={[{ required: true, message: 'Please select rejection' }]}>
                    <Select placeholder="Select rejection" style={{width:'150px'}}>
                      <Option value="yes">Yes</Option>
                      <Option value="no">No</Option>
                      <Option value="nl">NL</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Multi M/C Operat" name="multimachine" rules={[{ required: true, message: 'Please select multi m/c operat' }]}>
                    <Select placeholder="Select multi machine operation" style={{width:'150px'}}>
                      <Option value="yes">Yes</Option>
                      <Option value="no">No</Option>
                      <Option value="nl">NL</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Ideal Time" name="idealTime" rules={[{ required: true, message: 'Please input ideal time!' }]}>
                    <Input placeholder="Enter ideal time" type="number" step="0.01" style={{width:'150px'}} />
                  </Form.Item>

                  <Form.Item label="Actual Time" name="actualTime" rules={[{ required: true, message: 'Please input actual time!' }]}>
                    <Input placeholder="Enter actual time" type="number" step="0.01" style={{width:'150px'}} />
                  </Form.Item>

                  <Form.Item label="Time Loss No Load" name="timeLossNoLoad" rules={[{ required: true, message: 'Please input time loss no load!' }]}>
                    <Input placeholder="Enter time loss no load" type="number" step="0.01" style={{width:'150px'}}/>
                  </Form.Item>

                  <Form.Item label="Total Time Loss" name="totalTimeLoss" rules={[{ required: true, message: 'Please input total time loss!' }]}>
                    <Input placeholder="Enter total time loss" type="number" step="0.01" style={{width:'150px'}}/>
                  </Form.Item>
                </div>

              <Form.Item style={{ marginTop: '20px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                >
                  Submit Report
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Content>
    </Layout>
  );
}