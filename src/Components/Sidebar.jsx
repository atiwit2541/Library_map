import React, { useState, useEffect } from 'react';
import Checkbox from './Checkbox';
import { AiTwotoneLeftCircle } from "react-icons/ai";

const Sidebar = ({ 
  storeTypeStates, 
  toggleStoreType,
  onStoreTypesLoaded
}) => {
  const [open, setOpen] = useState(true);
  const [storeTypes, setStoreTypes] = useState([]);

  // ดึงข้อมูลประเภทร้านหนังสือจาก API
  useEffect(() => {
    const fetchStoreTypes = async () => {
      try {
        const response = await fetch(
          'https://chaipongmap.com/libraries_pg/get_bookstores.php',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();
        if (data.status === "success") {
          // ดึงประเภทที่ไม่ซ้ำกันจากข้อมูล
          const uniqueStoreTypes = [...new Set(data.data.map(item => item.store_type).filter(Boolean))];
          setStoreTypes(uniqueStoreTypes);
          
          // ส่งข้อมูลประเภทไปยัง parent component
          if (onStoreTypesLoaded) {
            onStoreTypesLoaded(uniqueStoreTypes);
          }
        }
      } catch (error) {
        console.error('Error fetching store types:', error);
      }
    };

    fetchStoreTypes();
  }, [onStoreTypesLoaded]);

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
        
        <ul className="pt-3">
          {open && storeTypes.length > 0 && (
            <ul className="pl-2">
              {storeTypes.map((storeType, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm text-white py-2">
                  <div className="flex items-center gap-x-2 w-full">
                    <Checkbox
                      checked={storeTypeStates[storeType] || false}
                      onChange={() => toggleStoreType(storeType)}
                    >
                      <span className="text-white">{storeType}</span>
                    </Checkbox>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;