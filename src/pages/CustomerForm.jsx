// src/pages/CustomerForm.jsx
import CustomerFormComponent from '@/components/customers/CustomerForm';

const CustomerForm = ({ isEdit }) => {
  return <CustomerFormComponent isEdit={isEdit} />;
};

export default CustomerForm;