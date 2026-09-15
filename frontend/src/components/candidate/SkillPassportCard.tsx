import React from 'react';
import { CandidateSkillPassport } from '../../types';
import { Award, CheckCircle2, ShieldCheck, Hash, Calendar, FileText, Code2, MessageSquare } from 'lucide-react';

interface SkillPassportCardProps {
  passport: CandidateSkillPassport;
}

export const SkillPassportCard: React.FC<SkillPassportCardProps> = ({ passport }) => {
  return (
    <div className="bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold tracking-tight">Verified Candidate Skill Passport</h3>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                VERIFIED CREDENTIAL
              </span>
            </div>
            <p className="text-xs text-indigo-200/70 mt-0.5">
              Candidate: <span className="font-semibold text-white">{passport.candidate_name}</span> • ID: {passport.passport_id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-indigo-200/60 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Issued: {passport.issue_date}
          </span>
          <span className="flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" />
            Audit Hash: {passport.blockchain_audit_hash.slice(0, 16)}...
          </span>
        </div>
      </div>

      {/* Verified Skills Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300/80">
            Multi-Source Verified Competencies ({passport.verified_skills_count})
          </span>
          <div className="flex items-center space-x-3 text-[11px] text-indigo-200/70">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-indigo-400" /> Resume Grounded</span>
            <span className="flex items-center gap-1"><Code2 className="w-3 h-3 text-emerald-400" /> Coding Assessment</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3 text-amber-400" /> AI Interview</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {passport.verified_skills.map((s, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/5 border border-indigo-500/20 hover:border-indigo-400/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h5 className="font-bold text-sm text-white">{s.skill}</h5>
                  <span className="text-[10px] text-indigo-300/70">{s.category}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {s.proficiency_level}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] border-t border-white/5 pt-2 mt-1">
                <div className="flex items-center space-x-2">
                  <span
                    title="Resume Claim Grounded"
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      s.resume_verified ? 'bg-indigo-500/30 text-indigo-300' : 'bg-white/5 text-white/20'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                  </span>
                  <span
                    title="Assessment Benchmark Passed"
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      s.assessment_verified ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/5 text-white/20'
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                  </span>
                  <span
                    title="Interview Rubric Grounded"
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      s.interview_verified ? 'bg-amber-500/30 text-amber-300' : 'bg-white/5 text-white/20'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                  </span>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {s.verification_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
