import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import MapComponent from './MapContainer';

const Rendermap = () => {
  // ใช้ state แบบไดนามิกสำหรับแต่ละประเภทร้านหนังสือ
  const [storeTypeStates, setStoreTypeStates] = useState({});
  const mapRef = useRef();

  // ฟังก์ชันสำหรับ toggle แต่ละประเภทแบบไดนามิก
  const toggleStoreType = (storeType) => {
    setStoreTypeStates(prev => ({
      ...prev,
      [storeType]: !prev[storeType]
    }));
  };

  // ฟังก์ชันสำหรับตั้งค่า state เริ่มต้น
  const initializeStoreTypeStates = (storeTypes) => {
    const initialStates = {};
    storeTypes.forEach(type => {
      if (!(type in storeTypeStates)) {
        initialStates[type] = true; // เริ่มต้นให้แสดงทั้งหมด
      }
    });
    if (Object.keys(initialStates).length > 0) {
      setStoreTypeStates(prev => ({ ...prev, ...initialStates }));
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow">
        <Sidebar 
          storeTypeStates={storeTypeStates}
          toggleStoreType={toggleStoreType}
          onStoreTypesLoaded={initializeStoreTypeStates}
        />
        <div className="flex-grow relative">
          <MapComponent 
            ref={mapRef} 
            storeTypeStates={storeTypeStates}
            onStoreTypesLoaded={initializeStoreTypeStates}
          />
        </div>
      </div>
    </div>
  );
};

export default Rendermap;