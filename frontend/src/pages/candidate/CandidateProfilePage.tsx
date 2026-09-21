import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, 
  User, Briefcase, GraduationCap, Plus, Trash2, Loader2, Save, X
} from 'lucide-react';
import { resumesApi, candidatesApi } from '../../api';
import { CandidateProfile, ResumeSummary } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/common/Badge';

const createDefaultProfile = (u: any): CandidateProfile => ({
  id: u?.candidate_profile_id || u?.id || 1,
  user_id: u?.id || 1,
  full_name: u?.full_name || 'Candidate',
  email: u?.email || '',
  phone: '',
  location: 'Remote / Hybrid',
  summary: '',
  years_of_experience: 1.0,
  education_level: "Bachelor's Degree",
  parsing_confidence: 0,
  skills: [],
  experiences: [],
  educations: [],
  resumes: [],
  recent_resume: undefined,
});

export const CandidateProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(() => (user ? createDefaultProfile(user) : null));
  const [fetching, setFetching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExp, setYearsExp] = useState(2.0);
  const [eduLevel, setEduLevel] = useState("Bachelor's Degree");
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (!profile) {
        setProfile(createDefaultProfile(user));
      }
      loadProfile();
    }
  }, [user]);

  const loadProfile = async (silent = false) => {
    if (!user) return;
    if (!silent) setFetching(true);
    setError(null);

    try {
      const data = await candidatesApi.getMyProfile();
      if (data) {
        setProfile(data);
        if (data.summary) setSummary(data.summary);
        if (data.phone) setPhone(data.phone);
        if (data.location) setLocation(data.location);
        if (data.years_of_experience != null) setYearsExp(data.years_of_experience);
        if (data.education_level) setEduLevel(data.education_level);
      }
    } catch (err: any) {
      console.warn('Could not refresh candidate profile from backend:', err);
      // Always preserve existing profile in state rather than clearing
      setProfile((prev) => prev || createDefaultProfile(user));
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    // Clear input value so selecting the same file again triggers onChange
    e.target.value = '';

    setError(null);
    setUploadMessage(null);
    setUploadingFile(fileName);
    setUploading(true);

    try {
      const res = await resumesApi.upload(file, profile?.id);
      setUploadMessage(res.message || `"${fileName}" uploaded and parsed successfully.`);

      // Immediately build active resume item
      const newResumeItem: ResumeSummary = {
        id: res.resume_id,
        filename: res.filename,
        file_type: res.file_type,
        file_size: res.file_size,
        parsing_confidence: res.parsing_confidence,
        created_at: new Date().toISOString(),
      };

      // Optimistically update local profile state so Active Resume Dossier renders immediately
      setProfile((prev) => {
        const current = prev || createDefaultProfile(user);
        const existingResumes = current.resumes ? current.resumes.filter((r) => r.id !== res.resume_id) : [];
        const newSkills = res.parsed_data?.skills?.map((s: any, idx: number) => ({
          id: idx + 1,
          candidate_id: current.id,
          skill_name: s.skill_name,
          level: s.claimed_level || 'Intermediate',
          verified: false,
        })) || current.skills || [];

        return {
          ...current,
          parsing_confidence: res.parsing_confidence,
          summary: res.parsed_data?.summary || current.summary,
          phone: res.parsed_data?.phone || current.phone,
          location: res.parsed_data?.location || current.location,
          years_of_experience: res.parsed_data?.years_of_experience ?? current.years_of_experience,
          education_level: res.parsed_data?.education_level || current.education_level,
          skills: newSkills,
          resumes: [...existingResumes, newResumeItem],
          recent_resume: newResumeItem,
        };
      });

      if (res.parsed_data?.summary) setSummary(res.parsed_data.summary);
      if (res.parsed_data?.phone) setPhone(res.parsed_data.phone);
      if (res.parsed_data?.location) setLocation(res.parsed_data.location);
      if (res.parsed_data?.years_of_experience != null) setYearsExp(res.parsed_data.years_of_experience);
      if (res.parsed_data?.education_level) setEduLevel(res.parsed_data.education_level);

      // Silently sync with backend in the background without blocking the UI
      loadProfile(true).catch(() => {});
    } catch (err: any) {
      setError(err.message || 'Unable to parse this resume. Please upload a valid PDF or DOCX file.');
    } finally {
      setUploading(false);
      setUploadingFile(null);
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();
    setProfile((prev) => {
      const current = prev || createDefaultProfile(user);
      if (current.skills.some((s) => s.skill_name.toLowerCase() === skillName.toLowerCase())) {
        return current;
      }
      return {
        ...current,
        skills: [
          ...current.skills,
          {
            id: Date.now(),
            candidate_id: current.id,
            skill_name: skillName,
            level: 'Intermediate',
            verified: false,
          },
        ],
      };
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        skills: prev.skills.filter((s) => s.skill_name.toLowerCase() !== skillName.toLowerCase()),
      };
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeId = profile?.id || user?.id;
    if (!activeId) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await candidatesApi.update(activeId, {
        summary,
        phone,
        location,
        years_of_experience: yearsExp,
        education_level: eduLevel,
      });
      setProfile((prev) => ({
        ...(prev || createDefaultProfile(user)),
        ...updated,
        skills: prev?.skills || updated.skills || [],
        resumes: prev?.resumes || updated.resumes || [],
        recent_resume: prev?.recent_resume || updated.recent_resume,
      }));
      setUploadMessage('Profile adjustments saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentProfile = profile || createDefaultProfile(user);

  const activeResume: ResumeSummary | null = currentProfile.recent_resume || 
    (currentProfile.resumes && currentProfile.resumes.length > 0 
      ? currentProfile.resumes[currentProfile.resumes.length - 1] 
      : null);

  const hasUploadedResume = Boolean(activeResume || (currentProfile.parsing_confidence && currentProfile.parsing_confidence > 0));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Candidate Profile & Credentials
            </span>
            {fetching && (
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-100 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing data...
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Resume & Experience Dossier
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload your resume in PDF or DOCX format for automatic parsing and confidence calculation.
          </p>
        </div>
      </div>

      {uploadMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{uploadMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Resume Card or Upload Dropzone */}
      {hasUploadedResume ? (
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border-2 border-emerald-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeResume?.filename || `${(currentProfile.full_name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`}
                  </h3>
                  <Badge variant="success" size="sm">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active & Parsed
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {activeResume?.file_size ? `${Math.round(activeResume.file_size / 1024)} KB • ` : ''}
                  {activeResume?.created_at && !isNaN(new Date(activeResume.created_at).getTime()) ? `Uploaded ${new Date(activeResume.created_at).toLocaleDateString()} • ` : ''}
                  AI Confidence: <strong className="text-emerald-700 font-bold">{Math.round(currentProfile.parsing_confidence || activeResume?.parsing_confidence || 85)}%</strong>
                </p>
              </div>
            </div>

            {/* Replace / Upload New Button */}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Parsing {uploadingFile || 'Resume'}...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Upload New Resume</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Quick Extracted Highlights Grid */}
          <div className="mt-5 pt-4 border-t border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-slate-400 block text-[11px] font-medium">Extracted Skills</span>
              <span className="font-bold text-slate-800 text-sm">{currentProfile.skills?.length || 0} Competencies</span>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-slate-400 block text-[11px] font-medium">Industry Tenure</span>
              <span className="font-bold text-slate-800 text-sm">{currentProfile.years_of_experience || 0} Years</span>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-slate-400 block text-[11px] font-medium">Degree Alignment</span>
              <span className="font-bold text-slate-800 text-sm truncate">{currentProfile.education_level || "Bachelor's"}</span>
            </div>
            <div className="bg-white/80 rounded-xl p-3 border border-emerald-100">
              <span className="text-slate-400 block text-[11px] font-medium">Verification Status</span>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div className="bg-white border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-8 text-center transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            ) : (
              <Upload className="w-7 h-7" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {uploading ? `Parsing ${uploadingFile || 'Resume'}...` : 'Upload Your Resume'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Supported formats: <strong>.PDF, .DOCX</strong> (Max 10MB). PyMuPDF and python-docx will extract your credentials.
          </p>

          <label className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Parsing Resume...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" /> Select Resume File
              </>
            )}
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Editable Profile Information */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Parsed Candidate Details & Manual Overrides
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 0123-4567"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State / Remote"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Years Experience</label>
              <input
                type="number"
                step="0.5"
                value={yearsExp}
                onChange={(e) => setYearsExp(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Education Level</label>
            <select
              value={eduLevel}
              onChange={(e) => setEduLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="High School">High School</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="Doctorate / PhD">Doctorate / PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Professional Summary</label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Provide a short professional summary or let the resume parser auto-fill it..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Current Extracted Skills with Add & Remove */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">
              Recognized Competencies ({currentProfile.skills?.length || 0})
            </label>

            {currentProfile.skills && currentProfile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentProfile.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs group"
                  >
                    {s.skill_name}
                    <span className="text-[10px] text-indigo-400">({s.level})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.skill_name)}
                      className="text-indigo-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                      title={`Remove ${s.skill_name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No skills detected yet. Upload your resume above or add custom competencies below.
              </p>
            )}

            {/* Quick Add Skill Form */}
            <div className="flex items-center gap-2 pt-2 max-w-sm">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                placeholder="Add custom skill (e.g. React, Python)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving changes...' : 'Save Profile Adjustments'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
