import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleRefresh = () => {
    refreshNotifications();
  };

  return (
    <div style={{ 
      padding: isMobile ? '16px' : '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      backgroundColor: '#f8fffe', 
      minHeight: '100vh'
    }}>
      {/* Mobile Header with Back Button */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '12px 0'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.2s ease',
              marginRight: '12px',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = '#059669';
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#10b981';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              margin: 0, 
              color: '#065f46'
            }}>
              Notifications
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: 0 
            }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
        </div>
      )}
      
      {/* Desktop Header */}
      {!isMobile && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '24px',
          borderRadius: '16px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            🔔 Notifications
          </h1>
          <p style={{ fontSize: '16px', opacity: '0.9', margin: 0 }}>
            Stay updated with your booking status and important updates
          </p>
        </div>
      )}

      <div style={{ marginBottom: isMobile ? '20px' : '30px' }}>
        <h2 style={{ 
          fontSize: isMobile ? '18px' : '20px', 
          marginBottom: '16px', 
          color: '#065f46', 
          fontWeight: '600' 
        }}>
          📊 Stats
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)', 
          gap: isMobile ? '12px' : '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            padding: isMobile ? '16px 12px' : '20px', 
            backgroundColor: 'white', 
            borderRadius: isMobile ? '10px' : '12px', 
            textAlign: 'center',
            border: '2px solid #d1fae5',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#059669' 
            }}>
              {notifications.length}
            </div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#6b7280', 
              fontWeight: '500' 
            }}>Total</div>
          </div>
          
          <div style={{ 
            padding: isMobile ? '16px 12px' : '20px', 
            backgroundColor: unreadCount > 0 ? '#fef3f2' : 'white', 
            borderRadius: isMobile ? '10px' : '12px', 
            textAlign: 'center',
            border: unreadCount > 0 ? '2px solid #fecaca' : '2px solid #d1fae5',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: unreadCount > 0 ? '#dc2626' : '#059669' 
            }}>
              {unreadCount}
            </div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#6b7280', 
              fontWeight: '500' 
            }}>Unread</div>
          </div>
          
          <div style={{ 
            padding: isMobile ? '16px 12px' : '20px', 
            backgroundColor: 'white', 
            borderRadius: isMobile ? '10px' : '12px', 
            textAlign: 'center',
            border: '2px solid #d1fae5',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{ 
              fontSize: isMobile ? '24px' : '32px', 
              fontWeight: 'bold', 
              color: '#059669' 
            }}>
              {readNotifications.length}
            </div>
            <div style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              color: '#6b7280', 
              fontWeight: '500' 
            }}>Read</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                padding: '10px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              ✅ Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px', 
          backgroundColor: 'white', 
          borderRadius: '16px',
          border: '2px solid #d1fae5',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔔</div>
          <h3 style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '22px', fontWeight: '600' }}>No notifications yet</h3>
          <p style={{ color: '#6b7280', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
            You'll receive notifications here about your bookings, offers, and updates.
          </p>
        </div>
      ) : (
        <div>
          {/* Unread Notifications */}
          {unreadNotifications.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '20px', 
                marginBottom: '16px', 
                color: '#dc2626',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🔴 Unread Notifications ({unreadCount})
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unreadNotifications.map((notification) => {
                  const getTypeIcon = (type: string) => {
                    switch(type) {
                      case 'booking_pending': return '⏰';
                      case 'booking_confirmed': return '✅';
                      case 'booking_cancelled': return '❌';
                      case 'payment_success': return '💳';
                      case 'payment_failed': return '⚠️';
                      default: return '📢';
                    }
                  };
                  
                  return (
                    <div key={notification._id} style={{
                      padding: '20px',
                      border: '2px solid #10b981',
                      borderRadius: '12px',
                      backgroundColor: '#dcfce7',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                      transition: 'all 0.2s ease',
                      borderLeft: '6px solid #10b981'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                          <div style={{
                            fontSize: '24px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            borderRadius: '8px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '2px solid white'
                          }}>
                            {getTypeIcon(notification.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#065f46', fontSize: '16px' }}>
                              {notification.title}
                            </h3>
                            <p style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>
                              {notification.message}
                            </p>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#6b7280',
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              <span style={{ 
                                backgroundColor: '#e5f3ff', 
                                color: '#0369a1', 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                fontWeight: '500'
                              }}>
                                {notification.type?.replace('_', ' ')}
                              </span>
                              <span>{new Date(notification.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                        >
                          ✓ Mark read
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Read Notifications */}
          {readNotifications.length > 0 && (
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                marginBottom: '16px', 
                color: '#059669',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ✅ Read Notifications ({readNotifications.length})
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {readNotifications.map((notification) => {
                  const getTypeIcon = (type: string) => {
                    switch(type) {
                      case 'booking_pending': return '⏰';
                      case 'booking_confirmed': return '✅';
                      case 'booking_cancelled': return '❌';
                      case 'payment_success': return '💳';
                      case 'payment_failed': return '⚠️';
                      default: return '📢';
                    }
                  };
                  
                  return (
                    <div key={notification._id} style={{
                      padding: '16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      opacity: 0.8
                    }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                          fontSize: '20px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '6px',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {getTypeIcon(notification.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: '0 0 6px 0', fontWeight: '500', color: '#374151', fontSize: '14px' }}>
                            {notification.title}
                          </h3>
                          <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '13px' }}>
                            {notification.message}
                          </p>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#9ca3af',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <span style={{ 
                              backgroundColor: '#f3f4f6', 
                              padding: '2px 6px', 
                              borderRadius: '3px'
                            }}>
                              {notification.type?.replace('_', ' ')}
                            </span>
                            <span>{new Date(notification.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
