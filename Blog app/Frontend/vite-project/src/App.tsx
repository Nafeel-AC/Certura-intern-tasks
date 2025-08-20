import { useEffect, useState } from 'react'
import './App.css'

type Post = {
  _id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchPosts() {
    try {
      setLoading(true)
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data)
    } catch (e) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    try {
      setLoading(true)
      setError('')
      if (editingId) {
        const res = await fetch(`/api/posts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        })
        if (!res.ok) throw new Error('update failed')
      } else {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        })
        if (!res.ok) throw new Error('create failed')
      }
      setTitle('')
      setContent('')
      setEditingId(null)
      await fetchPosts()
    } catch (e) {
      setError('Save failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      await fetchPosts()
    } catch (e) {
      setError('Delete failed')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(post: Post) {
    setEditingId(post._id)
    setTitle(post.title)
    setContent(post.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle('')
    setContent('')
  }

  return (
    <div className="container">
      <header className="hero">
        <div className="hero-badge">BLOG</div>
        <h1>Orange Orbit Blog</h1>
        <p className="subtitle">Write, reflect, and share your ideas with style.</p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
        />
        <div className="row">
          <button type="submit" disabled={loading}>
            {editingId ? 'Update' : 'Create'} Post
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} disabled={loading}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading...</p>}

      {posts.length === 0 && !loading && (
        <div className="empty">
          <h3>No posts yet</h3>
          <p>Start by writing your first post using the form above.</p>
        </div>
      )}

      <ul className="posts">
        {posts.map((p) => (
          <li key={p._id} className="post">
            <div className="post-header">
              <h3>{p.title}</h3>
              <div className="row">
                <button onClick={() => startEdit(p)}>Edit</button>
                <button className="secondary" onClick={() => handleDelete(p._id)}>Delete</button>
              </div>
            </div>
            <p>{p.content}</p>
            <small>
              {new Date(p.createdAt).toLocaleString()}
              {p.updatedAt !== p.createdAt ? ' (edited)' : ''}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
