import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-955 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30">
        <AlertCircle className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Page Not Found</h1>
        <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          The link you followed might be broken, or the page may have been relocated.
        </p>
      </div>
      <Link
        to="/"
        className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
      >
        Return to Home overview
      </Link>
    </div>
  );
};

export default NotFound;
