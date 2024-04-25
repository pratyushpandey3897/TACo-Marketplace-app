import { NavLink, Outlet } from "react-router-dom";
import SidebarItem from "./sidebar-item.component";

const Sidebar = () => {
    return (
        <div className="h-full flex flex-col justify-between bg-white shadow-lg rounded-lg items-center pt-5">
            <div className="flex flex-col justify-start text-left w-full ">
                <SidebarItem to="/" text="Marketplace" />
                <SidebarItem to="publish" text="Publish Asset" />
                <SidebarItem to="audit" text="Audit Code" />
            </div>
        </div>
    );
};

export default Sidebar;
