import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import {
  People as PeopleIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

interface DashboardStats {
  totalCustomers: number;
  totalBills: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalBills: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats from API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [customers, bills] = await Promise.all([
          fetch('http://localhost:8000/api/customers/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('http://localhost:8000/api/bills/', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const customersData = await customers.json();
        const billsData = await bills.json();

        const totalRevenue = billsData.reduce(
          (sum: number, bill: any) => sum + parseFloat(bill.total_amount),
          0
        );

        setStats({
          totalCustomers: customersData.length,
          totalBills: billsData.length,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon }: any) => (
    <Grid item xs={12} sm={4}>
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="h4" component="p">
          {value}
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<PeopleIcon sx={{ fontSize: 40 }} />}
        />
        <StatCard
          title="Total Bills"
          value={stats.totalBills}
          icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<MoneyIcon sx={{ fontSize: 40 }} />}
        />
      </Grid>
    </Box>
  );
} 