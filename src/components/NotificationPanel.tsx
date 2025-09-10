import { useState } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

export default function NotificationPanel() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Get the latest 5 notifications for the dropdown
  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);
    navigate("/notifications");
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    setIsOpen(false);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          fontSize: '20px'
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              minWidth: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            width: '320px',
            maxHeight: '400px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#f9f9f9'
          }}>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>Notifications</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✖
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div>⏳ Loading...</div>
            </div>
          ) : recentNotifications.length === 0 ? (
            /* Empty State */
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔔</div>
              <p style={{ margin: 0, color: '#666' }}>No notifications yet</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                You'll see your latest updates here
              </p>
            </div>
          ) : (
            /* Notifications List */
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: !notification.isRead ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (notification.isRead) {
                      e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = !notification.isRead ? '#e3f2fd' : 'white';
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: !notification.isRead ? '#2196f3' : '#ccc',
                        marginTop: '4px',
                        flexShrink: 0
                      }}
                    />
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: !notification.isRead ? 'bold' : 'normal',
                        color: !notification.isRead ? '#333' : '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notification.title}
                      </h4>
                      
                      <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '12px',
                        color: '#666',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {notification.message}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          backgroundColor: '#f0f0f0',
                          borderRadius: '10px',
                          color: '#666'
                        }}>
                          {notification.type}
                        </span>
                      </div>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid #eee',
              backgroundColor: '#f9f9f9'
            }}>
              <button
                onClick={handleViewAll}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                👁 View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
