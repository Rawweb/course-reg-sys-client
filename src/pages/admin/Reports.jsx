// src/pages/admin/Reports.jsx
// The four admin reports as switchable tabs, each a responsive table.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getStudentRegistrationReport,
  getCourseEnrollmentReport,
  getPrerequisiteValidationReport,
  getUnitLoadReport,
} from '../../api/reportApi';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { SkeletonBlock } from '../../components/ui/Skeleton';

// The four tabs, each with its key, label, and fetch function.
const TABS = [
  { key: 'student', label: 'Student Registration', fn: getStudentRegistrationReport },
  { key: 'enrollment', label: 'Course Enrollment', fn: getCourseEnrollmentReport },
  { key: 'prerequisite', label: 'Prerequisite Validation', fn: getPrerequisiteValidationReport },
  { key: 'unitload', label: 'Unit Load', fn: getUnitLoadReport },
];

const Reports = () => {
  const [active, setActive] = useState('student');

  // Fetch ONLY the active tab's report. `enabled` keeps the others dormant.
  const activeTab = TABS.find((t) => t.key === active);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['report', active],
    queryFn: activeTab.fn,
    enabled: !!activeTab, // always true here, but the pattern is explicit
  });

  const rows = data?.rows || [];

  return (
    <div>
      <h1 className='text-2xl font-bold text-text-heading'>Reports</h1>
      <p className='mt-1 text-sm text-text-muted'>Registration reports across all departments.</p>

      {/* Tabs — horizontally scrollable on small screens */}
      <div className='mt-6 flex gap-1 overflow-x-auto border-b border-border'>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
              active === t.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className='mt-6'>
        {isLoading ? (
          <div className='space-y-3'>
            <SkeletonBlock className='h-12 w-full' />
            <SkeletonBlock className='h-12 w-full' />
            <SkeletonBlock className='h-12 w-full' />
          </div>
        ) : isError ? (
          <p className='text-sm text-danger'>Couldn't load this report.</p>
        ) : rows.length === 0 ? (
          <div className='card text-center py-10'>
            <p className='text-sm text-text-muted'>No records for this report.</p>
          </div>
        ) : (
          <>
            <p className='mb-3 text-sm text-text-muted'>{rows.length} record(s)</p>
            {/* Each report renders its own columns */}
            {active === 'student' && <StudentReport rows={rows} />}
            {active === 'enrollment' && <EnrollmentReport rows={rows} />}
            {active === 'prerequisite' && <PrerequisiteReport rows={rows} />}
            {active === 'unitload' && <UnitLoadReport rows={rows} />}
          </>
        )}
      </div>
    </div>
  );
};

// --- Report 1: Student Registration ---
// Columns: Student ID, Name, Department, Level, Status.
const StudentReport = ({ rows }) => (
  <Table headers={['Matric No', 'Name', 'Department', 'Level', 'Status']}>
    {rows.map((r, i) => (
      <tr key={i}>
        <td className='whitespace-nowrap px-4 py-3 font-medium text-text-heading'>{r.studentId}</td>
        <td className='px-4 py-3 text-text'>{r.studentName}</td>
        <td className='px-4 py-3 text-text'>{r.department}</td>
        <td className='px-4 py-3 text-text'>{r.level}L</td>
        <td className='px-4 py-3'>
          <Badge status={r.status} />
        </td>
      </tr>
    ))}
  </Table>
);

// --- Report 2: Course Enrollment ---
// Columns: Course Code, Title, Credit Unit, No. of Students.
const EnrollmentReport = ({ rows }) => (
  <Table headers={['Course Code', 'Title', 'Credit Unit', 'Students Registered']}>
    {rows.map((r, i) => (
      <tr key={i}>
        <td className='whitespace-nowrap px-4 py-3 font-medium text-text-heading'>
          {r.courseCode}
        </td>
        <td className='px-4 py-3 text-text'>{r.courseTitle}</td>
        <td className='px-4 py-3 text-text'>{r.creditUnit}</td>
        <td className='px-4 py-3 font-semibold text-text-heading'>{r.studentsRegistered}</td>
      </tr>
    ))}
  </Table>
);

// --- Report 3: Prerequisite Validation ---
// Columns: Student Name, Courses Applied For, Reason, Validation Status.
const PrerequisiteReport = ({ rows }) => (
  <Table headers={['Student', 'Matric No', 'Courses Applied', 'Reason', 'Status']}>
    {rows.map((r, i) => (
      <tr key={i}>
        <td className='px-4 py-3 text-text'>{r.studentName}</td>
        <td className='whitespace-nowrap px-4 py-3 text-text'>{r.matricNumber}</td>
        <td className='px-4 py-3 text-text'>{r.coursesAppliedFor?.join(', ')}</td>
        <td className='px-4 py-3 text-text'>{r.reason}</td>
        <td className='px-4 py-3'>
          <span className='badge-rejected'>{r.validationStatus}</span>
        </td>
      </tr>
    ))}
  </Table>
);

// --- Report 4: Unit Load ---
// Columns: Student Name, Total Units, Status.
const UnitLoadReport = ({ rows }) => (
  <Table headers={['Student', 'Matric No', 'Department', 'Level', 'Total Units', 'Status']}>
    {rows.map((r, i) => (
      <tr key={i}>
        <td className='px-4 py-3 text-text'>{r.studentName}</td>
        <td className='whitespace-nowrap px-4 py-3 text-text'>{r.matricNumber}</td>
        <td className='px-4 py-3 text-text'>{r.department}</td>
        <td className='px-4 py-3 text-text'>{r.level}L</td>
        <td className='px-4 py-3 font-semibold text-text-heading'>{r.totalRegisteredUnits}</td>
        <td className='px-4 py-3'>
          <span className={r.status === 'Exceeded Limit' ? 'badge-rejected' : 'badge-pending'}>
            {r.status}
          </span>
        </td>
      </tr>
    ))}
  </Table>
);

export default Reports;
