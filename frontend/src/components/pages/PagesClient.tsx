"use client";
import { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

export default function PagesClient({ initialPages }: { initialPages: any[] }) {
  const [pages, setPages] = useState(initialPages);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <input placeholder="Filter pages..." className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 w-full outline-none" />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Create Page
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs text-slate-700 uppercase bg-gray-50 dark:bg-slate-800 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3">Page Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{page.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${page.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4">{page.date}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-indigo-600 hover:underline">Edit</button>
                  <button className="text-rose-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simplified Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-96">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Create Page</h3>
            <input placeholder="Page Name" className="w-full mb-3 p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}