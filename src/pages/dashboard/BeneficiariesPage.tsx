import React, { useEffect, useState } from 'react';
import { beneficiariesApi } from '../../lib/api';
import '../../assets/css/HistoryPage.css';

const BeneficiariesPage: React.FC = () => {
  const [beneficiaries, setBeneficiaries] = useState<Record<string, unknown>[]>([]);
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const loadBeneficiaries = async () => {
    const response = await beneficiariesApi.list();
    if (response.success && Array.isArray(response.data)) setBeneficiaries(response.data);
  };

  useEffect(() => { void loadBeneficiaries(); }, []);

  const handleAdd = async () => {
    await beneficiariesApi.create({ name, accountNumber });
    setName('');
    setAccountNumber('');
    await loadBeneficiaries();
  };

  const handleDelete = async (id: string) => {
    await beneficiariesApi.remove(id);
    await loadBeneficiaries();
  };

  return (
    <main className="history-page">
      <div className="page-header"><h1 className="page-title">Beneficiaries</h1></div>
      <div className="filters-section">
        <div className="filter-group"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="filter-group"><label>Account Number</label><input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} /></div>
        <button className="export-btn" onClick={handleAdd}>Add</button>
      </div>
      <div className="history-table-container">
        <table className="history-table">
          <thead><tr><th>Name</th><th>Account</th><th>Action</th></tr></thead>
          <tbody>
            {beneficiaries.map((beneficiary, index) => (
              <tr key={String(beneficiary.id || index)}>
                <td>{String(beneficiary.name || '-')}</td>
                <td>{String(beneficiary.accountNumber || '-')}</td>
                <td><button className="page-number" onClick={() => void handleDelete(String(beneficiary.id || ''))}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default BeneficiariesPage;
