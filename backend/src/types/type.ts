
import { HydratedDocument } from "mongoose";
import { IPlatform } from "../interface/interface_platform";
import { ISetting } from "../interface/interface_setting";

export type PlatformDoc = HydratedDocument<IPlatform>;
export type SettingDoc = HydratedDocument<ISetting>;
