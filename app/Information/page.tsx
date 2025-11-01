"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabaseClient"; 
// (เพิ่ม Icon สำหรับ Phone/Email)
import { Upload, Eye, Edit2, Trash2, X, Download, FileText, Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, Filter, Mail, Phone } from 'lucide-react';

export default function CVManagementSystem() {

// --- [1. MODIFY INTERFACE] ---
interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  experience: number;
  job_id: string | null; 
  status: string;
  cv_url?: string | null;
  job_descriptions?: { 
    id: string;
    title: string;
  } | null;
  // (ADDED) เพิ่ม Fields ใหม่
  email?: string | null;
  phone?: string | null;
}
// --- [END MODIFY] ---

// Interface สำหรับ state ของ Job List
interface Job {
  id: string;
  title: string;
}

const [applicants, setApplicants] = useState<Applicant[]>([]);    
const [jobsList, setJobsList] = useState<Job[]>([]); 

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ message: string, onConfirm: () => void } | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- [2. MODIFY STATE TYPE] ---
  const [editForm, setEditForm] = useState<{
    id?: string;
    firstName?: string;
    lastName?: string;
    // (ADDED)
    email?: string | null;
    phone?: string | null;
    gender?: string;
    experience?: number;
    job_id?: string | null; 
    status?: string;
    cv_url?: string | null;
    job_descriptions?: { 
        id: string;
        title: string;
    } | null;
  }>({});
  
  const [newApplicantForm, setNewApplicantForm] = useState({
    firstName: '',
    lastName: '',
    // (ADDED)
    email: '',
    phone: '',
    gender: 'Male',
    experience: 0,
    job_id: '', 
    status: 'Applied'
  });
  // --- [END MODIFY] ---

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // (FIX 1: ย้าย fetchApplicants ขึ้นมา)
  const fetchApplicants = async () => {
    // (ใช้ select * ถูกต้องแล้ว เพราะมันจะดึง email, phone มาอัตโนมัติ)
    const { data, error } = await supabase
      .from('applicants')
      .select(`
        *, 
        job_descriptions ( id, title ) 
      `) 
      .order('id', { ascending: true });
      
    if (error) {
       console.error("Error fetching applicants:", error);
    } else {
       setApplicants(data as Applicant[]); 
    }
  };


  const handleSort = (field: string) => { 
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const showConfirm = (action: string, message: string, onConfirm: () => void) => { 
    setConfirmAction({ message, onConfirm });
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction?.onConfirm) {
      confirmAction.onConfirm();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

// (ส่วนนี้เหมือนเดิม)
const handleFileUpload = async (applicantId: string, file: File) => {
  if (!file) return alert('No file selected');
  if (file.type !== 'application/pdf') return alert('Please upload a PDF file only');

  try {
    const filePath = `${applicantId}/${file.name}`;

    const { error: uploadError } = await supabase
      .storage
      .from('cv_bucket')
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase
      .storage
      .from('cv_bucket')
      .getPublicUrl(filePath);
    const publicURL = data.publicUrl;
    
    await supabase
      .from('applicants')
      .update({ cv_url: publicURL })
      .eq('id', applicantId);

    const updatedApplicant = applicants.find(a => a.id === applicantId);
    if (updatedApplicant) {
      setSelectedApplicant({ ...updatedApplicant, cv_url: publicURL });
      setShowPreviewModal(true);
    }
   
    const response = await fetch('/api/extractCV', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, fileUrl: publicURL })
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to extract text from API');
    }

    if (!result.error) {
      await supabase
        .from('cvs')
        .upsert([{
          filename: file.name,
          text: result.text || '',
          upload_by: applicantId,
          created_at: new Date().toISOString()
        }], { 
            onConflict: 'upload_by'
        });

      fetchApplicants(); 
      setShowUploadModal(false);
      alert('CV uploaded and text saved successfully!');
    }

  } catch (err: any) {
    console.error(err);
    alert(`Upload failed: ${err.message}`);
  }
};


// --- [DATA FETCHING] ---
useEffect(() => {
  fetchApplicants();
}, []);

useEffect(() => {
  const fetchJobsList = async () => {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('id, title'); 
        
      if (error) {
          console.error("Error fetching jobs list:", error);
      } else {
          setJobsList(data as Job[]);
      }
  };
  fetchJobsList();
}, []); 
// --- [สิ้นสุดการแก้ไข Data Fetching] ---


  const handleDelete = async (id: string) => { 
  const { error } = await supabase
    .from('applicants')
    .delete() 
    .eq('id', id);
  if (error) return alert(error.message);

  fetchApplicants();
};


  const handleDeleteCV = (applicant: Applicant) => {
  showConfirm(
    'delete-cv',
    'Are you sure you want to delete this CV?',
    async () => {
      if (applicant.cv_url) {
        const urlParts = applicant.cv_url.split('/');
        const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
        
        if (filePath && filePath.includes(applicant.id)) {
            await supabase.storage.from('cv_bucket').remove([filePath]);
        } else {
            console.warn("Could not determine file path from URL to delete from storage:", applicant.cv_url);
        }
      }
      await supabase.from('applicants').update({ cv_url: null }).eq('id', applicant.id);
      await supabase.from('cvs').delete().eq('upload_by', applicant.id);

      fetchApplicants();
    }
  );
};


  const openPreview = (applicant: Applicant) => { 
    setSelectedApplicant(applicant);
    setShowPreviewModal(true);
  };

  const openEdit = (applicant: Applicant) => { 
    setSelectedApplicant(applicant);
    // (setEditForm({...applicant}) จะดึง email/phone ที่ fetch มาอัตโนมัติ)
    setEditForm({ 
        ...applicant,
        job_id: applicant.job_id || null 
    });
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
  const { id, job_descriptions, ...updateData } = editForm;

  const { data, error } = await supabase
    .from('applicants')
    .update(updateData) // (updateData มี email/phone แล้ว)
    .eq('id', editForm.id); 
  if (error) return alert(error.message);

  setShowEditModal(false);
  fetchApplicants(); 
};


  const handleAddApplicant = async () => {
  // (เพิ่ม validation)
  if (!newApplicantForm.firstName || !newApplicantForm.lastName || !newApplicantForm.job_id || !newApplicantForm.email) {
    alert('Please fill in all required fields (First Name, Last Name, Email, Position)');
    return;
  }

  const { data, error } = await supabase
    .from('applicants')
    .insert([{ ...newApplicantForm }]); // (newApplicantForm มี email/phone แล้ว)
  if (error) return alert(error.message);

  // --- [3. MODIFY RESET FORM] ---
  setNewApplicantForm({
      firstName: '',
      lastName: '',
      email: '', // (ADDED)
      phone: '', // (ADDED)
      gender: 'Male',
      experience: 0,
      job_id: '',
      status: 'Applied'
  });
  // --- [END MODIFY] ---
  setShowAddModal(false);
  fetchApplicants(); 
};


  const handleExportCV = (applicant: Applicant) => { 
    if (!applicant.cv_url) {
      alert('No CV available to export');
      return;
    }
    const link = document.createElement('a');
    link.href = applicant.cv_url;
    link.download = `${applicant.firstName}_${applicant.lastName}_CV.pdf`;
    link.click();
  };

  // Filter and sort applicants
  let filteredApplicants = applicants.filter(app => {
    // (เพิ่มการค้นหา email/phone)
    const matchesSearch = app.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || // (ADDED)
      (app.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) || // (ADDED)
      (app.job_descriptions?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesGender = genderFilter === 'All' || app.gender === genderFilter;
    return matchesSearch && matchesStatus && matchesGender;
  });

  // Sort applicants
  filteredApplicants.sort((a, b) => {
    let aVal, bVal;

    if (sortField === 'job_descriptions') {
        aVal = a.job_descriptions?.title || '';
        bVal = b.job_descriptions?.title || '';
    } else {
        aVal = (a as any)[sortField];
        bVal = (b as any)[sortField];
    }
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">CV Management System</h1>
            <p className="text-slate-600">Manage applicant CVs and information</p>
          </div>
         <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
          <Plus className="w-5 h-5" />
          New Applicant
        </button>

        </div>

        {/* Stats Cards (เหมือนเดิม) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Applicants</p>
                <p className="text-3xl font-bold text-slate-800">{applicants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">CVs Uploaded</p>
                <p className="text-3xl font-bold text-slate-800">
                  {applicants.filter(a => a.cv_url).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Shortlisted</p>
                <p className="text-3xl font-bold text-slate-800">
                  {applicants.filter(a => a.status === 'Shortlisted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text" 
                // (เพิ่ม placeholder)
                placeholder="Search by name, ID, Email, Phone, or Position..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer hover:border-slate-400 transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interviewed">Interviewed</option>
                <option value="Rejected">Rejected</option>
                <option value="Offered">Offered</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer hover:border-slate-400 transition-colors"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="All">All Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Applicants Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">S/N</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('id')} className="flex items-center gap-1 hover:text-blue-600">
                      ID <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('firstName')} className="flex items-center gap-1 hover:text-blue-600">
                      Name <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  {/* (เพิ่มคอลัมน์ Contact) */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-blue-600">
                      Contact <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('job_descriptions')} className="flex items-center gap-1 hover:text-blue-600">
                      Position <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-blue-600">
                      Status <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">CV</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentApplicants.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700">{startIndex + idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 truncate" style={{ maxWidth: '100px' }}>{app.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{app.firstName} {app.lastName}</td>
                    
                    {/* (เพิ่มคอลัมน์ Contact) */}
                    <td className="px-6 py-4 text-sm text-slate-700" style={{ minWidth: '180px' }}>
                        {app.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400"/> {app.email}</div>}
                        {app.phone && <div className="flex items-center gap-2 mt-1"><Phone size={14} className="text-slate-400"/> {app.phone}</div>}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {app.job_descriptions?.title || (app.job_id ? <span className="text-red-500 text-xs">Job ID not found</span> : <span className="text-gray-400">N/A</span>)}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'Interviewed' ? 'bg-purple-100 text-purple-700' :
                        app.status === 'Offered' ? 'bg-green-100 text-green-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    
                    {/* (CV Column) */}
                    <td className="px-6 py-4">
                      {app.cv_url ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openPreview(app)}
                            className={`p-1 rounded-lg transition-colors ${app.cv_url ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 cursor-not-allowed'}`}
                            title="Preview CV"
                            disabled={!app.cv_url}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCV(app)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                            title="Delete CV"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedApplicant(app);
                            setShowUploadModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                        >
                          <Upload className="w-3 h-3" />
                          Upload
                        </button>
                      )}
                    </td>
                    
                    {/* (Actions Column) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(app)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Applicant"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Applicant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination (เหมือนเดิม) */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredApplicants.length)} of {filteredApplicants.length} applicants
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- [4. MODIFY "ADD" MODAL] --- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Add New Applicant</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* (ปรับ layout เป็น grid 2 คอลัมน์) */}
              <div className="grid grid-cols-2 gap-4">
                {/* (First Name - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newApplicantForm.firstName}
                    onChange={(e) => setNewApplicantForm({...newApplicantForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {/* (Last Name - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newApplicantForm.lastName}
                    onChange={(e) => setNewApplicantForm({...newApplicantForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                {/* (Email - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newApplicantForm.email}
                    onChange={(e) => setNewApplicantForm({...newApplicantForm, email: e.target.value})}
                    placeholder="applicant@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                
                {/* (Phone - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newApplicantForm.phone}
                    onChange={(e) => setNewApplicantForm({...newApplicantForm, phone: e.target.value})}
                    placeholder="080-123-4567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* (Gender - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <div className="relative">
                    <select
                      value={newApplicantForm.gender}
                      onChange={(e) => setNewApplicantForm({...newApplicantForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* (Experience - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    value={newApplicantForm.experience}
                    onChange={(e) => setNewApplicantForm({...newApplicantForm, experience: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* (Position - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position *</label>
                  <div className="relative">
                    <select
                      value={newApplicantForm.job_id}
                      onChange={(e) => setNewApplicantForm({...newApplicantForm, job_id: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">-- Select Position --</option>
                      {jobsList.map(job => ( 
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                
                {/* (Status - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={newApplicantForm.status}
                      onChange={(e) => setNewApplicantForm({...newApplicantForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offered">Offered</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddApplicant}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Applicant
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- [END MODIFY] --- */}


        {/* Confirm Modal (เหมือนเดิม) */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Confirm Action</h3>
              <p className="text-slate-600 mb-6">{confirmAction?.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal (เหมือนเดิม) */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Upload CV</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  Applicant: <span className="font-semibold">{selectedApplicant?.firstName} {selectedApplicant?.lastName}</span>
                </p>
                <p className="text-sm text-slate-600">
                  ID: <span className="font-semibold">{selectedApplicant?.id}</span>
                </p>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-2">Drop your PDF here or click to browse</p>
                <input
                  type="file"
                  accept=".pdf"
                  id={`cv-upload-${selectedApplicant?.id}`}
                  onChange={(e) => {
                    if (!e.target.files || !selectedApplicant) return;
                    handleFileUpload(selectedApplicant.id, e.target.files[0]);
                  }}
                  className="hidden"
                />
                <label
                  htmlFor={`cv-upload-${selectedApplicant?.id}`}
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal (เหมือนเดิม) */}
        {showPreviewModal && selectedApplicant?.cv_url && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">CV Preview</h3>
                  <p className="text-sm text-slate-600">{selectedApplicant.firstName} {selectedApplicant.lastName} - {selectedApplicant.id}</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-hidden">
                <iframe
                  src={selectedApplicant.cv_url}
                  className="w-full h-full rounded-lg border border-slate-200"
                  title="CV Preview"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- [5. MODIFY "EDIT" MODAL] --- */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Edit Applicant</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* (ปรับ layout เป็น grid 2 คอลัมน์) */}
              <div className="grid grid-cols-2 gap-4">
                {/* (First Name - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName || ''} 
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {/* (Last Name - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName || ''} 
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* (Email - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ''} 
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {/* (Phone - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone || ''} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* (Gender - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <div className="relative">
                    <select
                      value={editForm.gender || 'Male'} 
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* (Experience - Span 1) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience (yrs)</label>
                  <input
                    type="number"
                    value={editForm.experience || 0} 
                    onChange={(e) => setEditForm({...editForm, experience: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* (Position - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                  <div className="relative">
                    <select
                      value={editForm.job_id || ''} 
                      onChange={(e) => setEditForm({...editForm, job_id: e.target.value || null})} 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="">-- Select Position --</option>
                      {jobsList.map(job => ( 
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
                
                {/* (Status - Span 2) */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={editForm.status || 'Applied'} 
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interviewed">Interviewed</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offered">Offered</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {/* --- [END MODIFY] --- */}

      </div>
    </div>
  );
}