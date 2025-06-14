import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  LayersControl, 
  ImageOverlay,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapMarkersLibrary from './databaserender-library';
import BookstoreLegend from './BookstoreLegend';

// 🧮 Bounds Calculator Function - ใช้เมื่อมีข้อมูลใหม่
function calculateBoundsFromPGW(imageWidth, imageHeight, pgwContent) {
  const lines = pgwContent.split('\n');
  const scaleX = parseFloat(lines[0]);
  const scaleY = parseFloat(lines[3]);
  const centerX = parseFloat(lines[4]);
  const centerY = parseFloat(lines[5]);

  const width = imageWidth * scaleX;
  const height = imageHeight * scaleY;

  return [
    [centerY - height/2, centerX - width/2],
    [centerY + height/2, centerX + width/2]
  ];
}

// ===== จังหวัดและการตั้งค่า (ข้อมูลจริงแล้ว!) =====

// Provincial bounds สำหรับ layer switching
const provinceBounds = {
  'CNXPane': [[16.51, 95.806], [20.953, 100.708]], // เชียงใหม่ (4908x3695) - แก้ไขให้ตรงกับ ImageOverlay
  'PHKPane': [[14.936, 97.73], [19.247, 102.45]],   // พิษณุโลก (4908x3699)
  'BKKPane': [[13.221, 99.866], [14.326, 101.2]], // กรุงเทพ (4908x3695)
};

const provinceZoomLevels = {
  'CNXPane': { min: 9, max: 18, default: 9, center: [18.802500, 100.967500] }, // เชียงใหม่
  'PHKPane': { min: 9, max: 18, default: 8, center: [17.09, 100.59] },         // พิษณุโลก  
  'BKKPane': { min: 11, max: 18, default: 9, center: [13.763300, 100.520000] }, // กรุงเทพ
};

// สร้างฟังก์ชันสำหรับ PNG ImageOverlay
const createProvinceImageOverlay = (imageUrl, bounds, paneName, imageSize) => {
  const ProvinceComponent = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [error, setError] = useState(null);
    
    useEffect(() => {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setError(`Failed to load PNG: ${imageUrl}`);
      };
      img.src = imageUrl;
    }, []);

    if (error) {
      return null;
    }

    return imageLoaded ? (
      <ImageOverlay
        url={imageUrl}
        bounds={bounds}
        opacity={1}
        zIndex={650}
        pane={paneName}
      />
    ) : null;
  };
  
  return ProvinceComponent;
};

// ===== Province Image Overlays =====

// 🏔️ เชียงใหม่ - ข้อมูลจริง (4908x3695)
const GeojsonHideCNX = createProvinceImageOverlay(
  '/images/cnx.png',
  [[16.51, 95.806], [20.953, 101.708]],
  'CNXPane',
  '4908x3695'
);

// 🏞️ พิษณุโลก - ข้อมูลจริง (4908x3699)
const GeojsonHidePHK = createProvinceImageOverlay(
  '/images/phk.png',
  [[14.936, 97.73], [19.247, 103.45]],
  'PHKPane', 
  '4908x3699'
);

// 🏙️ กรุงเทพ - ข้อมูลจริง (4908x3695)
const GeojsonHideBKK = createProvinceImageOverlay(
  '/images/bkk.png',
  [[13.221, 99.866], [14.326, 101.335]],
  'BKKPane',
  '4908x3695'
);

// ===== Map Components =====

const ProvincesLayerManager = () => {
  const map = useMap();
  
  useEffect(() => {
    const panes = ['CNXPane', 'PHKPane', 'BKKPane'];
    
    panes.forEach(paneName => {
      if (!map.getPane(paneName)) {
        map.createPane(paneName);
        map.getPane(paneName).style.zIndex = 650;
        map.getPane(paneName).style.pointerEvents = 'none';
      }
    });
  }, [map]);

  return null;
};

const LayerChangeHandler = () => {
  const map = useMap();
  
  useEffect(() => {
    const handleBaseLayerChange = (e) => {
      const layerName = e.name;
      
      // ✅ ฟังก์ชันสำหรับเปลี่ยนจังหวัดอย่างปลอดภัย
      const switchToProvince = (config, bounds) => {
        // 1. Clear bounds ก่อน
        map.setMaxBounds(null);
        
        // 2. Set zoom levels ก่อน
        map.setMinZoom(config.min);
        map.setMaxZoom(config.max);
        
        // 3. Set view พร้อม zoom ที่ถูกต้อง
        map.setView(config.center, config.default, { 
          animate: true, 
          duration: 1.0,
          reset: true  // Force reset view
        });
        
        // 4. Set bounds หลังจาก view เสร็จแล้ว
        setTimeout(() => {
          map.setMaxBounds(bounds);
        }, 100); // รอให้ animation เสร็จก่อน
      };
      
      if (layerName === "จังหวัดเชียงใหม่") {
        const config = provinceZoomLevels.CNXPane;
        switchToProvince(config, provinceBounds.CNXPane);
        
      } else if (layerName === "จังหวัดพิษณุโลก") {
        const config = provinceZoomLevels.PHKPane;
        switchToProvince(config, provinceBounds.PHKPane);
        
      } else if (layerName === "จังหวัดกรุงเทพมหานคร") {
        const config = provinceZoomLevels.BKKPane;
        switchToProvince(config, provinceBounds.BKKPane);
      } 
    };
    
    map.on('baselayerchange', handleBaseLayerChange);
    
    return () => {
      map.off('baselayerchange', handleBaseLayerChange);
    };
  }, [map]);
  
  return null;
};

const BookstoreMarkersManager = ({ showGeneralBookstore, showMallBookstore }) => {
  const [storeTypes, setStoreTypes] = useState([]);
  
  const handleStoreTypesLoaded = useCallback((typesData) => {
    setStoreTypes(typesData);
  }, []);

  return (
    <>
      <MapMarkersLibrary 
        showGeneralBookstore={showGeneralBookstore}
        showMallBookstore={showMallBookstore}
        onStoreTypesLoaded={handleStoreTypesLoaded}
      />
      
      <BookstoreLegend 
        storeTypes={storeTypes} 
        visible={true}
      />
    </>
  );
};

// ===== Main Map Component =====

const MapComponent = React.forwardRef(({ 
  showGeneralBookstore = true, 
  showMallBookstore = true 
}, ref) => {
  
  // 🏔️ ใช้การตั้งค่าของเชียงใหม่เป็น default (เหมือนกับตอนกดเลือกเชียงใหม่)
  const cnxConfig = provinceZoomLevels.CNXPane;
  const cnxBounds = provinceBounds.CNXPane;

  return (
    <MapContainer
      ref={ref}
      style={{ height: "100%", width: "100%", zIndex: "30" }}
      center={cnxConfig.center}           // Center ของเชียงใหม่
      zoom={cnxConfig.default}            // Zoom level ของเชียงใหม่
      zoomControl={false}
      maxBounds={cnxBounds}               // Bounds ของเชียงใหม่
      maxBoundsViscosity={1.0}
      minZoom={cnxConfig.min}             // Min zoom ของเชียงใหม่
      maxZoom={cnxConfig.max}             // Max zoom ของเชียงใหม่
      preferCanvas={true}
    >
      <ProvincesLayerManager />
      <LayerChangeHandler />
      
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        updateWhenIdle={true}
        updateWhenZooming={false}
        keepBuffer={4}
        maxNativeZoom={18}
      />
      
      <LayersControl position="topright">
        <LayersControl.BaseLayer name="จังหวัดเชียงใหม่" checked>
          <GeojsonHideCNX />
        </LayersControl.BaseLayer>
        
        <LayersControl.BaseLayer name="จังหวัดพิษณุโลก" >
          <GeojsonHidePHK />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="จังหวัดกรุงเทพมหานคร">
          <GeojsonHideBKK />
        </LayersControl.BaseLayer>
      </LayersControl>
      
      <BookstoreMarkersManager 
        showGeneralBookstore={showGeneralBookstore}
        showMallBookstore={showMallBookstore}
      />
    </MapContainer>
  );
});

// 🔧 Export Calculator Function สำหรับใช้ภายนอก
export { calculateBoundsFromPGW };

export default MapComponent;