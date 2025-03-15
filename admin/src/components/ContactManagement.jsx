import { useState, useEffect } from 'react'
import axios from 'axios'
import { format } from 'date-fns'
import { API_URL } from '../config'

const ContactManagement = () => {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/contact`)
      setContacts(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching contact messages:', err)
      setError('Failed to load contact messages. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const updateContactStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/contact/${id}`, { status })
      // Update the contact in the local state
      setContacts(contacts.map(contact => 
        contact._id === id ? { ...contact, status } : contact
      ))
      // Close the modal if the updated contact is the selected one
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact({ ...selectedContact, status })
      }
    } catch (err) {
      console.error('Error updating contact status:', err)
      alert('Failed to update contact status. Please try again.')
    }
  }

  const deleteContact = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return

    try {
      await axios.delete(`${API_URL}/api/contact/${id}`)
      // Remove the contact from the local state
      setContacts(contacts.filter(contact => contact._id !== id))
      // Close the modal if the deleted contact is the selected one
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(null)
      }
    } catch (err) {
      console.error('Error deleting contact message:', err)
      alert('Failed to delete contact message. Please try again.')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800'
      case 'read':
        return 'bg-blue-100 text-blue-800'
      case 'responded':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredContacts = statusFilter === 'all' 
    ? contacts 
    : contacts.filter(contact => contact.status === statusFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Contact Message Management</h1>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
          </select>
          <button
            onClick={fetchContacts}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center text-gray-500">
          No contact messages found.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedContact(contact)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                    <div className="text-sm text-gray-500">{contact.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 truncate max-w-xs">{contact.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(contact.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(contact.status)}`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedContact(contact)
                      }}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteContact(contact._id)
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-red-600">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Contact Message Details</h3>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">From</p>
                <p className="mt-1 text-sm text-gray-900">{selectedContact.name} ({selectedContact.email})</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p className="mt-1 text-sm text-gray-900">{selectedContact.subject}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(selectedContact.createdAt), 'PPpp')}
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500">Message</p>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedContact.message}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium text-gray-500 mr-2">Status:</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedContact.status)}`}>
                    {selectedContact.status.charAt(0).toUpperCase() + selectedContact.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={selectedContact.status}
                    onChange={(e) => updateContactStatus(selectedContact._id, e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                  </select>
                  <button
                    onClick={() => deleteContact(selectedContact._id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactManagement
