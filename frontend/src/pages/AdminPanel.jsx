import { useEffect, useState } from 'react'
import { Navbar } from '../components/Layout'
import { Card, Button, Input, Select, Badge, Spinner } from '../components/UI'
import { adminAPI } from '../services'

export const AdminPanel = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Selected user for editing/deleting
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    first_name: '',
    last_name: '',
    role: 'user',
  })
  
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminAPI.getUsers()
      setUsers(response.data || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Auto-clear success messages after 4 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const openAddModal = () => {
    setFormData({
      email: '',
      password: '',
      company_name: '',
      first_name: '',
      last_name: '',
      role: 'user',
    })
    setFormError('')
    setIsAddModalOpen(true)
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: '', // Leave blank unless they want to change it
      company_name: user.company_name,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role || 'user',
    })
    setFormError('')
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const response = await adminAPI.createUser(formData)
      setUsers((prev) => [response.data, ...prev])
      setIsAddModalOpen(false)
      setSuccess(`User ${formData.email} created successfully.`)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    
    // We only send password if they filled it in
    const updatePayload = {
      company_name: formData.company_name,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      email: formData.email,
    }
    if (formData.password) {
      updatePayload.password = formData.password
    }

    try {
      const response = await adminAPI.updateUser(selectedUser.id, updatePayload)
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? response.data : u))
      )
      setIsEditModalOpen(false)
      setSuccess(`User ${selectedUser.email} updated successfully.`)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update user.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    setFormLoading(true)
    setFormError('')
    try {
      await adminAPI.deleteUser(selectedUser.id)
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
      setIsDeleteModalOpen(false)
      setSuccess(`User ${selectedUser.email} deleted successfully.`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user.')
      setIsDeleteModalOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const search = searchQuery.toLowerCase()
    const emailMatch = u.email.toLowerCase().includes(search)
    const companyMatch = u.company_name.toLowerCase().includes(search)
    const nameMatch = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search)
    return emailMatch || companyMatch || nameMatch
  })

  // Statistics calculations
  const totalUsers = users.length
  const adminCount = users.filter((u) => u.role === 'admin').length
  const normalCount = totalUsers - adminCount

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Background decoration */}
      <div className="glow-blob glow-indigo -top-20 left-1/4"></div>
      <div className="glow-blob glow-cyan top-1/2 right-1/4"></div>

      <main className="flex-1 container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-indigo-200 via-slate-100 to-cyan-200 bg-clip-text text-transparent">
              Platform Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Manage platform users, create accounts, and set privileges.
            </p>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <span>➕</span> Add User Account
          </Button>
        </div>

        {/* Banner messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 shadow-lg animate-fade-in">
            <span>✅</span> {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2 shadow-lg animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
              <h2 className="text-3xl font-black mt-2 text-white">{loading ? '...' : totalUsers}</h2>
            </div>
            <span className="text-3xl bg-slate-900/60 p-3 rounded-lg border border-slate-800">👥</span>
          </Card>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Platform Admins</p>
              <h2 className="text-3xl font-black mt-2 text-indigo-400">{loading ? '...' : adminCount}</h2>
            </div>
            <span className="text-3xl bg-slate-900/60 p-3 rounded-lg border border-slate-800">👑</span>
          </Card>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Client Accounts</p>
              <h2 className="text-3xl font-black mt-2 text-cyan-400">{loading ? '...' : normalCount}</h2>
            </div>
            <span className="text-3xl bg-slate-900/60 p-3 rounded-lg border border-slate-800">💼</span>
          </Card>
        </div>

        {/* Users Control Board */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white">Registered Users Account Directory</h2>
            <div className="w-full md:w-80">
              <Input
                type="text"
                placeholder="Search by email, company or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-0"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <p className="text-slate-400 text-sm">Fetching users from database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <span className="text-4xl mb-4 block">🔍</span>
              {searchQuery ? 'No users matching your search parameters.' : 'No user accounts found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold text-sm">
                    <th className="py-3 px-4">User Email</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Representative</th>
                    <th className="py-3 px-4">Access Role</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/30 transition text-sm">
                      <td className="py-4 px-4 font-medium text-slate-200">{user.email}</td>
                      <td className="py-4 px-4 text-slate-300">{user.company_name}</td>
                      <td className="py-4 px-4 text-slate-400">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={user.role === 'admin' ? 'primary' : 'success'}>
                          {user.role === 'admin' ? 'Super Admin' : 'User'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            className="px-2 py-1 text-xs border border-slate-700 text-slate-300 hover:text-white"
                          >
                            ✏️ Edit
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30"
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center mt-auto">
        <p className="text-sm text-slate-500 font-mono">OmniSupport AI Dashboard — Platform Administrator Portal</p>
      </footer>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg transition"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Create New User Account</h3>
            
            <form onSubmit={handleCreateUser}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
              />
              <Input
                label="Login Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="•••••••• (Min 8 characters)"
                required
              />
              <Input
                label="Company Name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Acme Corporation"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
              </div>
              <Select
                label="Access Privilege Level"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={[
                  { label: 'Normal Client User', value: 'user' },
                  { label: 'Platform Administrator', value: 'admin' },
                ]}
              />

              {formError && <p className="text-red-400 text-sm mb-4">{formError}</p>}
              
              <div className="flex gap-4 mt-6 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Creating User...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg transition"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Modify User Account: {selectedUser?.email}</h3>
            
            <form onSubmit={handleUpdateUser}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
              />
              <Input
                label="Change Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Leave blank to keep current password"
              />
              <Input
                label="Company Name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Acme Corporation"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="John"
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                />
              </div>
              <Select
                label="Access Privilege Level"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                options={[
                  { label: 'Normal Client User', value: 'user' },
                  { label: 'Platform Administrator', value: 'admin' },
                ]}
              />

              {formError && <p className="text-red-400 text-sm mb-4">{formError}</p>}
              
              <div className="flex gap-4 mt-6 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving changes...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-sm border border-slate-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">⚠️ Delete User Account?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Are you sure you want to permanently delete the account for <strong className="text-slate-200">{selectedUser?.email}</strong>? 
              This will remove all associated widgets, chatbots, history, and databases. This action is irreversible.
            </p>
            
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteUser}
                disabled={formLoading}
                className="bg-red-600 hover:bg-red-500 shadow-red-600/20"
              >
                {formLoading ? 'Deleting Account...' : 'Confirm Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
