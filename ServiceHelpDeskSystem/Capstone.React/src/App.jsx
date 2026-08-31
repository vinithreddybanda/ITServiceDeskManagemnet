import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'

const API_BASE = 'https://localhost:5193/ITSRPAPI'

function statusText(request) {
  if (request?.status?.description) {
    return request.status.description
  }

  return request?.reqStatus === 2 ? 'Closed' : 'New'
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString()
}

function Header({ title, user, onLogout }) {
  return (
    <header className="hero">
      <h1>{title}</h1>
      {user && (
        <div className="hero-actions">
          <span>Welcome {user.userName}</span>
          <button onClick={onLogout} type="button">Logout</button>
        </div>
      )}
    </header>
  )
}

function LoginScreen({ onLogin }) {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.get(`${API_BASE}/Authenticate`, {
        params: { userName, password }
      })

      onLogin(response.data)
      if (response.data.roleId === 2) {
        navigate('/admin')
      } else {
        navigate('/user')
      }
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page login-page">
      <Header title="IT Service Desk Management" />
      <form className="card form" onSubmit={submit}>
        <h2>User Login</h2>
        <label htmlFor="userName">User Name</label>
        <input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={20}
        />

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  )
}

function RequestTable({ requests, showUser, showActions }) {
  return (
    <table className="request-table">
      <thead>
        <tr>
          <th>Request ID</th>
          <th>Description</th>
          <th>Details</th>
          {showUser && <th>Requested By</th>}
          <th>Creation Date</th>
          <th>Request Status</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.requestId}>
            <td>{request.requestId}</td>
            <td>{request.description}</td>
            <td>{request.details}</td>
            {showUser && <td>{request.raisedBy}</td>}
            <td>{formatDate(request.raisedOn)}</td>
            <td>{statusText(request)}</td>
            {showActions && <td>{showActions(request)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function UserHome({ user, onLogout }) {
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')

  const loadRequests = useCallback(async (clearMessage = true) => {
    if (clearMessage) {
      setMessage('')
    }
    try {
      const response = await axios.get(`${API_BASE}/GetRequestsByUser`, {
        params: { userName: user.userName }
      })
      setRequests(response.data)
    } catch {
      setRequests([])
      setMessage('No requests found')
    }
  }, [user.userName])

  useEffect(() => {
    loadRequests(false)
  }, [loadRequests])

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <div className="card">
        <div className="toolbar">
          <Link to="/user/new">Raise New Request</Link>
          <button type="button" onClick={loadRequests}>Refresh</button>
        </div>

        {message && <p>{message}</p>}
        {requests.length > 0 && (
          <RequestTable
            requests={requests}
            showUser={false}
            showActions={(request) => (
              <>
                <Link to={`/user/delete/${request.requestId}`}>Delete</Link>
                {' | '}
                {request.reqStatus === 2 ? <Link to={`/user/reopen/${request.requestId}`}>Re-Open</Link> : <span>-</span>}
              </>
            )}
          />
        )}
      </div>
    </div>
  )
}

function AddRequest({ user, onLogout }) {
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [details, setDetails] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      const response = await axios.post(`${API_BASE}/CreateNewSeRequest`, {
        description,
        details,
        raisedBy: user.userName,
        justification: 'Initial request',
        reqStatus: 1
      })

      setMessage(`Request Added Successfully. Your request Id is ${response.data.requestId}`)
      setDescription('')
      setDetails('')
    } catch {
      setMessage('Unable to create request')
    }
  }

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <form className="card form" onSubmit={submit}>
        <h2>Raise New Request</h2>
        <label htmlFor="description">Description</label>
        <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={50} required />

        <label htmlFor="details">Details</label>
        <textarea id="details" value={details} onChange={(e) => setDetails(e.target.value)} maxLength={100} required />

        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate('/user')}>Back to List</button>
        {message && <p className="success">{message}</p>}
      </form>
    </div>
  )
}

function DeleteRequest({ user, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get(`${API_BASE}/GetRequestById`, { params: { reqId: id } })
      .then((response) => setRequest(response.data))
      .catch(() => setMessage('Request not found'))
  }, [id])

  const remove = async () => {
    try {
      await axios.get(`${API_BASE}/Delete`, { params: { id } })
      setMessage('Request deleted successfully')
    } catch {
      setMessage('Unable to delete request')
    }
  }

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <div className="card">
        <h2>Are you sure you want to delete this?</h2>
        {request && (
          <RequestTable requests={[request]} showUser={false} />
        )}
        <div className="toolbar">
          <button type="button" onClick={remove}>Delete Request</button>
          <button type="button" onClick={() => navigate('/user')}>Back to List</button>
        </div>
        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

function ReopenRequest({ user, onLogout }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [justification, setJustification] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get(`${API_BASE}/GetRequestById`, { params: { reqId: id } })
      .then((response) => setRequest(response.data))
      .catch(() => setMessage('Request not found'))
  }, [id])

  const reopen = async () => {
    if (!request) {
      return
    }

    try {
      await axios.post(`${API_BASE}/reopen`, {
        requestId: request.requestId,
        description: request.description,
        details: request.details,
        raisedBy: request.raisedBy,
        raisedOn: request.raisedOn,
        reqStatus: 1,
        justification
      })
      setMessage('Request reopened successfully')
    } catch {
      setMessage('Unable to reopen request')
    }
  }

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <div className="card form">
        <h2>Re-Open Request</h2>
        {request && (
          <>
            <label>Description</label>
            <input value={request.description} readOnly />
            <label>Details</label>
            <input value={request.details} readOnly />
            <label>Creation Date</label>
            <input value={formatDate(request.raisedOn)} readOnly />
            <label htmlFor="justification">Justification</label>
            <input
              id="justification"
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              maxLength={50}
              required
            />
          </>
        )}
        <button type="button" onClick={reopen}>ReOpen Request</button>
        <button type="button" onClick={() => navigate('/user')}>Back to List</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

function AdminHome({ user, onLogout }) {
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')

  const loadRequests = useCallback(async (clearMessage = true) => {
    if (clearMessage) {
      setMessage('')
    }
    try {
      const response = await axios.get(`${API_BASE}/GetAllRequest`)
      setRequests(response.data)
    } catch {
      setRequests([])
      setMessage('No requests found')
    }
  }, [])

  const closeRequest = async (id) => {
    await axios.get(`${API_BASE}/CloseRequest`, { params: { id } })
    await loadRequests()
  }

  useEffect(() => {
    loadRequests(false)
  }, [loadRequests])

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <div className="card">
        <div className="toolbar">
          <Link to="/admin/search">Search Requests</Link>
          <button type="button" onClick={loadRequests}>Refresh</button>
        </div>
        {message && <p>{message}</p>}
        {requests.length > 0 && (
          <RequestTable
            requests={requests}
            showUser
            showActions={(request) => (
              request.reqStatus === 1 ? (
                <button type="button" onClick={() => closeRequest(request.requestId)}>Close Request</button>
              ) : (
                <span>Closed</span>
              )
            )}
          />
        )}
      </div>
    </div>
  )
}

function SearchRequests({ user, onLogout }) {
  const [userName, setUserName] = useState('')
  const [requests, setRequests] = useState([])
  const [message, setMessage] = useState('')

  const search = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      const response = await axios.get(`${API_BASE}/GetRequestsBySP`, {
        params: { userName }
      })
      setRequests(response.data)
      if (response.data.length === 0) {
        setMessage('No match found')
      }
    } catch {
      setRequests([])
      setMessage('No match found')
    }
  }

  return (
    <div className="page">
      <Header title="Your One Stop Web Site For All Service Requests" user={user} onLogout={onLogout} />
      <div className="card">
        <form className="search-form" onSubmit={search}>
          <h2>Search Requests</h2>
          <label htmlFor="search-user">Enter the requester name</label>
          <input id="search-user" value={userName} onChange={(e) => setUserName(e.target.value)} />
          <button type="submit">Search</button>
          <Link to="/admin">Back</Link>
        </form>
        {message && <p>{message}</p>}
        {requests.length > 0 && <RequestTable requests={requests} showUser />}
      </div>
    </div>
  )
}

function ProtectedRoute({ user, roleId, children }) {
  if (!user) {
    return <Navigate to="/" replace />
  }

  if (roleId && user.roleId !== roleId) {
    return <Navigate to={user.roleId === 2 ? '/admin' : '/user'} replace />
  }

  return children
}

function AppShell() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('helpdesk-user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('helpdesk-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('helpdesk-user')
    }
  }, [user])

  const onLogout = () => {
    setUser(null)
    navigate('/')
  }

  const homeRoute = useMemo(() => {
    if (!user) {
      return '/'
    }

    return user.roleId === 2 ? '/admin' : '/user'
  }, [user])

  return (
    <Routes>
      <Route path="/" element={<LoginScreen onLogin={setUser} />} />
      <Route path="/home" element={<Navigate to={homeRoute} replace />} />
      <Route path="/user" element={<ProtectedRoute user={user} roleId={1}><UserHome user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="/user/new" element={<ProtectedRoute user={user} roleId={1}><AddRequest user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="/user/delete/:id" element={<ProtectedRoute user={user} roleId={1}><DeleteRequest user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="/user/reopen/:id" element={<ProtectedRoute user={user} roleId={1}><ReopenRequest user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute user={user} roleId={2}><AdminHome user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="/admin/search" element={<ProtectedRoute user={user} roleId={2}><SearchRequests user={user} onLogout={onLogout} /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
