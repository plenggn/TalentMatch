// app/jobs/[id]/page.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useParams } from 'next/navigation'
// (ถ้าใช้ @/ path)
import { supabase } from "../../../lib/supabaseClient"; 
// (ถ้าใช้ relative path)
// import { supabase } from '../../../lib/supabaseClient' 

export default function ApplyPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const params = useParams()
  const jobId = params.id as string

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file || !name || !jobId) {
      setMessage('Please fill in all fields and select a CV file.')
      return
    }

    setIsLoading(true)
    setMessage('Uploading and analyzing CV...')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name) // ส่งเป็น 'name'
    formData.append('email', email)
    formData.append('jobId', jobId)

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'An error occurred')
      }

      setMessage(`Success! ${result.message}`)
      setName('')
      setEmail('')
      setFile(null)
      ;(e.target as HTMLFormElement).reset()

    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Apply for Job (ID: {jobId})</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Full Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Upload CV (PDF/DOCX):</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2 border rounded"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white p-3 rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Processing...' : 'Submit Application'}
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}