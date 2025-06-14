// ===== BookstoreLegend.jsx =====
import { useState, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Component สำหรับแสดง Legend ประเภทร้านหนังสือ
const BookstoreLegend = ({ storeTypes, visible }) => {
  const [legend, setLegend] = useState(null);
  const map = useMap();

  useEffect(() => {
    if (!map || !storeTypes) return;

    // สร้าง legend control ถ้ายังไม่มี
    if (!legend) {
      const newLegend = L.control({ position: 'bottomright' });

      newLegend.onAdd = function() {
        const div = L.DomUtil.create('div', 'bookstore-legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        div.style.lineHeight = '24px';
        div.style.maxHeight = '300px';
        div.style.overflow = 'auto';
        div.style.fontFamily = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        div.style.fontSize = '13px';
        div.style.minWidth = '200px';
        div.style.maxWidth = '250px';
        div.style.opacity = visible ? '1' : '0';
        div.style.transition = 'opacity 0.3s ease';
        div.style.pointerEvents = 'auto';
        div.style.border = '1px solid #ddd';

        // แสดงเฉพาะเมื่อมีข้อมูลประเภทร้านเท่านั้น
        if (storeTypes.length > 0) {
          div.innerHTML = `
            <div style="
              font-weight: bold; 
              margin-bottom: 10px; 
              border-bottom: 2px solid #4CAF50; 
              padding-bottom: 6px; 
              text-align: center;
              color: #333;
              font-size: 14px;
            ">
              📚 ประเภทร้านหนังสือ
            </div>
          `;
          
          storeTypes.forEach(storeType => {
            div.innerHTML += `
              <div style="
                display: flex; 
                align-items: center; 
                margin-bottom: 8px;
                padding: 4px;
                border-radius: 4px;
                background-color: #f9f9f9;
                transition: background-color 0.2s;
              " onmouseover="this.style.backgroundColor='#e8f5e8'" onmouseout="this.style.backgroundColor='#f9f9f9'">
                <img src="${storeType.iconUrl}" style="
                  width: 24px; 
                  height: 24px; 
                  margin-right: 10px;
                  border-radius: 3px;
                ">
                <div style="
                  color: ${storeType.color}; 
                  flex: 1;
                  font-weight: 500;
                ">
                  ${storeType.name || 'ไม่ระบุ'}
                </div>
              </div>
            `;
          });
        }

        return div;
      };

      // เพิ่มเงื่อนไขให้แสดง legend เฉพาะเมื่อมีข้อมูลประเภทร้าน
      if (storeTypes.length > 0) {
        newLegend.addTo(map);
        setLegend(newLegend);
      }
    } else {
      // อัพเดท legend ที่มีอยู่แล้ว
      const div = legend.getContainer();
      if (div) {
        div.style.opacity = visible ? '1' : '0';
        
        if (storeTypes.length > 0) {
          let content = `
            <div style="
              font-weight: bold; 
              margin-bottom: 10px; 
              border-bottom: 2px solid #4CAF50; 
              padding-bottom: 6px; 
              text-align: center;
              color: #333;
              font-size: 14px;
            ">
              📚 ประเภทร้านหนังสือ
            </div>
          `;
          
          storeTypes.forEach(storeType => {
            content += `
              <div style="
                display: flex; 
                align-items: center; 
                margin-bottom: 8px;
                padding: 4px;
                border-radius: 4px;
                background-color: #f9f9f9;
              ">
                <img src="${storeType.iconUrl}" style="
                  width: 24px; 
                  height: 24px; 
                  margin-right: 10px;
                  border-radius: 3px;
                ">
                <div style="
                  color: ${storeType.color}; 
                  flex: 1;
                  font-weight: 500;
                ">
                  ${storeType.name || 'ไม่ระบุ'}
                </div>
              </div>
            `;
          });
          
          div.innerHTML = content;
        } else {
          // ถ้าไม่มีข้อมูล ให้ซ่อน legend
          div.style.opacity = '0';
        }
      }
    }

    // Cleanup function
    return () => {
      if (legend && map) {
        map.removeControl(legend);
        setLegend(null);
      }
    };
  }, [map, storeTypes, legend, visible]);

  return null;
};

export default BookstoreLegend;

