"use client";
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

interface Candidate {
  id: number;
  name: string;
  applicantId: string;
  gender: string;
  experience: number;
  position: string;
  education: string;
  matchingScore: number; 
  status: string;
}

const FILTER_OPTIONS = {
  genders: ['All', 'Male', 'Female'],
  experiences: ['All', '2 years', '3 years', '4 years', '5 years', '6 years', '7 years'],
  positions: ['All', 'Backend Developer', 'Software Engineer', 'Frontend Developer', 'Data Analyst', 'DevOps Engineer'],
  matchingScores: ['All', '60-70%', '71-80%', '81-90%', '91-100%'],
  statuses: ['All', 'Applied', 'Shortlisted', 'Interview', 'Offer']
};

const AIMatchingPage = () => {
  const [applicantId, setApplicantId] = useState('');
  const [jobId, setJobId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    gender: 'All',
    experience: 'All',
    position: 'All',
    matchingScore: 'All',
    status: 'All'
  });

  const itemsPerPage = 6;

  const allCandidates: Candidate[] = useMemo(() => [
    { id: 1, name: 'Weeraphol Jongsara', applicantId: 'EMP-83030', gender: 'Male', experience: 7, position: 'Software Engineer', education: 'Bachelor of Science, Computer Engineering, KMUTT', matchingScore: 97, status: 'Interview' },
    { id: 2, name: 'Chayanon Phakthin', applicantId: 'EMP-83110', gender: 'Male', experience: 6, position: 'Software Engineer', education: 'Bachelor of Science, Computer Engineering, Kasetsart University', matchingScore: 89, status: 'Shortlisted' },
    { id: 3, name: 'Thanapon Watthanakun', applicantId: 'EMP-83078', gender: 'Male', experience: 4, position: 'Software Engineer', education: 'Bachelor of Science, Computer Engineering, KMITL', matchingScore: 85, status: 'Interview' },
    { id: 4, name: 'Kanokwan Srisawat', applicantId: 'EMP-83045', gender: 'Female', experience: 5, position: 'Frontend Developer', education: 'Bachelor of Engineering, Software Engineering, Chulalongkorn', matchingScore: 82, status: 'Offer' },
    { id: 5, name: 'Piyapong Charoen', applicantId: 'EMP-83092', gender: 'Male', experience: 3, position: 'Backend Developer', education: 'Bachelor of Science, Computer Science, Mahidol', matchingScore: 78, status: 'Applied' },
    { id: 6, name: 'Supawadee Tanaka', applicantId: 'EMP-83156', gender: 'Female', experience: 6, position: 'Data Analyst', education: 'Bachelor of Science, Statistics, Thammasat', matchingScore: 75, status: 'Shortlisted' },
    { id: 7, name: 'Nattapong Somjai', applicantId: 'EMP-83201', gender: 'Male', experience: 4, position: 'DevOps Engineer', education: 'Bachelor of Engineering, Computer Engineering, KMUTNB', matchingScore: 72, status: 'Applied' },
    { id: 8, name: 'Chutima Prasert', applicantId: 'EMP-83134', gender: 'Female', experience: 5, position: 'Software Engineer', education: 'Bachelor of Science, Information Technology, KU', matchingScore: 88, status: 'Interview' }
  ], []);

  const filteredCandidates = useMemo(() => {
    return allCandidates.filter(candidate => {
      const genderMatch = filters.gender === 'All' || candidate.gender === filters.gender;
      const expMatch = filters.experience === 'All' || `${candidate.experience} years` === filters.experience;
      const posMatch = filters.position === 'All' || candidate.position === filters.position;
      const statusMatch = filters.status === 'All' || candidate.status === filters.status;

      let scoreMatch = true;
      if (filters.matchingScore === '60-70%') scoreMatch = candidate.matchingScore >= 60 && candidate.matchingScore <= 70;
      else if (filters.matchingScore === '71-80%') scoreMatch = candidate.matchingScore >= 71 && candidate.matchingScore <= 80;
      else if (filters.matchingScore === '81-90%') scoreMatch = candidate.matchingScore >= 81 && candidate.matchingScore <= 90;
      else if (filters.matchingScore === '91-100%') scoreMatch = candidate.matchingScore >= 91 && candidate.matchingScore <= 100;

      return genderMatch && expMatch && posMatch && scoreMatch && statusMatch;
    });
  }, [allCandidates, filters]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-blue-500 to-blue-600';
    if (score >= 80) return 'from-blue-400 to-purple-500';
    if (score >= 70) return 'from-purple-400 to-purple-500';
    return 'from-gray-400 to-gray-500';
  };

  const filterOptionsMap: Record<string, string[]> = {
    gender: FILTER_OPTIONS.genders,
    experience: FILTER_OPTIONS.experiences,
    position: FILTER_OPTIONS.positions,
    matchingScore: FILTER_OPTIONS.matchingScores,
    status: FILTER_OPTIONS.statuses
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/images/LogoTalentMatch.png" alt="AI Matching Logo" width={128} height={128} className="object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Matching</h1>
          <p className="text-lg text-blue-600">AI-powered insights for faster, smarter hiring.</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicant ID</label>
              <input
                type="text"
                placeholder="Enter search word"
                value={applicantId}
                onChange={(e) => setApplicantId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Job ID</label>
              <input
                type="text"
                placeholder="Enter search word"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="col-span-2">
              <button className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all">
                Matching
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Filter By:</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.keys(filters).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase">{key}</label>
                <div className="relative">
                  <select
                    value={(filters as any)[key]}
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {filterOptionsMap[key].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidates Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {currentCandidates.map(candidate => (
            <div key={candidate.id} className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1">
              <div className="flex items-start justify-between p-6">
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div><span className="text-blue-600 font-semibold">Candidate: </span>{candidate.name}</div>
                    <div><span className="text-blue-600 font-semibold">Applicant ID: </span>{candidate.applicantId}</div>
                    <div><span className="text-blue-600 font-semibold">Experience: </span>{candidate.experience} years</div>
                    <div><span className="text-blue-600 font-semibold">Position: </span>{candidate.position}</div>
                    <div className="col-span-2"><span className="text-blue-600 font-semibold">Education: </span>{candidate.education}</div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow hover:shadow-lg transition-all text-sm">CV Insight</button>
                    <button className="px-6 py-2 border border-blue-500 text-blue-500 rounded-xl font-semibold hover:bg-blue-50 transition-all text-sm">Update status</button>
                  </div>
                </div>
                <div className={`flex-shrink-0 ml-6 w-40 h-40 bg-gradient-to-br ${getScoreColor(candidate.matchingScore)} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg`}>
                  <div className="text-5xl font-bold">{candidate.matchingScore}%</div>
                  <div className="text-sm font-medium mt-1">Matching Score</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-5 py-2.5 rounded-xl ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              &gt;&gt;
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIMatchingPage;
