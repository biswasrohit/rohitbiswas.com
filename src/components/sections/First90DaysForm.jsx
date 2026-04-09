import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';

const MAX = {
  company: 100,
  role: 100,
  description: 4000,
};

const PLACEHOLDER_DESCRIPTION = `Paste the job posting or a quick blurb about the team — what you're building, the stack, what the role owns. The more specific, the better the plan.`;

const First90DaysForm = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!company.trim()) next.company = 'Required';
    if (!role.trim()) next.role = 'Required';
    if (!description.trim()) next.description = 'Required';
    if (description.length > MAX.description) {
      next.description = `Max ${MAX.description} characters`;
    }
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    navigate('/first-90-days', {
      state: {
        company: company.trim(),
        role: role.trim(),
        description: description.trim(),
      },
    });
  };

  return (
    <section id="first-90-days-form" className="section-container">
      <SectionHeader
        title="My First 90 Days at Your Company"
        subtitle="Tell me about the role and I'll generate a personalized onboarding plan grounded in my actual skills and projects"
        index="01.5 · 90-day plan"
      />

      <motion.div
        className="terminal-chrome max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-xs text-white/30 ml-2">
            rohit@columbia:~$ ./generate-90-day-plan.sh
          </span>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {/* Company + Role row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="company"
                className="block font-mono text-xs text-[#38bdf8]/70 mb-2 uppercase tracking-widest"
              >
                &gt; company_name
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, MAX.company))}
                placeholder="Acme Inc."
                maxLength={MAX.company}
                className="input-terminal"
                aria-invalid={Boolean(errors.company)}
                aria-describedby={errors.company ? 'company-error' : undefined}
              />
              {errors.company && (
                <p id="company-error" className="font-mono text-xs text-[#d946ef] mt-1">
                  // {errors.company}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block font-mono text-xs text-[#38bdf8]/70 mb-2 uppercase tracking-widest"
              >
                &gt; role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value.slice(0, MAX.role))}
                placeholder="Software Engineer Intern"
                maxLength={MAX.role}
                className="input-terminal"
                aria-invalid={Boolean(errors.role)}
                aria-describedby={errors.role ? 'role-error' : undefined}
              />
              {errors.role && (
                <p id="role-error" className="font-mono text-xs text-[#d946ef] mt-1">
                  // {errors.role}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block font-mono text-xs text-[#38bdf8]/70 mb-2 uppercase tracking-widest"
            >
              &gt; job_description / company_blurb
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, MAX.description))}
              placeholder={PLACEHOLDER_DESCRIPTION}
              rows={7}
              maxLength={MAX.description}
              className="input-terminal resize-y leading-6"
              style={{ minHeight: '160px' }}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : 'description-counter'}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description ? (
                <p id="description-error" className="font-mono text-xs text-[#d946ef]">
                  // {errors.description}
                </p>
              ) : (
                <span aria-hidden="true" />
              )}
              <p
                id="description-counter"
                className="font-mono text-xs text-white/30 ml-auto"
              >
                {description.length} / {MAX.description}
              </p>
            </div>
          </div>

          {/* Submit + helper */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <button type="submit" className="btn-glow">
              <span aria-hidden="true">$</span>
              <span>Generate My First 90 Days Plan</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <p className="font-mono text-xs text-white/40">
              // free, anonymous, 10 plans per IP per hour
            </p>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

export default First90DaysForm;
