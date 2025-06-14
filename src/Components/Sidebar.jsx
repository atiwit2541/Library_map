import React, { useState } from 'react';
import { BiLogOut } from "react-icons/bi";
import Checkbox from './Checkbox';
import { AiTwotoneLeftCircle } from "react-icons/ai";
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ 
  showGeneralBookstore, 
  toggleGeneralBookstore, 
  showMallBookstore, 
  toggleMallBookstore
}) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      navigate('/', { replace: true });
    }
  };

  const Menus = [
    {
      subMenus: [
        {
          title: 'ร้านหนังสือทั่วไป', 
          type: 'checkbox', 
          checked: showGeneralBookstore, 
          toggle: toggleGeneralBookstore,
        },
        { 
          title: 'ร้านหนังสือในห้าง', 
          type: 'checkbox', 
          checked: showMallBookstore, 
          toggle: toggleMallBookstore,
        },
      ],
    },
  ];

  return (
    <div className="flex z-40">
      <div
        className={`${open ? 'w-60' : 'w-5'} bg-dark-purple h-screen p-5 pt-8 relative duration-500`}
      > 
        <AiTwotoneLeftCircle
          size={28}
          className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple border-2 rounded-full duration-500 ${!open ? 'rotate-180' : ''}`}
          onClick={() => setOpen(!open)}
        />
        <div className="flex gap-x-4 items-center">
          <h1 className={`text-white origin-left font-medium text-xl duration-500 ${!open && 'scale-0'}`}>
            ประเภทร้านหนังสือ
          </h1>
        </div>
        
        <ul className="pt-3 flex flex-col h-[calc(100vh-120px)] justify-between">
          <div>
            {Menus.map((Menu, index) => (
              <React.Fragment key={index}>
                {open && Menu.subMenus && (
                  <ul className="pl-2">
                    {Menu.subMenus.map((subMenuItem, idx) => (
                      <li key={idx} className="flex items-center justify-between text-sm text-white py-2">
                        <div className="flex items-center gap-x-2 w-full">
                          <Checkbox
                            checked={subMenuItem.checked}
                            onChange={subMenuItem.toggle}
                          >
                            <span className="text-white">{subMenuItem.title}</span>
                          </Checkbox>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {open && (
            <li className="flex items-center text-sm text-white py-2 mb-4 pl-2">
              <div 
                className="flex items-center gap-x-2 cursor-pointer hover:text-teal-400 w-full"
                onClick={handleLogout}
              >
                <BiLogOut />
                <span>ออกจากระบบ</span>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;