import React, { useState, useRef, useEffect } from 'react';
import { Users, Search, Plus, X, Megaphone, Shield } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react'; // Standard modern GSAP hook, or use useEffect

const GroupManagement = () => {
  // 1. Data State
  const [managedGroups, setManagedGroups] = useState([
    { id: 1, name: 'VIP Traders', type: 'Group' },
    { id: 2, name: 'Announcements', type: 'Channel' },
  ]);

  const availableAssets = [
    { id: 101, name: 'Public Chat', type: 'Group' },
    { id: 102, name: 'Degen Calls', type: 'Channel' },
    { id: 103, name: 'Whale Alerts', type: 'Channel' },
    { id: 104, name: 'Support Group', type: 'Group' },
    { id: 105, name: 'Team Internal', type: 'Group' },
  ];

  // 2. UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'Group' | 'Channel' | null
  const [modalSearch, setModalSearch] = useState('');

  // 3. GSAP Refs
  const modalOverlayRef = useRef(null);
  const modalContentRef = useRef(null);

  // --- ANIMATION LOGIC ---

  // Handle Entrance Animation
  useEffect(() => {
    if (activeModal) {
      // 1. Set initial state (invisible and slightly scaled down)
      gsap.set(modalOverlayRef.current, { opacity: 0 });
      gsap.set(modalContentRef.current, { opacity: 0, scale: 0.95, y: 10 });

      // 2. Animate In
      const tl = gsap.timeline();
      tl.to(modalOverlayRef.current, { 
        opacity: 1, 
        duration: 0.3, 
        ease: "power2.out" 
      })
      .to(modalContentRef.current, { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.4, 
        ease: "back.out(1.2)" // A subtle 'pop' effect for cleanliness
      }, "-=0.2"); // Overlap slightly
    }
  }, [activeModal]);

  // Handle Exit Animation (Run animation THEN clear state)
  const closeModal = () => {
    if (!activeModal) return;

    const tl = gsap.timeline({
      onComplete: () => {
        setActiveModal(null);
        setModalSearch('');
      }
    });

    tl.to(modalContentRef.current, { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      duration: 0.2, 
      ease: "power2.in" 
    })
    .to(modalOverlayRef.current, { 
      opacity: 0, 
      duration: 0.2 
    }, "-=0.1");
  };

  // --- HANDLERS ---

  const addToManaged = (asset) => {
    if (!managedGroups.find(g => g.id === asset.id)) {
      setManagedGroups([...managedGroups, asset]);
    }
    closeModal(); // Use the animated close
  };

  const removeGroup = (id) => {
    setManagedGroups(managedGroups.filter((g) => g.id !== id));
  };

  // Filters
  const filteredManaged = managedGroups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailable = availableAssets.filter(asset => 
    asset.type === activeModal && 
    !managedGroups.find(g => g.id === asset.id) && 
    asset.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <>
      {/* --- MAIN DASHBOARD CARD --- */}
      <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-lg h-[350px] overflow-hidden font-sans relative z-10">
        
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-sm">Protected Assets</h3>
            <span className="bg-slate-800 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {managedGroups.length}
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-32 sm:w-40 bg-slate-950 border border-slate-800 rounded-md pl-7 pr-2 py-1 text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500/50 transition-colors outline-none"
            />
            <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>

        {/* Main List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredManaged.length > 0 ? (
            filteredManaged.map((group) => (
              <div
                key={group.id}
                className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                    group.type === 'Group' 
                      ? 'bg-blue-500/10 border-blue-500/10 text-blue-400' 
                      : 'bg-purple-500/10 border-purple-500/10 text-purple-400'
                  }`}>
                    {group.type === 'Group' ? <Users size={12} /> : <Megaphone size={12} />}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-xs font-medium text-slate-200 mb-1">{group.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{group.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeGroup(group.id)}
                  className="p-1 cursor-pointer text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <p className="text-xs">No assets found</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-3">
          <button
            onClick={() => setActiveModal('Group')}
            className="flex cursor-pointer items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-900/20 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-400 py-2 rounded-lg transition-all text-xs font-semibold group"
          >
            <div className="p-1 rounded bg-slate-800 group-hover:bg-indigo-500/20 transition-colors">
               <Users size={12} />
            </div>
            Add Group
          </button>

          <button
             onClick={() => setActiveModal('Channel')}
             className="flex cursor-pointer items-center justify-center gap-2 bg-slate-900 hover:bg-purple-900/20 border border-slate-800 hover:border-purple-500/30 text-slate-300 hover:text-purple-400 py-2 rounded-lg transition-all text-xs font-semibold group"
          >
            <div className="p-1 rounded bg-slate-800 group-hover:bg-purple-500/20 transition-colors">
               <Megaphone size={12} />
            </div>
            Add Channel
          </button>
        </div>
      </div>

      {/* --- GSAP ANIMATED MODAL --- */}
      {activeModal && (
        <div 
          ref={modalOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md p-4"
          onClick={(e) => {
              if (e.target === modalOverlayRef.current) closeModal();
          }}
        >
          <div 
            ref={modalContentRef}
            className="w-full max-w-sm bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
          >
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white">Select {activeModal}</h3>
                <p className="text-[10px] text-slate-500">Choose a {activeModal.toLowerCase()} to protect</p>
              </div>
              <button 
                onClick={closeModal}
                className="p-1.5 cursor-pointer text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Search */}
            <div className="px-4 py-3 bg-slate-950/50">
               <div className="relative">
                 <input 
                   autoFocus
                   type="text"
                   value={modalSearch}
                   onChange={(e) => setModalSearch(e.target.value)}
                   placeholder={`Search available ${activeModal.toLowerCase()}s...`}
                   className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none"
                 />
                 <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
               </div>
            </div>

            {/* Modal List */}
            <div className="max-h-[300px] overflow-y-auto p-2 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredAvailable.length > 0 ? (
                filteredAvailable.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => addToManaged(asset)}
                    className="w-full cursor-pointer flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 group transition-all text-left border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                         asset.type === 'Group' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'
                       }`}>
                         <span className="text-xs font-bold">{asset.name.substring(0,2).toUpperCase()}</span>
                       </div>
                       <div>
                         <p className="text-xs font-medium text-slate-200 group-hover:text-white">{asset.name}</p>
                         <p className="text-[10px] text-slate-500">ID: {asset.id}</p>
                       </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white p-1 rounded transition-all transform scale-90 group-hover:scale-100">
                      <Plus size={14} />
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-500">No available {activeModal.toLowerCase()}s found.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default GroupManagement;