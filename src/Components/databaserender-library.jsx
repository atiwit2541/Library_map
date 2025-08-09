// ===== แก้ไข databaserender-library.jsx =====
import React, { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import { Icon } from 'leaflet';
import MinimalStoreModal from './MinimalStoreModal';

// สีสำหรับแต่ละประเภท (จะสร้างอัตโนมัติตามข้อมูลใน database)
const defaultColors = [
  '#4CAF50', // เขียว
  '#FF9800', // ส้ม
  '#2196F3', // น้ำเงิน
  '#9C27B0', // ม่วง
  '#F44336', // แดง
  '#00BCD4', // ฟ้า
  '#FF5722', // ส้มแดง
  '#795548', // น้ำตาล
  '#607D8B', // น้ำเงินเทา
  '#E91E63', // ชมพู
];

// ใช้ SVG icon เดียวกันสำหรับทุกประเภท
const baseIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="{color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

// ฟังก์ชันเพื่อสร้าง custom icon URL ด้วย SVG
const createSvgIconUrl = (color) => {
  const encodedSvg = encodeURIComponent(baseIconSvg.replace('{color}', color));
  return `data:image/svg+xml;utf8,${encodedSvg}`;
};

// ฟังก์ชันสำหรับสร้างสีอัตโนมัติตามประเภท
const generateStoreTypeColors = (storeTypes) => {
  const colors = {};
  storeTypes.forEach((type, index) => {
    colors[type] = defaultColors[index % defaultColors.length];
  });
  return colors;
};

// ฟังก์ชันสำหรับกำหนดไอคอนตามประเภทร้าน
const getStoreTypeIcon = (storeType, storeTypeColors) => {
  if (!storeType) storeType = 'ไม่ระบุ';
  
  const color = storeTypeColors[storeType] || defaultColors[0];
  return {
    iconUrl: createSvgIconUrl(color),
    color: color
  };
};

const MapMarkersLibrary = ({ storeTypeStates, onStoreTypesLoaded, onLegendDataLoaded }) => {
    const [allMarkers, setAllMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLocationData, setSelectedLocationData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [storeTypeColors, setStoreTypeColors] = useState({});

    useEffect(() => {
        const fetchMarkers = async () => {
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
                    setAllMarkers(data.data);
                    
                    // ดึงประเภทที่ไม่ซ้ำกันจากข้อมูล
                    const uniqueStoreTypes = [...new Set(data.data.map(item => item.store_type).filter(Boolean))];
                    
                    // สร้างสีสำหรับแต่ละประเภท
                    const colors = generateStoreTypeColors(uniqueStoreTypes);
                    setStoreTypeColors(colors);
                    
                    // สร้าง legend data สำหรับทุกประเภท
                    const legendData = uniqueStoreTypes.map(storeType => ({
                        name: storeType,
                        iconUrl: createSvgIconUrl(colors[storeType]),
                        count: data.data.filter(marker => marker.store_type === storeType).length
                    }));
                    
                    // ส่งข้อมูลประเภทร้านขึ้นไปให้ parent component
                    if (onStoreTypesLoaded) {
                        onStoreTypesLoaded(uniqueStoreTypes);
                    }
                    
                    // ส่ง legend data ไปยัง parent component
                    if (onLegendDataLoaded) {
                        onLegendDataLoaded(legendData);
                    }
                } else {
                    setError(data.message);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkers();
    }, [onStoreTypesLoaded, onLegendDataLoaded]);

    // ฟังก์ชันเปิด Modal
    const openStoreModal = (store) => {
        // หาร้านทั้งหมดที่มี lat long เดียวกัน
        const storesAtLocation = allMarkers.filter(marker => 
            parseFloat(marker.latitude) === parseFloat(store.latitude) && 
            parseFloat(marker.longitude) === parseFloat(store.longitude)
        );

        // สร้างข้อมูลในรูปแบบที่ MinimalStoreModal ต้องการ
        const locationData = {
            location: {
                latitude: parseFloat(store.latitude),
                longitude: parseFloat(store.longitude),
                name: storesAtLocation.length > 1 ? `${store.district} (${storesAtLocation.length} ร้าน)` : store.store_name,
                district: store.district
            },
            stores: storesAtLocation.map(store => ({
                id: store.id,
                store_name: store.store_name,
                latitude: parseFloat(store.latitude),
                longitude: parseFloat(store.longitude),
                province: store.province,
                district: store.district,
                subdistrict: store.subdistrict,
                image_urls: store.image_urls,
                image_urls_array: store.image_urls_array,
                thumbnail_url: store.thumbnail_url,
                total_images: store.total_images,
                has_images: store.has_images
            }))
        };

        setSelectedLocationData(locationData);
        setIsModalOpen(true);
    };

    // ฟังก์ชันปิด Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLocationData(null);
    };

    // กรองข้อมูลตามประเภทที่เลือก
    const getFilteredMarkers = () => {
        return allMarkers.filter(marker => {
            const storeType = marker.store_type || '';
            
            // ตรวจสอบว่าเป็นประเภทที่เลือกแสดงหรือไม่
            return storeTypeStates[storeType] === true;
        });
    };

    if (loading) {
        return <div>กำลังโหลดข้อมูล...</div>;
    }

    if (error) {
        return <div className="error-message">เกิดข้อผิดพลาด: {error}</div>;
    }

    const filteredMarkers = getFilteredMarkers();

    return (
        <>
            {filteredMarkers.map((marker, index) => {
                const storeTypeName = marker.store_type || 'ไม่ระบุ';
                const storeTypeData = getStoreTypeIcon(storeTypeName, storeTypeColors);
                
                const customIcon = new Icon({
                    iconUrl: storeTypeData.iconUrl,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                });
                
                return (
                    <Marker
                        key={`${marker.id}-${index}`}
                        position={[marker.latitude, marker.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => openStoreModal(marker)
                        }}
                    />
                );
            })}
            
            {isModalOpen && selectedLocationData && (
                <MinimalStoreModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    locationData={selectedLocationData}
                />
            )}
        </>
    );
};

export default MapMarkersLibrary;