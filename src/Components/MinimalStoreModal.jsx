import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const MinimalStoreModal = ({ locationData, isOpen, onClose }) => {
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  if (!isOpen || !locationData || !locationData.stores?.length) return null;

  const stores = locationData.stores;
  const currentStore = stores[currentStoreIndex];
  const location = locationData.location;
  const hasMultipleStores = stores.length > 1;

  // แปลง comma-separated image URLs เป็น array
  const getImageUrls = (imageUrlsString) => {
    if (!imageUrlsString) return [];
    if (typeof imageUrlsString !== 'string') return [];
    return imageUrlsString.split(',').map(url => url.trim()).filter(url => url);
  };

  const imageUrls = getImageUrls(currentStore.image_urls);
  const hasMultipleImages = imageUrls.length > 1;

  // Store navigation
  const nextStore = () => {
    setCurrentStoreIndex(prev => prev === stores.length - 1 ? 0 : prev + 1);
    setCurrentImageIndex(0);
  };

  const prevStore = () => {
    setCurrentStoreIndex(prev => prev === 0 ? stores.length - 1 : prev - 1);
    setCurrentImageIndex(0);
  };

  const goToStore = (index) => {
    setCurrentStoreIndex(index);
    setCurrentImageIndex(0);
  };

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1);
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1);
  };

  // Swipe handling
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasMultipleImages) {
      nextImage();
    }
    if (isRightSwipe && hasMultipleImages) {
      prevImage();
    }
  };

  const getStoreColor = () => {
    const colors = {
      'ร้านหนังสือทั่วไป': '#4CAF50',
      'ห้างสรรพสินค้า': '#FF9800',
    };
    return colors[currentStore.store_type] || '#2563eb';
  };

  // สร้างชื่อสถานที่จากข้อมูลที่มี
  const getLocationName = () => {
    if (location.name) return location.name;
    if (hasMultipleStores) return `${location.district} (${stores.length} ร้าน)`;
    return currentStore.store_name;
  };



  const storeColor = getStoreColor();
  const isMobile = window.innerWidth < 768;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      padding: isMobile ? 0 : '20px'
    }}>
      
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: isMobile ? 0 : '12px',
          width: isMobile ? '100vw' : 'min(90vw, 700px)',
          height: isMobile ? '100vh' : 'min(90vh, 600px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${storeColor}, ${storeColor}dd)`,
          color: 'white',
          padding: '16px 20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '12px',
                opacity: 0.9,
                marginBottom: '4px'
              }}>
                📍 {getLocationName()}
              </div>
              <h2 style={{
                margin: 0,
                fontSize: isMobile ? '18px' : '22px',
                fontWeight: 'bold',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {currentStore.store_name}
              </h2>
              <div style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  padding: '4px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  {currentStore.store_type}
                </div>
                {imageUrls.length > 0 && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    📷 {imageUrls.length} รูป
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          {/* Store Navigation */}
          {hasMultipleStores && (
            <div style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <button
                onClick={prevStore}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ‹
              </button>
              
              <div style={{
                flex: 1,
                display: 'flex',
                gap: '4px',
                overflowX: 'auto',
                padding: '4px 0'
              }}>
                {stores.map((store, index) => (
                  <button
                    key={index}
                    onClick={() => goToStore(index)}
                    style={{
                      background: index === currentStoreIndex ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {store.store_name.length > 15 ? store.store_name.substring(0, 15) + '...' : store.store_name}
                  </button>
                ))}
              </div>
              
              <button
                onClick={nextStore}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ›
              </button>
              
              <div style={{
                fontSize: '11px',
                opacity: 0.8,
                marginLeft: '4px'
              }}>
                {currentStoreIndex + 1}/{stores.length}
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          
          {/* Image Display */}
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: '#f5f5f5',
            overflow: 'hidden',
            height: isMobile ? '300px' : '400px',
            width: '100%',
            marginBottom: '20px'
          }}>
            {imageUrls.length > 0 ? (
              <>
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`${currentStore.store_name}`}
                  className="w-full h-48 object-cover rounded-t-lg"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5',
                    display: 'block'
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />
                
                {/* Image Navigation Buttons */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '20px',
                        zIndex: 1
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '20px',
                        zIndex: 1
                      }}
                    >
                      ›
                    </button>
                    {/* Image Counter */}
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      zIndex: 1
                    }}>
                      {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '16px'
              }}>
                ไม่มีรูปภาพ
              </div>
            )}
          </div>

          {/* Store Information */}
          <div style={{
            display: 'grid',
            gap: '12px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '6px'
              }}>
                📍 ที่อยู่
              </h3>
              
              <div style={{ lineHeight: '1.6', color: '#4b5563' }}>
                <div style={{ marginBottom: '4px' }}>
                  <strong>ตำบล:</strong> {currentStore.subdistrict || '-'}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>อำเภอ:</strong> {currentStore.district || '-'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>จังหวัด:</strong> {currentStore.province || '-'}
                </div>
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  พิกัด: {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MinimalStoreModal;