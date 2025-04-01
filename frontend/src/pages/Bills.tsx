import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';

interface Customer {
  id: number;
  name: string;
}

interface BillItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Bill {
  id: number;
  customer: number;
  customer_name: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  items: BillItem[];
}

export default function Bills() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [open, setOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    customer: '',
    bill_date: '',
    due_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
  });

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/bills/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/customers/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const billData = {
        ...newBill,
        bill_number: `BILL-${Date.now()}`,
        status: 'PENDING',
      };

      const response = await fetch('http://localhost:8000/api/bills/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billData),
      });

      if (response.ok) {
        const bill = await response.json();
        
        // Create bill items
        await Promise.all(
          newBill.items.map((item) =>
            fetch('http://localhost:8000/api/bill-items/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...item,
                bill: bill.id,
              }),
            })
          )
        );

        setOpen(false);
        setNewBill({
          customer: '',
          bill_date: '',
          due_date: '',
          items: [{ description: '', quantity: 1, unit_price: 0 }],
        });
        fetchBills();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

  const addBillItem = () => {
    setNewBill({
      ...newBill,
      items: [...newBill.items, { description: '', quantity: 1, unit_price: 0 }],
    });
  };

  const updateBillItem = (index: number, field: string, value: string | number) => {
    const items = [...newBill.items];
    items[index] = { ...items[index], [field]: value };
    setNewBill({ ...newBill, items });
  };

  const columns = [
    { field: 'bill_number', headerName: 'Bill Number', flex: 1 },
    { field: 'customer_name', headerName: 'Customer', flex: 1 },
    { field: 'bill_date', headerName: 'Bill Date', flex: 1 },
    { field: 'due_date', headerName: 'Due Date', flex: 1 },
    {
      field: 'total_amount',
      headerName: 'Total Amount',
      flex: 1,
      valueFormatter: (params: any) => `$${params.value.toFixed(2)}`,
    },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Bills
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Create Bill
        </Button>
      </Box>

      <DataGrid
        rows={bills}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Bill</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Customer"
                  value={newBill.customer}
                  onChange={(e) =>
                    setNewBill({ ...newBill, customer: e.target.value })
                  }
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Bill Date"
                  type="date"
                  value={newBill.bill_date}
                  onChange={(e) =>
                    setNewBill({ ...newBill, bill_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={newBill.due_date}
                  onChange={(e) =>
                    setNewBill({ ...newBill, due_date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Bill Items
            </Typography>

            {newBill.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateBillItem(index, 'description', e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateBillItem(index, 'quantity', parseFloat(e.target.value))
                    }
                    required
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Unit Price"
                    type="number"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateBillItem(
                        index,
                        'unit_price',
                        parseFloat(e.target.value)
                      )
                    }
                    required
                  />
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              onClick={addBillItem}
              sx={{ mt: 2 }}
              fullWidth
            >
              Add Item
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 