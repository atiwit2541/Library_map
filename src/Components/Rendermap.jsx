import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import MapComponent from './MapContainer';

const Rendermap = () => {
  // เพิ่ม state แยกสำหรับแต่ละประเภทร้านหนังสือ
  const [showGeneralBookstore, setShowGeneralBookstore] = useState(true);
  const [showMallBookstore, setShowMallBookstore] = useState(true);
  const mapRef = useRef();

  // ฟังก์ชันสำหรับ toggle แต่ละประเภท
  const toggleGeneralBookstore = () => setShowGeneralBookstore(!showGeneralBookstore);
  const toggleMallBookstore = () => setShowMallBookstore(!showMallBookstore);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow">
        <Sidebar 
          showGeneralBookstore={showGeneralBookstore}
          toggleGeneralBookstore={toggleGeneralBookstore}
          showMallBookstore={showMallBookstore}
          toggleMallBookstore={toggleMallBookstore}
        />
        <div className="flex-grow relative">
          <MapComponent 
            ref={mapRef} 
            showGeneralBookstore={showGeneralBookstore}
            showMallBookstore={showMallBookstore}
          />
        </div>
      </div>
    </div>
  );
};

export default Rendermap;