import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from "react";
import { Users, Search, Plus, X, Megaphone, Shield } from "lucide-react";
import gsap from "gsap";

import { GroupChannel } from "@/interface/telegram/interface.telegram";
import { AssetType } from "@/@types/telegram/type.telegram";
import { strlower } from "@/utils/util";
import { SetStateProps } from "@/interface";
import { TelegramProtectPageState } from "../TelegramProtectPage";
import { ActionButton } from "./entity/ActionButton";

type GroupManagementProps = SetStateProps<TelegramProtectPageState> & {
  handlers: {
    onAdd: (asset: GroupChannel) => void;
    onRemove: (asset: GroupChannel) => void;
    onSave: (asset: GroupChannel) => void;
  };
  t: (key: string) => string;
};

const GroupManagement: React.FC<GroupManagementProps> = ({
  state,
  setState,
  handlers,
  t,
}) => {
  const { onAdd, onRemove } = handlers;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<AssetType | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!activeModal || !modalOverlayRef.current || !modalContentRef.current)
      return;
    const ctx = gsap.context(() => {
      gsap.set(modalOverlayRef.current, { opacity: 0 });
      gsap.set(modalContentRef.current, { opacity: 0, scale: 0.95, y: 10 });
      const tl = gsap.timeline();
      tl.to(modalOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      }).to(
        modalContentRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "back.out(1.2)",
        },
        "-=0.2",
      );
    });
    return () => ctx.revert();
  }, [activeModal]);

  const closeModal = useCallback(() => {
    if (!activeModal || !modalContentRef.current || !modalOverlayRef.current)
      return;
    const tl = gsap.timeline({
      onComplete: () => {
        setActiveModal(null);
        setModalSearch("");
      },
    });
    tl.to(modalContentRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 10,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      modalOverlayRef.current,
      {
        opacity: 0,
        duration: 0.2,
      },
      "-=0.1",
    );
  }, [activeModal]);

  const handleAdd = useCallback(
    (asset: GroupChannel) => {
      onAdd(asset);
      closeModal();
    },
    [onAdd, closeModal],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent, asset: GroupChannel) => {
      e.stopPropagation();
      onRemove(asset);
    },
    [onRemove],
  );

  const filteredManagedAssets = useMemo(() => {
    const assets = state.managedAssets?.active ?? [];
    if (!searchQuery) return assets;
    return assets.filter((item) =>
      strlower(item.name).includes(strlower(searchQuery)),
    );
  }, [state.managedAssets?.active, searchQuery]);

  const filteredAvailableAssets = useMemo(() => {
    if (!activeModal) return [];
    const groups = state.managedAssets?.group ?? [];
    const channels = state.managedAssets?.channel ?? [];
    return [...groups, ...channels].filter((item) => {
      const typeMatch = strlower(item.type) === strlower(activeModal);
      if (!typeMatch) return false;
      if (!modalSearch) return true;
      return strlower(item.name).includes(strlower(modalSearch));
    });
  }, [state.managedAssets, activeModal, modalSearch]);

  const renderIcon = (type: string, size = 12) =>
    type === "Group" ? <Users size={size} /> : <Megaphone size={size} />;

  return (
    <React.Fragment>
      <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl shadow-lg h-[350px] overflow-hidden font-sans relative z-10">
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-sm">
              Protected Assets
            </h3>
            <span className="bg-slate-800 text-slate-500 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {filteredManagedAssets.length}
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

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredManagedAssets.length > 0 ? (
            filteredManagedAssets.map((group) => {
              const isActive = state.activeAsset?.id === group.id;
              const isGroup = group.type === "Group";
              return (
                <div
                  key={group.id}
                  onClick={() =>
                    setState((prev) => ({ ...prev, activeAsset: group }))
                  }
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-800/80 border-slate-600 shadow-[0_0_0_1px_rgba(148,163,184,0.4)]"
                      : "hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50"
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center border ${
                        isGroup
                          ? "bg-blue-500/10 border-blue-500/10 text-blue-400"
                          : "bg-purple-500/10 border-purple-500/10 text-purple-400"
                      }`}
                    >
                      {renderIcon(group.type)}
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-xs font-medium text-slate-200 mb-1">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {group.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, group)}
                    className="p-1 cursor-pointer text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Remove asset"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <p className="text-xs">No assets found</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 grid grid-cols-2 gap-3">
          <ActionButton
            onClick={() => setActiveModal("Group")}
            label="Add Group"
            icon={<Users size={12} />}
            colorClass="indigo"
          />
          <ActionButton
            onClick={() => setActiveModal("Channel")}
            label="Add Channel"
            icon={<Megaphone size={12} />}
            colorClass="purple"
          />
        </div>
      </div>
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
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Select {activeModal}
                </h3>
                <p className="text-[10px] text-slate-500">
                  Choose a {activeModal.toLowerCase()} to protect
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 cursor-pointer text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
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

            <div className="max-h-[300px] overflow-y-auto p-2 bg-slate-900 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredAvailableAssets.length > 0 ? (
                filteredAvailableAssets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleAdd(asset)}
                    className="w-full cursor-pointer flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 group transition-all text-left border border-transparent hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          asset.type === "Group"
                            ? "bg-indigo-500/10 text-indigo-400"
                            : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {asset.avartar ? (
                          <img
                            src={asset.avartar}
                            alt={asset.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-bold">
                            {asset.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-200 group-hover:text-white">
                          {asset.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          ID: {asset.id}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white p-1 rounded transition-all transform scale-90 group-hover:scale-100">
                      <Plus size={14} />
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-500">
                    No available assets found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
export default GroupManagement;
