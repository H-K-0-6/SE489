import React, { useEffect, useState } from 'react';
import { Users, Gavel, DollarSign, AlertTriangle, Search } from 'lucide-react';

function AdminDashboard() {
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalUsers: 0, activeAuctions: 0 });
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, CUSTOMER, ARTISAN

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = () => {
    fetch('http://localhost:3001/api/dashboard/admin')
      .then(res => res.json())
      .then(data => {
        setMetrics({
          totalRevenue: data.totalRevenue,
          totalUsers: data.totalUsers,
          activeAuctions: data.activeAuctions
        });
        setUsers(data.users || []);
      })
      .catch(console.error);
  };

  const handleToggleSuspend = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/dashboard/admin/toggle-suspend/${userId}`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Failed to update user status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="container" style={{ padding: '4rem 24px' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>System Administrator</h1>
      
      <div className="grid" style={{ marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 179, 0, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-directory)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>BD {metrics.totalRevenue}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(2, 136, 209, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-recruitment)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{metrics.totalUsers}</div>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(229, 57, 53, 0.2)', padding: '16px', borderRadius: '50%', color: 'var(--color-featured)' }}>
            <Gavel size={32} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Auctions</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>{metrics.activeAuctions}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ margin: 0 }}>User Management</h3>
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Export Audit Log</button>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="search-bar" 
              style={{ width: '100%', paddingLeft: '40px' }} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#888' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setRoleFilter('ALL')} 
              className={`btn ${roleFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1.2rem' }}
            >
              All Users
            </button>
            <button 
              onClick={() => setRoleFilter('ARTISAN')} 
              className={`btn ${roleFilter === 'ARTISAN' ? 'btn-recruitment' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1.2rem', border: roleFilter !== 'ARTISAN' ? '1px solid var(--glass-border)' : 'none' }}
            >
              Artisans
            </button>
            <button 
              onClick={() => setRoleFilter('CUSTOMER')} 
              className={`btn ${roleFilter === 'CUSTOMER' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.5rem 1.2rem' }}
            >
              Customers
            </button>
          </div>
        </div>
        
        {filteredUsers.length === 0 ? (
          <p style={{ color: 'var(--color-text)', textAlign: 'center', padding: '2rem' }}>No users found matching the filter criteria.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--color-text)', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{user.name}</td>
                  <td style={{ padding: '16px 12px' }}>{user.email}</td>
                  <td style={{ padding: '16px 12px', color: user.role === 'ARTISAN' ? 'var(--color-recruitment)' : 'var(--color-directory)', fontWeight: 'bold' }}>{user.role}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '50px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: user.status === 'ACTIVE' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(229, 57, 53, 0.15)',
                      color: user.status === 'ACTIVE' ? '#4CAF50' : '#E53935'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <button 
                      onClick={() => handleToggleSuspend(user.id)}
                      className="btn" 
                      style={{ 
                        background: 'transparent', 
                        color: user.status === 'ACTIVE' ? 'var(--color-featured)' : '#4CAF50', 
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <AlertTriangle size={18} /> {user.status === 'ACTIVE' ? 'Suspend' : 'Unsuspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
