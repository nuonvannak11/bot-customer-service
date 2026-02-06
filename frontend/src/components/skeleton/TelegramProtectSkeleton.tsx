const TelegramProtectSkeleton = () => {
  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative w-20 h-20 bg-slate-800 rounded-full shrink-0"></div>
            <div className="w-full">
              <div className="h-8 bg-slate-700 rounded w-48 mb-3"></div>
              <div className="h-4 bg-slate-800 rounded w-64 mb-4"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-slate-800 rounded w-20"></div>
                <div className="h-4 bg-slate-800 rounded w-20"></div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto shrink-0">
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center w-full md:w-32">
              <div className="h-3 bg-slate-700 rounded w-20 mx-auto mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-12 mx-auto"></div>
            </div>
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center w-full md:w-32">
              <div className="h-3 bg-slate-700 rounded w-16 mx-auto mb-2"></div>
              <div className="h-8 bg-slate-700 rounded w-12 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-lg h-[350px] overflow-hidden relative z-10">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
              <div className="w-6 h-4 bg-slate-800 rounded-full"></div>
            </div>
            <div className="w-32 sm:w-40 h-8 bg-slate-950 border border-slate-800 rounded-md"></div>
          </div>
          <div className="flex-1 p-2 space-y-2">
            <div className="h-10 bg-slate-800/50 rounded-lg w-full"></div>
            <div className="h-10 bg-slate-800/50 rounded-lg w-full"></div>
            <div className="h-10 bg-slate-800/50 rounded-lg w-full"></div>
            <div className="h-10 bg-slate-800/50 rounded-lg w-full/3"></div>
          </div>
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-3">
            <div className="h-10 bg-slate-900 border border-slate-800 rounded-lg"></div>
            <div className="h-10 bg-slate-900 border border-slate-800 rounded-lg"></div>
          </div>
        </div>
        <div className="w-full space-y-6 lg:col-span-2 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-6">
          <div className="relative flex flex-col h-[480px] w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
                <div>
                  <div className="h-5 bg-slate-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-32"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
            </div>
            <div className="p-6 flex-1 space-y-6">
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-slate-950 border border-slate-800 rounded-xl"></div>
                <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
              </div>
              <div className="h-[120px] p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 flex flex-wrap gap-2">
                <div className="h-8 w-16 bg-slate-800 rounded-lg"></div>
                <div className="h-8 w-20 bg-slate-800 rounded-lg"></div>
                <div className="h-8 w-14 bg-slate-800 rounded-lg"></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-40"></div>
                  <div className="h-3 bg-slate-800 rounded w-56"></div>
                </div>
                <div className="w-11 h-6 bg-slate-800 rounded-full"></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center">
              <div className="h-3 bg-slate-800 rounded w-32"></div>
              <div className="h-10 bg-slate-800 rounded-lg w-32"></div>
            </div>
          </div>

          <div className="relative flex flex-col h-[480px] w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
                <div>
                  <div className="h-5 bg-slate-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-slate-800 rounded w-32"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
            </div>
            <div className="p-6 flex-1 space-y-6">
              <div className="flex gap-2">
                <div className="flex-1 h-12 bg-slate-950 border border-slate-800 rounded-xl"></div>
                <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
              </div>
              <div className="h-[120px] p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 flex flex-wrap gap-2">
                <div className="h-8 w-24 bg-slate-800 rounded-lg"></div>
                <div className="h-8 w-32 bg-slate-800 rounded-lg"></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-40"></div>
                  <div className="h-3 bg-slate-800 rounded w-56"></div>
                </div>
                <div className="w-11 h-6 bg-slate-800 rounded-full"></div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex justify-between items-center">
              <div className="h-3 bg-slate-800 rounded w-32"></div>
              <div className="h-10 bg-slate-800 rounded-lg w-32"></div>
            </div>
          </div>
        </div>{" "}
      </div>{" "}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
            <div>
              <div className="h-4 bg-slate-700 rounded w-24 mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-32"></div>
            </div>
          </div>
          <div className="h-9 bg-slate-800 rounded-lg w-28"></div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-700 rounded w-24"></div>
              <div className="h-5 bg-slate-800 rounded w-10"></div>
            </div>
            <div className="h-6 bg-slate-800 rounded-full w-full"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-700 rounded w-32"></div>
              <div className="h-5 bg-slate-800 rounded w-10"></div>
            </div>
            <div className="h-6 bg-slate-800 rounded-full w-full"></div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="h-4 bg-slate-700 rounded w-28"></div>
              <div className="h-5 bg-slate-800 rounded w-12"></div>
            </div>
            <div className="h-6 bg-slate-800 rounded-full w-full"></div>
          </div>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-800 rounded"></div>
            <div className="h-5 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="h-4 bg-slate-800 rounded w-16"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">
                  <div className="h-4 bg-slate-800 rounded w-12"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-slate-800 rounded w-16"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-slate-800 rounded w-20"></div>
                </th>
                <th className="px-6 py-3">
                  <div className="h-4 bg-slate-800 rounded w-24"></div>
                </th>
                <th className="px-6 py-3 text-right">
                  <div className="h-4 bg-slate-800 rounded w-16 ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-slate-800 rounded w-14"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-32"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded w-20"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-slate-800 rounded w-14"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-40"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-slate-800 rounded w-14"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-28"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded w-22"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-slate-800 rounded w-14"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-36"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-700 rounded w-16"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-5 bg-slate-800 rounded w-14"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-3 bg-slate-800 rounded w-24"></div>
                </td>
                <td className="px-6 py-4">
                  <div className="h-4 bg-slate-800 rounded w-20 ml-auto"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TelegramProtectSkeleton;
