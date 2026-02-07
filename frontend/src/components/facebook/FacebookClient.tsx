"use client";

interface messagesProps {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface FacebookClientProps {
  data: {
    pageName: string;
    messages: messagesProps[];
  };
}

export default function FacebookClient({ data }: FacebookClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-blue-600 p-6 rounded-xl text-white shadow-lg flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Facebook Page</h3>
          <p className="text-blue-100">
            Connected: <span className="font-semibold">{data.pageName}</span>
          </p>
        </div>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold">
          Sync Now
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm p-4">
        <h4 className="font-semibold dark:text-white mb-4">Inbox</h4>
        <div className="space-y-4">
          {data.messages.map((msg: any) => (
            <div
              key={msg.id}
              className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-2">
              <div>
                <p className="text-sm font-medium dark:text-white">
                  {msg.user}
                </p>
                <p className="text-xs text-slate-500 truncate w-40">
                  {msg.text}
                </p>
              </div>
              <button className="text-xs text-blue-500 hover:underline">
                Reply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
