"use client";

export default function ProfileClient({ profile }: { profile: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-4 border-slate-50 dark:border-slate-800">
             {profile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{profile.name}</h2>
            <p className="text-slate-500">{profile.role}</p>
          </div>
        </div>
        <hr className="my-8 border-gray-200 dark:border-slate-800" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Full Name</label>
            <input defaultValue={profile.name} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Email</label>
            <input defaultValue={profile.email} className="w-full p-2 border rounded dark:bg-slate-800 dark:border-slate-700" />
          </div>
        </div>
        <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg">Save Profile</button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
        <h3 className="font-medium dark:text-white mb-4">Sessions</h3>
        <ul className="space-y-4 text-sm">
          {profile.sessions.map((s: any, i: number) => (
             <li key={i} className="flex justify-between">
                <div>
                   <p className="font-medium dark:text-white">{s.device}</p>
                   <p className="text-xs text-slate-500">{s.ip}</p>
                </div>
                <span className="text-xs text-slate-400">{s.active}</span>
             </li>
          ))}
        </ul>
      </div>
    </div>
  );
}