// app/AiMatching/page.tsx (Final Version with Corrected Button Layout)
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Image from "next/image";
import { ChevronDown, Users, Briefcase, Search, Loader2, Star, BarChart2, Zap, AlertTriangle, X, Eye, FileText, Check, FileCheck } from "lucide-react";
import Link from "next/link"; 

// --- Interfaces (เหมือนเดิม) ---
interface Applicant { id: number | string; firstName: string; lastName: string; name: string; cv_url?: string; }
interface Job { id: number | string; title: string; }
interface MatchResultApplicant { 
    id: number | string; name: string; matching_score: number; ai_summary: string; cvUrl?: string; 
    overview?: string; strengths?: string[]; potential_gaps?: string[];
    status?: string; 
}
interface MatchResultJob { id: number | string; title: string; matching_score: number; ai_summary: string; }
type MatchMode = 'jobToApplicants' | 'applicantToJobs';
const STATUS_OPTIONS = ["Applied", "Shortlisted", "Interviewed", "Offered", "Rejected"]; 

const AIMatchingPage = () => {
  // --- State ---
  const [mode, setMode] = useState<MatchMode>('jobToApplicants');
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");
  const [applicantSearchTerm, setApplicantSearchTerm] = useState<string>("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [suggestedApplicants, setSuggestedApplicants] = useState<Applicant[]>([]);
  [/* ... โค้ดส่วนบนที่เหลือ (เหมือนเดิม) ... */]
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<(MatchResultApplicant | MatchResultJob)[]>([]);
  const [resultTitle, setResultTitle] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCVModal, setShowCVModal] = useState(false);
  const [cvModalUrl, setCvModalUrl] = useState<string | null>(null);
  const [modalApplicantDetails, setModalApplicantDetails] = useState<MatchResultApplicant | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);


  // --- Data Fetching (เหมือนเดิม) ---
  useEffect(() => {
      const fetchData = async () => { setErrorMessage(null); try { setIsLoading(true); const [jobRes, appRes] = await Promise.all([ supabase.from("job_descriptions").select("id, title"), supabase.from("applicants").select("id, firstName, lastName, cv_url") ]); if (jobRes.error) throw new Error(jobRes.error.message || "Failed to load jobs"); setJobs(jobRes.data as Job[]); if (appRes.error) throw new Error(appRes.error.message || "Failed to load applicants"); const mappedApps = appRes.data.map(a => ({...a, id: a.id, name: `${a.firstName} ${a.lastName}`})) as Applicant[]; setApplicants(mappedApps); setSuggestedApplicants(mappedApps.slice(0, 5)); } catch (err: any) { setErrorMessage(`Failed to load initial data: ${err.message}`); setJobs([]); setApplicants([]); setSuggestedApplicants([]); } finally { setIsLoading(false); } }; fetchData();
   }, []);
  useEffect(() => { /* ... applicantSearchTerm effect ... */
       if (!applicantSearchTerm && applicants.length > 0) { setSuggestedApplicants(applicants.slice(0, 5)); return; } if (!applicantSearchTerm) { setSuggestedApplicants([]); return } const filtered = applicants.filter(a => a.name.toLowerCase().includes(applicantSearchTerm.toLowerCase()) || a.id.toString().toLowerCase().includes(applicantSearchTerm.toLowerCase()) ).slice(0, 5); setSuggestedApplicants(filtered);
   }, [applicantSearchTerm, applicants]);

  // --- Run Matching (เหมือนเดิม) ---
  const runMatch = async () => {
    let targetId: string;
    let bodyToSend: { mode: MatchMode; targetId: string };

    if (mode === 'jobToApplicants') {
        if (!selectedJobId || !selectedJobId.includes('-') || typeof selectedJobId !== 'string' || selectedJobId.length < 30) {
             alert(`Please select a Job from the dropdown.`);
             setSelectedJobId("");
             return;
        }
        targetId = selectedJobId;
        bodyToSend = { mode, targetId };

    } else { // mode === 'applicantToJobs'
        if (!selectedApplicantId || !selectedApplicantId.includes('-') || typeof selectedApplicantId !== 'string' || selectedApplicantId.length < 30) {
             alert(`Please search and select an Applicant from the list.`);
             setSelectedApplicantId(""); // Clear selection
             return;
        }
        targetId = selectedApplicantId;
        bodyToSend = { mode, targetId };
    }

    setIsLoading(true); setResults([]); setErrorMessage(null); setResultTitle("");
    try {
      const response = await fetch('/api/aiMatch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyToSend) });
      const data = await response.json();
      if (!response.ok) { throw new Error(data.error || `API request failed (Status: ${response.status})`); }

      if (mode === 'jobToApplicants' && data.results) {
          const resultsWithCv = (data.results as MatchResultApplicant[]).map(res => { 
              const originalApp = applicants.find(app => app.id === res.id); 
              return {...res, cvUrl: originalApp?.cv_url ?? undefined }; 
          });
          setResults(resultsWithCv);
          const jobTitle = jobs.find(j => j.id === targetId)?.title || `Job ID ${targetId}`;
          setResultTitle(`Top Applicant Matches for "${jobTitle}"`);
      } else if (mode === 'applicantToJobs' && data.results) {
          setResults(data.results as MatchResultJob[]);
          setResultTitle(`Top Job Matches for "${data.applicantName || `Applicant ID ${targetId}`}"`);
      }
      if (data.message) { console.log("API Message:", data.message); }
    } catch (err: any) { console.error("Matching failed:", err); setErrorMessage(`Matching failed: ${err.message}`); }
    finally { setIsLoading(false); }
  };
  
  // --- Status Update Logic (เหมือนเดิม) ---
  const handleUpdateStatus = async (applicantId: string | number, newStatus: string) => {
    const { error } = await supabase.from("applicants").update({ status: newStatus }).eq("id", applicantId);
    if (!error) {
        setModalApplicantDetails(prev => prev ? {...prev, status: newStatus} : null);
        alert(`Status updated to ${newStatus} for ${applicantId}`);
    } else {
        alert("Failed to update status: " + error.message);
    }
    setShowStatusDropdown(false);
  };

  // --- Open CV Modal (Fetch ข้อมูลเพิ่มเติมก่อนเปิด) ---
  const handleOpenCvModal = async (applicantResult: MatchResultApplicant) => {
      if (!applicantResult.cvUrl) {
          alert("No CV file URL found for this applicant.");
          return;
      }
      
      const { data, error } = await supabase.from('applicants').select('*').eq('id', applicantResult.id).single();
      
      if (error || !data) {
          console.error("Failed to fetch full applicant details:", error?.message);
          alert("Failed to load full analysis details. Data may not have been saved successfully.");
          return;
      }

      const modalData: MatchResultApplicant = {
          ...applicantResult,
          overview: data.overview || "AI overview not available (Re-run match for full detail).",
          strengths: data.strengths || [],
          potential_gaps: data.potential_gaps || [],
          cvUrl: data.cv_url,
          status: data.status || "Applied", 
      };

      setModalApplicantDetails(modalData);
      setCvModalUrl(data.cv_url);
      setShowCVModal(true);
  };
  const handleCloseCvModal = () => { setShowCVModal(false); setCvModalUrl(null); setModalApplicantDetails(null); };


  // --- Render Functions (เหมือนเดิม) ---
  const getScoreColor = (score: number) => { 
      if (!score || score <= 0) return "from-gray-400 to-gray-500 text-white"; 
      if (score >= 90) return "from-green-500 to-emerald-600 text-white";
      if (score >= 75) return "from-blue-500 to-indigo-600 text-white";
      if (score >= 60) return "from-yellow-500 to-orange-500 text-white";
      return "from-red-400 to-red-500 text-white";
  };

  const renderResultItem = (item: MatchResultApplicant | MatchResultJob, index: number) => { 
      const isApplicantResult = mode === 'jobToApplicants'; 
      const result = item as any; 
      const score = result.matching_score || 0;

      const rankColor = index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600';

      return (
          <div key={isApplicantResult ? `app-${result.id}` : `job-${result.id}`} 
               className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-6 border border-gray-100 transition-all duration-200 hover:shadow-xl transform hover:-translate-y-0.5">
             
             {/* Rank & Action Column */}
             <div className="flex flex-col items-center flex-shrink-0 w-32">
                 {/* Rank */}
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm mb-2 ${rankColor}`}>
                    #{index + 1}
                 </div>
                 {/* Score Badge */}
                 <div className={`w-20 h-8 bg-gradient-to-r ${getScoreColor(score)} rounded-lg flex items-center justify-center font-extrabold text-sm shadow mb-3`}>
                    {score}%
                 </div>
                 
                 {/* Action Buttons */}
                 {isApplicantResult && (
                    <div className="flex flex-col gap-1 items-center">
                        <button
                            onClick={() => handleOpenCvModal(result as MatchResultApplicant)}
                            className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors flex items-center gap-1"
                            title="View Detailed Analysis (Modal)"
                        >
                            <FileText className="w-3 h-3" /> View Detail
                        </button>
                        {/* Link to CVSummary Page */}
                        <Link
                            href={`/CVSummary?applicantId=${result.id}`}
                            className="text-xs text-purple-600 font-semibold hover:text-purple-800 transition-colors flex items-center gap-1 mt-1"
                            title="Go to Full Applicant Summary Page"
                        >
                            <Eye className="w-3 h-3" /> Go to Summary
                        </Link>
                    </div>
                 )}
                 {!isApplicantResult && (
                     <a 
                         href={`/JobDescription?id=${result.id}`} // ลิงก์ไปหน้า Job Description พร้อม ID
                         className="text-xs text-gray-500 mt-1 hover:text-blue-500 transition-colors flex items-center gap-1"
                         title={`View Job ID ${result.id}`}
                     >
                         <FileCheck className="w-3 h-3" /> View Job
                     </a>
                 )}
             </div>

             {/* Details (Name/Title + Summary) */}
             <div className="flex-1 min-w-0">
                 <h3 className="text-lg font-extrabold text-gray-900 truncate" title={isApplicantResult ? result.name : result.title}>
                     {isApplicantResult ? result.name : result.title}
                 </h3>
                 {/* Quick AI Summary Line (แสดง Error สั้นๆ) */}
                 <p className="text-sm text-gray-600 line-clamp-3 mt-1" title={result.ai_summary}>
                    {score <= 0 ? <span className='text-red-500 font-extrabold'>[PROCESSING ERROR]: {result.ai_summary}</span> : result.ai_summary || "No quick summary."}
                 </p>
             </div>
          </div>
      );
  };


  return (
    // ✅ ลบ class font-sans ออก เพื่อให้ใช้ Font Family ของระบบ/Global CSS
    <div className="min-h-screen bg-gray-50 p-8"> 
      <main className="max-w-4xl mx-auto">
        {/* Header */} 
        <div className="text-center mb-12 mt-4">
           <Image src="/images/LogoTalentMatch.png" alt="Logo" width={100} height={100} className="mx-auto mb-3" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">AI MATCHING ENGINE</h1>
          <p className="text-md text-blue-600 font-semibold">Find the perfect fits using Gemini AI</p>
        </div>

        {/* Control Panel */} 
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-10 border border-gray-200">
           {/* Mode Selection */} 
           <div className="flex justify-center gap-3 mb-6 p-1 bg-gray-100 rounded-xl">
               <button
                  onClick={() => { setMode('jobToApplicants'); setSelectedApplicantId(""); setApplicantSearchTerm(""); setResults([]); setResultTitle(""); setErrorMessage(null); }}
                  // ✅ ปรับเป็น text-sm และ font-semibold (เทียบเท่า 14px, 600)
                  className={`flex-1 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${mode === 'jobToApplicants' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white'}`}
               >
                  <Users className="w-4 h-4 inline mr-2" /> Find Applicants
               </button>
               <button
                  onClick={() => { setMode('applicantToJobs'); setSelectedJobId(""); setResults([]); setResultTitle(""); setErrorMessage(null); }}
                  // ✅ ปรับเป็น text-sm และ font-semibold (เทียบเท่า 14px, 600)
                  className={`flex-1 px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${mode === 'applicantToJobs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-white'}`}
               >
                  <Briefcase className="w-4 h-4 inline mr-2" /> Find Jobs
               </button>
           </div>

           {/* Input Selection */} 
           <div className="flex flex-col sm:flex-row gap-4 items-end">
               {mode === 'jobToApplicants' ? (
                   <div className="flex-grow w-full sm:w-auto relative">
                      <label htmlFor="jobSelect" className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Select Job Description</label>
                      <select
                        id="jobSelect"
                        value={selectedJobId}
                        onChange={e => { const newJobId = e.target.value; setSelectedJobId(newJobId); setSelectedApplicantId(""); setApplicantSearchTerm(""); }}
                        // ✅ ปรับ text-base เป็น text-sm หรือลบทิ้งเพื่อสืบทอด
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg shadow-inner text-sm bg-white disabled:bg-gray-100 appearance-none focus:border-blue-500 focus:ring-0"
                        disabled={isLoading}
                      >
                        <option value="">-- Select Job Description --</option>
                        {jobs.map(job => (
                          <option key={job.id} value={job.id.toString()}>{job.title}</option>
                        ))}
                      </select>
                       <ChevronDown className="absolute right-3 top-[38px] w-5 h-5 text-gray-400 pointer-events-none" />
                   </div>
               ) : (
                   <div className="flex-grow w-full sm:w-auto relative">
                       <label htmlFor="applicantSearch" className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Search Applicant (Click to Select)</label>
                       <input
                           type="text"
                           id="applicantSearch"
                           placeholder="Type Name or ID..."
                           value={applicantSearchTerm}
                           // *** แก้ไข: เมื่อพิมพ์ ให้เคลียร์ selectedApplicantId เสมอ ***
                           onChange={e => {setApplicantSearchTerm(e.target.value); setSelectedApplicantId("");}} 
                           // ✅ ปรับ text-base เป็น text-sm หรือลบทิ้งเพื่อสืบทอด
                           className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg shadow-inner text-sm focus:border-blue-500 focus:ring-0"
                           disabled={isLoading}
                       />
                       {/* Suggestions Dropdown */}
                        {applicantSearchTerm && suggestedApplicants.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
                                {suggestedApplicants.map(app => (
                                    <div
                                        key={app.id}
                                        // *** Logic Selection ที่แก้ไข ***
                                        onClick={() => { 
                                            const newAppId = app.id.toString(); 
                                            setSelectedApplicantId(newAppId); // ตั้งค่า ID ที่ถูกต้อง
                                            setApplicantSearchTerm(`${app.name} (ID: ${newAppId.substring(0, 8)}...)`); // ตั้งค่า Display Name ที่มี ID
                                            setSuggestedApplicants([]); // ซ่อน Dropdown
                                            setSelectedJobId(""); // เคลียร์ Job ID
                                        }} 
                                        className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                                    >
                                        {app.name}
                                        {/* Show checkmark if this item is currently selected */}
                                        {selectedApplicantId === app.id.toString() && <Check className='w-4 h-4 text-green-500'/>} 
                                    </div>
                                ))}
                            </div>
                        )}
                   </div>
               )}
               {/* Run Button */} 
               <div className="flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={runMatch}
                    // ✅ ปรับ text-base เป็น text-sm (14px) และใช้ font-semibold (600)
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm flex items-center justify-center gap-2 ${ 
                        (mode === 'jobToApplicants' && !selectedJobId) || (mode === 'applicantToJobs' && !selectedApplicantId) || isLoading
                        ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg hover:from-blue-700 hover:to-indigo-800'
                    }`}
                    disabled={isLoading || (mode === 'jobToApplicants' && !selectedJobId) || (mode === 'applicantToJobs' && !selectedApplicantId)}
                  >
                    {/* *** FIX: ไอคอนและข้อความอยู่ในระดับเดียวกัน *** */}
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    {isLoading ? 'Matching...' : 'Run AI Match'}
                  </button>
               </div>
           </div>

           {/* Error Message */} 
           {errorMessage && ( <div className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{errorMessage}</div> )}
        </div>

        {/* --- Results Area --- */}
        <div className="mt-6">
           {isLoading && (
              <div className="text-center py-10 text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-500 mb-3" />
                  <p className="text-sm">Gemini is analyzing candidates and reading CVs...</p>
              </div>
           )}

           {!isLoading && results.length > 0 && (
               <div className="space-y-4">
                   <h2 className="text-xl font-extrabold text-gray-800 mb-4">{resultTitle} ({results.length} results)</h2>
                   {results.map(renderResultItem)}
               </div>
           )}

            {!isLoading && results.length === 0 && resultTitle && ( 
                <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow border border-gray-100">
                    <Search className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm">No matches found for this selection.</p>
                </div>
            )}

            {!isLoading && results.length === 0 && !resultTitle && !errorMessage && ( 
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">Select a mode and choose a Job or Applicant to start matching.</p>
                </div>
            )}
        </div>

         {/* --- Full AI Analysis Modal --- */}
         {showCVModal && modalApplicantDetails && (
           <div className="fixed inset-0 z-[9999] flex justify-center items-center bg-black bg-opacity-70 p-4">
             <div className="relative bg-white rounded-2xl p-8 max-w-5xl w-full max-h-[90vh] overflow-auto shadow-xl grid grid-cols-1 md:grid-cols-5 gap-6">

               <button className="absolute top-4 right-6 text-gray-400 hover:text-gray-800 z-10" onClick={handleCloseCvModal}>
                 <X className="w-6 h-6" />
               </button>

               {/* คอลัมน์ซ้าย (CV Preview) */}
               <div className="md:col-span-3 flex flex-col min-h-[70vh]">
                 <h2 className="text-2xl font-bold text-gray-800 mb-1">{modalApplicantDetails.name}</h2>
                 <p className="text-gray-600 mb-4 text-sm">Match Score: {modalApplicantDetails.matching_score}%</p>
                 
                 {/* Status Update Dropdown */}
                 <div className="relative mb-4 w-48">
                    <button 
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className={`w-full px-4 py-2 text-white rounded-lg font-semibold flex items-center justify-between text-sm transition-colors ${modalApplicantDetails.status?.toLowerCase() === 'shortlisted' ? 'bg-blue-500' : modalApplicantDetails.status?.toLowerCase() === 'interviewed' ? 'bg-purple-500' : modalApplicantDetails.status?.toLowerCase() === 'offered' ? 'bg-green-500' : 'bg-gray-500'}`}
                    >
                        Status: {modalApplicantDetails.status || 'Applied'} <ChevronDown className="w-4 h-4" />
                    </button>
                    {showStatusDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                            {STATUS_OPTIONS.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdateStatus(modalApplicantDetails.id, status)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors  items-center gap-2"
                                >
                                    {modalApplicantDetails.status === status && <Check className="w-4 h-4 text-green-500" />}
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>

                 {modalApplicantDetails.cvUrl ? (
                   <iframe title="CV Preview" src={modalApplicantDetails.cvUrl} className="border rounded-xl w-full flex-1" />
                 ) : <div className="flex-1 flex items-center justify-center border rounded-xl bg-gray-50 text-gray-500">No CV file available</div>}
               </div>

               {/* คอลัมน์ขวา (AI Analysis Report) */}
               <div className="md:col-span-2 flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
                 <h3 className="text-xl font-bold text-gray-800 mb-0 sticky top-0 bg-white py-2">AI Analysis Report</h3>

                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                   <h4 className="flex items-center gap-2 text-lg font-semibold text-blue-700 mb-2">
                     <BarChart2 className="w-5 h-5 flex-shrink-0"/> AI Profile Summary
                   </h4>
                   <p className="text-sm text-gray-700">
                      {modalApplicantDetails.ai_summary?.startsWith('Error') || modalApplicantDetails.ai_summary?.includes('failed') || modalApplicantDetails.ai_summary?.includes('JSON')
                         ? <span className="text-red-600 font-semibold">{modalApplicantDetails.ai_summary}</span>
                         : modalApplicantDetails.ai_summary || "-"
                      }
                   </p>
                 </div>
                 
                 {/* Overview / Job Fit */}
                 <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                   <h4 className="flex items-center gap-2 text-lg font-semibold text-green-700 mb-2">
                     <Star className="w-5 h-5 flex-shrink-0"/> Overall Job Fit Overview
                   </h4>
                   <p className="text-sm text-gray-700">{modalApplicantDetails.overview || "No specific overview available (Re-run match for full detail)."}</p>
                 </div>

                 {/* Key Strengths */}
                 <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                   <h4 className="flex items-center gap-2 text-lg font-semibold text-purple-700 mb-2">
                     <Zap className="w-5 h-5 flex-shrink-0"/> Key Strengths
                   </h4>
                   {(modalApplicantDetails.strengths && modalApplicantDetails.strengths.length > 0) ? (
                     <div className="flex flex-wrap gap-2">
                       {modalApplicantDetails.strengths.map((s, idx) => (
                         <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-medium">{s}</span>
                       ))}
                     </div>
                   ) : <p className="text-sm text-gray-500">No specific strengths found for this JD.</p>}
                 </div>

                 {/* Potential Gaps */}
                 <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                   <h4 className="flex items-center gap-2 text-lg font-semibold text-red-700 mb-2">
                     <AlertTriangle className="w-5 h-5 flex-shrink-0"/> Potential Gaps
                   </h4>
                   {(modalApplicantDetails.potential_gaps && modalApplicantDetails.potential_gaps.length > 0) ? (
                     <div className="flex flex-wrap gap-2">
                       {modalApplicantDetails.potential_gaps.map((g, idx) => (
                         <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-medium">{g}</span>
                       ))}
                     </div>
                   ) : <p className="text-sm text-gray-500">No significant gaps found.</p>}
                 </div>

               </div>
             </div>
           </div>
         )}
      </main>
    </div>
  );
};
export default AIMatchingPage;